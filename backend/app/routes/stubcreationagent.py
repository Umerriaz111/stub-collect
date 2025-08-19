from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
import os
import asyncio
from agents import Agent, Runner, SQLiteSession, function_tool
from agents.extensions.models.litellm_model import LitellmModel
import base64
from openai.types.responses import ResponseInputImageParam, ResponseInputTextParam
from openai.types.responses.response_input_item_param import Message
from dotenv import load_dotenv
import tempfile
import shutil

load_dotenv()

bp = Blueprint('stubcreationagent', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@function_tool()
def draft_listing(
    listing_title: str,
    listing_description_paragraph: str,
    event_plain: str,
    date: str,  # formatted as YYYY-MM-DD
    venue: str,
    estimated_market_value: int  # strict float, no ranges/strings
):
    """
    Represents extracted information from a ticket stub to draft a marketplace listing.
    - `date`: MUST be in YYYY-MM-DD format.
    - `estimated_market_value`: MUST be a float (e.g., 120.01).
    """
    print("Tool called from Umer Riaz")
    print(
        f"Drafting listing with title: {listing_title}, "
        f"description: {listing_description_paragraph}, "
        f"event: {event_plain}, date: {date}, "
        f"venue: {venue}, estimated market value: {estimated_market_value}"
    )
    return {
        "title": listing_title,
        "description": listing_description_paragraph,
        "event": event_plain,
        "date": date,
        "venue": venue,
        "estimated_market_value": estimated_market_value,
    }

system_prompt = """
SYSTEM PROMPT (Universal Stub Analyzer)

You are an assistant that analyzes uploaded ticket stubs and MUST always reply in the same 5-step structured format below.
Do not add or remove steps. Do not change headings. Do not change the phrasing of the intro sentences.
Fill in the placeholders wrapped in {{ }}. If information is unavailable, write Unknown.

User Interaction Rules:
- If only text is sent (no image), answer the user’s question and then say: "please upload stub for identification."
- If an image is included, skip the greeting and immediately apply the 5-step structured analysis.
- If the user points out that the information is incorrect (price, section, row, seat, date, event name, venue, account number, barcode, listing title/description, or market value):
  1. Override the old value with the new one.
  2. Persist that change for the session (do not revert to old values later).
  3. ONLY update the specific corrected information - do NOT regenerate the full 5-step analysis.
  4. Respond with a brief confirmation like: "Updated: [specific field] is now [new value]. Is there anything else to correct?"

Draft Listing Rules (Very Important):
- After stub is uploaded and analysis is generated, always end with the full "Step 5: Marketplace Listing" section.
- If the user CONFIRMS the listing (examples: "yes", "ok", "go ahead", "create listing", "information is correct", "draft it", "looks good"), you MUST call the `draft_listing` tool with all the extracted values.
- Do NOT generate raw JSON in the assistant response. Always use the `draft_listing` tool to output the listing.
- If the user makes corrections *before* confirming, ONLY update the specific corrected information and respond briefly. Do NOT regenerate the full analysis.
- Only call the `draft_listing` tool once the user confirms the listing is correct.

Tool Calling Rules (Formatting Only):
- When passing values to the `draft_listing` tool:
  • `date` MUST always be in the format YYYY-MM-DD (e.g., 2019-10-23).
  • `estimated_market_value` MUST always be a single number (integer or float).
  • Always assume **USD** — do not ask the user which currency to use.
  • Do not include ranges, symbols ($, USD), or text. Just output the numeric value.

5-Step Structured Template (always follow this after stub is uploaded):

Step 1: OCR and Ticket Details Extraction
Using my image processing capabilities, I’ll extract the text from the ticket stub:

Event: {{event_name_with_opponents_or_performers}}
Venue: {{venue_full}}
Date and Time: {{date_long}} – {{time_local}}

Seat Details:
Section: {{section}}
Row: {{row}}
Seat: {{seat}}

Price: {{price}}
Account Number: {{account_number}}
Barcode: {{barcode}}

Interpretation:
This ticket stub is for {{event_type}} held at {{venue_short}}.
{{ticket_context_line}}

Step 2: Identify the Event

Historical records show:

On {{date_long}}, {{event_summary}} at {{venue_short}}.

Key Historical Context:
{{key_context_line_1}}
{{key_context_line_2}}

Hypothesis:
This stub is almost certainly from {{hypothesis_sentence}}.

Step 3: Retrieve Event Data (Simulated Query)

Event Summary Data ({{source_label}}):

Attendance: {{attendance}}
Notable Figures / Performers: {{notable_figures}}
Key Moments: {{notable_highlights}}

Context:
{{contextual_summary_sentence}}

Step 4: Identify Significance, Debuts, and Highlights

Significance:
{{significance_line_1}}
{{significance_line_2}}

Debuts / Firsts:
{{debuts_line}}

Career Highs / Major Moments:
{{career_highs_line}}

Other Highlights:
{{highlight_line}}

Step 5: Marketplace Listing

Draft Listing:

Title: {{listing_title}}

Description:
“{{listing_description_paragraph}}”

Event: {{event_plain}}
Date: {{date_long}}
Venue: {{venue_short}}

Estimated Market Value: {{price_estimate_value}} (USD)

AI: Is this information correct or have I missed something? 
If everything looks good, I would give this an estimated market price of {{price_estimate_range}}.
Would you like me to go ahead and draft the listing?

"""

def get_agent():
    """Get or create Agent instance"""
    return Agent(
        name="Stub Analyzer Agent",
        instructions=system_prompt,
        model=LitellmModel(
            model=os.getenv("MODEL"),
            api_key=os.getenv("GEMINI_API_KEY")
        ),
        tools=[draft_listing],
    )

def get_session(user_id):
    """Get or create SQLiteSession for user"""
    # Use user_id for unique session isolation
    session_id = f"user_{user_id}_session"
    
    # Ensure the instance directory exists
    instance_dir = os.path.join(current_app.root_path, 'instance')
    os.makedirs(instance_dir, exist_ok=True)
    
    # Use user_id in database path for unique isolation
    db_path = os.path.join(instance_dir, f'conversations_{user_id}.db')
    return SQLiteSession(session_id=session_id, db_path=db_path)

def encode_image(image_path):
    """Encode image to base64"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

@bp.route('/stub-creation-agent', methods=['POST'])
@login_required
def stub_creation_agent():
    """Interact with the stub creation agent"""
    try:
        # Handle both JSON and form data
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json()
            if not data or 'query' not in data:
                return jsonify({
                    'status': 'error',
                    'message': 'Query is required'
                }), 400
            query = data['query']
        else:
            # Handle form data (when image is uploaded)
            query = request.form.get('query')
            if not query:
                return jsonify({
                    'status': 'error',
                    'message': 'Query is required'
                }), 400

        image_file = request.files.get('image') if request.files else None
        
        # Create temporary directory for this session
        temp_dir = tempfile.mkdtemp()
        conversation_db_path = None
        image_path = None
        
        try:
            agent = get_agent()
            session = get_session(current_user.id)
            
            # Handle image upload if provided
            if image_file and image_file.filename != '':
                if not allowed_file(image_file.filename):
                    return jsonify({
                        'status': 'error',
                        'message': 'Invalid file type. Allowed types: PNG, JPG, JPEG'
                    }), 400
                
                # Save image to temp directory
                image_path = os.path.join(temp_dir, image_file.filename)
                image_file.save(image_path)
                
                # Encode image to base64
                base64_image = encode_image(image_path)
                
                # Create message with image
                message = [
                    Message(
                        role="user",
                        content=[
                            ResponseInputTextParam(text=query, type="input_text"),
                            ResponseInputImageParam(
                                type="input_image",
                                detail="high",
                                image_url=f"data:image/jpeg;base64,{base64_image}",
                            ),
                        ],
                    )
                ]
                
                # Run agent with image
                result = asyncio.run(Runner.run(
                    agent,
                    input=message,
                    session=None
                ))
                
                # Add to session
                asyncio.run(session.add_items([
                    {"role": "user", "content": f"{query} + [image]"},
                    {"role": "assistant", "content": result.final_output},
                ]))
                
            else:
                # Run agent with text only
                result = asyncio.run(Runner.run(
                    agent,
                    input=query,
                    session=session
                ))
            
            # Check if tool was called (listing created)
            tool_called = hasattr(result, 'tool_calls') and result.tool_calls
            listing_data = None
            
            if tool_called:
                # Extract listing data from tool calls
                for tool_call in result.tool_calls:
                    if tool_call.function.name == 'draft_listing':
                        listing_data = tool_call.function.arguments
                        break
                
                # Clean up everything after listing is created
                if image_path and os.path.exists(image_path):
                    os.remove(image_path)
                    print(f"Deleted image: {image_path}")
                
                # Delete the user's session database and all related files
                try:
                    # Close the session first to release file handles
                    asyncio.run(session.close())
                    
                    # Delete all SQLite database files
                    base_path = os.path.join(current_app.root_path, 'instance', f'conversations_{current_user.id}')
                    sqlite_extensions = ['.db', '.db-wal', '.db-shm']
                    
                    for ext in sqlite_extensions:
                        file_path = base_path + ext
                        if os.path.exists(file_path):
                            os.remove(file_path)
                            print(f"Deleted database file: {file_path}")
                            
                except Exception as e:
                    print(f"Error deleting session database: {e}")
                
                # Clean up temp directory
                if temp_dir and os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
                    print(f"Deleted temp directory: {temp_dir}")
            
            return jsonify({
                'status': 'success',
                'message': 'Agent response generated successfully',
                'data': {
                    'response': result.final_output,
                    'listing_created': bool(listing_data),
                    'listing_data': listing_data
                }
            }), 200
            
        except Exception as e:
            # Clean up on error
            if image_path and os.path.exists(image_path):
                os.remove(image_path)
                print(f"Cleaned up image on error: {image_path}")
            
            # Clean up temp directory
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
                print(f"Cleaned up temp directory on error: {temp_dir}")
            
            raise e
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to process request',
            'error': str(e)
        }), 500

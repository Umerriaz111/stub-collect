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
from flask import current_app
import os
from agents import SQLiteSession
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime
        
# Get current user ID from Flask-Login
from flask_login import current_user

from app.prompts.agentprompt import system_prompt

from app.services.stub_service import StubProcessor

load_dotenv()

bp = Blueprint('stubcreationagent', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def custom_save_image(image_file, user_id):
    """
    Custom method to save uploaded image file
    Returns the saved image path
    """
    try:
        # Create upload directory structure
        upload_base = os.path.join(current_app.root_path, 'static', 'uploads', 'stubs')
        user_upload_dir = os.path.join(upload_base, str(user_id))
        
        # Ensure directories exist
        os.makedirs(user_upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = image_file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        
        # Full file path
        file_path = os.path.join(user_upload_dir, unique_filename)
        
        # Save the file
        image_file.save(file_path)
        
        # Verify file was saved
        if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
            print(f"Image successfully saved to: {file_path}")
            return file_path
        else:
            raise Exception("File was not saved properly or is empty")
            
    except Exception as e:
        print(f"Error in custom_save_image: {e}")
        raise Exception(f"Failed to save image: {str(e)}")


def get_stub_processor():
    """Get or create StubProcessor instance"""
    UPLOAD_FOLDER = os.path.join(current_app.root_path, 'static', 'uploads', 'stubs')
    print(f"Upload folder path: {UPLOAD_FOLDER}")
    print(f"Upload folder exists: {os.path.exists(UPLOAD_FOLDER)}")
    print(f"Current app root path: {current_app.root_path}")
    return StubProcessor(UPLOAD_FOLDER)


def get_session(user_id):
    """Get or create SQLiteSession for user"""
    # Use user_id for unique session isolation
    session_id = f"user_{user_id}_session"
    
    # Ensure the instance directory exists
    instance_dir = os.path.join(current_app.root_path, 'agentmemory')
    os.makedirs(instance_dir, exist_ok=True)
    
    # Use user_id in database path for unique isolation
    db_path = os.path.join(instance_dir, f'conversations_{user_id}.db')
    return SQLiteSession(session_id=session_id, db_path=db_path)


def encode_image(image_path):
    """Encode image to base64"""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
    except Exception as e:
        print(f"Error encoding image: {e}")
        raise Exception(f"Failed to encode image: {str(e)}")


@function_tool()
async def draft_listing(
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
    
    # Clean up user memory after successful listing creation
    try:
        print(f"Starting memory cleanup for user {current_user.id}")
        
        # Create session for cleanup
        session_id = f"user_{current_user.id}_session"
        instance_dir = os.path.join(current_app.root_path, 'agentmemory')
        db_path = os.path.join(instance_dir, f'conversations_{current_user.id}.db')
        
        # Verify database file exists before attempting cleanup
        if not os.path.exists(db_path):
            print(f"No session database found for user {current_user.id}, skipping cleanup")
            return
            
        # Delete all SQLite database files for this user
        sqlite_extensions = ['.db-wal', '.db-shm', '.db']
        deleted_files = []
        for ext in sqlite_extensions:
            file_path = db_path + ext
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    deleted_files.append(os.path.basename(file_path))
                    print(f"Deleted database file: {file_path}")
                except Exception as e:
                    print(f"Could not delete file {file_path}: {e}")
        
        print(f"Successfully cleaned up memory for user {current_user.id}")
        print(f"Deleted {len(deleted_files)} database files: {', '.join(deleted_files)}")
        
    except Exception as e:
        print(f"Error cleaning up user memory: {e}")
        print(f"Memory cleanup failed, but listing creation will continue")


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


@bp.route('/stub-creation-agent', methods=['POST'])
@login_required
def stub_creation_agent():
    """Interact with the stub creation agent"""
    temp_dir = None
    saved_image_path = None
    
    try:
        # Handle both JSON and form data
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json()
            query = data.get('query', '')
            queryid = data.get('queryid')  # Optional queryid
        else:
            # Handle form data (when image is uploaded)
            query = request.form.get('query', '')  # Make query optional, default to empty string
            queryid = request.form.get('queryid')  # Optional queryid
        
        image_file = request.files.get('image') if request.files else None
        
        # If no image and no query, return error
        if not image_file and not query:
            return jsonify({
                'status': 'error',
                'message': 'Either an image or a query is required'
            }), 400
        
        # Handle image upload if provided
        if image_file and image_file.filename != '':
            if not allowed_file(image_file.filename):
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid file type. Allowed types: PNG, JPG, JPEG'
                }), 400
            
            # Save image using custom method
            try:
                saved_image_path = custom_save_image(image_file, current_user.id)
                print(f"Image saved successfully at: {saved_image_path}")
                
                # Verify the saved file exists and has content
                if not os.path.exists(saved_image_path):
                    raise Exception("Saved image file does not exist")
                    
                file_size = os.path.getsize(saved_image_path)
                if file_size == 0:
                    raise Exception("Saved image file is empty")
                    
                print(f"Saved image file size: {file_size} bytes")
                
            except Exception as e:
                print(f"Error saving image: {e}")
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to save image: {str(e)}'
                }), 500
            
            # Encode image to base64 for agent processing
            try:
                base64_image = encode_image(saved_image_path)
            except Exception as e:
                print(f"Error encoding image: {e}")
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to process image: {str(e)}'
                }), 500
            
            # Create message with image - using the EXACT format from your working reference code
            user_query = query if query else "Please analyze this ticket stub and extract all relevant information"
            
            message = [
                Message(
                    role="user",
                    content=[
                        ResponseInputTextParam(text=user_query, type="input_text"),
                        ResponseInputImageParam(
                            type="input_image",
                            detail="high",
                            image_url=f"data:image/jpeg;base64,{base64_image}",
                        ),
                    ],
                )
            ]
            
            # Run agent with image - using session=None like in your working reference
            try:
                result = asyncio.run(Runner.run(
                    get_agent(),
                    input=message,
                    session=None  # disable session since we're passing structured messages
                ))
                
                # Create session and add to it
                session = get_session(current_user.id)
                user_content = f"{query + ' + [image]' if query else '[image only]'}"
                asyncio.run(session.add_items([
                    {"role": "user", "content": user_content},
                    {"role": "assistant", "content": result.final_output},
                ]))
                
            except Exception as e:
                print(f"Error running agent with image: {e}")
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to process with agent: {str(e)}'
                }), 500
            
        else:
            # Run agent with text only
            try:
                session = get_session(current_user.id)
                result = asyncio.run(Runner.run(
                    get_agent(),
                    input=query,
                    session=session
                ))
            except Exception as e:
                print(f"Error running agent with text: {e}")
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to process query: {str(e)}'
                }), 500
        
        # Check if tool was called (listing created)
        tool_called = hasattr(result, 'tool_calls') and result.tool_calls
        listing_data = None
        
        if tool_called:
            # Extract listing data from tool calls
            for tool_call in result.tool_calls:
                if tool_call.function.name == 'draft_listing':
                    listing_data = tool_call.function.arguments
                    break
        
        # Return response in the exact structure you specified
        return jsonify({
            'date': datetime.now().strftime('%Y-%m-%d'),
            'question': query if query else '[image only]',
            'question_id': queryid,
            'response': result.final_output,
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'user_id': current_user.id
        }), 200
        
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        
        return jsonify({
            'status': 'error',
            'message': 'Failed to process request',
            'error': str(e)
        }), 500
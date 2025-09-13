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
from dataclasses import dataclass
from flask_login import current_user
from app.prompts.agentprompt import stub_creation_agent_prompt
from app.services.stub_service import StubProcessor
from app.models.stub import Stub
from app import db


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
            return file_path
        else:
            raise Exception("File was not saved properly or is empty")
            
    except Exception as e:
        raise Exception(f"Failed to save image: {str(e)}")


def get_stub_processor():
    """Get or create StubProcessor instance"""
    UPLOAD_FOLDER = os.path.join(current_app.root_path, 'static', 'uploads', 'stubs')
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


def clear_user_memory(user_id):
    """Completely clear all agent memory for a specific user"""
    try:
        print(f"Starting memory cleanup for user {user_id}")
        
        # Get the database path
        instance_dir = os.path.join(current_app.root_path, 'agentmemory')
        db_base_path = os.path.join(instance_dir, f'conversations_{user_id}')
        
        # List of SQLite file extensions to clean up
        sqlite_extensions = ['.db', '.db-wal', '.db-shm']
        deleted_files = []
        
        # Delete all SQLite database files for this user
        for ext in sqlite_extensions:
            file_path = db_base_path + ext
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    deleted_files.append(os.path.basename(file_path))
                    print(f"Deleted: {file_path}")
                except Exception as e:
                    print(f"Could not delete file {file_path}: {e}")
        
        if deleted_files:
            print(f"Successfully deleted memory files for user {user_id}: {deleted_files}")
        else:
            print(f"No memory files found to delete for user {user_id}")
            
        return True
        
    except Exception as e:
        print(f"Error cleaning up user memory for user {user_id}: {e}")
        return False


def encode_image(image_path):
    """Encode image to base64"""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
    except Exception as e:
        raise Exception(f"Failed to encode image: {str(e)}")


@function_tool()
async def draft_listing(
    listing_title: str,
    listing_description_paragraph: str,
    event_plain: str,
    date: str,  # formatted as YYYY-MM-DD
    venue: str,
    seat_details: str,
    estimated_market_value: int # strict float, no ranges/strings,
    
):
    """
     Drafts a structured marketplace listing from the extracted details of a ticket stub.

    Parameters:
        listing_title (str): A concise title for the listing.
        listing_description_paragraph (str): A descriptive paragraph providing 
            context and details about the ticket/event.
        event_plain (str): The plain text name of the event (e.g., "Coldplay Concert").
        date (str): The date of the event, formatted strictly as YYYY-MM-DD.
        venue (str): The name of the venue where the event will take place.
        seat_details (str): Specific seating information (e.g., "Section A, Row 5, Seat 12").
        estimated_market_value (float): The precise market value of the ticket. 
            Must be a float (e.g., 120.01) and cannot be a string or range.
    """
    
    # Store stub in database
    try:
        # Get the current app context
        with current_app.app_context():
            # Get image path from app context or use a default
            image_path = getattr(current_app, 'last_uploaded_image_path', '')
            if not image_path:
                # Fallback: create a placeholder path
                image_path = f"placeholder_{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            
            # Validate required fields
            if not listing_title or not event_plain or not venue:
                return f"Warning: Missing required fields, but listing created for {event_plain} at {venue} on {date} with estimated value: ${estimated_market_value}"
            
            # Validate date format
            parsed_date = Stub.parse_date(date)
            if not parsed_date:
                return f"Warning: Invalid date format ({date}), but listing created for {event_plain} at {venue} with estimated value: ${estimated_market_value}"
            
            # Validate estimated market value
            if not isinstance(estimated_market_value, (int, float)) or estimated_market_value <= 0:
                return f"Warning: Invalid estimated market value ({estimated_market_value}), but listing created for {event_plain} at {venue} on {date}"
            
            # Create new stub record
            new_stub = Stub(
                user_id=current_user.id,
                title=listing_title,
                image_path=image_path,
                raw_text=listing_description_paragraph,
                event_name=event_plain,
                event_date=parsed_date,
                venue_name=venue,
                ticket_price=estimated_market_value,
                currency='USD',
                seat_info=seat_details,
                status='processed'
            )
            
            # Add to database
            db.session.add(new_stub)
            db.session.commit()
            
            # Verify the stub was actually created
            if new_stub.id:
                # Expose the created stub id to the request context for response usage
                try:
                    current_app.last_created_stub_id = new_stub.id
                except Exception:
                    pass
                
                # Return success message
                return f"Stub successfully stored in database with ID: {new_stub.id}. Listing created for {event_plain} at {venue} on {date} with estimated value: ${estimated_market_value}"
            else:
                raise Exception("Stub was not properly created in database")
            
    except Exception as e:
        
        # Return error message but continue with listing creation
        return f"Warning: Stub storage failed ({str(e)}), but listing created for {event_plain} at {venue} on {date} with estimated value: ${estimated_market_value}"
    finally:
        # Clean up the image path from app context to prevent reuse
        try:
            if hasattr(current_app, 'last_uploaded_image_path'):
                delattr(current_app, 'last_uploaded_image_path')
        except Exception as e:
            print(f"Warning: Could not clean up image path: {e}")
    
    # Clean up user memory after successful listing creation
    try:
        # Clear all agent memory for this user
        clear_user_memory(current_user.id)
        
    except Exception as e:
        print(f"Error cleaning up user memory: {e}")


def get_agent():
    """Get or create Agent instance"""
    return Agent(
        name="Stub Analyzer Agent",
        instructions=stub_creation_agent_prompt(),
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
    stub_id = None
    stub_created = False

    try:
        # Handle both JSON and form data
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json()
            query = data.get('query', '')
            queryid_raw = data.get('queryid')
            queryid = int(queryid_raw) if queryid_raw is not None else None
        else:
            query = request.form.get('query', '')
            queryid_raw = request.form.get('queryid')
            queryid = int(queryid_raw) if queryid_raw is not None else None

        image_file = request.files.get('image') if request.files else None

        # ------------------------
        # CASE 1: Image uploaded now
        # ------------------------
        if image_file and image_file.filename != '':
            if not allowed_file(image_file.filename):
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid file type. Allowed types: PNG, JPG, JPEG'
                }), 400

            try:
                saved_image_path = custom_save_image(image_file, current_user.id)
                current_app.last_uploaded_image_path = saved_image_path  # persist image

                if not os.path.exists(saved_image_path):
                    raise Exception("Saved image file does not exist")

                if os.path.getsize(saved_image_path) == 0:
                    raise Exception("Saved image file is empty")

            except Exception as e:
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to save image: {str(e)}'
                }), 500

            # Encode for agent
            try:
                base64_image = encode_image(saved_image_path)
            except Exception as e:
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to process image: {str(e)}'
                }), 500

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

            try:
                result = asyncio.run(Runner.run(
                    get_agent(),
                    input=message,
                    session=None
                ))

                session = get_session(current_user.id)
                user_content = f"{query + ' + [image]' if query else '[image only]'}"
                asyncio.run(session.add_items([
                    {"role": "user", "content": user_content},
                    {"role": "assistant", "content": result.final_output},
                ]))

            except Exception as e:
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to process with agent: {str(e)}'
                }), 500

        # ------------------------
        # CASE 2: Query only (no image in this request)
        # ------------------------
        else:
            if hasattr(current_app, 'last_uploaded_image_path'):
                # Reuse previously uploaded image
                saved_image_path = current_app.last_uploaded_image_path
                try:
                    session = get_session(current_user.id)
                    result = asyncio.run(Runner.run(
                        get_agent(),
                        input=query,
                        session=session
                    ))
                except Exception as e:
                    return jsonify({
                        'status': 'error',
                        'message': f'Failed to process query: {str(e)}'
                    }), 500
            else:
                # No image ever uploaded → prepend "no image uploaded" info
                modified_query = f"{query} (Note: No image uploaded for analysis)"
                try:
                    session = get_session(current_user.id)
                    result = asyncio.run(Runner.run(
                        get_agent(),
                        input=modified_query,
                        session=session
                    ))
                except Exception as e:
                    return jsonify({
                        'status': 'error',
                        'message': f'Failed to process query: {str(e)}'
                    }), 500

        # ------------------------
        # Stub tracking and cleanup
        # ------------------------
        try:
            if hasattr(current_app, 'last_created_stub_id'):
                potential_id = getattr(current_app, 'last_created_stub_id', None)
                if potential_id:
                    stub_id = potential_id
                    stub_created = True
        finally:
            try:
                if hasattr(current_app, 'last_created_stub_id'):
                    delattr(current_app, 'last_created_stub_id')
            except Exception:
                pass

        if stub_created:
            try:
                print(f"Stub was created successfully (ID: {stub_id}), clearing agent memory...")
                clear_user_memory(current_user.id)
                print(f"Agent memory cleared for user {current_user.id}")
            except Exception as e:
                print(f"Warning: Failed to clear agent memory after stub creation: {e}")

        # ------------------------
        # Final response
        # ------------------------
        return jsonify({
            'date': datetime.now().strftime('%Y-%m-%d'),
            'question': query if query else '[image only]',
            'question_id': queryid,
            'response': result.final_output,
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'user_id': current_user.id,
            'stub_id': stub_id,
            'stub_created': stub_created
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to process request',
            'error': str(e)
        }), 500
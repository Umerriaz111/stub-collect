from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
import base64
import json
from datetime import datetime
from typing import List, Dict, Optional
import google.generativeai as genai
from PIL import Image
import io
import logging
from app.prompts.agentprompt import chatbot_agent_prompt
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bp = Blueprint('chatbot', __name__, url_prefix='/api/chatbot')

# Configure Google Gemini AI
def configure_gemini():
    """Configure Google Gemini AI with API key"""
    try:
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            return None
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        return model
    except Exception as e:
        logger.error(f"Error configuring Gemini AI: {e}")
        return None

def validate_image_file(file) -> tuple[bool, str]:
    """Validate uploaded image file"""
    if not file:
        return False, "No image file provided"
    
    # Handle BytesIO objects (from base64)
    if hasattr(file, 'read') and hasattr(file, 'seek'):
        # This is a BytesIO object, skip filename validation
        return True, ""
    
    # Check file extension for uploaded files
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
    if '.' not in file.filename or \
       file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return False, f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
    
    # Check file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    if hasattr(file, 'content_length') and file.content_length and file.content_length > max_size:
        return False, "File size too large. Maximum size: 10MB"
    
    return True, ""

def process_image_for_ai(image_file) -> Optional[Image.Image]:
    """Process image file for AI analysis"""
    try:
        # Handle both file uploads and BytesIO objects
        if hasattr(image_file, 'stream'):
            # File upload object
            image = Image.open(image_file.stream)
        else:
            # BytesIO object
            image = Image.open(image_file)
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too large (Gemini has size limits)
        max_dimension = 1024
        if max(image.size) > max_dimension:
            ratio = max_dimension / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        return image
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return None

def build_conversation_context(conversation_history: List[Dict]) -> str:
    """Build conversation context from history"""
    if not conversation_history:
        return ""
    
    context_parts = []
    for i, message in enumerate(conversation_history):
        # Handle both old format (role/content) and new format (question/response)
        if 'role' in message and 'content' in message:
            # Old format: role/content
            role = message.get('role', '')
            content = message.get('content', '')
            if role and content:
                context_parts.append(f"{role} ({i+1}): {content}")
    
    return "\n".join(context_parts)

def generate_ai_response(
    model, 
    question: str, 
    image: Optional[Image.Image] = None, 
    conversation_history: List[Dict] = None
) -> tuple[bool, str]:
    """Generate AI response using Gemini"""
    try:
        # Build the prompt with conversation context
        context = build_conversation_context(conversation_history or [])
        
        # Beautiful StubCollector Agent Prompt
        system_prompt = chatbot_agent_prompt()
        
        if context:
            full_prompt = f"""{system_prompt}

            Previous conversation context:
            {context}

            **Your Question:** {question}

            Please provide a comprehensive, helpful response. If this is a follow-up question, I'll consider our conversation history to give you the most relevant answer."""
        else:
            full_prompt = f"""{system_prompt}

            **Your Question:** {question}

            I'm ready to help! Please let me know what you'd like to know about your documents, shipping, or any other related topics."""
                    
        if image:
            # Generate response with image
            response = model.generate_content([full_prompt, image])
        else:
            # Generate text-only response
            response = model.generate_content(full_prompt)
        
        if response.text:
            return True, response.text.strip()
        else:
            return False, "AI model failed to generate a response"
            
    except Exception as e:
        logger.error(f"Error generating AI response: {e}")
        return False, f"Error generating response: {str(e)}"

@bp.route('/chat', methods=['POST'])
@login_required
def chat():
    """
    Chatbot endpoint that handles:
    1. Text-only questions
    2. Questions with images
    3. Conversation context from previous interactions
    
    Input:
    - question: User's question (required)
    - image: Optional image file or base64 string
    - conversation_history: Array of previous conversation messages with structure:
        # Format 1 (role/content - legacy support):
        [
            {
                "role": "user",
                "content": "Hi, I just uploaded a ticket. Can you tell me what it is for?"
            },
            {
                "role": "assistant", 
                "content": "Sure! This looks like an event ticket for 'A Ride For Texas'..."
            }
        ]
        
        # Format 2 (question/response - new format):
        [
            {
                "question_id": 1,
                "question": "What is this ticket for?",
                "response": "This is a concert ticket for...",
                "timestamp": "2025-08-16T19:45:00"
            }
        ]
    - question_id: Unique identifier for the question (optional, auto-generated if not provided)
    
    Output:
    - success: Boolean indicating success
    - user_id: User ID (integer)
    - question_id: Unique identifier for the question (integer)
    - question: Original user question
    - response: AI generated response
    - date: Date of response (YYYY-MM-DD)
    - timestamp: ISO timestamp
    """
    try:
        # Handle both JSON and form data
        if request.is_json:
            # JSON request
            data = request.get_json()
            question = data.get('question', '').strip()
            conversation_history = data.get('conversation_history', [])
            question_id = data.get('question_id')
        else:
            # Form data request
            question = request.form.get('question', '').strip()
            conversation_history = request.form.get('conversation_history', '[]')
            question_id = request.form.get('question_id')
        
        # Validate question
        if not question:
            return jsonify({
                'success': False,
                'user_id': current_user.id,
                'question_id': int(question_id) if question_id else int(datetime.now().timestamp()),
                'question': question or '',
                'response': '',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'timestamp': datetime.now().isoformat()
            }), 400
        
        # Parse conversation history (only needed for form data)
        if not request.is_json:
            try:
                conversation_history = json.loads(conversation_history)
                if not isinstance(conversation_history, list):
                    conversation_history = []
            except (json.JSONDecodeError, TypeError):
                conversation_history = []
        
        # Ensure conversation_history is a list
        if not isinstance(conversation_history, list):
            conversation_history = []
        
        # Handle image input
        image_file = request.files.get('image')
        image_path = None
        processed_image = None
        
        if request.is_json and data.get('image'):
            # Handle base64 encoded image from JSON
            try:
                image_data = data.get('image')
                if image_data.startswith('data:image'):
                    # Remove data URL prefix
                    image_data = image_data.split(',')[1]
                
                image_bytes = base64.b64decode(image_data)
                image_stream = io.BytesIO(image_bytes)
                image_stream.name = 'image.jpg'  # Give it a name for processing
                
                                # Process base64 image
                processed_image = process_image_for_ai(image_stream)
                if not processed_image:
                    return jsonify({
                        'success': False,
                        'user_id': current_user.id,
                        'question_id': int(question_id) if question_id else int(datetime.now().timestamp()),
                        'question': question or '',
                        'response': '',
                        'date': datetime.now().strftime('%Y-%m-%d'),
                        'timestamp': datetime.now().isoformat()
                    }), 400
                
                # Save image if configured
                if current_app.config.get('SAVE_CHATBOT_IMAGES', False):
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    filename = f"chatbot_{current_user.id}_{timestamp}_base64.jpg"
                    upload_dir = os.path.join(current_app.root_path, 'static', 'uploads', 'chatbot')
                    os.makedirs(upload_dir, exist_ok=True)
                    
                    image_path = os.path.join('uploads', 'chatbot', filename)
                    full_path = os.path.join(upload_dir, filename)
                    processed_image.save(full_path, 'JPEG', quality=85)
                    
            except Exception as e:
                logger.error(f"Error processing base64 image: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Invalid image data'
                }), 400
                
        elif image_file:
            # Handle file upload from form data
            # Validate image
            is_valid, error_msg = validate_image_file(image_file)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'user_id': current_user.id,
                    'question_id': int(question_id) if question_id else int(datetime.now().timestamp()),
                    'question': question or '',
                    'response': '',
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'timestamp': datetime.now().isoformat()
                }), 400
            
            # Process image for AI
            processed_image = process_image_for_ai(image_file)
            if not processed_image:
                return jsonify({
                    'success': False,
                    'user_id': current_user.id,
                    'question_id': int(question_id) if question_id else int(datetime.now().timestamp()),
                    'question': question or '',
                    'response': '',
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'timestamp': datetime.now().isoformat()
                }), 400
            
            # Save image to uploads directory (optional)
            if current_app.config.get('SAVE_CHATBOT_IMAGES', False):
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"chatbot_{current_user.id}_{timestamp}_{secure_filename(image_file.filename)}"
                upload_dir = os.path.join(current_app.root_path, 'static', 'uploads', 'chatbot')
                os.makedirs(upload_dir, exist_ok=True)
                
                image_path = os.path.join('uploads', 'chatbot', filename)
                full_path = os.path.join(upload_dir, filename)
                processed_image.save(full_path, 'JPEG', quality=85)
        
        # Configure and use Gemini AI
        model = configure_gemini()
        if not model:
            return jsonify({
                'success': False,
                'user_id': current_user.id,
                'question_id': int(question_id) if question_id else int(datetime.now().timestamp()),
                'question': question or '',
                'response': '',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'timestamp': datetime.now().isoformat()
            }), 503
        
        # Generate AI response
        success, response_text = generate_ai_response(
            model=model,
            question=question,
            image=processed_image,
            conversation_history=conversation_history
        )
        
        if not success:
            return jsonify({
                'success': False,
                'user_id': current_user.id,
                'question_id': int(question_id) if question_id else int(datetime.now().timestamp()),
                'question': question or '',
                'response': '',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Prepare response
        current_timestamp = datetime.now().isoformat()
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # Generate question_id if not provided (as integer)
        if not question_id:
            question_id = int(datetime.now().timestamp())
        else:
            # Convert question_id to int if it's a string
            try:
                question_id = int(question_id)
            except (ValueError, TypeError):
                question_id = int(datetime.now().timestamp())
        
        response_data = {
            'success': True,
            'user_id': current_user.id,
            'question_id': question_id,
            'question': question,
            'response': response_text,
            'date': current_date,
            'timestamp': current_timestamp
        }
        
        logger.info(f"Chatbot response generated for user {current_user.id}")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error in chatbot endpoint: {e}")
        return jsonify({
            'success': False,
            'user_id': current_user.id,
            'question_id': int(question_id) if question_id else int(datetime.now().timestamp()),
            'question': question or '',
            'response': '',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the chatbot service"""
    try:
        model = configure_gemini()
        status = "healthy" if model else "unhealthy"
        
        return jsonify({
            'service': 'chatbot',
            'status': status,
            'timestamp': datetime.now().isoformat(),
            'ai_model': 'gemini-pro-vision' if model else 'unavailable'
        }), 200 if model else 503
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'service': 'chatbot',
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Error handlers
@bp.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({
        'success': False,
        'user_id': 0,  # Default user_id for error cases
        'question_id': int(datetime.now().timestamp()),
        'question': '',
        'response': '',
        'date': datetime.now().strftime('%Y-%m-%d'),
        'timestamp': datetime.now().isoformat()
    }), 413

@bp.errorhandler(400)
def bad_request(e):
    """Handle bad request error"""
    return jsonify({
        'success': False,
        'user_id': 0,  # Default user_id for error cases
        'question_id': int(datetime.now().timestamp()),
        'question': '',
        'response': '',
        'date': datetime.now().strftime('%Y-%m-%d'),
        'timestamp': datetime.now().isoformat()
    }), 400

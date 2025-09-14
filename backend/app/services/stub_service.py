import os
from PIL import Image
from datetime import datetime
from werkzeug.utils import secure_filename
#from langchain_google_genai import ChatGoogleGenerativeAI
#from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
from typing import Optional, Literal
import base64
import dotenv
from app.models.stub import SUPPORTED_CURRENCIES

dotenv.load_dotenv()

# Set your Google API key (replace with your actual key or set as environment variable)
# os.environ["GOOGLE_API_KEY"] = "YOUR_GOOGLE_API_KEY"

class StubData(BaseModel):
    """
    Represents extracted information from a ticket stub.
    """
    event_name: Optional[str] = Field(None, description="The name of the event.")
    event_date: Optional[str] = Field(None, description="The date of the event in a clear format (e.g., YYYY-MM-DD).")
    venue_name: Optional[str] = Field(None, description="The name of the venue where the event took place.")
    ticket_price: Optional[float] = Field(None, description="The numeric price value without currency symbol")
    currency: Optional[Literal['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNH', 'HKD', 'NZD']] = Field(
        'USD',
        description="The currency of the ticket price (USD, EUR, JPY, etc.)"
    )
    seat_info: Optional[str] = Field(None, description="Detailed seat information (e.g., Row, Section, Seat Number).")

class StubProcessor:
    def __init__(self, upload_folder):
        self.upload_folder = upload_folder
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        # Initialize Google Gemini Vision model
        self.llm_vision = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=api_key,
            temperature=0.1
        )

    def save_image(self, image_file, user_id):
        """Save the uploaded image and return the path"""
        try:
            # Create user directory if it doesn't exist
            user_dir = os.path.join(self.upload_folder, str(user_id))
            os.makedirs(user_dir, exist_ok=True)

            # Secure the filename and save the image
            filename = secure_filename(image_file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            file_path = os.path.join(user_dir, filename)
            
            # Process and save the image
            with Image.open(image_file) as img:
                # Convert RGBA to RGB if necessary
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                # Resize if too large (max 2000x2000)
                if img.size[0] > 2000 or img.size[1] > 2000:
                    img.thumbnail((2000, 2000))
                img.save(file_path, quality=85, optimize=True)
            
            return file_path
        except Exception as e:
            raise Exception(f"Error saving image: {str(e)}")

    def process_image(self, image_path):
        """Process the image by sending it directly to Gemini Vision for parsing."""
        try:
            # Parse the image using Google Gemini Vision with structured output
            parsed_data = self.parse_image_with_gemini_vision(image_path)
            
            if parsed_data is None:
                return {
                    'success': False,
                    'error': 'Failed to extract information from the image'
                }
            
            return {
                'success': True,
                'raw_text': "Image processed by Gemini Vision API",
                'parsed_data': parsed_data.model_dump()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def parse_image_with_gemini_vision(self, image_path: str) -> Optional[StubData]:
        """
        Parses the image using Google Gemini Vision to extract structured stub data.
        """
        try:
            # Configure the LLM to return structured output
            structured_llm_vision = self.llm_vision.with_structured_output(StubData)

            # Read and encode image
            with open(image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

            # Create the prompt
            message_content = [
                {
                    "type": "text",
                    "text": f"""
                    You are an expert at extracting information from ticket stubs.
                    Analyze the provided image of a ticket stub and extract the following information:
                    - Event Name
                    - Event Date (format as YYYY-MM-DD)
                    - Venue Name
                    - Ticket Price (extract only the numeric value without currency symbol)
                    - Currency (identify the currency from these options: {', '.join(SUPPORTED_CURRENCIES)})
                    - Seat Information (e.g., Row, Section, Seat Number, Gate)

                    For the ticket price:
                    - Extract only the numeric value (e.g., for "$50.00" just return 50.00)
                    - Look for currency symbols (€, £, ¥, etc.) to determine the currency
                    - Default to USD if no currency symbol is found
                    - For JPY prices, convert any sen (1/100 yen) to full yen

                    If a piece of information is not clearly visible or found, return None for that field.
                    Prioritize accuracy over completeness.
                    """
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{encoded_string}"
                    }
                }
            ]
            
            # Process with Gemini Vision
            response = structured_llm_vision.invoke([HumanMessage(content=message_content)])
            
            return response
        except Exception as e:
            print(f"Error parsing with Gemini Vision: {e}")
            return StubData()

# Example Usage (you'd typically integrate this into your Flask routes)
if __name__ == '__main__':
    # Create a dummy upload folder for testing
    if not os.path.exists('uploads'):
        os.makedirs('uploads')

    processor = StubProcessor('uploads')

    # Create a dummy image file for testing using Pillow
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # Create a blank image
        img = Image.new('RGB', (800, 400), color = (255, 255, 255))
        d = ImageDraw.Draw(img)

        # Try to load a font, if not available, use default
        try:
            # A common path for Arial on Windows, adjust for your OS or use a Google Font
            font_path = "C:/Windows/Fonts/arial.ttf"
            if os.path.exists(font_path):
                fnt = ImageFont.truetype(font_path, 30)
            else:
                fnt = ImageFont.load_default()
                print("Using default font. For better results, provide a path to a .ttf font like Arial.")
        except IOError:
            fnt = ImageFont.load_default()
            print("Could not load Arial font. Using default font.")

        # Add text to the image to simulate a ticket stub
        d.text((50, 50), "GLOBAL MUSIC FEST", fill=(0,0,0), font=fnt)
        d.text((50, 100), "Date: 2025-08-15 7:00 PM", fill=(0,0,0), font=fnt)
        d.text((50, 150), "Venue: Olympic Stadium", fill=(0,0,0), font=fnt)
        d.text((50, 200), "Price: $99.99 USD", fill=(0,0,0), font=fnt)
        d.text((50, 250), "Section: GA, Row: Stand, Seat: All", fill=(0,0,0), font=fnt)
        d.text((50, 300), "Gate 3 Entrance", fill=(0,0,0), font=fnt)
        
        dummy_image_path = "temp_ticket_stub_for_gemini.png"
        img.save(dummy_image_path)

        # Simulate an uploaded file
        class DummyFile:
            def __init__(self, filename, content):
                self.filename = filename
                self.content = content
            
            def save(self, path):
                with open(path, 'wb') as f:
                    f.write(self.content)

        with open(dummy_image_path, 'rb') as f:
            dummy_image_content = f.read()
        
        dummy_image_file = DummyFile("sample_ticket_gemini.png", dummy_image_content)
        
        print("Saving dummy image...")
        saved_path = processor.save_image(dummy_image_file, user_id=456)
        print(f"Image saved to: {saved_path}")

        print("\nProcessing image with Gemini Vision...")
        result = processor.process_image(saved_path)

        if result['success']:
            print("\n--- Processing Result ---")
            print(f"Raw Text Info: {result['raw_text']}") # Will indicate image was sent
            print("\n--- Parsed Data (from Gemini Vision) ---")
            import json
            print(json.dumps(result['parsed_data'], indent=4))
        else:
            print(f"Error processing image: {result['error']}")
        
        # Clean up the dummy image and saved file
        os.remove(dummy_image_path)
        os.remove(saved_path)
        os.rmdir(os.path.join('uploads', '456'))
        print("\nCleanup complete.")

    except ImportError:
        print("Pillow not found. Please install: pip install Pillow")
        print("\nCannot generate dummy image for demonstration. You will need a real image file to test.")
    except Exception as e:
        print(f"An error occurred during example execution: {e}")
        print("Please ensure your GOOGLE_API_KEY environment variable is set or provided directly in the code.")

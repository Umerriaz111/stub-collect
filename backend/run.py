from app import create_app
from dotenv import load_dotenv
import os



app = create_app()

if __name__ == '__main__':
    port = os.getenv("BACKEND_PORT")
   
    app.run(debug=True, port=port)

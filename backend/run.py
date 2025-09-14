from app import create_app
from dotenv import load_dotenv
import os



app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))  # Render sets PORT, fallback for local
    app.run(host="0.0.0.0", port=port, debug=True)

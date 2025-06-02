# Stub Collector Project

This project consists of a Flask backend API and a frontend application (to be implemented) for managing ticket stubs.

## Backend

### Prerequisites

- Python 3.12 or higher (Recommended 3.12.10)
- pip (Python package installer)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create and activate virtual environment**

   ```bash
   # Create virtual environment
   python -m venv my_env

   # Activate virtual environment
   # On Linux/Mac:
   source my_env/bin/activate
   # On Windows:
   my_env\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python run.py
   ```
   The server will start running at `http://localhost:5000`

### API Endpoints

The following endpoints are available:

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Development Notes

- The application uses SQLite as the default database
- CORS is configured to allow requests from `http://localhost:3000`
- Session-based authentication is implemented using Flask-Login

### Troubleshooting

If you encounter any issues:

1. Make sure your virtual environment is activated
2. Verify all dependencies are installed correctly
3. Check if the SQLite database file is created in the `instance` folder
4. Ensure you're running the application from the `backend` directory

## Frontend

_To be implemented_

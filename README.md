# Splunk Log Analyzer Chatbot

A powerful chatbot application designed to analyze Splunk logs using Google Gemini AI. This application allows users to connect to log data, visualize it, and ask natural language questions to gain insights.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8+**
- **Node.js 16+**
- **npm** (usually comes with Node.js)

## Setup Instructions

### 1. Backend Setup

The backend is built with Python and Flask.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```

3.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Set up environment variables:
    - Create a `.env` file in the `backend` directory.
    - Add your Google Gemini API key:
      ```
      GOOGLE_API_KEY=your_api_key_here
      ```

5.  Start the backend server:
    ```bash
    python app.py
    ```
    The server will start on `http://localhost:8000`.

### 2. Frontend Setup

The frontend is built with React and Vite.

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the port shown in the terminal).

## Usage

1.  Open the frontend application in your browser.
2.  Click on the **Connect** button in the sidebar to load the sample log data.
3.  Once connected, you can ask questions about the data in the chat interface.
    - Example: "Show me the error distribution over time."
    - Example: "What are the most common error messages?"

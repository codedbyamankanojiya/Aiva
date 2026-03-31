# Aiva Setup Instructions

This guide provides detailed instructions on how to set up and run both the frontend and backend applications for the Aiva project.

## Prerequisites
- **Node.js**: Requires npm (comes with Node.js) to run the frontend.
- **Python**: Requires Python to run the FastAPI backend.
- **Browser Permissions**: Camera and microphone access for interview functionality.

---

## 🚀 1. Starting the Frontend

The frontend is a TypeScript application that uses `npm` for package management and starting the dev server.

### Steps to Run:
**1. Open a new terminal and navigate to the frontend folder:**
```bash
cd d:\Projects\Hackathons\Aiva\frontend
```

**2. Install dependencies (First-time setup only):**
```bash
npm install
```

**3. Run the development server:**
```bash
npm run dev
```

Your frontend application should now be running. The exact URL (typically `http://localhost:3000` or `http://localhost:5173` or `http://localhost:5174`) will be displayed in the terminal output.

---

## 🐍 2. Starting the Backend

The backend is a Python application built with the FastAPI framework. We use a Python virtual environment (`venv`) to keep its dependencies isolated.

### Steps to Run:

**1. Open a new terminal and navigate to the backend folder:**
```bash
cd d:\Projects\Hackathons\Aiva\backend
```

**2. Create the virtual environment (First-time setup only):**
```bash
python -m venv venv
```

**3. Activate the virtual environment:**
- **On Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **On Windows (Command Prompt - CMD):**
  ```cmd
  .\venv\Scripts\activate
  ```
  *(You'll know the environment is activated when you see `(venv)` prepended to your command line prompt).*

**4. Install backend dependencies (First-time setup only):**
Make sure the virtual environment is activated, then run:
```bash
pip install -r requirements.txt
```

**5. Start the FastAPI Server:**
```bash
python main.py
```

---

### ⚡ Recommended Method: Direct Python (Backend)

If you want to run the backend straight from the command line without manually activating the `venv` each time, use this single command from inside the `backend` folder:

```bash
python main.py
```

The backend server should now be running on **http://localhost:8000**.

---

## 🎯 Quick Start (Both Services)

### Method 1: Run Both in Separate Terminals
1. **Terminal 1 - Frontend:**
   ```bash
   cd d:\Projects\Hackathons\Aiva\frontend
   npm run dev
   ```

2. **Terminal 2 - Backend:**
   ```bash
   cd d:\Projects\Hackathons\Aiva\backend
   python main.py
   ```

### Method 2: Run Backend First, Then Frontend
1. Start the backend first (it needs to be ready for API calls)
2. Then start the frontend (it will connect to the backend)

---

## 🎥 Camera & Microphone Features

### Interview Setup Page
After selecting a role and clicking "Start", you'll be taken to the interview setup page where you can:

**Camera Controls:**
- **Camera Button** (Right, red when off, blue when on): Click to toggle camera
- **Live Preview**: Camera feed appears in the video area when enabled
- **High Quality**: 1280x720 resolution for clear video

**Microphone Controls:**
- **Microphone Button** (Left, red when muted, blue when active): Click to toggle microphone
- **Audio Enhancement**: Echo cancellation, noise suppression, auto-gain control
- **Visual Feedback**: Button color and icon change based on state

**Join Interview:**
- Click "Join Interview" to start the session
- Camera will be automatically activated if not already on
- Button shows "Starting Camera..." during initialization

### During Interview
- **Camera Feed**: Continues from setup page
- **Microphone**: Toggle with mic button in bottom controls
- **Text-to-Speech**: Questions are read aloud automatically
- **Question Navigation**: Next/Previous buttons for progression

---

## 🔧 Troubleshooting

### Backend Issues
- **"Address already in use"**: Port 8000 is occupied. Kill existing processes:
  ```bash
  netstat -ano | findstr :8000
  taskkill /PID [PROCESS_ID] /F
  ```
- **"uvicorn command not found"**: Use `python main.py` instead
- **"Permission denied"**: Make sure you're in the correct directory
- **"Module not found"**: Run `pip install -r requirements.txt` in activated venv

### Frontend Issues  
- **"Port already in use"**: The frontend will automatically try the next available port (5174, 5175, etc.)
- **"Module not found"**: Run `npm install` to install dependencies

### Camera/Microphone Issues
- **"Camera access denied"**: 
  - Check browser permissions (click lock icon in address bar)
  - Ensure no other app is using the camera
  - Refresh page and try again
- **"Microphone not working"**:
  - Check browser microphone permissions
  - Ensure microphone is not muted in system settings
  - Try refreshing the page

---

## 📱 Access URLs
- **Frontend**: http://localhost:5173 (or next available port)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (when backend is running)

---

## 🎯 Application Flow

1. **Practice Page**: Select interview role (Software Engineer, Data Scientist, etc.)
2. **Interview Setup**: Test camera/microphone, configure language and level
3. **Active Session**: Live interview with questions, camera feed, and AI assistant
4. **Results**: Complete interview and view performance summary

---

## 💡 Pro Tips

- **Test Devices First**: Use the camera/microphone buttons in setup page to verify everything works
- **Good Lighting**: Ensure proper lighting for clear camera feed
- **Quiet Environment**: Minimize background noise for better microphone quality
- **Browser Choice**: Chrome/Edge work best for camera permissions
- **Stable Internet**: Required for API calls and smooth experience

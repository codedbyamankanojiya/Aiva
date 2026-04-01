# 🚀 Aiva Setup Guide

> **Complete step-by-step instructions to get Aiva running on your local machine**

## 📋 Prerequisites

### Required Software
- **Node.js** 18.0 or higher
- **npm** 8.0 or higher  
- **Python** 3.9 or higher
- **pip** (Python package manager)
- **Git** for version control

### API Keys Needed
- **ElevenLabs API Key** - For text-to-speech functionality
  - Get your key at: https://elevenlabs.io/app
  - Select the "Free" tier for development

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+

## 🛠️ Installation Steps

### 1. Clone the Repository

```bash
# Clone using HTTPS
git clone https://github.com/codedbyamankanojiya/aiva.git

# Or clone using SSH (if you have SSH keys set up)
git clone git@github.com:codedbyamankanojiya/aiva.git

# Navigate to project directory
cd aiva
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

#### Configure Backend Environment

Edit the `.env` file in the backend directory:

```env
# ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: Default voice ID for TTS
ELEVENLABS_VOICE_ID=your_voice_id_here

# Optional: Server configuration
HOST=0.0.0.0
PORT=8000
DEBUG=false
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Create environment file (if needed)
cp .env.example .env.local
```

#### Configure Frontend Environment

Edit the `.env.local` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Optional: Debug mode
VITE_DEBUG=false

# Optional: Analytics
VITE_ENABLE_ANALYTICS=false
```

## 🚀 Running the Application

### Method 1: Start Both Services (Recommended)

#### Terminal 1 - Backend
```bash
# In backend directory
cd backend

# Activate virtual environment (if not already active)
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Start the FastAPI server
python main.py
```

#### Terminal 2 - Frontend
```bash
# In a new terminal window
cd frontend

# Start the Vite development server
npm run dev
```

### Method 2: Start with Concurrent Scripts

```bash
# Install concurrently globally (one-time)
npm install -g concurrently

# Start both services from root directory
concurrently "cd backend && python main.py" "cd frontend && npm run dev"
```

## 🌐 Access the Application

Once both services are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Development Workflow

### Frontend Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run linting with auto-fix
npm run lint:fix
```

### Backend Development Commands

```bash
# Start development server
python main.py

# Start with auto-reload (for development)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run with debug mode
DEBUG=true python main.py

# Install dependencies
pip install -r requirements.txt

# Update dependencies
pip install --upgrade -r requirements.txt
```

## 🧪 Testing

### Frontend Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

### Backend Testing

```bash
# Run Python tests
python -m pytest

# Run tests with coverage
python -m pytest --cov=.

# Run specific test file
python -m pytest tests/test_api.py
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Port Already in Use
```bash
# Error: Port 5173 is already in use
# Solution: Change port in vite.config.ts or kill existing process

# On Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti:5173
kill -9 <PID>
```

#### Module Not Found Errors
```bash
# Frontend: Module not found
npm install

# Backend: Module not found
pip install -r requirements.txt
```

#### API Key Issues
```bash
# Error: Invalid ElevenLabs API key
# Solution:
# 1. Check API key in backend/.env
# 2. Verify key is active on ElevenLabs dashboard
# 3. Check for extra spaces or special characters
```

#### CORS Issues
```bash
# Error: CORS policy blocked request
# Solution: Ensure frontend URL is in backend CORS origins
# Edit main.py and add: "http://localhost:5173"
```

#### Virtual Environment Issues
```bash
# On Windows: venv\Scripts\activate not found
# Solution: Use PowerShell or Command Prompt with admin rights

# On macOS: Permission denied
# Solution: chmod +x venv/bin/activate
```

## 🔍 Verification Steps

### 1. Verify Backend is Running
```bash
# Test API health
curl http://localhost:8000/health

# Test API documentation
curl http://localhost:8000/docs
```

### 2. Verify Frontend is Running
```bash
# Check if frontend responds
curl http://localhost:5173

# Check browser console for errors
# Open http://localhost:5173 in browser
```

### 3. Test Integration
1. Open http://localhost:5173 in browser
2. Navigate to Settings page
3. Test theme toggle functionality
4. Try starting a practice session
5. Verify TTS is working (requires API key)

## 📱 Mobile Development

### iOS Development
```bash
# Install iOS dependencies (if needed)
cd frontend
npm install

# Start with iOS simulator
npm run dev:ios
```

### Android Development
```bash
# Install Android dependencies (if needed)
cd frontend
npm install

# Start with Android emulator
npm run dev:android
```

## 🚀 Production Deployment

### Frontend Build
```bash
# Create optimized production build
npm run build

# Output will be in: frontend/dist/
# Deploy this folder to your hosting service
```

### Backend Deployment
```bash
# Production server setup
pip install gunicorn

# Start with Gunicorn
gunicorn main:app --host 0.0.0.0 --port 8000

# Or use Docker (recommended)
docker build -t aiva-backend .
docker run -p 8000:8000 aiva-backend
```

## 🔧 Environment Variables Reference

### Backend (.env)
```env
# Required
ELEVENLABS_API_KEY=your_api_key_here

# Optional
ELEVENLABS_VOICE_ID=your_voice_id_here
HOST=0.0.0.0
PORT=8000
DEBUG=false
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### Frontend (.env.local)
```env
# Required
VITE_API_URL=http://localhost:8000

# Optional
VITE_DEBUG=false
VITE_ENABLE_ANALYTICS=false
VITE_SENTRY_DSN=your_sentry_dsn_here
```

## 📚 Additional Resources

### Documentation
- **API Documentation**: http://localhost:8000/docs
- **React Documentation**: https://react.dev/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

### Community & Support
- **GitHub Issues**: https://github.com/codedbyamankanojiya/aiva/issues

---

## ✅ Quick Start Checklist

- [ ] Clone repository
- [ ] Install Python dependencies (`pip install -r requirements.txt`)
- [ ] Install Node.js dependencies (`npm install`)
- [ ] Set up environment variables (.env files)
- [ ] Start backend server (`python main.py`)
- [ ] Start frontend server (`npm run dev`)
- [ ] Verify both services are running
- [ ] Test basic functionality in browser

## 🎉 Next Steps

Once setup is complete:

1. **Explore the Dashboard** - See your progress overview
2. **Try a Practice Session** - Experience the AI interview coach
3. **Configure Settings** - Customize your experience
4. **Check Analytics** - Monitor your improvement
5. **Join the Community** - Connect with other learners

Need help? Check our [troubleshooting section](#-troubleshooting) or [create an issue](https://github.com/codedbyamankanojiya/aiva/issues).

---

**🚀 Happy coding and good luck with your interview preparation!**

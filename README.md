# 🤖 Aiva - AI Interview Coach

> **A high-performance AI-driven personal coach designed to bridge gap between technical knowledge and communication excellence.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion)

## 🌟 Overview

Aiva revolutionizes interview preparation by deconstructing user performance into three core pillars:
- **🧬 Biological** - Body language, posture, and non-verbal cues
- **🎤 Vocal** - Speech patterns, tone, and delivery analysis  
- **🧠 Logical** - Content quality, structure, and technical accuracy

Unlike traditional recording tools, Aiva reconstructs this data into personalized, actionable roadmaps for success in Vivas and Interviews.

## ✨ Key Features

### 🎯 Interview Preparation
- **Role-Specific Mock Interviews** - Tailored questions for 50+ job roles
- **Real-Time AI Analysis** - Instant feedback on responses
- **Difficulty Progression** - Beginner to Expert level challenges
- **Industry-Specific Training** - Tech, Finance, Healthcare, and more

### 🎨 Premium UI/UX
- **Dark/Light Theme System** - Seamless theme switching
- **Lenis Smooth Scrolling** - Butter-smooth navigation
- **Glassmorphism Design** - Modern, elegant interface
- **Micro-interactions** - Delightful hover states and transitions
- **Responsive Design** - Perfect on mobile, tablet, and desktop

### 🚀 Advanced Features
- **Text-to-Speech** - Natural voice synthesis with ElevenLabs
- **Camera & Audio Analysis** - Real-time performance tracking
- **Progress Analytics** - Detailed performance metrics
- **Achievement System** - Gamified learning experience

## 🏗️ Architecture

### Frontend Stack
```
React 18 + TypeScript
├── UI Framework: Tailwind CSS
├── Animations: Framer Motion + Lenis
├── State Management: React Context
├── Routing: React Router
├── HTTP Client: Fetch API
└── Build Tool: Vite
```

### Backend Stack
```
Python + FastAPI
├── ASGI Server: Uvicorn
├── AI Services: ElevenLabs TTS
├── Data Validation: Pydantic
├── CORS: FastAPI built-in
└── Environment: python-dotenv
```

## 🚀 Quick Start

> **⚠️ Important:** For detailed setup instructions, please refer to our [**Setup Guide**](./INSTRUCTIONS.md)

### Prerequisites
- **Node.js** 18+ and **npm** 8+
- **Python** 3.9+ and **pip**
- **ElevenLabs API Key** (for TTS functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/codedbyamankanojiya/aiva.git
   cd aiva
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   # Backend (.env)
   ELEVENLABS_API_KEY=your_api_key_here
   
   # Frontend (if needed)
   VITE_API_URL=http://localhost:8000
   ```

### Running the Application

1. **Start Backend**
   ```bash
   cd backend
   python main.py
   # Server runs on http://localhost:8000
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   # Application runs on http://localhost:5173
   ```

## 📁 Project Structure

```
aiva/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                # FastAPI backend
│   ├── main.py             # Main application entry
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment variables
├── INSTRUCTIONS.md         # Detailed setup guide
└── README.md               # This file
```

## 🎮 Usage Guide

### Starting an Interview Session
1. **Browse Roles** - Select from 50+ interview categories
2. **Configure Settings** - Choose difficulty, language, and level
3. **Begin Session** - Start AI-powered mock interview
4. **Receive Feedback** - Get real-time performance analysis
5. **Track Progress** - Monitor improvement over time

### Key Features Navigation
- **📊 Dashboard** - Overview of progress and achievements
- **🎯 Practice** - Role selection and interview setup
- **📈 Analytics** - Detailed performance metrics
- **⚙️ Settings** - Theme, audio, and accessibility options
- **👥 Community** - Connect with other learners

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

### Feature Flags
```typescript
// In frontend/src/config/features.ts
export const FEATURES = {
  TTS_ENABLED: true,
  CAMERA_ANALYSIS: true,
  ADVANCED_ANALYTICS: true,
  GAMIFICATION: true
};
```

## 🎨 Customization

### Theme Configuration
```typescript
// Available themes
const themes = ['light', 'dark', 'auto'];

// Theme colors can be customized in CSS variables
:root {
  --primary-color: #7C3AED;
  --secondary-color: #6366F1;
  --accent-color: #EC4899;
}
```

### Animation Settings
```typescript
// Animation preferences
const animationConfig = {
  duration: 0.3,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  reducedMotion: false
};
```

## 🧪 Development

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

### Backend Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Code Quality
```bash
# Frontend linting
npm run lint

# Frontend type checking
npm run type-check

# Backend linting
flake8 backend/
```

## 📊 API Documentation

### Core Endpoints

#### Questions API
```http
GET /api/questions/{role_id}?level={level}
POST /api/questions/create
PUT /api/questions/{id}
```

#### TTS API
```http
POST /api/tts
Content-Type: application/json

{
  "text": "Your interview question here",
  "voice_id": "optional_voice_id"
}
```

#### Roles API
```http
GET /api/roles
POST /api/roles/create
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

## 🐛 Troubleshooting

### Common Issues

#### Frontend Issues
- **Module not found**: Run `npm install` in frontend directory
- **Port already in use**: Change port in `vite.config.ts`
- **Build fails**: Check TypeScript types and imports

#### Backend Issues
- **API key errors**: Verify ElevenLabs API key in `.env`
- **CORS issues**: Ensure frontend URL is in CORS origins
- **Module import errors**: Install all requirements with `pip install -r requirements.txt`

#### Performance Issues
- **Slow animations**: Enable reduced motion in settings
- **High memory usage**: Close unused browser tabs
- **Audio not working**: Check browser permissions for microphone

### Debug Mode
```bash
# Frontend debug
VITE_DEBUG=true npm run dev

# Backend debug
DEBUG=true python main.py
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Standards
- **TypeScript** for all frontend code
- **Python 3.9+** for backend code
- **ESLint** and **Prettier** for code formatting
- **Conventional Commits** for commit messages


## 🙏 Acknowledgments

- **[Framer Motion](https://www.framer.com/motion)** - Smooth animations
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[ElevenLabs](https://elevenlabs.io/)** - AI voice synthesis
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon library

## 📞 Support

- **🐛 Issues**: [Report bugs](https://github.com/codedbyamankanojiya/aiva/issues)
- **📖 Documentation**: [DOCUMENTATION.md](./DOCUMENTATION.md)

---

> **🚀 Ready to transform your interview preparation?** 
> 
> **Check out our [Setup Guide](./INSTRUCTIONS.md) to get started in minutes!**
>

Made with ❤️ by Team Pythasauras:

- Vaishnav Kadav
- Aman Kanojiya
- Mahima Mourya
- Tanvi Bhageshwar
# 📚 Aiva Documentation

> **Comprehensive technical documentation for developers and contributors**

## 📋 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Frontend Documentation](#-frontend-documentation)
3. [Backend Documentation](#-backend-documentation)
4. [API Reference](#-api-reference)
5. [Component Library](#-component-library)
6. [State Management](#-state-management)
7. [Styling Guide](#-styling-guide)
8. [Animation System](#-animation-system)
9. [Development Guidelines](#-development-guidelines)
10. [Testing Strategy](#-testing-strategy)
11. [Deployment Guide](#-deployment-guide)
12. [Troubleshooting](#-troubleshooting)

---

## 🏗️ Architecture Overview

### System Architecture
```text
┌─────────────────┐    HTTP/WS   ┌─────────────────┐
│   Frontend      │ ◄──────────► │    Backend      │
│   (React)       │              │   (FastAPI)     │
│                 │              │                 │
│ • Edge Vision   │              │ • API Endpoints │
│ • UI Components │              │ • LLM/NLP Engine│
│ • State Mgmt    │              │ • Speech-to-Text│
│ • Animations    │              │ • TTS Service   │
└─────────────────┘              └─────────────────┘
         │                               │
    Local ML Models               External Services
 (TensorFlow/Face-API)          (ElevenLabs, DB, LLM)
```

### Technology Stack

#### Frontend
- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lenis** - Smooth scrolling
- **React Router** - Client-side routing

#### Backend & AI
- **Python 3.9+** - Programming language
- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **LLM/NLP Engine** - Evaluates contextual relevance of answers
- **Vosk / Web Speech** - Speech-to-Text conversion
- **ElevenLabs** - Text-to-speech AI generation
- **Pydantic** - Data validation
- **python-dotenv** - Environment management

#### Machine Learning / Vision (Frontend-driven)
- **TensorFlow.js (@tensorflow/tfjs-core)** - Local ML execution
- **face-api (@vladmandic/face-api)** - Face detection and expressions

---

## 🎨 Frontend Documentation

### Project Structure
```
frontend/src/
├── components/         # Reusable UI components
│   ├── common/         # Shared components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   ├── effects/        # Visual effects
│   └── vision/         # Real-time face tracking and Vision HUD components
├── context/            # React context providers
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── Section/        # Interview sections (e.g., ActiveSession)
│   └── ...             # Other pages (Resources, Dashboard, etc.)
├── hooks/              # Custom React hooks (e.g., useVisionSystem, useLenis)
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # Global styles
└── assets/             # Static assets
```

### Component Architecture

#### Component Hierarchy
```
App
├── BrowserRouter
├── ThemeProvider
├── AuthProvider
├── InterviewProvider
└── Routes
    ├── ProtectedRoute
    │   └── AppLayout
    │       ├── Sidebar
    │       ├── Header
    │       └── Main
    │           └── Page Components
    └── Public Routes
        └── Auth Pages
```

#### Component Patterns

**Functional Components with Hooks**
```typescript
interface ComponentProps {
  // Props interface
}

export function Component({ prop }: ComponentProps) {
  const [state, setState] = useState();
  const context = useContext(SomeContext);
  
  return (
    <motion.div>
      {/* JSX content */}
    </motion.div>
  );
}
```

**Interactive Components**
```typescript
export function InteractiveComponent() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring' }}
    >
      {/* Content */}
    </motion.div>
  );
}
```

### State Management

#### Context Providers
- **AuthProvider** - User authentication state
- **InterviewProvider** - Interview session state
- **ThemeProvider** - Dark/light theme state

#### State Flow
```
User Action → Component Event → Context Dispatch → State Update → UI Re-render
```

---

## 🔧 Backend Documentation

### Project Structure
```
backend/
├── main.py              # FastAPI application entry
├── models/              # Pydantic models
├── services/            # Business logic
├── utils/               # Utility functions
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables
```

### API Architecture

#### FastAPI Application
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Aiva API",
    description="AI Interview Coach Backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Data Models
```python
from pydantic import BaseModel

class Question(BaseModel):
    id: str
    text: str
    difficulty: str
    category: str

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
```

---

## 🌐 API Reference

### Base URL
```
Development: http://localhost:8000
Production: https://api.aiva.dev
```

### Authentication
Currently using mock authentication. Production will implement JWT tokens.

### Endpoints

#### Questions API
```http
GET /api/questions/{role_id}?level={level}&count={count}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "q1",
      "text": "What is React?",
      "difficulty": "beginner",
      "category": "frontend"
    }
  ]
}
```

#### Text-to-Speech API
```http
POST /api/tts
Content-Type: application/json

{
  "text": "Hello, this is a test",
  "voice_id": "your_voice_id_here"
}
```

**Response:** Audio stream (audio/wav)

#### Roles API
```http
GET /api/roles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "full-stack-dev",
      "title": "Full Stack Developer",
      "description": "Complete web development",
      "tags": ["React", "Node.js", "Database"]
    }
  ]
}
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {...}
  }
}
```

---

## 🧩 Component Library

### Vision Components

#### Vision HUD
```typescript
<VisionHUD
  videoRef={videoRef}
  isModelReady={isModelReady}
  isTracking={isTracking}
  faceData={faceData}
/>
```
*Used in the ActiveSession view to render the camera feed alongside the FaceTrackingOverlay and live analysis metrics.*

### Core Components

#### GlassCard
```typescript
interface GlassCardProps {
  variant: 'blue' | 'purple' | 'green' | 'orange';
  children: React.ReactNode;
  className?: string;
}

<GlassCard variant="blue" className="p-6">
  <h3>Title</h3>
  <p>Content</p>
</GlassCard>
```

#### AnimatedButton
```typescript
interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

<AnimatedButton 
  variant="primary" 
  size="md"
  icon={<ArrowRight />}
  onClick={handleClick}
>
  Start Interview
</AnimatedButton>
```

#### InteractiveCard
```typescript
interface InteractiveCardProps {
  children: React.ReactNode;
  hover?: boolean;
  scale?: boolean;
  glow?: boolean;
  tilt?: boolean;
  onClick?: () => void;
}

<InteractiveCard hover scale glow tilt onClick={handleClick}>
  <div>Card content</div>
</InteractiveCard>
```

### Form Components

#### Input
```typescript
interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password';
  error?: string;
  disabled?: boolean;
}

<Input
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  type="email"
  error={error}
/>
```

#### Button Variants
```typescript
// Primary button
<Button variant="primary" size="lg">Submit</Button>

// Secondary button
<Button variant="secondary" size="md">Cancel</Button>

// Ghost button
<Button variant="ghost" size="sm">Learn More</Button>
```

---

## 🔄 State Management

### Context Providers

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

#### InterviewContext
```typescript
interface InterviewContextType {
  role: string;
  level: string;
  language: string;
  status: 'idle' | 'active' | 'completed';
  setRole: (role: string) => void;
  setLevel: (level: string) => void;
  setStatus: (status: string) => void;
}
```

#### ThemeContext
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

### State Patterns

#### Local State
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<Data[]>([]);
```

#### Derived State
```typescript
const filteredData = useMemo(() => {
  return data.filter(item => item.category === activeCategory);
}, [data, activeCategory]);
```

#### Side Effects
```typescript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

---

## 🎨 Styling Guide

### Tailwind CSS Configuration

#### Custom Theme
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'aiva-purple': '#7C3AED',
        'aiva-indigo': '#6366F1',
        'aiva-pink': '#EC4899'
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
      }
    }
  }
}
```

### CSS Custom Properties
```css
:root {
  --primary-color: #7C3AED;
  --secondary-color: #6366F1;
  --accent-color: #EC4899;
  --motion-duration: 0.3s;
}

.dark {
  --primary-color: #8B5CF6;
  --secondary-color: #818CF8;
  --accent-color: #F472B6;
}
```

### Component Styling Patterns

#### Glassmorphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
}

.dark .glass-card {
  background: rgba(17, 24, 39, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### Interactive Elements
```css
.btn-interactive {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
}
```

---

## ✨ Animation System

### Framer Motion Setup

#### Animation Variants
```typescript
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const scale = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
};
```

#### Page Transitions
```typescript
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};
```

#### Component Animations
```typescript
<motion.div
  variants={slideUp}
  initial="hidden"
  animate="visible"
  transition={{ duration: 0.5, delay: 0.2 }}
>
  {/* Content */}
</motion.div>
```

### Lenis Smooth Scrolling
```typescript
import { useLenis } from '@/hooks/useLenis';

export function App() {
  useLenis(); // Enable smooth scrolling
  
  return (
    <div>
      {/* App content */}
    </div>
  );
}
```

---

## 📋 Development Guidelines

### Code Standards

#### TypeScript
- Use interfaces for type definitions
- Prefer explicit return types
- Use generic types when appropriate
- Enable strict mode in tsconfig.json

#### React
- Use functional components with hooks
- Prefer custom hooks for complex logic
- Use TypeScript for all components
- Follow component naming conventions

#### CSS
- Use Tailwind utility classes
- Create custom CSS for complex animations
- Use CSS custom properties for theming
- Follow mobile-first responsive design

### File Naming Conventions

```
Components:    PascalCase (AnimatedButton.tsx)
Hooks:         camelCase with use prefix (useLenis.tsx)
Utils:         camelCase (apiClient.ts)
Pages:         PascalCase (SettingsPage.tsx)
Types:         camelCase (interviewTypes.ts)
```

### Git Workflow

#### Branch Naming
```
feature/add-user-auth
bugfix/fix-tts-error
hotfix/critical-security-patch
```

#### Commit Messages
```
feat: add user authentication system
fix: resolve TTS playback issue
docs: update API documentation
refactor: optimize component rendering
```

---

## 🧪 Testing Strategy

### Frontend Testing

#### Unit Tests
```typescript
// Component.test.tsx
import { render, screen } from '@testing-library/react';
import { AnimatedButton } from './AnimatedButton';

test('renders button with text', () => {
  render(<AnimatedButton>Click me</AnimatedButton>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

#### Integration Tests
```typescript
// Page.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Practice } from './Practice';

test('can start interview session', async () => {
  render(<Practice />);
  
  const startButton = screen.getByText('Start');
  fireEvent.click(startButton);
  
  await waitFor(() => {
    expect(screen.getByText('Interview Session')).toBeInTheDocument();
  });
});
```

### Backend Testing

#### API Tests
```python
# test_api.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_questions():
    response = client.get("/api/questions/full-stack-dev")
    assert response.status_code == 200
    assert "questions" in response.json()

def test_tts_endpoint():
    response = client.post("/api/tts", json={"text": "Hello"})
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/wav"
```

### E2E Testing
```typescript
// e2e/interview.spec.ts
import { test, expect } from '@playwright/test';

test('complete interview flow', async ({ page }) => {
  await page.goto('/practice');
  
  // Select role
  await page.click('[data-testid="role-full-stack"]');
  
  // Start interview
  await page.click('[data-testid="start-interview"]');
  
  // Verify interview page
  await expect(page.locator('[data-testid="interview-session"]')).toBeVisible();
});
```

---

## 🚀 Deployment Guide (Split Strategy)

### Frontend Deployment (Vercel)

#### Build Process
```bash
# Vercel will automatically run this command:
npm run build
```

#### Environment Variables
In the Vercel dashboard, add:
```env
# Production Backend URL
VITE_API_URL=https://your-backend-app.onrender.com
VITE_ENABLE_ANALYTICS=true
```

### Backend Deployment (Render or Railway)
It is highly advised not to use Serverless (like Vercel) for the Python backend to avoid 10s execution timeouts during LLM/TTS generation. Use containers (Render/Railway).

#### Render Deployment Steps
1. Create a "Web Service" connecting to the GitHub Repo.
2. Select Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### CI/CD Pipeline

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@v1

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v3
      - run: pip install -r requirements.txt
      - run: pytest
      - uses: docker/build-push-action@v2
```

---

## 🔧 Troubleshooting

### Common Issues

#### Frontend Issues

**Module Not Found**
```bash
# Solution
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
```bash
# Check types
npm run type-check

# Update types
npm update
```

**Build Failures**
```bash
# Clear cache
npm run build -- --force

# Check for circular dependencies
npx madge --circular src/
```

#### Backend Issues

**Import Errors**
```bash
# Check Python path
python -c "import sys; print(sys.path)"

# Install in development mode
pip install -e .
```

**API Connection Issues**
```bash
# Check CORS settings
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:8000
```

#### Performance Issues

**Frontend Optimization**
```typescript
// Lazy load components
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Debounce API calls
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);
```

**Backend Optimization**
```python
# Add caching
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

FastAPICache.init(RedisBackend(redis_client))

# Use async operations
async def get_questions():
    result = await database.fetch_all(questions_query)
    return result
```

### Debug Tools

#### Frontend
- **React DevTools** - Component inspection
- **Chrome DevTools** - Performance profiling
- **Lighthouse** - Performance audits

#### Backend
- **FastAPI Docs** - Interactive API testing
- **Python Debugger** - Code debugging
- **Logging** - Application monitoring

---

## 📞 Support & Resources

### Additional Documentation
- **API Reference**: http://localhost:8000/docs
- **React Documentation**: https://react.dev/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

### Community
- **GitHub Issues**: https://github.com/codedbyamankanojiya/aiva/issues


---

**📚 This documentation is continuously updated. Check back for the latest information!**

# ClearAir

> **Know Your Air. Stay Safe.**  
> A simple, clean, and helpful air safety companion that helps families and communities understand winter smog and urban air pollution, protect their health, and take meaningful daily actions.

---

## 💡 About ClearAir

ClearAir is designed with a simple, human-friendly approach:
- **No confusing scientific jargon or complex microgram units**: Air quality is presented on a clean **0%–100% Pollution and Smog scale** (Low, Moderate, High, Very High) with intuitive color indicators.
- **Modern Minimal Design**: Soft blue, white, and grey color palette with a true OLED **Pure Black (`#000000`)** dark mode and subtle borders.
- **7 Simple Features**:
  1. **Air Pollution (`/pollution`)**: Check today's air quality, pollution percentage, and an interactive area map with color-coded safety zones.
  2. **AI Assistant (`/assistant`)**: Ask any question in plain English, Hindi, or Gujarati and receive direct, practical steps to protect your family.
  3. **Alerts (`/alerts`)**: Receive high-pollution warnings, critical smog notices, and toggle notification preferences.
  4. **Smart Travel (`/travel`)**: Compare travel routes to pick lower-pollution and safer corridors.
  5. **Pollution Forecast (`/forecast`)**: View a 7-day day-by-day forecast list and a clean trend graph.
  6. **What To Do (`/what-to-do`)**: Simple checklist of actions to protect yourself and reduce personal emissions.
  7. **Profile & Settings (`/profile`)**: Manage your personal information, selected location, notification preferences, language, and theme.

- **Footer Information Pages**:
  - **Reviews (`/reviews`)**: Real user feedback and rating submission backed by MongoDB.
  - **Contact Us (`/contact`)**: Inquiries and support messages stored in MongoDB.
  - **Help Center (`/help`)**: Answers to common questions, device tips, and mask guidance.
  - **About Us (`/about`)**: Our mission and commitment to clean air for every citizen.
  - **Privacy Policy (`/privacy`)**: Transparent location and account data protection policy.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet, Recharts.
- **Backend**: Node.js, Express, TypeScript, MongoDB / Mongoose.
- **AI Engine**: Google Gemini API (`GEMINI_API_KEY`) or OpenAI API (`OPENAI_API_KEY`) with intelligent fallback rule engine.
- **Air Quality Data**: Open-Meteo Air Quality & Weather API with CPCB-aligned calculations.

---

## 🚀 How to Run the Application

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Database (Local instance or MongoDB Atlas URI)

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Configure your environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://ashasolanki8849_db_user:Sam3008@complete-backend.yj7dp2w.mongodb.net/clearair?retryWrites=true&w=majority
   JWT_SECRET=clearair_super_secret_jwt_key_2026
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

---

### 3. Frontend Setup
1. Open a separate terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Configure environment variables in `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

### 4. Production Build Verification
- **Backend check**:
  ```bash
  cd backend && npx tsc --noEmit
  ```
- **Frontend build**:
  ```bash
  cd frontend && npm run build
  ```

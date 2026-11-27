import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { AirPollutionPage } from './pages/AirPollutionPage';
import { AssistantPage } from './pages/AssistantPage';
import { AlertsPage } from './pages/AlertsPage';
import { TravelPage } from './pages/TravelPage';
import { ForecastPage } from './pages/ForecastPage';
import { WhatToDoPage } from './pages/WhatToDoPage';
import { ProfilePage } from './pages/ProfilePage';
import { FamilyPage } from './pages/FamilyPage';
import { IndoorPage } from './pages/IndoorPage';
import { CommunityPage } from './pages/CommunityPage';

// Footer Pages
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { HelpPage } from './pages/HelpPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Home />} />

      {/* Main Features */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/pollution" element={<AirPollutionPage />} />
      <Route path="/assistant" element={<AssistantPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/travel" element={<TravelPage />} />
      <Route path="/forecast" element={<ForecastPage />} />
      <Route path="/what-to-do" element={<WhatToDoPage />} />
      <Route path="/family" element={<Navigate to="/what-to-do" replace />} />
      <Route path="/indoor" element={<Navigate to="/what-to-do" replace />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Footer Pages */}
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Seamless redirects for previous legacy URLs */}
      <Route path="/pollutants" element={<Navigate to="/pollution" replace />} />
      <Route path="/planner" element={<Navigate to="/what-to-do" replace />} />
      <Route path="/sustainability" element={<Navigate to="/what-to-do" replace />} />
      <Route path="/impact" element={<Navigate to="/what-to-do" replace />} />
      <Route path="/simulator" element={<Navigate to="/pollution" replace />} />
      <Route path="/locations" element={<Navigate to="/profile" replace />} />
      <Route path="/roadmap" element={<Navigate to="/about" replace />} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;

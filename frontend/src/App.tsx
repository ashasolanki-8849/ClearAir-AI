import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { PollutantsDetail } from './pages/PollutantsDetail';
import { AlertsPage } from './pages/AlertsPage';
import { SavedLocationsPage } from './pages/SavedLocationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AssistantPage } from './pages/AssistantPage';
import { PlannerPage } from './pages/PlannerPage';
import { IndoorPage } from './pages/IndoorPage';
import { TravelPage } from './pages/TravelPage';
import { ForecastPage } from './pages/ForecastPage';
import { SustainabilityPage } from './pages/SustainabilityPage';
import { CommunityPage } from './pages/CommunityPage';
import { ImpactPage } from './pages/ImpactPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { RoadmapPage } from './pages/RoadmapPage';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/assistant" element={<AssistantPage />} />
      <Route path="/planner" element={<PlannerPage />} />
      <Route path="/indoor" element={<IndoorPage />} />
      <Route path="/travel" element={<TravelPage />} />
      <Route path="/forecast" element={<ForecastPage />} />
      <Route path="/sustainability" element={<SustainabilityPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/impact" element={<ImpactPage />} />
      <Route path="/simulator" element={<SimulatorPage />} />
      <Route path="/pollutants" element={<PollutantsDetail />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/locations" element={<SavedLocationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/roadmap" element={<RoadmapPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;

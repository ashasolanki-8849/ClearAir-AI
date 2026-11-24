import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { RoomAssessmentModal } from '../components/indoor/RoomAssessmentModal';
import { PurifierCalculator } from '../components/indoor/PurifierCalculator';
import { VentilationAdvisorCard } from '../components/indoor/VentilationAdvisorCard';
import { AffordableSolutionsCard } from '../components/indoor/AffordableSolutionsCard';
import { KitchenSafetyCard } from '../components/indoor/KitchenSafetyCard';
import { ClassroomOfficeCard } from '../components/indoor/ClassroomOfficeCard';
import { ConnectedDevicesPanel } from '../components/indoor/ConnectedDevicesPanel';
import { IndoorAIAdvisor } from '../components/indoor/IndoorAIAdvisor';
import { MythsVsFactsCard } from '../components/indoor/MythsVsFactsCard';
import { DailyIndoorRoutineCard } from '../components/indoor/DailyIndoorRoutineCard';
import { indoorService } from '../services/indoorService';
import {
  IndoorRoomData,
  IndoorAssessmentData,
  IndoorDeviceData,
  IndoorAlertData,
  SupportedLanguage,
} from '../types';
import { useAQI } from '../context/AQIContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAQIConfig } from '../utils/aqiHelper';
import {
  Home,
  Wind,
  ShieldAlert,
  AlertTriangle,
  ClipboardCheck,
  Cpu,
  Sparkles,
  HelpCircle,
  Plus,
  RefreshCw,
  Globe,
  Sliders,
  Utensils,
  School,
  Building,
  CheckCircle2,
  Bell,
  Layers,
  Info,
} from 'lucide-react';

export const IndoorPage: React.FC = () => {
  const { location, aqiData, refreshAQI, isLoading: aqiLoading } = useAQI();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('clearair_indoor_lang') as SupportedLanguage) || 'en';
  });

  // State
  const [rooms, setRooms] = useState<IndoorRoomData[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [assessment, setAssessment] = useState<IndoorAssessmentData | null>(null);
  const [devices, setDevices] = useState<IndoorDeviceData[]>([]);
  const [alerts, setAlerts] = useState<IndoorAlertData[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab Navigation
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'ventilation'
    | 'purifier'
    | 'solutions'
    | 'kitchen'
    | 'institutions'
    | 'devices'
    | 'advisor'
    | 'myths'
    | 'routine'
  >('overview');

  // Modals
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('bedroom');

  const selectedRoom = rooms.find((r) => r._id === selectedRoomId) || rooms[0] || null;
  const aqiConfig = getAQIConfig(aqiData?.aqiCategory || 'Moderate');

  const getCategoryBadgeVariant = (cat?: string): 'good' | 'satisfactory' | 'moderate' | 'poor' | 'verypoor' | 'severe' | 'default' => {
    switch (cat) {
      case 'Good': return 'good';
      case 'Satisfactory': return 'satisfactory';
      case 'Moderate': return 'moderate';
      case 'Poor': return 'poor';
      case 'Very Poor': return 'verypoor';
      case 'Severe': return 'severe';
      default: return 'moderate';
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsRes, devicesRes, alertsRes] = await Promise.all([
        indoorService.getRooms().catch(() => ({ success: false, rooms: [] })),
        indoorService.getDevices().catch(() => ({ success: false, devices: [] })),
        indoorService.getAlerts().catch(() => ({ success: false, alerts: [] })),
      ]);

      if (roomsRes.success && roomsRes.rooms.length > 0) {
        setRooms(roomsRes.rooms);
        if (!selectedRoomId) {
          setSelectedRoomId(roomsRes.rooms[0]._id);
        }
      }

      if (devicesRes.success && devicesRes.devices) {
        setDevices(devicesRes.devices);
      }

      if (alertsRes.success && alertsRes.alerts) {
        setAlerts(alertsRes.alerts);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to initialize indoor data', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedRoomId, showToast]);

  // Load assessment when room changes
  useEffect(() => {
    if (selectedRoomId) {
      indoorService.getRoomAssessment(selectedRoomId).then((res) => {
        if (res.success && res.assessment) {
          setAssessment(res.assessment);
        } else {
          setAssessment(null);
        }
      });
    }
  }, [selectedRoomId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    localStorage.setItem('clearair_indoor_lang', newLang);
    showToast(`Switched language to ${newLang.toUpperCase()}`, 'info');
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const res = await indoorService.createRoom({
        roomName: newRoomName.trim(),
        roomType: newRoomType as any,
      });

      if (res.success && res.room) {
        setRooms((prev) => [...prev, res.room]);
        setSelectedRoomId(res.room._id);
        setShowAddRoomModal(false);
        setNewRoomName('');
        showToast(`Created room "${res.room.roomName}".`, 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to create room', 'error');
    }
  };

  const handleMarkAlertRead = async (id: string) => {
    try {
      await indoorService.markAlertRead(id);
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, read: true } : a)));
    } catch (e) {
      // ignore
    }
  };

  const hasPhysicalDevices = devices.some((d) => !d.isDemo);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Home className="w-3.5 h-3.5" />
                MODULE 4: ACTIVE
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {selectedRoom?.roomName || 'All Environments'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              Indoor Air Quality Intelligence & Guide
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Scientifically grounded source detection, smart ventilation, and purifier engineering for{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">{location.name}</strong>.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#070707]">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
              </select>
            </div>

            {/* Room Selector Dropdown */}
            {rooms.length > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#070707]">
                <Home className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.roomName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddRoomModal(true)}
              className="gap-1 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Room</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAssessmentModal(true)}
              className="gap-1.5 text-xs"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Assess Room</span>
            </Button>
          </div>
        </div>

        {/* Sensor Reality Banner: Distinguishes Measured vs Estimated */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#070707] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {hasPhysicalDevices ? (
              <Badge variant="good">Hardware Connected</Badge>
            ) : (
              <Badge variant="outline">
                Indoor Air Not Measured
              </Badge>
            )}
            <span className="text-zinc-600 dark:text-zinc-400">
              {hasPhysicalDevices
                ? 'Active IoT hardware monitor streaming ground-truth indoor telemetry.'
                : 'Laptops & phones cannot measure indoor AQI. Guidance is estimated from room questionnaire and outdoor telemetry.'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-zinc-400 text-[11px]">
              Outdoor Ambient AQI: <strong className="text-zinc-800 dark:text-zinc-200">{aqiData?.aqi || 140}</strong>
            </span>
            <button
              onClick={() => setActiveTab('devices')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Hardware Center →
            </button>
          </div>
        </div>

        {/* 10 Navigation Section Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-200 dark:border-zinc-800 text-xs">
          {[
            { id: 'overview', label: 'Overview & Sources', icon: Home },
            { id: 'ventilation', label: 'Ventilation Advisor', icon: Wind },
            { id: 'purifier', label: 'Purifier CADR Sizing', icon: Sliders },
            { id: 'solutions', label: 'Affordable Solutions', icon: Sparkles },
            { id: 'kitchen', label: 'Kitchen & CO Safety', icon: Utensils },
            { id: 'institutions', label: 'Classrooms & Offices', icon: School },
            { id: 'devices', label: 'Connected Sensors', icon: Cpu },
            { id: 'advisor', label: 'Ask AI Advisor', icon: HelpCircle },
            { id: 'routine', label: '24h Daily Routine', icon: Layers },
            { id: 'myths', label: 'Myths vs Facts', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/10'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: OVERVIEW & ROOM ASSESSMENT */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Selected Room Overview */}
              <Card className="p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Target Room
                  </span>
                  <Badge variant="outline">{selectedRoom?.roomType || 'Living'}</Badge>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                    {selectedRoom?.roomName || 'Living Space'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {selectedRoom?.dimensions.length}m × {selectedRoom?.dimensions.width}m (
                    {Math.round((selectedRoom?.dimensions.length || 4) * (selectedRoom?.dimensions.width || 3.5) * 10.76)} sq ft)
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Occupancy: {selectedRoom?.occupancyCount || 2} persons</span>
                  <button onClick={() => setShowAssessmentModal(true)} className="text-emerald-500 hover:underline">
                    Re-assess
                  </button>
                </div>
              </Card>

              {/* Card 2: Estimated Vulnerability Score */}
              <Card className="p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Vulnerability Level
                  </span>
                  <Badge
                    variant={
                      assessment?.overallRiskLevel === 'severe'
                        ? 'severe'
                        : assessment?.overallRiskLevel === 'high'
                        ? 'poor'
                        : 'moderate'
                    }
                  >
                    {assessment?.overallRiskLevel ? `${assessment.overallRiskLevel.toUpperCase()} RISK` : 'ESTIMATED'}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                      {assessment?.identifiedPollutionSources.length || 0}
                    </span>
                    <span className="text-xs text-zinc-400">Identified Sources</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                    {assessment?.assessmentSummary ||
                      'No questionnaire submitted for this room yet. Click Assess Room to evaluate.'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Method: Questionnaire</span>
                  <span className="text-emerald-500 font-medium">Empirical Model</span>
                </div>
              </Card>

              {/* Card 3: Outdoor Infiltration Factor */}
              <Card className="p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Outdoor Infiltration
                  </span>
                  <Badge variant={getCategoryBadgeVariant(aqiData?.aqiCategory)}>
                    {aqiData?.aqiCategory || 'Moderate'}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                      {aqiData?.aqi || 140}
                    </span>
                    <span className="text-xs text-zinc-400">Outdoor AQI</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Ambient PM2.5: {aqiData?.pollutants.pm25 || 65} µg/m³. Estimated 40–60% passive penetration without sealing.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>{location.name}</span>
                  <button onClick={() => setActiveTab('ventilation')} className="text-emerald-500 hover:underline">
                    Ventilation Advice →
                  </button>
                </div>
              </Card>

              {/* Card 4: Hardware Sensor Presence */}
              <Card className="p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Physical Sensors
                  </span>
                  <Badge variant={hasPhysicalDevices ? 'good' : 'outline'}>
                    {hasPhysicalDevices ? 'PAIRED' : 'NOT MEASURED'}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                    {hasPhysicalDevices ? `${devices.filter(d => !d.isDemo).length} Device(s)` : 'Zero Hardware'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {hasPhysicalDevices
                      ? 'Live laser telemetry stream active.'
                      : 'Physical sensors required for measured indoor AQI readings.'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
                  <button onClick={() => setActiveTab('devices')} className="text-emerald-500 hover:underline">
                    Open Sensor Manager
                  </button>
                </div>
              </Card>
            </div>

            {/* Identified Pollution Sources & Actionable Recommendations */}
            {assessment && assessment.identifiedPollutionSources.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    Identified Indoor Pollution Sources for {assessment.roomName}
                  </h3>
                  <Badge variant="outline">
                    {assessment.identifiedPollutionSources.length} Factors Detected
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assessment.identifiedPollutionSources.map((src) => (
                    <div
                      key={src.id}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          {src.sourceName}
                        </span>
                        <Badge
                          variant={
                            src.severity === 'severe'
                              ? 'severe'
                              : src.severity === 'high'
                              ? 'poor'
                              : 'moderate'
                          }
                        >
                          {src.severity.toUpperCase()} RISK
                        </Badge>
                      </div>

                      <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 text-[11px]">
                        <p>
                          <strong className="text-zinc-800 dark:text-zinc-200">Why it matters:</strong> {src.whyItMatters}
                        </p>
                        <p>
                          <strong className="text-zinc-800 dark:text-zinc-200">Where it occurs:</strong> {src.whereItOccurs}
                        </p>
                        <p className="text-amber-600 dark:text-amber-400">
                          <strong>Health concerns:</strong> {src.healthConcerns}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 text-xs text-emerald-800 dark:text-emerald-300">
                        <strong>Recommended Preventive Action:</strong> {src.preventiveAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707]">
                <ClipboardCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  No Assessment Generated for {selectedRoom?.roomName || 'this room'}
                </h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 mb-4">
                  Take the 2-minute Room Air Assessment to identify hidden cooking plumes, mold, incense particles, or infiltration gaps.
                </p>
                <Button variant="primary" onClick={() => setShowAssessmentModal(true)}>
                  Start Room Assessment
                </Button>
              </Card>
            )}

            {/* Quick Preview of Smart Ventilation & Routine */}
            <VentilationAdvisorCard
              location={{ lat: location.lat, lon: location.lon, name: location.name }}
              roomId={selectedRoom?._id}
              roomName={selectedRoom?.roomName}
              language={language}
            />
          </div>
        )}

        {/* Tab 2: VENTILATION ADVISOR */}
        {activeTab === 'ventilation' && (
          <VentilationAdvisorCard
            location={{ lat: location.lat, lon: location.lon, name: location.name }}
            roomId={selectedRoom?._id}
            roomName={selectedRoom?.roomName}
            language={language}
          />
        )}

        {/* Tab 3: PURIFIER CADR SIZING CALCULATOR */}
        {activeTab === 'purifier' && (
          <PurifierCalculator
            initialLength={selectedRoom?.dimensions.length || 4}
            initialWidth={selectedRoom?.dimensions.width || 3.5}
            initialHeight={selectedRoom?.dimensions.height || 2.8}
            initialUnit={selectedRoom?.dimensions.unit || 'meters'}
          />
        )}

        {/* Tab 4: AFFORDABLE SOLUTIONS */}
        {activeTab === 'solutions' && <AffordableSolutionsCard />}

        {/* Tab 5: KITCHEN SAFETY & CARBON MONOXIDE EMERGENCY */}
        {activeTab === 'kitchen' && <KitchenSafetyCard />}

        {/* Tab 6: CLASSROOMS & OFFICES */}
        {activeTab === 'institutions' && <ClassroomOfficeCard />}

        {/* Tab 7: CONNECTED HARDWARE SENSORS & DEMO */}
        {activeTab === 'devices' && (
          <ConnectedDevicesPanel
            devices={devices}
            rooms={rooms}
            onDeviceUpdated={loadData}
          />
        )}

        {/* Tab 8: ASK INDOOR AI ADVISOR */}
        {activeTab === 'advisor' && (
          <IndoorAIAdvisor
            location={{ lat: location.lat, lon: location.lon, name: location.name }}
            selectedRoom={selectedRoom}
            language={language}
          />
        )}

        {/* Tab 9: 24-HOUR ROUTINE */}
        {activeTab === 'routine' && <DailyIndoorRoutineCard />}

        {/* Tab 10: MYTHS VS FACTS */}
        {activeTab === 'myths' && <MythsVsFactsCard />}
      </div>

      {/* Modals */}
      <RoomAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        selectedRoom={selectedRoom}
        onAssessmentCompleted={(newAssessment) => setAssessment(newAssessment)}
        location={{ lat: location.lat, lon: location.lon, name: location.name }}
        language={language}
      />

      {/* Create Room Modal */}
      <Modal
        isOpen={showAddRoomModal}
        onClose={() => setShowAddRoomModal(false)}
        title="Create New Room Profile"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
          <Input
            label="Room Name"
            placeholder="e.g. Kid's Study Room, Master Bedroom, Kitchen"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="font-semibold block text-zinc-800 dark:text-zinc-200">
              Room Category
            </label>
            <select
              value={newRoomType}
              onChange={(e) => setNewRoomType(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-2.5 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="bedroom">Bedroom</option>
              <option value="living_room">Living Room</option>
              <option value="kitchen">Kitchen</option>
              <option value="study_room">Study Room</option>
              <option value="classroom">Classroom</option>
              <option value="office">Office / Meeting Room</option>
              <option value="other">Other Space</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button variant="outline" type="button" onClick={() => setShowAddRoomModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Room
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

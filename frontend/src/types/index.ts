export type AgeGroup = 'under_18' | '18_35' | '36_60' | 'above_60';
export type UserCategory = 'student' | 'professional' | 'family' | 'elderly' | 'community';

export interface User {
  id: string;
  fullName: string;
  email: string;
  ageGroup: AgeGroup;
  userCategory: UserCategory;
  city: string;
  preferredLocation?: {
    name: string;
    lat: number;
    lon: number;
  };
  createdAt?: string;
}

export type AQICategory = 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

export interface PollutantDetail {
  key: string;
  name: string;
  concentration: number | null;
  unit: string;
  description: string;
  standardLimit24h: number;
  status: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  condition: string;
  code: number;
}

export interface HealthGuidance {
  category: AQICategory;
  color: string;
  badgeBg: string;
  badgeText: string;
  healthImplications: string;
  vulnerableGroups: string[];
  precautions: string[];
  disclaimer: string;
}

export interface HourlyTrendPoint {
  time: string;
  aqi: number;
  pm25: number;
  pm10: number;
  temperature: number;
}

export interface AQIData {
  location: {
    name: string;
    city: string;
    lat: number;
    lon: number;
  };
  aqi: number;
  aqiCategory: AQICategory;
  standard: string;
  healthGuidance: HealthGuidance;
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
    nh3: number | null;
  };
  weather: WeatherData;
  hourlyTrend: HourlyTrendPoint[];
  dataSource: string;
  isDemo: boolean;
  lastUpdated: string;
}

export type AlertSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type AlertType = 'unhealthy_aqi' | 'pm25_spike' | 'air_quality_improvement' | 'severe_smog_warning' | 'advisory';

export interface AlertItem {
  _id: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  locationName: string;
  aqiValue?: number;
  read: boolean;
  timestamp: string;
}

export interface SavedLocation {
  _id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  isDefault: boolean;
}

export interface GeocodingItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone?: string;
}

// ================= MODULE 2 TYPES ================= //

export type SupportedLanguage = 'en' | 'hi' | 'gu';

export interface AIRecommendation {
  category: string;
  action: string;
  reason: string;
  timing: string;
  personal_benefit: string;
  environmental_benefit: string;
}

export interface StructuredAIResponse {
  summary: string;
  current_conditions: {
    locationName: string;
    aqi: number | null;
    category: string;
    dominant_pollutant?: string;
    pm25?: number | null;
    pm10?: number | null;
    temperature?: number | null;
    data_timestamp: string | null;
    is_live: boolean;
  };
  risk_level: string;
  user_context_applied?: {
    category: string;
    age_group: string;
  };
  recommendations: AIRecommendation[];
  daily_routine?: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };
  what_if_analysis?: {
    scenario: string;
    consequences: string;
    safer_alternative: string;
  };
  alternatives: string[];
  limitations: string[];
  follow_up_questions: string[];
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  structuredData?: StructuredAIResponse | null;
  timestamp: string;
}

export interface ConversationSummary {
  _id: string;
  title: string;
  language: SupportedLanguage;
  aqiContextSnapshot?: {
    locationName: string;
    city: string;
    aqi: number;
    aqiCategory: string;
  };
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

// ================= MODULE 3 TYPES ================= //

export type PlanPeriod = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night';
export type ActivityStatus = 'pending' | 'completed' | 'skipped';
export type IndoorOutdoorType = 'indoor' | 'outdoor' | 'transit';

export interface PlannedActivity {
  id: string;
  period: PlanPeriod;
  periodLabel: string;
  activity: string;
  recommendedTime: string;
  indoorOutdoor: IndoorOutdoorType;
  pollutionRisk: 'low' | 'moderate' | 'high' | 'severe';
  reason: string;
  alternativeActivity: string;
  expectedBenefit: string;
  personalBenefit: string;
  environmentalBenefit: string;
  status: ActivityStatus;
  completedAt?: string | null;
  isCustom?: boolean;
  isAlternativeApplied?: boolean;
}

export interface DailyPlanData {
  _id: string;
  userId: string;
  date: string;
  environmentalContext: {
    locationName: string;
    city: string;
    lat: number;
    lon: number;
    aqi: number;
    aqiCategory: string;
    pm25: number;
    pm10: number;
    temperature: number;
    timestamp: string;
  };
  activities: PlannedActivity[];
  completionPercentage: number;
  exposureScore: {
    outdoorMinutes: number;
    indoorMinutes: number;
    exposureAvoidanceActions: number;
  };
  lastCalculatedAqi: number;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface LifestyleProfileData {
  _id?: string;
  userId?: string;
  userCategory: string;
  schedule: {
    wakeUpTime: string;
    sleepTime: string;
    workOrSchoolStart: string;
    workOrSchoolEnd: string;
    exerciseTime: string;
    mealTimings: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
    travelTimings: {
      morningCommute: string;
      eveningCommute: string;
    };
  };
  activityPreferences: string[];
  transportationPreferences: string[];
  healthVulnerabilities?: string[];
  preferredLocation?: {
    name: string;
    lat: number;
    lon: number;
  };
}

export interface FamilyProfileData {
  _id: string;
  ownerUserId: string;
  name: string;
  relationship: string;
  category: 'children' | 'adults' | 'elderly';
  age: number;
  activityPreferences: string[];
  healthNotes?: string;
  activePrecautions?: string[];
  createdAt?: string;
}

export interface FamilyGuidanceItem {
  memberId: string;
  name: string;
  category: string;
  age: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  recommendedActions: string[];
  safeTimeWindow: string;
  precautions: string[];
}

export interface PlannerReminderData {
  _id: string;
  userId: string;
  reminderType: string;
  title: string;
  time: string;
  enabled: boolean;
  days: string[];
}

// ==========================================
// MODULE 4: INDOOR AIR QUALITY TYPES
// ==========================================

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'study_room'
  | 'classroom'
  | 'office'
  | 'other';

export interface RoomDimensionsData {
  length: number;
  width: number;
  height: number;
  unit: 'meters' | 'feet';
}

export interface RoomVentilationData {
  windowCount: number;
  hasExhaustFan: boolean;
  hasAirPurifier: boolean;
  hasAC: boolean;
  ventilationType: 'natural' | 'mechanical' | 'balanced' | 'poor';
}

export interface IndoorRoomData {
  _id: string;
  userId: string;
  roomName: string;
  roomType: RoomType;
  dimensions: RoomDimensionsData;
  ventilation: RoomVentilationData;
  occupancyCount: number;
  hasSmokingExposure: boolean;
  hasPets: boolean;
  hasIncenseCandles: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionnaireResponsesData {
  roomType: string;
  roomAreaSqFt?: number;
  windowCount: number;
  ventilationAvailability: 'none' | 'limited' | 'adequate' | 'cross_ventilation';
  airPurifierStatus: 'none' | 'present_running' | 'present_idle';
  cookingActivities?: 'none' | 'light_boiling' | 'heavy_frying_tadka' | 'wood_kerosene';
  indoorSmoking: boolean;
  incenseOrCandles: 'never' | 'occasional' | 'daily_puja' | 'heavy';
  dustAccumulation: 'low' | 'moderate' | 'heavy';
  petsInRoom: boolean;
  cleaningHabits: 'dry_sweeping' | 'wet_mopping' | 'vacuum_hepa' | 'irregular';
  dampnessOrMold: 'none' | 'musty_odor' | 'visible_damp_patches' | 'visible_black_mold';
  combustionAppliances?: 'none' | 'piped_gas' | 'lpg_cylinder' | 'room_heater_unvented';
}

export interface IdentifiedSourceData {
  id: string;
  category: 'particulate' | 'gaseous' | 'biological_moisture';
  sourceName: string;
  whyItMatters: string;
  whereItOccurs: string;
  healthConcerns: string;
  preventiveAction: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
}

export interface AssessmentRecommendationData {
  id: string;
  category: 'immediate' | 'daily_habit' | 'ventilation' | 'filtration' | 'maintenance';
  title: string;
  action: string;
  benefit: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  costCategory: 'zero_cost' | 'low_cost' | 'medium_cost' | 'higher_investment';
}

export interface IndoorAssessmentData {
  _id: string;
  userId: string;
  roomId?: string;
  roomName: string;
  roomType: string;
  questionnaireResponses: QuestionnaireResponsesData;
  identifiedPollutionSources: IdentifiedSourceData[];
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'severe';
  assessmentSummary: string;
  recommendations: AssessmentRecommendationData[];
  isQuestionnaireBased: boolean;
  outdoorAqiAtAssessment?: number;
  createdAt: string;
}

export interface DeviceLatestReadingsData {
  pm25?: number;
  pm10?: number;
  co2?: number;
  humidity?: number;
  temperature?: number;
  voc?: number;
  co?: number;
  timestamp?: string;
}

export interface IndoorDeviceData {
  _id: string;
  userId: string;
  deviceName: string;
  deviceType: 'physical_sensor' | 'smart_purifier' | 'hvac_monitor' | 'co_dedicated_sensor' | 'demo_sensor';
  deviceIdentifier: string;
  roomId?: string;
  roomName?: string;
  connectionStatus: 'online' | 'offline' | 'simulated';
  supportedMetrics: string[];
  latestReadings?: DeviceLatestReadingsData;
  isDemo: boolean;
  filterLifePercentage?: number;
  createdAt?: string;
}

export interface IndoorReadingData {
  _id: string;
  deviceId: string;
  roomId?: string;
  pm25: number;
  pm10: number;
  co2?: number;
  humidity: number;
  temperature: number;
  voc?: number;
  co?: number;
  isSimulated: boolean;
  timestamp: string;
}

export interface IndoorAlertData {
  _id: string;
  userId: string;
  roomId?: string;
  deviceId?: string;
  roomName: string;
  alertCategory: 'pm25_spike' | 'high_humidity' | 'co2_stuffiness' | 'purifier_filter' | 'kitchen_ventilation' | 'co_warning' | 'general_advisory';
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  message: string;
  explanation: string;
  recommendedAction: string;
  dataSource: 'connected_sensor' | 'estimated_assessment' | 'user_reported';
  read: boolean;
  timestamp: string;
}

export interface VentilationAdviceData {
  isWindowOpeningRecommended: boolean;
  ventilationStatus: 'favorable' | 'restricted_pulse_only' | 'emergency_purge' | 'closed_filtration_only';
  headline: string;
  recommendation: string;
  bestTimeWindow: string;
  durationMinutes: number;
  kitchenVentilationRule: string;
  co2AndStuffinessRisk: 'low' | 'moderate' | 'high' | 'critical';
  outdoorInfiltrationRisk: 'low' | 'moderate' | 'high' | 'severe';
  airPurifierCoordination: string;
  scientificContext: string;
  dataLimitationsNotice: string;
}

export interface PurifierGuidanceData {
  roomDimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'meters' | 'feet';
  };
  roomVolume: {
    cubicMeters: number;
    cubicFeet: number;
  };
  floorArea: {
    sqMeters: number;
    sqFeet: number;
  };
  recommendedCADR: {
    smokeCfm: number;
    smokeM3h: number;
    dustCfm: number;
    pollenCfm: number;
  };
  airChangesPerHour: number;
  filterTechRequired: {
    preFilter: boolean;
    hepaGrade: string;
    activatedCarbonWeight: string;
    forbiddenTechWarning: string;
  };
  maintenanceSchedule: {
    preFilterCleaningInterval: string;
    hepaReplacementMonths: string;
    filterLifeCheckInstructions: string;
  };
  energyAndCostGuidance: {
    typicalPowerWatts: string;
    dailyEnergyKWh: string;
    costEstimateCategory: string;
  };
  criticalLimitations: string[];
}

export interface IndoorAIAnswerData {
  identifiedProblem: string;
  possibleCause: string;
  recommendedAction: string;
  reason: string;
  expectedBenefit: string;
  costCategory: 'zero_cost' | 'low_cost' | 'medium_cost' | 'higher_investment';
  limitations: string;
  dataSourceNote: string;
}

// ==========================================
// MODULE 5: LOW-EMISSION TRAVEL PLANNER TYPES
// ==========================================

export type TravelPriority = 'balanced' | 'fastest' | 'lowest_emissions' | 'lowest_exposure' | 'lowest_cost';

export type PlaceLabel = 'home' | 'office' | 'college' | 'school' | 'family' | 'other';

export interface SavedPlaceData {
  _id: string;
  userId?: string;
  label: PlaceLabel;
  customName?: string;
  address: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  isDefaultOrigin?: boolean;
  createdAt?: string;
}

export interface SavedRouteData {
  _id: string;
  userId?: string;
  routeName: string;
  origin: {
    name: string;
    address?: string;
    lat: number;
    lon: number;
  };
  destination: {
    name: string;
    address?: string;
    lat: number;
    lon: number;
  };
  preferredMode: string;
  priority: TravelPriority;
  alertOnHighAqi: boolean;
  aqiThreshold: number;
  createdAt?: string;
}

export interface RouteGeometryPoint {
  0: number; // lat
  1: number; // lon
}

export interface RouteExposureData {
  exposureScore: number; // 0-100 (lower is safer)
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  doseIndex: number;
  modeMultiplier: number;
  openAirExposure: boolean;
  cabinRecirculationRecommended: boolean;
  maskRecommendation: string;
  vulnerableGroupWarning?: string;
}

export interface RouteEmissionData {
  totalGramsCo2: number;
  gramsCo2PerPassenger: number;
  avoidedGramsCo2: number;
  carEquivalenceFactor: number;
  isZeroEmission: boolean;
  methodology: string;
}

export interface RouteAlternativeData {
  routeId: string;
  routeName: string;
  routeType: 'arterial_fastest' | 'clean_bypass' | 'metro_transit';
  mode: string;
  distanceKm: number;
  durationMinutes: number;
  estimatedCostInr: number;
  trafficLevel: 'low' | 'moderate' | 'heavy' | 'congested';
  streetAqiEstimated: number;
  geometry: [number, number][];
  emissions: RouteEmissionData;
  exposure: RouteExposureData;
  advantages: string[];
  disadvantages: string[];
  overallScore: number;
  scoreBreakdown: {
    speedScore: number;
    cleanAirScore: number;
    emissionScore: number;
    costScore: number;
  };
  isRecommended: boolean;
  recommendationReason: string;
  healthSafetyDisclaimer: string;
}

export interface RouteComparisonData {
  comparisonId?: string;
  origin: {
    name: string;
    address?: string;
    lat: number;
    lon: number;
  };
  destination: {
    name: string;
    address?: string;
    lat: number;
    lon: number;
  };
  outdoorAqi: number;
  pm25?: number;
  priority: TravelPriority;
  routes: RouteAlternativeData[];
  bestOverallRouteId: string;
  lowestExposureRouteId: string;
  lowestEmissionsRouteId: string;
  fastestRouteId: string;
  recommendationNarrative: string;
  personaNotes?: string;
  createdAt?: string;
}

export interface DepartureTimeWindowData {
  id: string;
  name: string;
  timeRange: string;
  ambientAqiExpected: number;
  trafficMultiplier: number;
  atmosphericCondition: string;
  inversionRisk: boolean;
  solarMixingDispersion: boolean;
  recommendationLevel: 'optimal' | 'acceptable' | 'avoid_if_possible' | 'critical_smog_peak';
  explanation: string;
}

export interface DepartureTimeAdviceData {
  bestWindow: string;
  currentWindow: string;
  windows: DepartureTimeWindowData[];
  meteorologicalExplanation: string;
  inversionLayerNotice: string;
}

export interface TravelHistoryData {
  _id: string;
  userId?: string;
  originName: string;
  destinationName: string;
  modeUsed: string;
  distanceKm: number;
  durationMinutes: number;
  ambientAqiAtTravel?: number;
  exposureScore: number;
  emissionsGramsCo2: number;
  emissionsAvoidedGramsCo2: number;
  maskUsed: boolean;
  cabinRecirculationUsed: boolean;
  notes?: string;
  tripDate: string;
  createdAt?: string;
}

export interface TravelPreferenceData {
  userId?: string;
  defaultPriority: TravelPriority;
  preferredModes: string[];
  hasPersonalCar: boolean;
  carFuelType: 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid';
  hasTwoWheeler: boolean;
  twoWheelerIsElectric: boolean;
  hasBicycle: boolean;
  willingToCarpool: boolean;
  hasPreExistingRespiratoryCondition: boolean;
  familyTraveler: boolean;
  defaultDepartureWindow?: string;
}

export interface EmissionCalculationResult {
  distanceKm: number;
  mode: string;
  totalTripGramsCo2: number;
  perPassengerGramsCo2: number;
  avoidedVsSoloCarGramsCo2: number;
  equivalentTreesPerYear: number;
  modeFactSheet: {
    modeName: string;
    gramsCo2PerKm: number;
    isPerPassenger: boolean;
    notes: string;
  };
}

export interface TravelAIAnswerData {
  recommendedMode: string;
  routeAdvice: string;
  exposureMitigation: string;
  emissionImpact: string;
  timingAdvice: string;
  familyOrStudentSpecificAdvice: string;
  healthDisclaimer: string;
}

// ==========================================
// MODULE 6: POLLUTION FORECAST & PREDICTION TYPES
// ==========================================

export interface HourlyForecastData {
  time: string;
  hourOffset: number;
  aqi: number;
  category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  pollutants: {
    pm25: number;
    pm10: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
  };
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    condition: string;
  };
  trend: 'increasing' | 'decreasing' | 'stable' | 'spike';
  confidenceScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface DailyForecastData {
  date: string;
  dayName: string;
  avgAqi: number;
  maxAqi: number;
  minAqi: number;
  category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  dominantPollutant: string;
  avgPm25: number;
  avgPm10: number;
  weather: {
    tempMax: number;
    tempMin: number;
    precipitationSum: number;
    windSpeedMax: number;
    condition: string;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  healthPrecaution: string;
}

export interface PollutantForecastData {
  id: string;
  name: string;
  unit: string;
  currentValue: number;
  forecast1h: number;
  forecast6h: number;
  forecast24h: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentChange24h: number;
  safetyThreshold24h: number;
  healthSignificance: string;
}

export interface TrendAnalysisData {
  currentTrend: 'rising_fast' | 'rising_slow' | 'stable' | 'clearing';
  trendScore: number;
  headline: string;
  explanation: string;
  peakHour: {
    time: string;
    expectedAqi: number;
    category: string;
  };
  clearingHour: {
    time: string;
    expectedAqi: number;
    category: string;
  };
  lowestExpectedTime?: string;
  trendSummary?: {
    direction: string;
    summaryText: string;
    peakExpectedTime?: string;
    lowestExpectedTime?: string;
  };
  diurnalPattern: {
    morningInversionRisk: boolean;
    middayDispersionWindow: boolean;
    eveningCommuteSpike: boolean;
    nightColdStagnation: boolean;
  };
  scientificCorrelationNote: string;
}

export interface WeatherFactorData {
  factor: 'wind' | 'temperature_inversion' | 'humidity' | 'precipitation' | 'solar_radiation';
  status: 'favorable' | 'neutral' | 'unfavorable' | 'hazardous';
  currentValueText: string;
  influenceOnPollution: string;
  scientificMechanism: string;
}

export interface WeatherPollutionData {
  overallDispersionCondition: 'optimal_dispersion' | 'moderate_ventilation' | 'poor_stagnation' | 'severe_inversion_trap';
  dispersionScore: number;
  headline: string;
  summary: string;
  factors: WeatherFactorData[];
  rainScavengingPotential: 'none' | 'light_dampening' | 'active_washout';
  scientificLimitationNotice: string;
}

export interface AnomalySpikeData {
  id?: string;
  pollutant: 'aqi' | 'pm25' | 'pm10';
  detectedValue: number;
  baselineValue: number;
  anomalyDelta: number;
  zScore: number;
  rateOfChangePerHour: number;
  severity: 'mild' | 'moderate' | 'severe' | 'critical_spike';
  detectionMethod: 'rolling_zscore' | 'rate_of_change_spike' | 'cpcb_severe_jump' | 'threshold';
  possibleCauses: string[];
  actionableAdvice: string;
  timestamp: string;
}

export interface EarlyWarningAlertData {
  id?: string;
  category: 'spike_warning' | 'aqi_deterioration' | 'rain_cleansing' | 'severe_hazard' | 'improving_window' | 'unusual_trend';
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  title: string;
  expectedTime: string;
  expectedAqi: number;
  expectedCategory: string;
  relevantPollutant?: string;
  explanation: string;
  recommendedAction: string;
  dataSource: string;
  forecastTimestamp: string;
  read: boolean;
  isDismissed?: boolean;
}

export interface HorizonMetricData {
  horizon: '1h' | '3h' | '6h' | '12h' | '24h' | '48h';
  observationCount: number;
  mae: number;
  rmse: number;
  acceptableTolerancePercentage: number;
}

export interface ForecastEvaluationData {
  modelName: string;
  totalEvaluatedObservations: number;
  overallMae: number;
  overallRmse: number;
  accuracyRatingText: string;
  horizonBreakdown: HorizonMetricData[];
  evaluationMethodology: string;
  dataNotice: string;
  isSufficientData: boolean;
}

export interface LocationForecastComparisonData {
  name: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  currentAqi: number | null;
  currentCategory: string;
  forecast24hAvg: number | null;
  forecast24hPeak: number | null;
  dominantPollutant: string;
  pm25Current: number | null;
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'spike';
  updatedAt: string;
  isDataAvailable: boolean;
}

export interface ForecastExplanationData {
  headline: string;
  contributingConditions?: string[];
  contributingFactors?: string[];
  scientificExplanation?: string;
  explanation?: string;
  whatItMeans?: string;
  impactOnVulnerable?: string;
  preventiveActions?: string[];
  actionableAdvice?: string;
  scientificDisclaimer?: string;
  confidence?: number;
  horizon?: string;
  timestamp?: string;
}



// ==========================================
// MODULE 7: SUSTAINABLE LIVING ADVISOR TYPES
// ==========================================

export type SustainabilityCategory =
  | 'transportation'
  | 'energy'
  | 'cooking'
  | 'waste'
  | 'shopping'
  | 'water'
  | 'environment';

export type BudgetPreference = 'free' | 'low_cost' | 'medium_budget' | 'high_investment' | 'all';

export interface SustainabilityScoreData {
  overall: number;
  actionCompletionScore: number;
  challengeScore: number;
  diversityScore: number;
  householdScore: number;
  lastCalculatedAt: string;
  calculationExplanation: string;
}

export interface UserSustainabilityProfileData {
  budgetPreference: BudgetPreference;
  focusCategories: SustainabilityCategory[];
  transportationHabits: {
    primaryCommuteMode: string;
    hasBicycle: boolean;
    hasElectricVehicle: boolean;
    willingToCarpool: boolean;
    dailyCommuteDistanceKm?: number;
  };
  householdHabits: {
    cookingFuel: 'lpg' | 'piped_natural_gas' | 'induction_electric' | 'traditional_biomass';
    wasteSegregationPracticed: boolean;
    compostingActive: boolean;
    airConditioningUsageHoursPerDay: number;
    solarPanelsInstalled: boolean;
    waterPurifierRejectWaterReused: boolean;
    appliancesStarRatingAvg: number;
  };
  sustainabilityGoals: string[];
  sustainabilityScore: SustainabilityScoreData;
}

export interface SustainableRecommendationData {
  _id: string;
  category: SustainabilityCategory;
  currentHabit: string;
  recommendedAlternative: string;
  reason: string;
  priority: 'high' | 'recommended' | 'optional';
  costCategory: BudgetPreference;
  implementationDifficulty: 'easy' | 'moderate' | 'advanced';
  personalBenefit: string;
  environmentalBenefit: string;
  implementationSteps: string[];
  maintenanceRequirements: string;
  limitations: string[];
  estimatedSavings?: {
    amount?: number;
    unit?: string;
    period?: string;
    description?: string;
  };
  dataSource: {
    name: string;
    url?: string;
    lastUpdated?: string;
    assumptions?: string;
  };
  isActive: boolean;
}

export interface SustainableActionData {
  _id: string;
  userId: string;
  recommendationId?: string;
  title: string;
  category: SustainabilityCategory;
  costCategory: BudgetPreference;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: string;
  notes?: string;
  impactEstimate?: {
    co2AvoidedKg?: number;
    wasteAvoidedKg?: number;
    waterSavedLiters?: number;
    moneySavedInr?: number;
  };
}

export interface BudgetAlternativeData {
  id: string;
  category: string;
  costCategory: BudgetPreference;
  costCategoryLabel: string;
  currentHabit: string;
  suggestedReplacement: string;
  implementationDifficulty: 'easy' | 'moderate' | 'advanced';
  expectedPracticalBenefit: string;
  maintenanceRequirements: string;
  environmentalConsiderations: string;
  estimatedSavings: {
    amount?: number;
    unit?: string;
    period?: string;
    description?: string;
  } | null;
  implementationSteps: string[];
  limitations: string[];
  citation: string;
}

export interface LocalSustainableFacilityData {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  distanceKm?: number;
  contactNumber?: string;
  operatingHours: string;
  servicesOffered: string[];
  verificationSource: string;
  lastUpdated: string;
  isVerified: boolean;
}

export interface ImpactCalculationResultData {
  activityType: string;
  inputQuantity: number;
  inputUnit: string;
  calculatedValues: {
    co2EquivalentKg: number;
    pm25AvoidedGrams: number;
    noxAvoidedGrams: number;
    wasteDivertedKg: number;
    waterSavedLiters: number;
  };
  calculationMethod: string;
  emissionFactor: {
    factor: number;
    unit: string;
    citation: string;
  };
  assumptions: string[];
  dataConfidence: 'high' | 'medium' | 'insufficient_data';
  insufficientDataReason?: string;
  isReliable: boolean;
}

export interface ImpactSummaryData {
  totalCo2EquivalentKg: number;
  totalPm25AvoidedGrams: number;
  totalNoxAvoidedGrams: number;
  totalWasteDivertedKg: number;
  totalWaterSavedLiters: number;
  recordsCount: number;
  equivalentTreesOffset: number;
}

export interface ChallengeDayData {
  dayNumber: number;
  title: string;
  description: string;
  category: SustainabilityCategory;
  practicalAction: string;
  estimatedTimeMinutes: number;
  expectedBenefit: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface ChallengeProgressData {
  challengeTitle: string;
  startedAt: string;
  completedAt?: string;
  status: 'active' | 'completed' | 'abandoned';
  daysProgress: ChallengeDayData[];
  completedDaysCount: number;
  totalDays: number;
  badgeAwarded: boolean;
  userCustomNotes?: string;
}

export interface HouseholdSustainabilityData {
  householdName: string;
  memberCount: number;
  sharedGoals: Array<{
    id: string;
    title: string;
    category: string;
    targetDescription: string;
    progressPercentage: number;
    assignedMemberName?: string;
    isCompleted: boolean;
    targetDate?: string;
  }>;
  wasteManagement: {
    segregationRatePercentage: number;
    compostingActive: boolean;
    eWasteDropOffsCount: number;
  };
  energySavingProgress: {
    ledPercentage: number;
    offPeakUsageHabit: boolean;
    starRatedAppliancesInstalled: boolean;
  };
  completedHouseholdActionsCount: number;
  apartmentSocietyInitiatives?: Array<{
    title: string;
    organizer: string;
    description: string;
    status: 'active' | 'upcoming';
  }>;
}

export interface SustainabilityAIData {
  summary: string;
  priority: 'high' | 'recommended' | 'optional';
  current_habit: string;
  recommended_alternative: string;
  reason: string;
  implementation_steps: string[];
  personal_benefit: string;
  environmental_benefit: string;
  cost_category: 'free' | 'low_cost' | 'medium_budget' | 'high_investment';
  estimated_savings: {
    amount?: number;
    unit?: string;
    period?: string;
    description?: string;
  } | null;
  limitations: string[];
  data_sources: string[];
}

export interface BeforeAfterComparisonItem {
  category: string;
  beforeHabit: string;
  afterAlternative: string;
  metricLabel: string;
  beforeValueText: string;
  afterValueText: string;
  changeSummary: string;
  estimatedCo2AvoidedKgMonthly: number;
  estimatedMoneySavedInrMonthly?: number;
  scientificExplanation: string;
  disclaimer: string;
}

// ==========================================
// MODULE 8: COMMUNITY & SOCIETY INTELLIGENCE
// ==========================================

export type CommunityType =
  | 'residential_society'
  | 'school'
  | 'college'
  | 'workplace'
  | 'neighborhood'
  | 'environmental_group';

export type CommunityPrivacy = 'public' | 'private' | 'invite_only';
export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';
export type MemberStatus = 'active' | 'pending' | 'rejected' | 'not_joined';

export interface CommunityLocationData {
  city: string;
  locality: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  address?: string;
  pincode?: string;
}

export interface CommunityData {
  _id: string;
  name: string;
  slug: string;
  type: CommunityType;
  description: string;
  location: CommunityLocationData;
  privacy: CommunityPrivacy;
  invitationCode: string;
  ownerId: string;
  objectives: string[];
  bannerUrl?: string;
  logoUrl?: string;
  adminContact?: {
    email?: string;
    phone?: string;
    organizationName?: string;
  };
  membersCount: number;
  settings: {
    allowMemberPosts: boolean;
    requireReportVerification: boolean;
    autoAlertSevereAqi: boolean;
    aqiAlertThreshold: number;
  };
  isMember?: boolean;
  membershipStatus?: MemberStatus;
  userRole?: MemberRole | null;
  createdAt: string;
  updatedAt: string;
}

export type PollutionCategory =
  | 'garbage_burning'
  | 'construction_dust'
  | 'road_dust'
  | 'vehicle_smoke'
  | 'industrial_emissions'
  | 'open_waste_dumping'
  | 'excessive_smoke'
  | 'waste_management'
  | 'other';

export type ReportSeverity = 'low' | 'moderate' | 'high' | 'severe';
export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export interface PollutionReportData {
  _id: string;
  communityId?: string;
  userId: string;
  reporterName: string;
  isAnonymous: boolean;
  category: PollutionCategory;
  title: string;
  description: string;
  location: {
    name: string;
    city: string;
    locality?: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  imageUrl?: string;
  severity: ReportSeverity;
  status: ReportStatus;
  moderationNotes?: string;
  verifiedAt?: string;
  resolvedAt?: string;
  resolvedNotes?: string;
  isPublic: boolean;
  upvotes: number;
  upvoters?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HotspotMapPoint {
  id: string;
  type: 'citizen_report' | 'sensor_station';
  title: string;
  category: PollutionCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  description: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  locationName: string;
  city: string;
  upvotes: number;
  imageUrl?: string;
  createdAt: string;
}

export type EventCategory =
  | 'clean_drive'
  | 'tree_planting'
  | 'recycling_camp'
  | 'workshop'
  | 'smog_awareness'
  | 'carpool_initiative'
  | 'other';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface CommunityEventData {
  _id: string;
  communityId: string;
  title: string;
  category: EventCategory;
  description: string;
  location: {
    name: string;
    address?: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  startDate: string;
  endDate: string;
  organizerId: string;
  organizerName: string;
  maxParticipants: number;
  registeredCount: number;
  status: EventStatus;
  impactSummary?: {
    wasteCollectedKg?: number;
    treesPlanted?: number;
    attendees?: number;
    notes?: string;
  };
  isUserRegistered?: boolean;
  createdAt: string;
}

export type CampaignCategory =
  | 'waste_segregation'
  | 'anti_burning'
  | 'green_commute'
  | 'energy_conservation'
  | 'clean_air_audit';

export type CampaignStatus = 'active' | 'completed' | 'draft';

export interface CommunityCampaignData {
  _id: string;
  communityId: string;
  title: string;
  objective: string;
  category: CampaignCategory;
  startDate: string;
  endDate: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  participantsCount: number;
  status: CampaignStatus;
  resultsNotes?: string;
  progressPercentage?: number;
  createdAt: string;
}

export type PostCategory =
  | 'air_quality'
  | 'pollution_concerns'
  | 'sustainable_living'
  | 'waste_management'
  | 'activities'
  | 'education'
  | 'general';

export interface CommunityPostData {
  _id: string;
  communityId: string;
  userId: string;
  authorName: string;
  authorRole: string;
  category: PostCategory;
  title: string;
  content: string;
  pinned: boolean;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface CommunityCommentData {
  _id: string;
  postId: string;
  communityId: string;
  userId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface CommunityNotificationData {
  _id: string;
  communityId: string;
  type:
    | 'severe_aqi_warning'
    | 'sudden_aqi_spike'
    | 'local_incident'
    | 'announcement'
    | 'event_reminder';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export interface CommunityImpactData {
  communityId: string;
  communityName: string;
  communityType: string;
  totalMembers: number;
  totalEventsOrganized: number;
  totalEventAttendees: number;
  activeCampaignsCount: number;
  completedCampaignsCount: number;
  incidentsReported: number;
  incidentsResolved: number;
  recordedImpact: {
    wasteSegregatedKg: number;
    treesPlanted: number;
    totalAttendees: number;
    resolvedPollutionHotspots: number;
  };
  transparencyNote: string;
}

export interface CommunityLeaderboardEntryData {
  userId: string;
  name: string;
  role: string;
  eventsAttendedCount: number;
  reportsSubmittedCount: number;
  discussionPostsCount: number;
  totalActivityScore: number;
  badge: string;
}

export interface CommunityAIData {
  summary: string;
  community_context: string;
  identified_concerns: string[];
  recommended_actions: Array<{
    title: string;
    category: string;
    targetGroup: string;
    priority: 'immediate' | 'high' | 'medium';
    description: string;
    expectedOutcome: string;
  }>;
  implementation_steps: string[];
  estimated_resources: string[];
  limitations: string[];
  data_sources: string[];
}

export interface InstitutionSpecificPillar {
  title: string;
  icon: string;
  description: string;
  metricsTracked: string[];
}

export interface InstitutionSpecificViewData {
  focusArea: string;
  pillars: InstitutionSpecificPillar[];
}

// ==========================================
// MODULE 9: ENVIRONMENTAL IMPACT TRACKER
// ==========================================

export type ReportType =
  | 'executive_summary'
  | 'comprehensive_audit'
  | 'category_deep_dive'
  | 'progress_update';

export type FootprintCategory =
  | 'transportation'
  | 'electricity'
  | 'household_fuel'
  | 'waste'
  | 'water'
  | 'other';

export type DataQualityStatus =
  | 'User Entered'
  | 'Measured'
  | 'Imported'
  | 'Estimated'
  | 'Calculated'
  | 'Verified';

export interface CarbonFootprintRecordData {
  _id: string;
  userId: string;
  householdId?: string;
  category: FootprintCategory;
  activityName: string;
  inputValues: {
    quantity: number;
    unit: string;
    passengers?: number;
    fuelType?: string;
    transportMode?: string;
    distanceKm?: number;
    kwh?: number;
    billingPeriod?: string;
    gridRegion?: string;
    wasteType?: string;
    disposalMethod?: string;
    waterLiters?: number;
    notes?: string;
  };
  calculatedEmissionsKgCO2e: number;
  criteriaPollutantsGrams?: {
    pm25?: number;
    pm10?: number;
    nox?: number;
    so2?: number;
    co?: number;
  };
  emissionFactor: {
    name: string;
    factor: number;
    unit: string;
    source: string;
    methodology: string;
  };
  dataQuality: {
    status: DataQualityStatus;
    completenessPercentage: number;
    assumptions: string[];
    limitations: string[];
  };
  date: string;
  period: 'single' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt?: string;
}

export type ActivityCategory =
  | 'transportation'
  | 'energy'
  | 'waste'
  | 'water'
  | 'community'
  | 'consumption';

export interface EnvironmentalActivityData {
  _id: string;
  userId: string;
  householdId?: string;
  activityName: string;
  category: ActivityCategory;
  date: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  isCompleted: boolean;
  dataQuality: {
    status: DataQualityStatus;
    source: string;
  };
  footprintRecordId?: string;
  createdAt?: string;
}

export type GoalCategory =
  | 'carbon'
  | 'electricity'
  | 'transportation'
  | 'waste'
  | 'water'
  | 'habits';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface EnvironmentalGoalData {
  _id: string;
  userId: string;
  householdId?: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  targetReductionKgCo2e?: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  trackingFrequency: 'daily' | 'weekly' | 'monthly';
  remindersEnabled: boolean;
  notes?: string;
  createdAt?: string;
}

export interface EmissionFactorData {
  _id: string;
  name: string;
  category: string;
  value: number;
  factorValue?: number;
  unit: string;
  geography: string;
  source: string;
  sourceUrl?: string;
  publicationDate?: string;
  methodology: string;
  version: string;
  uncertaintyPercentage?: number;
  dataQuality?: string;
  description?: string;
  code?: string;
  year?: number;
}

export interface DashboardImpactData {
  periodLabel: string;
  startDate: string;
  endDate: string;
  hasSufficientData: boolean;
  totalCarbonFootprintKgCO2e: number;
  breakdown: {
    transportationKgCO2e: number;
    electricityKgCO2e: number;
    householdFuelKgCO2e: number;
    wasteKgCO2e: number;
    waterKgCO2e: number;
  };
  sharesPercentage: {
    transportation: number;
    electricity: number;
    householdFuel: number;
    waste: number;
    water: number;
  };
  criteriaPollutantsGrams: {
    pm25: number;
    pm10: number;
    nox: number;
    co: number;
    so2: number;
  };
  resourceMetrics: {
    totalDistanceKm: number;
    electricityKwh: number;
    waterLiters: number;
    wasteDivertedKg: number;
    compostProducedKg: number;
  };
  activitiesCompletedCount: number;
  activeGoalsCount: number;
  trendSeries: Array<{
    date: string;
    totalKgCO2e: number;
    transport: number;
    energy: number;
    waste: number;
  }>;
  dataQualitySummary: {
    averageCompletenessPercentage: number;
    recordCountsByStatus: Record<string, number>;
  };
}

export interface ComparisonPeriodMetrics {
  totalEmissionsKg: number;
  transportationKg: number;
  energyKg: number;
  wasteKg: number;
  waterKg: number;
  distanceKm: number;
  electricityKwh: number;
  recordsCount: number;
}

export interface ComparisonDiffItem {
  previous: number;
  current: number;
  absoluteDifference: number;
  percentageDifference: number | null;
  isReduction: boolean;
}

export interface ComparisonAnalyticsData {
  period1: {
    label: string;
    startDate: string;
    endDate: string;
    metrics: ComparisonPeriodMetrics;
  };
  period2: {
    label: string;
    startDate: string;
    endDate: string;
    metrics: ComparisonPeriodMetrics;
  };
  period1Metrics?: any;
  period2Metrics?: any;
  differences: {
    totalCarbonFootprint?: ComparisonDiffItem;
    transportation?: ComparisonDiffItem;
    energy?: ComparisonDiffItem;
    waste?: ComparisonDiffItem;
    distanceKm?: ComparisonDiffItem;
    electricityKwh?: ComparisonDiffItem;
    [key: string]: any;
  };
  percentageChanges?: any;
  dataCompleteness: {
    period1RecordsCount: number;
    period2RecordsCount: number;
    isComparisonReliable: boolean;
    notice: string;
  };
}

export interface SmartInsightItem {
  title: string;
  explanation: string;
  category: string;
  metric?: string;
  suggestedAction?: string;
  completeness?: string;
  priority?: string;
  description?: string;
  recommendedAction?: string;
}

export interface LocalPollutionAwarenessData {
  location?: {
    name: string;
    city: string;
    coordinates: { lat: number; lon: number };
  };
  stationName?: string;
  city?: string;
  currentAqi: number;
  aqiCategory?: string;
  standard?: string;
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
  };
  hourlyTrend?: Array<{
    time: string;
    aqi: number;
    pm25: number;
    pm10: number;
    temperature: number;
  }>;
  weather?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
  };
  avoidedExposureEstimate?: { pm25GramsAvoided: number };
  dataSource?: string;
  lastUpdated: string;
  scientificBoundaryNote?: string;
}

export interface EnvironmentalReportData {
  _id: string;
  userId: string;
  reportType?: string;
  period?: string;
  title?: string;
  reportingPeriod?: {
    startDate: string;
    endDate: string;
    label: string;
  };
  reportData?: Record<string, any>;
  totalCarbonFootprintKg?: number;
  breakdownByScope?: any;
  totalWasteDivertedKg?: number;
  recommendations?: string[];
  generatedAt: string;
}

export interface FamilyImpactSummaryData {
  familyMembersCount?: number;
  memberCount?: number;
  familyName?: string;
  totalHouseholdFootprintKg?: number;
  perCapitaFootprintKg?: number;
  householdMetrics?: {
    totalEmissionsKgCO2e: number;
    electricityKwh: number;
    waterLiters: number;
    wasteDivertedKg: number;
  };
  perCapitaEmissionsKgCO2e?: number;
  note?: string;
}

export interface CommunityImpactProgressData {
  communityId?: string;
  communityName?: string;
  membersCount?: number;
  campaignsCount?: number;
  eventsCount?: number;
  totalAttendees?: number;
  wasteCollectedOrDivertedKg?: number;
  treesPlanted?: number;
  totalVerifiedReductionKg?: number;
  totalWasteDivertedKg?: number;
  activeCampaignsCount?: number;
  campaigns?: Array<{
    _id: string;
    title: string;
    participantsCount: number;
    verifiedReductionsKgCo2e: number;
  }>;
  notice?: string;
}

export interface ImpactAIAdvisorData {
  summary?: string;
  directAnswer?: string;
  estimatedSavingsKgCo2e?: number;
  actionPlan?: string[];
  scientificCaveats?: string;
  key_findings?: string[];
  main_impact_categories?: Array<{
    category: string;
    emissionsKgCO2e: number;
    sharePercentage: number;
  }>;
  period_comparison?: Record<string, any>;
  recommended_actions?: Array<{
    title: string;
    category: string;
    expectedReductionKgCO2e: number;
    priority: 'immediate' | 'high' | 'medium';
    description: string;
  }>;
  calculation_explanations?: string[];
  data_limitations?: string[];
  data_sources?: string[];
  dataSources?: string[];
}

export type EmissionFactor = EmissionFactorData;
export type EnvironmentalGoal = EnvironmentalGoalData;
export type EnvironmentalReportRecord = EnvironmentalReportData;
export type LocalPollutionAwareness = LocalPollutionAwarenessData;
export type SmartEnvironmentalInsight = SmartInsightItem;
export type PeriodComparisonResult = ComparisonAnalyticsData;
export type FamilyFootprintSummary = FamilyImpactSummaryData;
export type CommunityImpactSummary = CommunityImpactProgressData;
export type ImpactAdvisorResponse = ImpactAIAdvisorData;


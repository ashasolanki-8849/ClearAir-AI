import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  Compass,
  Home,
  Navigation,
  TrendingUp,
  Leaf,
  Users,
  BarChart3,
  Sliders,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const RoadmapPage = () => {
  const modules = [
    {
      id: 1,
      title: 'Module 1: Real-Time Air Quality Monitoring',
      status: 'active',
      badge: 'LIVE & ACTIVE',
      icon: Layers,
      description:
        'The foundational engine providing real-time CPCB / Copernicus AQI telemetry, 7-pollutant breakdown (PM2.5, PM10, NO2, SO2, CO, O3, NH3), meteorological smog inversion tracking, and demographic health advisory.',
      architecture:
        'Full-stack Node.js/Express REST APIs, MongoDB Atlas schema, React + Vite TypeScript frontend, Open-Meteo & Copernicus integration.',
      route: '/dashboard',
    },
    {
      id: 2,
      title: 'Module 2: GenAI Smart Smog Assistant',
      status: 'active',
      badge: 'LIVE & ACTIVE',
      icon: Sparkles,
      description:
        'An intelligent public-health AI co-pilot that answers queries like "Is it safe to go outside?", "What precautions should my family take?", "What if I exercise outdoors today?" with real-time CPCB telemetry, personal vs. environmental impact explanations, and multilingual support in English, Hindi, and Gujarati.',
      architecture:
        'ContextBuilderService, RecommendationService, GenAI Assistant Service with fallback, Conversation model in MongoDB, responsive chat interface with structured cards.',
      route: '/assistant',
    },
    {
      id: 3,
      title: 'Module 3: Personalized Daily Action Planner',
      status: 'active',
      badge: 'LIVE & ACTIVE',
      icon: Compass,
      description:
        'Generates personalized diurnal 5-period action timelines grounded in live CPCB telemetry, meteorological smog inversion curves, user lifestyle profiles, and family demographic precautions.',
      architecture:
        'Diurnal schedule generator, schedule adjustment service, activity recommendation engine, MongoDB LifestyleProfile, DailyPlan & FamilyProfile models, and responsive timeline with one-click safe alternatives.',
      route: '/planner',
    },
    {
      id: 4,
      title: 'Module 4: Indoor Air Quality Guide',
      status: 'active',
      badge: 'LIVE & ACTIVE',
      icon: Home,
      description:
        'Indoor source detection (cooking plumes, incense, mold), smart ventilation advisor balancing outdoor AQI against CO2 accumulation, room-specific CADR purifier sizing calculator, kitchen carbon monoxide protection, and hardware device integration layer.',
      architecture:
        'IndoorRoom, IndoorAssessment, IndoorDevice, IndoorReading & IndoorAlert MongoDB models, empirical risk evaluation engine, and multi-tabbed educational dashboard with 10 specialized intelligence modules.',
      route: '/indoor',
    },
    {
      id: 5,
      title: 'Module 5: Low-Emission Travel Planner',
      status: 'active',
      badge: 'LIVE & ACTIVE',
      icon: Navigation,
      description:
        'Route recommendation engine comparing travel speed against inhaled PM2.5 dose & carbon footprint. Features 3 distinct alternatives (fastest arterial, clean bypass corridor, and metro eco-corridor), Leaflet interactive maps, diurnal departure advisor, cabin air recirculation guidance, and trip carbon calculators.',
      architecture:
        'OSRM route geometry engine with network interpolation fallback, IPCC emission models, micro-environment particulate dose multipliers, SavedPlace & SavedRoute MongoDB models, and Leaflet OpenStreetMap integration.',
      route: '/travel',
    },
    {
      id: 6,
      title: 'Module 6: Pollution Forecast & AI Prediction Engine',
      status: 'active',
      badge: 'LIVE & ACTIVE',
      icon: TrendingUp,
      description:
        'Copernicus CAMS ensemble atmospheric transport modeling, diurnal boundary layer inversion tracking, 7-day synoptic outlooks, 6-pollutant trajectory matrix, statistical z-score anomaly detection, and transparent MAE/RMSE empirical accuracy verification.',
      architecture:
        'Open-Meteo Air Quality & Weather API with 7-day horizon, PollutionForecast, ForecastEvaluation, PollutionAnomaly & ForecastAlert MongoDB models, early warning generator, and multilingual dashboard.',
      route: '/forecast',
    },
    {
      id: 7,
      title: 'Module 7: Sustainable Living Advisor',
      status: 'active',
      badge: 'LIVE & ACTIVE',
      icon: Leaf,
      description:
        'Personalized lifestyle guidance across transportation, energy, waste, cooking, and water. Features transparent scoring criteria, budget-based solutions, local recycling/transit facilities around you, 7-day green challenges, and CEA/IPCC-grounded environmental impact calculations.',
      architecture:
        'UserSustainabilityProfile, SustainableRecommendation, SustainableAction, GreenChallenge & EnvironmentalImpactRecord MongoDB models, BEE/CEA emission factor engines, and AI advisor.',
      route: '/sustainability',
    },
    {
      id: 8,
      title: 'Module 8: Community and Society Intelligence Platform',
      status: 'active',
      badge: 'LIVE & ACTIVE',
      icon: Users,
      description:
        'Neighborhood pollution hotspot map, verifiable citizen incident reporting, residential society (RWA) and school smog protocols, collective green campaigns, transparent activity leaderboard, and Community AI Advisor.',
      architecture:
        'Community, CommunityMember, PollutionReport, CommunityEvent, CommunityCampaign, CommunityPost, CommunityNotification & CommunityAuditLog MongoDB models, Leaflet ground-truth hotspot engine, and Gemini Community Advisor.',
      route: '/community',
    },
    {
      id: 9,
      title: 'Module 9: Environmental Impact Tracker & Intelligence',
      status: 'active',
      badge: 'LIVE & ACTIVE',
      icon: BarChart3,
      description:
        'Auditable personal carbon footprint calculator (CEA v19 grid & IPCC factors), local air pollution disaggregation (CO2e vs ambient AQI & avoided PM2.5 inhalation), before/after period comparison, family household aggregation without double counting, goal benchmarks, smart insights, and AI Impact Advisor.',
      architecture:
        'EmissionFactor, CarbonFootprintRecord, EnvironmentalActivity, EnvironmentalGoal & EnvironmentalReportRecord MongoDB models, rule-based comparison engine, CEA/CPCB/DMRC emission registries, and Gemini Impact Advisor.',
      route: '/impact',
    },
    {
      id: 10,
      title: 'Module 10: What-if Air Pollution Simulator',
      status: 'active',
      badge: 'LIVE & ACTIVE',
      icon: Sliders,
      description:
        'Interactive scenario simulator with 10 physics-informed policy levers (vehicle cuts, EV transition, metro usage, HEPA air cleaners, urban forestry, dust suppression, industrial abatement, waste burning bans, inversion activity shift). Features real-time 3-state scenario comparison, personal pulmonary dose avoidance, community scale projections, and Gemini AI scenario analysis.',
      architecture:
        'PollutionSimulation MongoDB model, CPCB/TERI/IIT-K empirical source-apportionment dispersion physics engine, Gemini AI Scenario Advisor with deterministic fallback, preset library & 4-tier recommendation engine.',
      route: '/simulator',
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
            ARCHITECTURE ROADMAP
          </span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          ClearAir AI Platform Architecture (Modules 1–10)
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
          ClearAir AI is designed with a strict modular foundation. Module 1 establishes the rock-solid telemetry pipeline, authentication, pure-black design system, and database schema, engineered for seamless plug-in of upcoming modules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = m.status === 'active';

          return (
            <Card
              key={m.id}
              id={`module-${m.id}`}
              className={`p-6 transition-all ${isActive
                ? 'border-emerald-500/80 bg-emerald-500/5 shadow-md'
                : 'hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${isActive
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                      {m.title}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Module Phase {m.id < 10 ? `0${m.id}` : m.id}
                    </span>
                  </div>
                </div>

                <Badge variant={isActive ? 'good' : 'default'} size="sm">
                  {m.badge}
                </Badge>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed">
                <p className="text-zinc-600 dark:text-zinc-300">{m.description}</p>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black border border-zinc-100 dark:border-zinc-900">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-0.5">
                    Architectural Blueprint:
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                    {m.architecture}
                  </span>
                </div>

                {isActive && m.route && (
                  <div className="pt-2">
                    <Link to={m.route}>
                      <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                        <span>Explore Module {m.id}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

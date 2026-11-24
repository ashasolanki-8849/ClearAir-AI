# ClearAir AI — Severe Winter Smog & Urban Air Quality Intelligence
> **Module 1: Real-Time Air Quality Monitoring & Environmental Telemetry (ACTIVE)**  
> **Module 2: GenAI Smart Smog Assistant & Public Health Copilot (ACTIVE)**  
> **Module 3: Personalized Daily Action Planner & Diurnal Smog Scheduling (ACTIVE)**  
> **Module 4: Indoor Air Quality Intelligence & Guide (ACTIVE)**  
> **Module 5: Low-Emission Travel Planner & Smart Route Advisor (ACTIVE)**  
> **Module 6: Pollution Forecast & AI Prediction Engine (ACTIVE)**  
> **Module 7: Sustainable Living Advisor & Green Lifestyle Intelligence (ACTIVE)**  
> **Module 8: Community & Society Intelligence Platform (ACTIVE)**  
> **Module 9: Environmental Impact Tracker & Intelligence (ACTIVE)**

ClearAir AI is a full-stack web application designed for families, students, working professionals, elderly citizens, and communities to understand severe winter smog and urban air pollution, monitor real-time particulates, and make safer daily health decisions.

---

## 🌟 Implemented Modules

### 🌿 Module 1: Real-Time Air Quality Monitoring
- **Live CPCB / US EPA Hybrid AQI**: Real-time calculations derived from ambient particulate matter and gaseous pollutants via Open-Meteo & Copernicus Atmosphere Monitoring Service (CAMS).
- **7-Pollutant Telemetry**: Live concentrations, measurement units, 24-hour safety thresholds, and health implications for:
  - **PM2.5** (Fine Particulate Matter)
  - **PM10** (Coarse Particulate Matter)
  - **NO2** (Nitrogen Dioxide)
  - **SO2** (Sulphur Dioxide)
  - **CO** (Carbon Monoxide)
  - **O3** (Ground-Level Ozone)
  - **NH3** (Ammonia)
- **Meteorological Context & Thermal Inversion**: Tracks ambient temperature, relative humidity, wind speed, and wind direction to detect atmospheric inversion blankets that trap winter smog.
- **Interactive Visualizations**: 24-hour diurnal trend area chart (Recharts) and pollutant comparison bar chart.
- **Health Risk Advisory & Alerts**: Multi-tier alert thresholds with email/in-app notification toggles and demographic guidelines.
- **Location Intelligence**: Automatic browser GPS detection and global city search with debounced autocomplete.
- **Pure-Black Dark Mode (`#000000`) & Light Theme**: Pure-black dark mode (no blue/navy tint) optimized for OLED displays.

---

### 🤖 Module 2: GenAI Smart Smog Assistant
- **Dedicated Conversational Copilot (`/assistant`)**: Grounded in real-time sensor observations without fabricating environmental data.
- **Real-Time Context Awareness**: Automatically injects monitored city coordinates, live AQI, dominant pollutant (PM2.5), ambient temperature, humidity, and user demographic category into recommendation prompts.
- **Structured AI Responses**: Responses render into rich interactive cards:
  - **Executive Summary & Environmental Badge** (reflecting live ground truth).
  - **Actionable Guidance Cards** with Action, Scientific Justification, Timing, and explicit **Impact Engine metrics**:
    - 🟢 **Personal Benefit**: How the action reduces personal lung deposition / inhalation.
    - 🔵 **Environmental Benefit**: How the action reduces community tailpipe or domestic emissions.
  - **Smart Diurnal Routine**: 4-part timetable (**Morning, Afternoon, Evening, Night**) customized dynamically for current AQI levels.
  - **What-If Simulation Engine**: Answers hypothetical inquiries (*"What if I exercise outdoors today?"*, *"What if I commute during peak traffic?"*, *"What if I keep my windows open?"*) with consequence analysis and safer alternatives.
  - **Indoor Air Quality Intelligence**: Low-cost mitigation strategies (wet mopping, draft foam seals), purifier filter maintenance, and myth-busting evidence (houseplants vs. true HEPA mechanical filters).
- **Native Multilingual Support**:
  - **English (EN)**
  - **हिन्दी (HI - Hindi)**
  - **ગુજરાતી (GU - Gujarati)**
  - Instant one-click language toggle across all consultations.
- **Persistent Conversation Management**:
  - Stored in MongoDB `Conversation` collection with timestamped messages and AQI context snapshots.
  - Sidebar history with instant switching, single deletion, and full history wipe.
- **Dual-Engine Architecture**:
  - Direct integration with Google Gemini (`GEMINI_API_KEY`) or OpenAI (`OPENAI_API_KEY`).
  - Seamless zero-downtime fallback to the built-in Environmental AI Rule Engine if external API keys are omitted, ensuring 100% operational reliability.

---

### 🧭 Module 3: Personalized Daily Action Planner
- **Diurnal Smog Inversion Grounding**: Automatically evaluates the 24-hour diurnal temperature inversion curve — accounting for heavy ground-level particulate accumulation during cold mornings (06:00–09:30) and nights (20:30+), while leveraging peak midday solar dispersion (12:00–15:30) for safe ventilation and transit.
- **5-Period Daily Schedule Timeline**:
  1. 🌅 **Early Morning (06:00 - 08:30)**: Low-exertion indoor routines, hydration, and morning inversion avoidance.
  2. 🚶 **Morning Commute (08:30 - 12:00)**: Clean transit corridors, metro/public transit recommendations, and pediatric bus protection.
  3. ☀️ **Afternoon Window (12:00 - 16:30)**: Optimal solar dispersion window for natural ventilation, chores, and light errands.
  4. 🌇 **Evening Transition (16:30 - 20:30)**: Staggered rush-hour commuting and smog-aware fitness routines.
  5. 🌙 **Night Recovery (20:30 - 23:00)**: Bedroom sealing, night-mode quiet air purification, and respiratory recuperation.
- **Dynamic AQI-Based Plan Adjustment**:
  - Real-time recalculation engine triggers automatically when ambient AQI shifts $\ge 20$ points or transitions air quality category.
  - Safeguards outdoor plans (morning jog, outdoor sports) by auto-substituting with pre-calculated indoor safe alternatives.
- **Dual Impact Engine**:
  - Every activity explicitly quantifies **Personal Inhalation Benefit** (reduction in lung deposition, avoidance of peak toxic spikes) vs. **Environmental Emission Impact** (reduction in vehicle trips, idling, or solid fuel burning).
- **Lifestyle Persona Customization (`LifestyleSetupModal`)**:
  - Customizes schedule by persona: *Student, Working Professional, Homemaker, Elderly Person, Outdoor Worker, Fitness Enthusiast, Family*.
  - Configures wake/sleep hours, work/school hours, exercise times, transport modes, and voluntary vulnerability notes.
- **Family Daily Smog Planning (`FamilyPlannerModal`)**:
  - Age-stratified and condition-specific health precautions for household members: *Children* (pediatric masking, recess precautions), *Adults* (commute exposure), and *Elderly* (bronchial/cardiovascular protection).
- **Interactive Daily Action Planner UI (`/planner`)**:
  - Real-time AQI badge, completion progress bar, exposure mitigation counter, and one-click alternative swapping.
  - "+ Add Custom Activity" modal for user-added tasks with automatic period labeling.
  - Multi-language toggle (English, Hindi, Gujarati).
  - Scientific disclaimer aligned with CPCB and WHO exposure standards.
- **Smart Reminders**:
  - Configurable notifications for Morning Air Check, Pre-Workout Air Safety Check, and Evening Bedroom Smog Prep.

---

### 🏠 Module 4: Indoor Air Quality Intelligence & Guide
- **Room-Wise Vulnerability Assessment**:
  - Interactive questionnaire evaluating room dimensions, window counts, ventilation type, cooking intensity, incense/dhoop burning, tobacco exposure, dust accumulation, pets, cleaning habits, and dampness/mold.
  - Generates empirical risk scores (*Low, Moderate, High, Severe*) and identifies particulate, gaseous, and biological pollution factors without falsely presenting questionnaire scores as measured sensor AQI.
- **Smart Ventilation Advisor**:
  - Dynamically balances outdoor winter smog infiltration against indoor CO2, moisture, and chemical accumulation.
  - Recommends strategic 5–10 minute "Pulse Ventilation" windows centered on midday solar mixing (12:00–15:30) to flush stagnant air while minimizing particulate entry.
  - Prioritizes active kitchen plume extraction during cooking regardless of outdoor AQI, while directing internal door isolation for sleeping spaces.
- **Air Purifier CADR Sizing & Safety Calculator**:
  - Calculates room floor area and exact volume in both metric ($m^3$) and imperial ($ft^3$) units.
  - Applies the 5 Air Changes per Hour (ACH) clinical standard to calculate exact minimum smoke Clean Air Delivery Rate (CADR in CFM and $m^3/h$).
  - Mandates True HEPA H13 filtration and granular activated carbon honeycomb layers.
  - **Strict Safety Rejections**: Rejects ozone-generating air cleaners, ionizers, and PCO devices emitting respiratory irritants.
- **Kitchen Safety & Life-Safety Carbon Monoxide Protocol**:
  - Emphasizes that **particulate AQI sensors DO NOT detect Carbon Monoxide (CO)**.
  - Mandates dedicated electrochemical CO alarms in fuel-burning households.
  - Outlines clear emergency evacuation steps for suspected CO exposure.
- **Affordable Indoor Solutions (Stratified by Budget)**:
  - Zero-Cost / Habitual: Damp mopping (wet pocha) over dry broom sweeping, flame-free prayer rituals, bedroom isolation.
  - Low-Cost: Weatherstripping window seals, bottom door draft sweepers.
  - Medium-Cost: High-CFM kitchen/bathroom exhaust fans, MERV 13 HVAC filter retrofits.
  - Higher-Investment: Certified True HEPA mechanical purifiers, calibrated IAQ monitors.
- **Institutional & Office Management Guide**:
  - Protocols for schools, colleges, and offices: indoor physical education thresholds during AQI > 200, classroom CO2 management, chalk dust elimination, and fragrance-free office policies.
- **Connected Hardware & IoT Sensor Integration Layer**:
  - Supports physical laser PM2.5, PM10, NDIR CO2, and humidity devices via REST/MQTT.
  - Prominently informs users when no hardware is connected: *"Indoor air quality is not currently being measured."*
  - Includes a built-in Demo Simulator mode allowing interface preview without hardware.
  - Automated threshold alerts for PM2.5 spikes (>60 µg/m³) and dangerous CO2 stuffiness (>1200 ppm).
- **AI-Powered Indoor Air Advisor**:
  - Answers specialized indoor questions (plants, cooking smoke, classroom ventilation, humidifier usage) with structured JSON containing problem, cause, recommended action, scientific reason, benefit, cost tier, and technical limitations.
- **Educational Myths vs. Facts**:
  - Evidence-based debunking of 6 pervasive indoor air myths (Houseplants replacing purifiers, sealing 24/7, AC automatically cleaning air, pleasant fragrances meaning clean air, etc.) citing EPA, WHO, and peer-reviewed building science.
- **24-Hour Diurnal Indoor Air Routine**:
  - Morning Inversion Defense, Midday Solar Pulse, Evening Cooking Plume Isolation, and Night Bedroom Recovery Sanctuary.

---

### 🚗 Module 5: Low-Emission Travel Planner & Smart Route Advisor
- **3 Pollution-Aware Route Alternatives**:
  - **Route A (Fastest Arterial)**: Follows high-speed ring roads and national highways. Analyzes high diesel exhaust and stop-and-go idling pollution penalties.
  - **Route B (Clean Air Bypass Corridor)**: Routes through secondary, residential, and green corridors with 30%–45% lower roadside particulate density despite a modest distance detour.
  - **Route C (Metro Rail & Electric Mass Transit)**: Grade-separated mass transit corridor with 85% lower per-passenger CO2 and an air-conditioned, filtered buffer against street-level smog.
- **Leaflet OpenStreetMap Interactive Route Map**:
  - Real-time map rendering with OpenStreetMap tiles and custom color-coded polylines (amber for arterial highways, emerald green for clean bypasses, sky blue dashed for metro rail).
  - Custom origin (A) and destination (B) markers with interactive popups and automatic bounds fitting.
- **Personal Inhalation Exposure vs. Transportation Emissions Duality**:
  - Distinguishes **Inhaled Particulate Dose** (Duration $\times$ Concentration $\times$ Breathing Rate $\times$ Vehicle Attenuation) from **Greenhouse Gas Emissions** (g CO₂/km).
  - Explicitly warns against vigorous outdoor cycling/running during severe smog (AQI > 200/300) where hyperventilation causes 3x deeper lung deposition.
- **The Lifesaving "Cabin Air Recirculation" Protocol**:
  - Explains the vehicle AC recirculation button to prevent intake of diesel tailpipe plumes, cutting cabin PM2.5 by 75%–85%.
  - Outlines the 45-minute periodic fresh air pulse rule to prevent carbon dioxide drowsiness during long journeys.
- **4-Window Diurnal Departure Time Advisor**:
  - Evaluates daily atmospheric boundary layer dynamics:
    1. *Morning Smog Peak (07:30 – 10:30)*: Severe ground inversion trap + tailpipe surge (*Avoid if possible*).
    2. *Midday Solar Mixing (12:00 – 15:30)*: **Optimal Travel Window** — solar radiation expands the planetary boundary layer, lifting and diluting surface PM2.5.
    3. *Evening Commute (17:30 – 21:00)*: Cooling inversion + heavy congestion.
    4. *Late Night (22:00 – 06:00)*: Nocturnal radiation inversion + freight truck bypass.
- **Interactive Transportation Modes Comparison Grid (9 Modes)**:
  - Compares: *Walking, Cycling, Metro Rail, Electric Bus, Standard Bus, Carpool, Electric Vehicle (EV), Two-Wheeler (Scooter), Private Petrol Car*.
  - Compares travel duration, cost in INR, tailpipe and grid emissions, and inhaled particulate exposure multipliers.
- **Standalone Trip Carbon Emissions Calculator**:
  - Interactive distance slider, vehicle type, fuel type (petrol, diesel, CNG, electric, hybrid), and passenger occupancy.
  - Calculates trip emissions, per-passenger emissions, avoided emissions vs. a solo petrol vehicle, and equivalent tree absorption offset.
- **Specialized Commuter Playbooks**:
  - **Student Commute**: Metro university routes, campus walking lanes avoiding ring roads, student transit pass advantages, N95 helmet protocol.
  - **Corporate Office Commute**: Carpool circle coordination, post-10:00 AM staggered arrival to catch the solar mixing window, cabin filter upgrades.
  - **Family & Sensitive Travel**: Stroller particulate height risks (exhaust at 0.5m child breathing level), avoiding open three-wheelers during smog peaks.
- **Saved Places & Bookmarked Routes CRUD**:
  - Saved places (*Home, Office, College, School, Family*) with GPS coordinates and 1-click start/destination assignment.
  - Bookmarked routes with preferred modes and custom AQI alert thresholds.
  - Travel history trip logging tracking cumulative distance and avoided carbon emissions.
- **GenAI Smart Travel Co-Pilot**:
  - Conversational travel assistant providing structured recommendations on route selection, departure windows, cabin recirculation, and respiratory protection.
  - Dual-engine fallback: Google Gemini REST API with zero-downtime Environmental Rule Engine fallback.

---

### 📈 Module 6: Pollution Forecast & AI Prediction Engine
- **48-Hour Hourly & 7-Day Synoptic Numerical Forecasting (`/forecast`)**:
  - Powered by the Copernicus Atmosphere Monitoring Service (CAMS) ensemble chemistry-transport model and Open-Meteo Air Quality integration.
  - Generates hourly projections for horizons: **1h, 3h, 6h, 12h, 24h, and 48h**, displaying predicted AQI, category, and hour-by-hour meteorological parameters.
  - 7-day daily synoptic outlook with average, minimum, and maximum expected AQI ranges, dominant species, and tailored preventive precautions.
- **Multi-Pollutant Trajectory Matrix (6 Chemical Species)**:
  - Tracks individual chemical concentrations and trends:
    - **PM2.5** ($\mu\text{g/m}^3$) with 24-hour national ambient safety thresholds ($60\text{ }\mu\text{g/m}^3$).
    - **PM10** ($\mu\text{g/m}^3$) with 24-hour safety thresholds ($100\text{ }\mu\text{g/m}^3$).
    - **NO2** ($\mu\text{g/m}^3$) traffic emission tracer.
    - **SO2** ($\mu\text{g/m}^3$) coal combustion and industrial precursor.
    - **CO** ($\text{mg/m}^3$) incomplete combustion marker.
    - **O3** ($\mu\text{g/m}^3$) photochemical smog oxidant.
  - Displays current concentration vs. 6-hour vs. 24-hour predicted value, percentage changes, and CPCB limit threshold bars.
- **AI Pollution Trend Analysis & Diurnal Patterns**:
  - Computes directional trend trajectory (-100 to +100 score): *rising_fast, rising_slow, stable, clearing*.
  - Pinpoints daily expected **Peak Smog Hour** (typically 02:00–07:00 during nocturnal inversion) and **Cleanest Vent Window** (typically 13:00–16:00 during solar expansion).
  - Flags diurnal boundary-layer phases: *Morning Inversion Risk, Midday Solar Dispersion Window, Evening Commute Spike, Night Cold Air Stagnation*.
- **Early-Warning Notification Center**:
  - Automated early warning triggers for:
    - **Severe Smog Surges**: AQI predicted to surpass 300 / 400.
    - **Rapid Deterioration**: Particulate increases $>25\text{ }\mu\text{g/m}^3/\text{hr}$.
    - **Rain-Cleansing Washout Windows**: Precipitation scavenging events diluting suspended particulates.
    - **Midday Cleaning Windows**: Optimal hours for ventilation, errands, and physical movement.
  - In-app acknowledgment (`PATCH /api/forecast/alerts/:id/read`).
- **Statistical Anomaly & Particulate Spike Detection**:
  - Algorithmic anomaly detector running rolling 24-hour z-score models ($>2.2\sigma$ for significant deviation, $>3.2\sigma$ for critical particulate burst).
  - Rate-of-change jump evaluator flagging unexpected industrial plumes, waste burning events, and fireworks spikes.
- **Atmospheric Physics & Dispersion Intelligence**:
  - Correlates meteorological variables without confusing correlation with causation:
    - **Wind Dispersion Vector**: Wind speeds $<5\text{ km/h}$ flagged as poor horizontal ventilation.
    - **Planetary Boundary Layer & Thermal Inversion**: Detects cold-air traps capping vertical mixing below 250m.
    - **Relative Humidity & Aerosol Swelling**: $>75\%$ RH promotes hygroscopic growth of fine particulates and secondary aerosol formation.
    - **Precipitation Scavenging**: Wet deposition potential during rain showers.
- **Forecast Explainability Engine ("Why Is Pollution Changing?")**:
  - Provides plain-language explanations of underlying atmospheric physics.
  - Google Gemini AI integration with zero-downtime deterministic physics fallback.
  - Outlines contributing conditions, scientific mechanism, demographic vulnerability impact, and actionable daily planner interventions.
- **Cross-Location Regional Forecast Comparison**:
  - Compares ambient and 24-hour peak exposure across key urban hubs (Central Delhi, Noida Sector 62, Gurugram Cyber City, Mumbai, Ahmedabad, Bengaluru).
- **Transparent Empirical Forecast Accuracy Verification**:
  - Strictly prevents fabricated accuracy claims.
  - Calculates real historical **Mean Absolute Error (MAE)** and **Root Mean Square Error (RMSE)** by reconciling past predictions against actual observed ground readings.
  - Displays observation sample count ($n$) and horizon breakdown ($1\text{h}$ to $48\text{h}$).
- **Multilingual Support**:
  - Instant one-click language toggle across all forecast views: **English (EN)**, **हिन्दी (Hindi)**, and **ગુજરાતી (Gujarati)**.

---

### 🌿 Module 7: Sustainable Living Advisor
- **Personalized Sustainability Score (`/sustainability`)**:
  - Objective 0–100 index evaluated through transparent, documented mathematical criteria:
    - **Action Completion** (up to 40 pts): Ratio of verified completed sustainable lifestyle actions.
    - **7-Day Challenge Progress** (up to 25 pts): Consistency across daily micro-actions.
    - **Category Breadth** (up to 20 pts): Diversity of green habits across the 7 domains.
    - **Household Habits** (up to 15 pts): Waste segregation compliance, composting, rooftop solar, and star-rated appliances.
  - Transparent formula displayed in-app with zero arbitrary scoring or fabricated achievements.
- **Personalized Sustainable Alternatives (7 Domains)**:
  - **Transportation**: Staggered metro transit, electric last-mile feeder buses, trip chaining (consolidating fragmented errands to eliminate cold-start engine pollution), and cycling/walking restricted strictly to clean air windows (never during severe inversion smog).
  - **Household Energy**: Setting air conditioners to the Bureau of Energy Efficiency (BEE) recommended 24°C (saving 6% compressor electricity per 1°C increase), eliminating phantom standby power loads, and group switching.
  - **Cooking and Kitchen**: Covered lid cooking (cutting LPG consumption by up to 25%), active mechanical range hood extraction to isolate frying plumes from bedrooms, food waste reduction, and strict prohibition of household waste open burning.
  - **Waste Management**: Two-bin domestic source segregation (Green for biodegradable wet waste, Blue for clean dry recyclables), decentralized balcony composting, and authorized SPCB/CPCB e-waste drop-offs.
  - **Shopping and Consumption**: Reusable cotton mesh produce totes, durable stainless steel water bottles, product repair over disposal, and avoidance of single-use virgin polymers.
  - **Water Conservation**: Faucet aerator retrofits (cutting flow by 50% without pressure loss), domestic RO reject brine water collection for floor cleaning, and rainwater harvesting.
  - **Indoor and Outdoor Environment**: Damp wet-mopping (pocha) over dry broom sweeping (which aerosolizes toxic PM10 into breathing zones), entrance door mat staging, zero domestic incense during smog alerts, and native urban biodiversity flora.
  - **Scientific Air Cleaning Clarification**: Houseplants provide urban biodiversity and psychological well-being, but **DO NOT substitute for certified mechanical HEPA air filtration for fine PM2.5 removal**.
- **Budget-Based Solutions ("Find Sustainable Alternatives Within My Budget")**:
  - Categorized by upfront financial commitment: **Free (₹0)**, **Low-Cost (< ₹500)**, **Medium Budget (₹500–₹5,000)**, and **Higher Investment (> ₹5,000)**.
  - Side-by-side comparison of current habit vs. sustainable replacement, implementation difficulty, practical benefit, maintenance, and realistic savings supported by empirical calculations.
- **Local Sustainable Solutions ("Solutions Available Around Me")**:
  - Geo-aware discovery of verified environmental infrastructure across Indian metropolitan hubs:
    - Authorized E-Waste Drop-Off Centers (CPCB / SPCB approved)
    - Decentralized Material Recovery Facilities (MRF dry waste)
    - Multi-Modal Mass Transit Interchanges (DMRC, BEST, Metro Rail)
    - Public Bicycle Sharing (PBS) Stations (SmartBike, MYBYK)
    - Community Composting Gardens & RWA Facilities
    - Rooftop Solar Facilitation Centers (PM Surya Ghar / Discoms)
    - Refill & Zero-Waste Stores
  - Includes distance sorting, operating hours, accepted materials, and municipal source citations.
- **AI Sustainable Lifestyle Advisor**:
  - Dedicated conversational copilot answering inquiries on habit changes, zero-cost savings, and society greening.
  - Strict structured JSON response output: Executive Summary, Priority Level, Current Habit, Recommended Alternative, Scientific Rationale, Action Steps, Personal Benefit, Environmental Benefit, Cost Tier, and Data Citations.
  - Dual-engine integration: Google Gemini API with zero-downtime Intelligent Sustainable Lifestyle Engine fallback.
- **Personal Environmental Impact Calculator**:
  - Calculates personal impact using documented conversion factors from the Central Electricity Authority (CEA India grid baseline: $0.716\text{ kg CO}_2\text{e/kWh}$), IPCC 2006 Mobile Combustion Guidelines, and CPCB Waste Models.
  - **Strict Metric Separation**: Clearly separates $\text{CO}_2$-equivalent emissions, criteria air pollutants ($\text{PM}_{2.5}$ and $\text{NO}_x$ grams), landfill waste diverted ($\text{kg}$), and water conserved ($\text{Liters}$).
  - Incomplete or zero inputs safely trigger *"Insufficient data for calculation"* rather than generating fabricated figures.
- **7-Day Sustainable Living Challenge**:
  - Day-by-day micro-habit challenge cards with time estimates and benefits:
    - Day 1: Vampire Power & AC 24°C Optimization
    - Day 2: Zero-Plastic Carry Habit
    - Day 3: Two-Bin Domestic Waste Segregation
    - Day 4: Smart Commute & Trip Chaining
    - Day 5: Clean Kitchen Ventilation & Food Care
    - Day 6: Water Aerator & Wet-Mopping Day
    - Day 7: Household Sustainability Review & Community Sharing
  - Interactive day completion toggle, streak counter, and Green Habit Champion badge.
- **Family & Community Sustainability**:
  - Shared household goals with progress bars, assigned members, and target completion dates.
  - Apartment society initiatives tracking wet-waste composting drives and e-waste collection camps.
- **Before-and-After Lifestyle Comparison**:
  - Compares previous high-carbon habits against sustainable replacements across Transportation, Energy, Waste, and Shopping.
  - Quantifies potential monthly $\text{CO}_2\text{e}$ avoidance and financial savings with scientific explanations and transparent disclaimers.

---

### 👥 Module 8: Community & Society Intelligence Platform
- **Community Hub Creation & Joining (`/community`)**:
  - Multi-tier community types: *Residential Apartment Societies (RWAs), School Campuses, College & University Campuses, Workplace / Corporate Parks, Environmental Citizen Groups, and Neighborhood Communities*.
  - Flexible privacy configurations: *Public* (open discovery), *Private* (admin review), and *Invite-Only* (alphanumeric secure join code e.g. `CLR-XXXXX`).
  - Role-based governance: **Owner**, **Admin**, **Moderator**, and **Member** permissions.
- **Hyper-Local Community Air Quality & Automatic Alerts**:
  - Ground-truth monitoring using verified coordinates via Open-Meteo & Copernicus CAMS.
  - Full 6-pollutant concentration matrix ($\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$), atmospheric inversion indicators, and explicit data station labeling.
  - Automatic critical smog alert broadcast when ambient AQI crosses community thresholds ($\ge 300$).
- **Citizen Pollution Incident Reporting**:
  - Grounded reporting categories: *Open Garbage/Plastic/Leaf Burning, Uncovered Construction Dust, Unpaved Road Dust, Heavy Commercial Vehicle Smoke, Industrial Plumes, and Open Waste Dumps*.
  - Identity privacy protection with voluntary one-click anonymous submission.
  - End-to-end moderation lifecycle tracking: $\text{Submitted} \rightarrow \text{Under Review} \rightarrow \text{Verified} \rightarrow \text{In Progress} \rightarrow \text{Resolved} \text{ / } \text{Rejected}$.
- **Neighbourhood Pollution Hotspot Map**:
  - Real coordinate mapping using Leaflet with custom category and severity markers.
  - Interactive incident drawer with corroboration upvotes and moderation status.
  - Strict scientific transparency: displays verified coordinates only; artificial spatial heatmaps are not simulated.
- **Community Green Activities & Verifiable Campaigns**:
  - **Upcoming Events**: RSVP registration for park cleanup drives, tree canopy misting, e-waste camps, and smog safety workshops with capacity management.
  - **Collective Campaigns**: Target-driven environmental drives (e.g., *1,000 kg Waste Segregation Challenge*, *Zero Leaf Burning Vigilance*) with dynamic progress bars and participant contribution logging.
- **Transparent Participation Leaderboard**:
  - Transparent activity points awarded strictly for verified physical actions: events attended (+10 pts), verified pollution reports (+15 pts), and discussion posts (+5 pts).
  - Explicit guarantee: strictly credits real participation; never fabricates ambient AQI displacement claims or hypothetical emissions math.
- **Community Discussion Forum**:
  - Topic-focused threads across Air Quality, Local Smog Concerns, Green Living, Waste Management, and School Protocols.
  - Multi-user threaded replies, upvotes, and content moderation flagging.
- **Institution & Society Specific Blueprints**:
  - **Residential Societies**: Wet mopping protocols, guard electric heating provisions to stop night warming fires, leaf composting pits, and DG filter compliance.
  - **Schools & Campuses**: Indoor sports shifting during smog peaks, school gate no-idling rules, library clean air sanctuaries, and student eco-ambassadors.
  - **Workplaces**: Staggered commuting schedules, HVAC MERV-13 filter maintenance, and corporate carpooling fleets.
- **Ask Community AI Advisor**:
  - Dual-engine co-pilot (Google Gemini API + deterministic environmental rule fallback).
  - Structured output schema: Executive Summary, Community Context, Identified Local Concerns, Priority Collective Actions, Implementation Roadmap, and Resource Estimates.
- **Community Governance & Audit Logs**:
  - Administrative role assignment, official noticeboard announcements, and immutable audit logs.

---

### 📊 Module 9: Environmental Impact Tracker & Intelligence
- **Auditable Personal Carbon Footprint Ledger (`/impact`)**:
  - Grounded in official regulatory emission coefficients: Central Electricity Authority (CEA Baseline Database v19 grid factor: $0.716\text{ kg CO}_2\text{e/kWh}$), DMRC metro railway factor ($0.028\text{ kg CO}_2\text{e/pkm}$), IPCC mobile tailpipe combustion factors, and CPCB solid waste diversion models.
  - Granular domain calculation:
    - **Transportation**: Mode-specific calculations (petrol/diesel personal car, two-wheeler, electric vehicle, public bus, urban metro, passenger load sharing).
    - **Electricity & Energy**: Utility bill accounting, renewable offset (rooftop solar net metering), and star-rated appliance loads.
    - **Household Fuel**: Domestic LPG cylinders ($42.37\text{ kg CO}_2\text{e}$ per 14.2 kg cylinder) and piped natural gas (PNG $2.15\text{ kg CO}_2\text{e/m}^3$).
    - **Solid Waste**: Landfill methane burden ($+1.45\text{ kg CO}_2\text{e/kg}$) vs. decentralized organic composting (avoiding $-0.52\text{ kg CO}_2\text{e/kg}$) and recyclables recovery ($-0.85\text{ kg CO}_2\text{e/kg}$).
    - **Water Consumption**: Municipal potable supply pumping and treatment energy intensity ($0.00035\text{ kg CO}_2\text{e/L}$).
- **Strict Scientific Metric Disaggregation**:
  - **Global Climate Impact**: Greenhouse gases ($\text{CO}_2, \text{CH}_4, \text{N}_2\text{O}$) expressed in $\text{kg CO}_2\text{e}$.
  - **Local Breathing Zone Air Quality**: Criteria air pollutants ($\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_x, \text{SO}_2, \text{CO}$) strictly tracked separately in tailpipe grams.
  - **Personal Inhalation Protection**: Quantified grams of $\text{PM}_{2.5}$ avoided from lung deposition through N95 mask usage, indoor HEPA filtration, and clean bypass routing.
  - **Scientific Transparency Callout**: Clearly highlights that individual carbon footprint reductions do not immediately alter regional citywide ambient AQI, which is heavily governed by meteorological inversion blankets and collective regional emissions.
- **Period-over-Period Environmental Comparison**:
  - Side-by-side comparison across time horizons (`today`, `yesterday`, `this_week`, `last_week`, `this_month`, `last_month`, `last_3_months`, `this_year`).
  - Transparent calculation of absolute and percentage deltas with reduction badges and audit completeness notices.
- **Daily Environmental Activity Logger**:
  - Unified activity logger tracking daily green habits, carpools, public transit rides, composting, and energy-saving chores.
  - Direct persistence into verified database models with categorization, quantity tracking, and quality ratings (`User Entered`, `Measured`, `Calculated`, `Verified`).
- **Personal Environmental Reduction Goals**:
  - Benchmark setting with category targets, units, target deadlines, and progress bars.
  - Real-time increment updates and status transitions (`active`, `completed`, `paused`, `abandoned`).
- **Collective Household & Community Impact**:
  - **Family Household**: Aggregates household-level footprints without double-counting shared residential meters (utility bills, piped gas).
  - **Community Intelligence**: Integrates with Module 8 society drives, clean air campaigns, and physical waste diversion.
- **Smart Rule-Based Insights & AI Impact Advisor**:
  - Identifies dominant emission drivers, rising trends, and audit data gaps.
  - Conversational AI co-pilot (Google Gemini API + deterministic rule fallback) delivering structured actionable guidance with CEA/IPCC citations.
- **Audit-Ready Report Generator & CSV Export**:
  - One-click print/PDF environmental statements and RFC-compliant CSV ledger downloads.

---

## 🏛️ Platform Architecture Roadmap (Modules 1–10)

| Module | Title | Status |
|---|---|---|
| **Module 1** | **Real-Time Air Quality Monitoring** | **LIVE & ACTIVE** |
| **Module 2** | **GenAI Smart Smog Assistant** | **LIVE & ACTIVE** |
| **Module 3** | **Personalized Daily Action Planner** | **LIVE & ACTIVE** |
| **Module 4** | **Indoor Air Quality Guide** | **LIVE & ACTIVE** |
| **Module 5** | **Low-Emission Travel Planner** | **LIVE & ACTIVE** |
| **Module 6** | **Pollution Forecast & AI Prediction Engine** | **LIVE & ACTIVE** |
| **Module 7** | **Sustainable Living Advisor** | **LIVE & ACTIVE** |
| **Module 8** | **Community & Society Intelligence Platform** | **LIVE & ACTIVE** |
| **Module 9** | **Environmental Impact Tracker & Intelligence** | **LIVE & ACTIVE** |
| Module 10 | What-if Pollution Simulator | Upcoming |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Theme**: Pure Black (`#000000`) and Light modes

### Backend
- **Runtime**: Node.js & Express.js
- **Architecture**: MVC REST API pattern (Controllers, Models, Routes, Services, Middleware)
- **Authentication**: JWT & Bcrypt password hashing
- **Database**: MongoDB Atlas / Mongoose ODM (with automatic in-memory fallback during local development)
- **AI Services**: ContextBuilderService, RecommendationService, AIAssistantService

### External Services
- **Real-time Air Quality**: Open-Meteo Air Quality API (Copernicus CAMS & GFS)
- **Meteorology**: Open-Meteo Weather API
- **Geocoding**: Open-Meteo Geocoding API & Browser Geolocation

---

## 📡 REST API Reference

### Module 8: Community & Society Intelligence Platform
- `GET /api/communities` — Search & list communities by city, type, or privacy
- `POST /api/communities` — Create community with location, objectives, and admin settings
- `POST /api/communities/join-by-code` — Join community using secure alphanumeric invitation code
- `GET /api/communities/my` — Get user's active joined communities
- `GET /api/communities/:id` — Get community details and user membership status
- `POST /api/communities/:id/join` — Join community (supports public, private pending, and invite-only)
- `POST /api/communities/:id/leave` — Leave community
- `GET /api/communities/:id/aqi` — Real-time community AQI, pollutant breakdown, and severe warning check
- `GET /api/communities/:id/impact` — Aggregate physical community impact (waste segregated, trees planted, attendees)
- `GET /api/communities/:id/leaderboard` — Transparent participant leaderboard based on verified activity points
- `GET /api/communities/:id/institution-view` — Tailored governance guidance for RWAs, Schools, or Workplaces
- `POST /api/communities/:id/advisor` — Community AI Advisor generating structured collective recommendations
- `GET /api/community-reports` — List citizen pollution reports with category, severity, and status filters
- `POST /api/community-reports` — Submit citizen pollution incident report with optional anonymity
- `GET /api/community-reports/hotspots` — Hotspot coordinates feed for Leaflet interactive map
- `PATCH /api/community-reports/:id/status` — Moderate incident (`submitted` -> `verified` -> `in_progress` -> `resolved`)
- `POST /api/community-reports/:id/upvote` — Corroborate / upvote incident
- `GET /api/communities/:id/events` — List community clean drives, tree planting, and workshops
- `POST /api/communities/:id/events` — Create community event with max participants
- `POST /api/communities/events/:eventId/register` — RSVP register for event
- `POST /api/communities/events/:eventId/cancel` — Cancel event RSVP
- `POST /api/communities/events/:eventId/impact` — Log recorded physical impact
- `GET /api/communities/:id/campaigns` — List active environmental campaigns with progress bars
- `POST /api/communities/:id/campaigns` — Create collective goal campaign
- `POST /api/communities/campaigns/:campaignId/progress` — Record campaign contribution progress
- `GET /api/communities/:id/posts` — Discussion threads with category filtering
- `POST /api/communities/:id/posts` — Create discussion thread
- `GET /api/communities/posts/:postId/comments` — Thread comments
- `POST /api/communities/posts/:postId/comments` — Reply to thread
- `POST /api/communities/posts/:postId/like` — Toggle thread upvote
- `POST /api/communities/posts/:postId/flag` — Flag inappropriate post for review
- `GET /api/communities/:id/notifications` — Community notices & severe smog broadcasts
- `POST /api/communities/:id/announcements` — Publish official administrator announcement
- `GET /api/communities/:id/audit-logs` — Administrative audit history

### Module 7: Sustainable Living Advisor
- `GET /api/sustainability/dashboard` — Complete sustainability overview, transparent score, and active actions
- `GET /api/sustainability/recommendations` — Filtered personalized sustainable recommendations across 7 domains
- `POST /api/sustainability/recommendations/generate` — Generate fresh recommendations based on user profile
- `PATCH /api/sustainability/recommendations/:id/status` — Mark recommendation adopted or saved
- `GET /api/sustainability/profile` — User sustainability profile and transparent scoring criteria
- `PUT /api/sustainability/profile` — Update sustainability habits across transport, energy, cooking, waste, water
- `GET /api/sustainability/alternatives` — Budget-based alternative habit comparisons (Free, Low-Cost, Medium, Investment)
- `GET /api/sustainability/local-solutions` — Verified local facilities (E-waste drop-offs, MRFs, metro hubs, PBS stations)
- `POST /api/sustainability/chat` — AI Sustainable Lifestyle Advisor with structured JSON output
- `POST /api/sustainability/calculate-impact` — Empirical personal impact calculator (CO2e, PM2.5, NOx, waste, water)
- `GET /api/sustainability/challenges` — 7-day sustainable living micro-habit challenges
- `POST /api/sustainability/challenges/:id/start` — Start 7-day challenge
- `PATCH /api/sustainability/challenges/progress/:dayNumber` — Mark daily micro-habit challenge complete
- `GET /api/sustainability/household` — Household shared targets and society eco-initiatives
- `POST /api/sustainability/household/goals` — Add household shared sustainability goal
- `GET /api/sustainability/comparisons` — Before-and-after lifestyle habit comparison matrix

### Module 6: Pollution Forecast & AI Prediction Engine
- `GET /api/forecast/current?city=...&lat=...&lon=...` — Real-time telemetry and current atmospheric inversion status
- `GET /api/forecast/hourly?city=...&hours=...` — High-resolution hourly AQI predictions (up to 72h)
- `GET /api/forecast/daily?city=...&days=...` — 7-day synoptic pollution outlook with peak windows
- `GET /api/forecast/pollutants?city=...` — 6-pollutant forecast trajectories (PM2.5, PM10, NO2, SO2, CO, O3)
- `GET /api/forecast/trends?city=...` — Multi-day trend indicators, diurnal ranges, and moving averages
- `GET /api/forecast/anomalies?city=...` — Statistical z-score anomaly detection and sudden spike alerts
- `GET /api/forecast/early-warnings?city=...` — Multi-tiered early warning notices and GRAP trigger stages
- `GET /api/forecast/weather-insights?city=...` — Inversion layer tracking, boundary layer height, and stagnation indices
- `POST /api/forecast/ai-explanation` — GenAI explanation of underlying atmospheric physics
- `GET /api/forecast/accuracy?city=...` — Transparent empirical MAE and RMSE prediction evaluation

### Module 5: Low-Emission Travel & Smart Route Advisor
- `POST /api/travel/search` — Generate 3 distinct route alternatives (Fastest Arterial, Clean Bypass, Metro Rail) with Leaflet polyline geometry, estimated street AQI, and priority ranking
- `POST /api/travel/compare` — Compare and rank arbitrary route arrays under specified priorities (balanced, fastest, lowest_exposure, lowest_emissions, lowest_cost)
- `GET /api/travel/alternatives?distanceKm=...&outdoorAqi=...` — Compare 9 transportation modes with duration, cost, emissions, and micro-environment exposure multipliers
- `GET /api/travel/places` — List user's saved favorite places (Home, Office, College, etc.)
- `POST /api/travel/places` — Save new favorite location with GPS coordinates and default origin toggle
- `PUT /api/travel/places/:id` — Update saved place details
- `DELETE /api/travel/places/:id` — Delete saved place
- `GET /api/travel/routes` — Retrieve bookmarked routes with custom AQI alert thresholds
- `POST /api/travel/routes` — Bookmark route with origin/destination and threshold
- `DELETE /api/travel/routes/:id` — Remove saved route bookmark
- `POST /api/travel/emissions/calculate` — Exact carbon emissions calculation based on mode, fuel type, distance, and passenger count
- `POST /api/travel/departure-times` — 4-window diurnal smog departure time advisor with meteorological boundary layer dispersion guidance
- `GET /api/travel/history` — Fetch user trip history with cumulative distance and carbon savings
- `POST /api/travel/history` — Record completed trip with mask and cabin recirculation logs
- `GET /api/travel/preferences` — Get user travel priorities and vehicle profile
- `PUT /api/travel/preferences` — Update travel preferences
- `POST /api/travel/ask-advisor` — GenAI Smart Travel Co-Pilot answering smog-safe route, mask, and cabin recirculation questions

### Module 4: Indoor Air Quality Intelligence & Guide
- `GET /api/indoor/rooms` — List user's rooms (auto-seeds defaults if new account)
- `POST /api/indoor/rooms` — Create room profile with dimensions, windows, and ventilation
- `PUT /api/indoor/rooms/:id` — Update room dimensions and parameters
- `DELETE /api/indoor/rooms/:id` — Delete room and cascade clean assessments
- `POST /api/indoor/assessment` — Submit questionnaire and generate source vulnerability analysis
- `GET /api/indoor/assessment/:roomId` — Retrieve latest assessment for a room
- `POST /api/indoor/ventilation-advice` — Get atmospheric balance ventilation strategy
- `POST /api/indoor/purifier-advice` — Calculate room volume and minimum CADR (5 ACH)
- `POST /api/indoor/ask-advisor` — Consult GenAI Indoor Air Intelligence Co-Pilot
- `GET /api/indoor/devices` — List paired hardware monitors and smart purifiers
- `POST /api/indoor/devices` — Register physical sensor device
- `DELETE /api/indoor/devices/:id` — Delete device and reading logs
- `POST /api/indoor/devices/:id/readings` — Ingest sensor readings and trigger automated safety alerts
- `GET /api/indoor/devices/:id/readings` — Retrieve historical telemetry
- `POST /api/indoor/devices/demo` — Activate simulated demo sensor for preview
- `GET /api/indoor/alerts` — Fetch indoor air quality alerts (PM2.5 spike, high CO2, mold dampness)
- `PATCH /api/indoor/alerts/:id/read` — Mark indoor alert as read

### Module 3: Personalized Daily Action Planner
- `GET /api/planner/today?lat=...&lon=...&name=...&language=...` — Retrieve or auto-generate today's 5-period action plan
- `POST /api/planner/generate` — Force re-evaluate/regenerate schedule against latest CPCB telemetry
- `GET /api/planner/lifestyle` — Retrieve user schedule and transport preferences
- `PUT /api/planner/lifestyle` — Update lifestyle profile (wake/sleep, commute, exercise, transport)
- `PATCH /api/planner/activity/:id/status` — Mark activity completed/pending & update completion percentage
- `POST /api/planner/activity/:id/swap` — One-click substitution of outdoor task with pre-calculated indoor alternative
- `POST /api/planner/activity/custom` — Add user-customized scheduled activity
- `GET /api/planner/family` — Retrieve family household member profiles
- `POST /api/planner/family` — Add family member (children, adults, elderly) with health notes
- `DELETE /api/planner/family/:id` — Delete family member profile
- `GET /api/planner/family/recommendations` — Age-stratified vulnerability precautions and safe time windows
- `GET /api/planner/reminders` — List smart air-safety reminders
- `PUT /api/planner/reminders/:id` — Toggle reminder on/off or change scheduled time

### Module 2: Smart Smog Assistant
- `POST /api/assistant/chat` — Send query, receive structured recommendation with context snapshot
- `GET /api/assistant/conversations` — Retrieve saved conversation history for user / session
- `GET /api/assistant/conversations/:id` — Load single conversation with message logs
- `DELETE /api/assistant/conversations/:id` — Delete specific conversation
- `DELETE /api/assistant/conversations` — Clear all conversations for authenticated user

### Module 1: Telemetry & Foundation
- `GET /api/air-quality/current?lat=...&lon=...` — Live AQI, 7 pollutants, weather, and health advisory
- `GET /api/air-quality/history?lat=...&lon=...` — 24-hour hourly trend readings
- `GET /api/air-quality/pollutants?lat=...&lon=...` — Detailed pollutant thresholds and biological impacts
- `POST /api/auth/register` — Create user account with demographic category
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/locations/search?q=...` — Global city geocoding search
- `POST /api/locations/save` — Save monitoring place to user profile
- `GET /api/alerts` — Fetch active pollution warnings and unread counts

---

## 🚀 Running the Project

*Note: As per user instructions, servers are currently idle and will run whenever requested.*

When you wish to start the application:
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api/health`

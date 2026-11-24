import mongoose from 'mongoose';
import {
  SustainableRecommendation,
  ISustainableRecommendation,
  PriorityLevel,
} from '../models/SustainableRecommendation.js';
import { SustainabilityCategory, BudgetPreference } from '../models/UserSustainabilityProfile.js';

// Comprehensive, non-generic, scientifically grounded recommendations catalog across 7 categories
export const RECOMMENDATIONS_CATALOG = [
  // A. TRANSPORTATION
  {
    category: 'transportation' as SustainabilityCategory,
    currentHabit: 'Single-occupancy private vehicle commute on congested urban corridors',
    recommendedAlternative: 'Staggered Metro transit combined with electric feeder last-mile transit',
    reason: 'Eliminates bumper-to-bumper diesel exhaust inhalation and cuts per-commuter greenhouse gas emissions by ~82%.',
    priority: 'high' as PriorityLevel,
    costCategory: 'low_cost' as BudgetPreference,
    implementationDifficulty: 'easy' as const,
    personalBenefit: 'Avoids roadway micro-environment PM2.5 spikes (150–300 µg/m³) in air-filtered metro cabins.',
    environmentalBenefit: 'Avoids ~1.8 kg CO2e and 0.24 g PM2.5 per 15 km roundtrip vs solo petrol car.',
    implementationSteps: [
      'Procure an automatic smart travel card or digital QR pass for seamless fare entry.',
      'Locate the nearest metro station or electric feeder bus stop using the Smart Travel Planner (Module 5).',
      'Wear an N95 mask during above-ground outdoor walking connections during smog hours.',
    ],
    maintenanceRequirements: 'Periodic smart card balance top-up.',
    limitations: ['Requires access to mass transit feeder routes within 1.5 km of origin/destination.'],
    estimatedSavings: {
      amount: 2200,
      unit: 'INR',
      period: 'monthly',
      description: 'Estimated fuel and parking savings compared to daily solo car commuting.',
    },
    dataSource: {
      name: 'Delhi Metro Rail Corporation (DMRC) / IPCC 2006 Guidelines',
      lastUpdated: '2026',
      assumptions: 'Based on 15 km daily commute replacing private petrol hatchback (12 km/L).',
    },
  },
  {
    category: 'transportation' as SustainabilityCategory,
    currentHabit: 'Individual solo two-wheeler or cab rides for small fragmented errands',
    recommendedAlternative: 'Trip chaining (combining multiple nearby errands into a single circular journey)',
    reason: 'Cold-start engine phases emit 40% higher carbon monoxide and unburnt hydrocarbons during the first 3 km.',
    priority: 'recommended' as PriorityLevel,
    costCategory: 'free' as BudgetPreference,
    implementationDifficulty: 'easy' as const,
    personalBenefit: 'Reduces total outdoor roadway exposure duration by up to 50%.',
    environmentalBenefit: 'Eliminates 2 to 3 redundant cold-start ignition cycles per week.',
    implementationSteps: [
      'Batch grocery, pharmacy, and postal errands into a single dedicated afternoon trip.',
      'Schedule the trip between 1:00 PM and 3:30 PM to coincide with peak solar boundary layer mixing.',
    ],
    maintenanceRequirements: 'Weekly planning habit.',
    limitations: ['Requires flexible errand scheduling.'],
    dataSource: {
      name: 'Central Pollution Control Board (CPCB) Vehicular Emission Studies',
      lastUpdated: '2026',
      assumptions: 'Assumes 3 consolidated errands per week saving 8 km total travel.',
    },
  },

  // B. HOUSEHOLD ENERGY
  {
    category: 'energy' as SustainabilityCategory,
    currentHabit: 'Setting Air Conditioning thermostats to 18°C–20°C during warm/humid periods',
    recommendedAlternative: 'Setting AC thermostat to the Bureau of Energy Efficiency (BEE) recommended 24°C',
    reason: 'Every 1°C increase in AC thermostat setting reduces compressor electricity consumption by 6%.',
    priority: 'high' as PriorityLevel,
    costCategory: 'free' as BudgetPreference,
    implementationDifficulty: 'easy' as const,
    personalBenefit: 'Prevents extreme indoor-to-outdoor temperature shock and respiratory mucous membrane drying.',
    environmentalBenefit: 'Saves ~2.8 kWh daily per 1.5-ton AC unit, avoiding ~2.0 kg CO2e per day (CEA grid factor: 0.716 kg/kWh).',
    implementationSteps: [
      'Set thermostat to 24°C and run ceiling fan at low speed to circulate cooled air evenly.',
      'Clean polyurethane dust filters every 15 days to maintain laminar airflow over cooling coils.',
    ],
    maintenanceRequirements: 'Fortnightly filter washing.',
    limitations: ['Thermal comfort depends on room insulation and direct solar heat gain.'],
    estimatedSavings: {
      amount: 750,
      unit: 'INR',
      period: 'monthly',
      description: 'Electricity bill savings per air-conditioner operating 8 hours/day at ₹8/kWh.',
    },
    dataSource: {
      name: 'Bureau of Energy Efficiency (BEE) India',
      url: 'https://beeindia.gov.in',
      lastUpdated: '2026',
      assumptions: '1.5 Ton 3-Star Inverter AC operating 8h daily at 24°C vs 20°C.',
    },
  },
  {
    category: 'energy' as SustainabilityCategory,
    currentHabit: 'Leaving appliances, set-top boxes, and chargers in active standby mode (phantom power)',
    recommendedAlternative: 'Switching off appliances at main wall socket or using smart power strips',
    reason: 'Vampire standby loads account for 5% to 8% of residential electrical consumption without providing utility.',
    priority: 'recommended' as PriorityLevel,
    costCategory: 'free' as BudgetPreference,
    implementationDifficulty: 'easy' as const,
    personalBenefit: 'Eliminates fire hazards from overheated, aging power adapters.',
    environmentalBenefit: 'Avoids ~15 kWh of unnecessary coal-fired grid electricity monthly per household.',
    implementationSteps: [
      'Turn off entertainment consoles, microwave displays, and chargers at the wall switch when retiring for bed.',
      'Group television peripherals on a single switchable master spike strip.',
    ],
    maintenanceRequirements: 'Daily habit.',
    limitations: ['Not suitable for Wi-Fi routers requiring uninterrupted medical or security connections.'],
    dataSource: {
      name: 'International Energy Agency (IEA) Standby Power Initiative',
      lastUpdated: '2026',
    },
  },

  // C. COOKING AND KITCHEN
  {
    category: 'cooking' as SustainabilityCategory,
    currentHabit: 'Cooking on high heat with lids off and insufficient range hood exhaust',
    recommendedAlternative: 'Covered lid cooking, pressure cooking, and active mechanical range hood extraction',
    reason: 'Cooking with lids retains heat, reducing LPG consumption by up to 25%, while active extraction purges indoor VOCs.',
    priority: 'high' as PriorityLevel,
    costCategory: 'free' as BudgetPreference,
    implementationDifficulty: 'easy' as const,
    personalBenefit: 'Prevents kitchen particulate spikes (PM2.5 frequently $>400\text{ }\mu\text{g/m}^3$ during high-oil frying) from infiltrating bedrooms.',
    environmentalBenefit: 'Reduces residential LPG cylinder consumption and unburnt fuel emissions.',
    implementationSteps: [
      'Always place lids on pots and use pressure cookers for lentils and grains.',
      'Run the kitchen exhaust fan 2 minutes before igniting burners and continue for 5 minutes after cooking.',
      'Keep kitchen doors closed to sleeping areas during frying or tempering (tadka).',
    ],
    maintenanceRequirements: 'Monthly kitchen exhaust fan mesh degreasing.',
    limitations: ['Requires functioning kitchen exhaust or chimney.'],
    dataSource: {
      name: 'Petroleum Conservation Research Association (PCRA) India',
      url: 'https://pcra.org',
      lastUpdated: '2026',
    },
  },

  // D. WASTE MANAGEMENT
  {
    category: 'waste' as SustainabilityCategory,
    currentHabit: 'Mixed disposal of wet food waste, dry plastics, and hazardous waste in single dustbin',
    recommendedAlternative: 'Two-bin source segregation (Green for biodegradable wet waste, Blue for clean dry recyclables)',
    reason: 'Organic waste rotting in unsegregated anaerobic landfills produces methane (28x more potent GHG than CO2) and triggers toxic surface fires.',
    priority: 'high' as PriorityLevel,
    costCategory: 'low_cost' as BudgetPreference,
    implementationDifficulty: 'easy' as const,
    personalBenefit: 'Eliminates foul domestic odors, fruit fly breeding, and hazardous chemical leachate in living quarters.',
    environmentalBenefit: 'Prevents ~0.8 kg waste daily from reaching overflowing municipal dumpsites; enables 100% recycling of dry polymers.',
    implementationSteps: [
      'Designate a green pedal-bin for vegetable peels, food scraps, and tea leaves.',
      'Designate a separate dry bin for rinsed milk pouches, cardboard, and recyclable plastic bottles.',
      'Hand segregated waste directly to authorized municipal collectors.',
    ],
    maintenanceRequirements: 'Daily bin emptying and rinsing.',
    limitations: ['Requires neighborhood municipal infrastructure that supports segregated pickup.'],
    dataSource: {
      name: 'Solid Waste Management Rules (SWM 2016) / Ministry of Environment, Forest and Climate Change (MoEFCC)',
      lastUpdated: '2026',
    },
  },
  {
    category: 'waste' as SustainabilityCategory,
    currentHabit: 'Disposing obsolete electronics, chargers, and alkaline batteries in regular trash',
    recommendedAlternative: 'Handing over electronic waste to authorized SPCB/CPCB e-waste collection centers',
    reason: 'Heavy metals (lead, cadmium, mercury) in landfill e-waste leach into groundwater and release toxic dioxins if open-burned.',
    priority: 'recommended' as PriorityLevel,
    costCategory: 'free' as BudgetPreference,
    implementationDifficulty: 'moderate' as const,
    personalBenefit: 'Safely purges hazardous chemical and battery fire risks from domestic storage.',
    environmentalBenefit: 'Facilitates recovery of rare earth metals and prevents groundwater lead contamination.',
    implementationSteps: [
      'Accumulate old phones, cables, and batteries in a designated cardboard box.',
      'Locate the nearest authorized e-waste drop-off bin using the "Solutions Around Me" section.',
    ],
    maintenanceRequirements: 'Bi-annual drop-off.',
    limitations: ['Drop-off points may require traveling 2–5 km.'],
    dataSource: {
      name: 'CPCB E-Waste (Management) Rules',
      lastUpdated: '2026',
    },
  },

  // E. SHOPPING AND CONSUMPTION
  {
    category: 'shopping' as SustainabilityCategory,
    currentHabit: 'Relying on single-use plastic grocery bags and disposable single-use water bottles',
    recommendedAlternative: 'Carrying washable cotton mesh shopping totes and food-grade stainless steel bottles',
    reason: 'Single-use polybags clog urban stormwater drains causing flooding, and degrade into microplastics that enter the food chain.',
    priority: 'recommended' as PriorityLevel,
    costCategory: 'low_cost' as BudgetPreference,
    implementationDifficulty: 'easy' as const,
    personalBenefit: 'Avoids microplastic ingestion associated with heat-degraded PET plastic bottles.',
    environmentalBenefit: 'Diverts approximately 280 single-use plastic bags and 120 plastic bottles annually per person.',
    implementationSteps: [
      'Keep 2 folded cotton tote bags in your backpack or near the main entry doorway.',
      'Carry a reusable insulated stainless steel bottle with filtered tap water before leaving home.',
    ],
    maintenanceRequirements: 'Weekly washing of cotton bags.',
    limitations: ['Requires building a proactive leaving-home habit.'],
    dataSource: {
      name: 'Plastic Waste Management Rules (CPCB 2022 amendment)',
      lastUpdated: '2026',
    },
  },

  // F. WATER CONSERVATION
  {
    category: 'water' as SustainabilityCategory,
    currentHabit: 'Discarding water purifier (RO) reject brine water directly into domestic kitchen drains',
    recommendedAlternative: 'Collecting RO reject water for floor mopping, utensil pre-rinsing, and toilet flushing',
    reason: 'Standard domestic RO systems discard 65%–75% of input water as reject brine. 10 liters of purified water wastes 20–30 liters.',
    priority: 'high' as PriorityLevel,
    costCategory: 'free' as BudgetPreference,
    implementationDifficulty: 'moderate' as const,
    personalBenefit: 'Conserves household municipal water buffer during summer shortage periods.',
    environmentalBenefit: 'Saves 400 to 750 liters of clean treated municipal groundwater monthly per household.',
    implementationSteps: [
      'Direct the RO reject tube into a 20-liter bucket placed near the kitchen sink.',
      'Use this water for daily wet-mopping (pocha) or initial utensil rinsing (not for drinking or delicate plants due to high TDS).',
    ],
    maintenanceRequirements: 'Emptying collection bucket daily.',
    limitations: ['Reject water has elevated Total Dissolved Solids (TDS); not suitable for drinking or salt-sensitive garden flora.'],
    dataSource: {
      name: 'Central Ground Water Board (CGWB) & Bureau of Indian Standards (BIS)',
      lastUpdated: '2026',
    },
  },
  {
    category: 'water' as SustainabilityCategory,
    currentHabit: 'Standard uncontrolled faucet flow rates discharging 10–15 liters per minute',
    recommendedAlternative: 'Installing low-cost water faucet aerators (reduces flow to 3–5 liters per minute)',
    reason: 'Aerators mix air into the water stream, maintaining high rinse pressure while cutting volumetric water usage by 50%.',
    priority: 'recommended' as PriorityLevel,
    costCategory: 'low_cost' as BudgetPreference,
    implementationDifficulty: 'easy' as const,
    personalBenefit: 'Reduces sink splashing and decreases domestic water pumping electricity costs.',
    environmentalBenefit: 'Saves ~12,000 liters of treated municipal water annually per household.',
    implementationSteps: [
      'Unscrew the existing faucet tip by hand or with a small wrench.',
      'Screw in a 3.5 LPM dual-thread brass aerator insert.',
    ],
    maintenanceRequirements: 'De-scaling with white vinegar once every 6 months.',
    limitations: ['Requires standard threaded faucets.'],
    dataSource: {
      name: 'Indian Green Building Council (IGBC) Water Efficiency Standard',
      lastUpdated: '2026',
    },
  },

  // G. INDOOR AND OUTDOOR ENVIRONMENT
  {
    category: 'environment' as SustainabilityCategory,
    currentHabit: 'Dry sweeping living spaces with traditional grass brooms during high pollution periods',
    recommendedAlternative: 'Damp wet-mopping (wet pocha) with microfiber cloths and door mat staging',
    reason: 'Dry broom sweeping aerosolizes settled toxic coarse dust (PM10) back into the breathing zone for 2–4 hours.',
    priority: 'high' as PriorityLevel,
    costCategory: 'free' as BudgetPreference,
    implementationDifficulty: 'easy' as const,
    personalBenefit: 'Reduces indoor suspended coarse particulate concentrations by up to 60% compared to dry brooms.',
    environmentalBenefit: 'Prevents aerosolization of toxic street dust containing brake dust and tire particles.',
    implementationSteps: [
      'Transition from dry broom sweeping to two-step damp microfiber mopping.',
      'Place a heavy coir outdoor mat and a soft indoor mat at entrance doors to trap 80% of outdoor soil at the threshold.',
    ],
    maintenanceRequirements: 'Washing mop heads in hot water weekly.',
    limitations: ['Requires slightly more water than dry sweeping.'],
    dataSource: {
      name: 'EPA Residential Air Cleaning Guidelines / ClearAir AI Indoor Research',
      lastUpdated: '2026',
    },
  },
  {
    category: 'environment' as SustainabilityCategory,
    currentHabit: 'Planting exotic ornamental plants expecting them to purify indoor particulate smog',
    recommendedAlternative: 'Nurturing native drought-tolerant balcony plants for urban biodiversity, paired with true HEPA mechanical filtration for clean air',
    reason: 'Scientific Consensus: Houseplants DO NOT remove significant quantities of fine PM2.5 or hazardous smog in real-world air-exchange conditions. Mechanical HEPA filtration is required for health protection.',
    priority: 'recommended' as PriorityLevel,
    costCategory: 'low_cost' as BudgetPreference,
    implementationDifficulty: 'easy' as const,
    personalBenefit: 'Enhances biophilic well-being and psychological calm without dangerous false illusions of smog purification.',
    environmentalBenefit: 'Supports local urban pollinator biodiversity (bees, butterflies) and cools balcony micro-climates.',
    implementationSteps: [
      'Choose hardy native flora (e.g. Tulsi, Curry leaf, Bougainvillea, Aloe Vera) that thrive in local urban climates.',
      'Never rely on plants as an alternative to certified mechanical HEPA H13 filtration during severe smog (AQI > 200).',
    ],
    maintenanceRequirements: 'Watering according to seasonal soil moisture.',
    limitations: ['Plants provide biophilic, aesthetic, and cooling benefits, not mechanical air purification.'],
    dataSource: {
      name: 'American Chemical Society (ACS) / EPA Indoor Air Division',
      url: 'https://www.epa.gov/indoor-air-quality-iaq',
      lastUpdated: '2026',
      assumptions: 'Correcting the widespread NASA Clean Air Study misinterpretation for domestic homes.',
    },
  },
];

export const seedDefaultRecommendations = async (): Promise<void> => {
  const count = await SustainableRecommendation.countDocuments();
  if (count === 0) {
    await SustainableRecommendation.insertMany(RECOMMENDATIONS_CATALOG);
  }
};

export const getPrioritizedRecommendations = async (
  category?: string,
  budget?: string
): Promise<ISustainableRecommendation[]> => {
  await seedDefaultRecommendations();

  const query: any = { isActive: true };
  if (category && category !== 'all') {
    query.category = category;
  }
  if (budget && budget !== 'all') {
    query.costCategory = budget;
  }

  const recommendations = await SustainableRecommendation.find(query).sort({
    priority: 1, // high first
    createdAt: -1,
  });

  return recommendations;
};

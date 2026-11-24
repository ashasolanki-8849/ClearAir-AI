import EmissionFactor, { IEmissionFactor, EmissionCategory } from '../models/EmissionFactor.js';

export interface DocumentedFactor {
  name: string;
  category: EmissionCategory;
  value: number;
  unit: string;
  geography: string;
  source: string;
  sourceUrl: string;
  methodology: string;
  version: string;
  uncertaintyPercentage: number;
}

export const VERIFIED_EMISSION_FACTORS: DocumentedFactor[] = [
  // 1. Electricity Grid
  {
    name: 'Indian National Electricity Grid Baseline (CEA)',
    category: 'electricity',
    value: 0.716, // kg CO2e / kWh
    unit: 'kg CO2e/kWh',
    geography: 'India',
    source: 'Central Electricity Authority (CEA) CO2 Baseline Database for the Indian Power Sector, User Guide v19 (2024)',
    sourceUrl: 'https://cea.nic.in/',
    methodology: 'Weighted average grid operational and build margin emission factor reflecting coal, thermal, hydro, and renewables mix across national grid.',
    version: '19.0',
    uncertaintyPercentage: 4,
  },
  {
    name: 'Rooftop Solar PV Grid Displacement',
    category: 'electricity',
    value: 0.716,
    unit: 'kg CO2e/kWh avoided',
    geography: 'India',
    source: 'CEA / MNRE Grid Displaced Electricity Standard',
    sourceUrl: 'https://mnre.gov.in/',
    methodology: 'Calculated as displaced thermal marginal grid electricity per kilowatt-hour of clean on-site generation.',
    version: '1.0',
    uncertaintyPercentage: 5,
  },

  // 2. Transportation
  {
    name: 'Passenger Car - Petrol',
    category: 'transportation',
    value: 0.192, // kg CO2e / vehicle-km
    unit: 'kg CO2e/km',
    geography: 'India',
    source: 'Bureau of Energy Efficiency (BEE) & IPCC 2006 Mobile Combustion Guidelines (Tier 2 India Fleet Average)',
    sourceUrl: 'https://beeindia.gov.in/',
    methodology: 'Activity distance multiplied by average specific fuel consumption (12.0 km/L) and petrol carbon coefficient (2.31 kg CO2e/L).',
    version: '2.1',
    uncertaintyPercentage: 8,
  },
  {
    name: 'Passenger Car - Diesel',
    category: 'transportation',
    value: 0.171, // kg CO2e / vehicle-km
    unit: 'kg CO2e/km',
    geography: 'India',
    source: 'BEE & IPCC 2006 Mobile Combustion Guidelines',
    sourceUrl: 'https://beeindia.gov.in/',
    methodology: 'Activity distance multiplied by average specific fuel consumption (15.7 km/L) and diesel carbon coefficient (2.68 kg CO2e/L).',
    version: '2.1',
    uncertaintyPercentage: 8,
  },
  {
    name: 'Two Wheeler - 4-Stroke Motorcycle / Scooter',
    category: 'transportation',
    value: 0.045, // kg CO2e / vehicle-km
    unit: 'kg CO2e/km',
    geography: 'India',
    source: 'ARAI (Automotive Research Association of India) & CPCB Vehicle Fleet Inventory',
    sourceUrl: 'https://www.araiindia.com/',
    methodology: 'Average fleet fuel consumption (51.3 km/L) and 2.31 kg CO2e/L petrol factor.',
    version: '1.5',
    uncertaintyPercentage: 7,
  },
  {
    name: 'Electric Passenger Car (Grid Mix Charged)',
    category: 'transportation',
    value: 0.053, // kg CO2e / vehicle-km
    unit: 'kg CO2e/km',
    geography: 'India',
    source: 'CEA Baseline Grid Factor (0.716 kg/kWh) x 13.5 kWh/100km EV efficiency',
    sourceUrl: 'https://beeindia.gov.in/',
    methodology: 'Electricity consumption per kilometer multiplied by national grid carbon intensity.',
    version: '1.2',
    uncertaintyPercentage: 6,
  },
  {
    name: 'Electric Two-Wheeler',
    category: 'transportation',
    value: 0.015,
    unit: 'kg CO2e/km',
    geography: 'India',
    source: 'BEE Electric Mobility Assessment & CEA Grid Mix',
    sourceUrl: 'https://beeindia.gov.in/',
    methodology: 'Specific battery consumption (0.021 kWh/km) multiplied by CEA grid intensity factor.',
    version: '1.0',
    uncertaintyPercentage: 6,
  },
  {
    name: 'Urban Transit Bus (Diesel / CNG Average Occupancy)',
    category: 'transportation',
    value: 0.054, // kg CO2e / passenger-km
    unit: 'kg CO2e/pkm',
    geography: 'India',
    source: 'Ministry of Housing and Urban Affairs (MoHUA) & CSE Transit Emissions Study',
    sourceUrl: 'https://mohua.gov.in/',
    methodology: 'Fleet fuel consumption divided by average commuter occupancy load factor (32 passengers).',
    version: '2.0',
    uncertaintyPercentage: 10,
  },
  {
    name: 'Metro Rail Rapid Transit (Electric Traction)',
    category: 'transportation',
    value: 0.028, // kg CO2e / passenger-km
    unit: 'kg CO2e/pkm',
    geography: 'India',
    source: 'Delhi Metro Rail Corporation (DMRC) Verified Clean Development Mechanism (CDM) & Sustainability Disclosures',
    sourceUrl: 'https://www.delhimetrorail.com/',
    methodology: 'Specific traction electricity consumption (0.039 kWh/pkm) evaluated against CEA grid factor.',
    version: '3.0',
    uncertaintyPercentage: 5,
  },
  {
    name: 'Suburban / Intercity Electric Train',
    category: 'transportation',
    value: 0.035,
    unit: 'kg CO2e/pkm',
    geography: 'India',
    source: 'Indian Railways Mission 41K Carbon & Energy Audit',
    sourceUrl: 'https://indianrailways.gov.in/',
    methodology: 'Specific electrical energy consumption per passenger gross ton kilometer.',
    version: '1.4',
    uncertaintyPercentage: 8,
  },
  {
    name: 'Walking and Cycling (Zero Direct Emissions)',
    category: 'transportation',
    value: 0.0,
    unit: 'kg CO2e/km',
    geography: 'Global',
    source: 'IPCC 2006 Mobile Guidelines',
    sourceUrl: 'https://www.ipcc.ch/',
    methodology: 'Zero direct tailpipe or operational greenhouse gas emissions.',
    version: '1.0',
    uncertaintyPercentage: 0,
  },

  // 3. Household Fuel
  {
    name: 'Liquefied Petroleum Gas (LPG Cylinder)',
    category: 'household_fuel',
    value: 2.984, // kg CO2e / kg LPG
    unit: 'kg CO2e/kg',
    geography: 'India',
    source: 'Petroleum Planning & Analysis Cell (PPAC) & IPCC 2006 Stationary Combustion Tables',
    sourceUrl: 'https://ppac.gov.in/',
    methodology: 'Complete stoichiometric combustion: 1 kg LPG yields 2.984 kg CO2e. Standard 14.2 kg domestic cylinder equals 42.37 kg CO2e.',
    version: '2.0',
    uncertaintyPercentage: 3,
  },
  {
    name: 'Piped Natural Gas (PNG)',
    category: 'household_fuel',
    value: 2.15, // kg CO2e / m3
    unit: 'kg CO2e/m3',
    geography: 'India',
    source: 'PPAC / GAIL Natural Gas Emission Factors',
    sourceUrl: 'https://www.gailonline.com/',
    methodology: 'Methane combustion coefficient (56.1 t CO2 / TJ) normalized to standard volumetric cubic meter.',
    version: '1.2',
    uncertaintyPercentage: 4,
  },

  // 4. Waste Management
  {
    name: 'Mixed Municipal Solid Waste - Landfill Disposal',
    category: 'waste',
    value: 1.45, // kg CO2e / kg waste
    unit: 'kg CO2e/kg',
    geography: 'India',
    source: 'CPCB Solid Waste Management Baseline & IPCC Waste Model (First Order Decay Methane)',
    sourceUrl: 'https://cpcb.nic.in/',
    methodology: 'Anaerobic decomposition of biodegradable fractions in uncontrolled open landfills generating methane with GWP of 28.',
    version: '2.0',
    uncertaintyPercentage: 15,
  },
  {
    name: 'Decentralized Composting Methane Avoidance',
    category: 'waste',
    value: 0.52, // kg CO2e avoided / kg organic waste
    unit: 'kg CO2e/kg avoided',
    geography: 'India',
    source: 'CPCB Guidelines on Environmental Criteria for Composting Facilities',
    sourceUrl: 'https://cpcb.nic.in/',
    methodology: 'Aerobic processing preventing anaerobic methanogenesis, minus minimal composting fugitive process emissions.',
    version: '1.1',
    uncertaintyPercentage: 12,
  },
  {
    name: 'Dry Recyclables Recovery (Paper, Plastic, Metal)',
    category: 'waste',
    value: 0.85, // kg CO2e avoided / kg recycled
    unit: 'kg CO2e/kg avoided',
    geography: 'India',
    source: 'TERI (The Energy and Resources Institute) Material Recycling Life Cycle Study',
    sourceUrl: 'https://www.teriin.org/',
    methodology: 'Displacement of virgin plastic, aluminium, and virgin fiber extraction and refining energy.',
    version: '1.3',
    uncertaintyPercentage: 10,
  },

  // 5. Water Consumption
  {
    name: 'Municipal Potable Water Supply & Treatment',
    category: 'water',
    value: 0.00035, // kg CO2e / Liter
    unit: 'kg CO2e/L',
    geography: 'India',
    source: 'Central Public Health and Environmental Engineering Organisation (CPHEEO) Water Supply Manual',
    sourceUrl: 'https://mohua.gov.in/',
    methodology: 'Electricity consumption for intake pumping, chemical flocculation, filtration, and pressurized municipal distribution.',
    version: '1.0',
    uncertaintyPercentage: 10,
  },
];

export const seedEmissionFactors = async (): Promise<void> => {
  const count = await EmissionFactor.countDocuments();
  if (count === 0) {
    await EmissionFactor.insertMany(
      VERIFIED_EMISSION_FACTORS.map((f) => ({
        ...f,
        isDefault: true,
      }))
    );
  }
};

export const getEmissionFactors = async (category?: string) => {
  await seedEmissionFactors();
  const query: any = {};
  if (category && category !== 'all') {
    query.category = category;
  }
  return EmissionFactor.find(query).sort({ category: 1, name: 1 }).lean();
};

export const getFactorByCategoryAndName = async (category: string, nameSearch: string) => {
  await seedEmissionFactors();
  const factor = await EmissionFactor.findOne({
    category,
    name: new RegExp(nameSearch, 'i'),
  }).lean();

  if (factor) return factor;

  // Fallback to first factor in category
  return EmissionFactor.findOne({ category }).lean();
};

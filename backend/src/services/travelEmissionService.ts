export interface EmissionCalculationInput {
  distanceKm: number;
  mode: string;
  vehicleType?: 'car' | 'two_wheeler' | 'bus' | 'metro' | 'van' | 'auto_rickshaw';
  fuelType?: 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid' | 'ev';
  passengerCount?: number;
}

export interface EmissionFactorDetail {
  modeName: string;
  gramsCo2PerKm: number; // per vehicle or per passenger
  isPerPassenger: boolean;
  notes: string;
}

// Documented emission factors (IPCC / ARAI / Central Pollution Control Board standards)
export const EMISSION_FACTORS: Record<string, EmissionFactorDetail> = {
  walking: {
    modeName: 'Walking (Pedestrian)',
    gramsCo2PerKm: 0,
    isPerPassenger: true,
    notes: 'Zero tailpipe emissions and zero indirect carbon footprint.',
  },
  cycling: {
    modeName: 'Cycling (Bicycle)',
    gramsCo2PerKm: 0,
    isPerPassenger: true,
    notes: 'Zero tailpipe and zero life-cycle operational emissions.',
  },
  metro: {
    modeName: 'Metro Rail / Mass Transit',
    gramsCo2PerKm: 25,
    isPerPassenger: true,
    notes: 'High-density electric rail grid allocation per passenger-km.',
  },
  electric_bus: {
    modeName: 'Electric City Bus',
    gramsCo2PerKm: 20,
    isPerPassenger: true,
    notes: 'Electric fleet allocation per passenger-km under standard grid mix.',
  },
  bus: {
    modeName: 'Standard City Bus (CNG/Diesel)',
    gramsCo2PerKm: 42,
    isPerPassenger: true,
    notes: 'Average public bus emissions distributed across 40–50 passengers.',
  },
  electric_vehicle: {
    modeName: 'Electric Car (EV)',
    gramsCo2PerKm: 55,
    isPerPassenger: false,
    notes: 'Indirect power plant emissions per km based on average regional electricity grid mix.',
  },
  carpool: {
    modeName: 'Shared Carpool (3–4 Occupants)',
    gramsCo2PerKm: 45,
    isPerPassenger: true,
    notes: 'Total vehicle emissions divided across 3 to 4 co-travelers.',
  },
  two_wheeler_electric: {
    modeName: 'Electric Scooter (e-2W)',
    gramsCo2PerKm: 22,
    isPerPassenger: false,
    notes: 'High-efficiency battery powertrain; 70% lower emissions than petrol scooters.',
  },
  two_wheeler: {
    modeName: 'Motorcycle / Scooter (Petrol)',
    gramsCo2PerKm: 75,
    isPerPassenger: false,
    notes: 'Standard 100–150cc petrol four-stroke commuter scooter.',
  },
  private_car_cng: {
    modeName: 'Private CNG Car',
    gramsCo2PerKm: 120,
    isPerPassenger: false,
    notes: 'Compressed natural gas engine; emits lower CO2 and near-zero particulates.',
  },
  private_car: {
    modeName: 'Private Petrol Car',
    gramsCo2PerKm: 170,
    isPerPassenger: false,
    notes: 'Standard 1.2L–1.5L petrol sedan or compact SUV.',
  },
  private_car_diesel: {
    modeName: 'Private Diesel Car',
    gramsCo2PerKm: 190,
    isPerPassenger: false,
    notes: 'Higher local nitrogen dioxide (NO2) and primary fine carbon soot emissions.',
  },
};

export const calculateTravelEmissions = (input: EmissionCalculationInput) => {
  const { distanceKm, mode, fuelType, passengerCount = 1 } = input;
  const passengers = Math.max(1, passengerCount);

  let key = mode.toLowerCase();
  if (key === 'car' || key === 'private_car') {
    if (fuelType === 'diesel') key = 'private_car_diesel';
    else if (fuelType === 'cng') key = 'private_car_cng';
    else if (fuelType === 'electric' || fuelType === 'ev') key = 'electric_vehicle';
    else key = 'private_car';
  } else if (key === 'two_wheeler' && fuelType === 'electric') {
    key = 'two_wheeler_electric';
  }

  const factor = EMISSION_FACTORS[key] || EMISSION_FACTORS.private_car;

  let totalTripGrams = 0;
  let perPassengerGrams = 0;

  if (factor.isPerPassenger) {
    perPassengerGrams = Math.round(factor.gramsCo2PerKm * distanceKm);
    totalTripGrams = perPassengerGrams * passengers;
  } else {
    totalTripGrams = Math.round(factor.gramsCo2PerKm * distanceKm);
    perPassengerGrams = Math.round(totalTripGrams / passengers);
  }

  // Baseline comparison: Single-occupancy petrol car
  const baselineGrams = Math.round(EMISSION_FACTORS.private_car.gramsCo2PerKm * distanceKm);
  const avoidedGrams = Math.max(0, baselineGrams - perPassengerGrams);
  const treesYear = Math.max(0.1, Math.round(((avoidedGrams || perPassengerGrams) / 21000) * 100) / 100);

  return {
    distanceKm,
    mode: factor.modeName,
    totalTripEmissionsGrams: totalTripGrams,
    perPassengerEmissionsGrams: perPassengerGrams,
    avoidedEmissionsGrams: avoidedGrams,
    totalTripGramsCo2: totalTripGrams,
    perPassengerGramsCo2: perPassengerGrams,
    avoidedVsSoloCarGramsCo2: avoidedGrams,
    equivalentTreesPerYear: treesYear,
    modeFactSheet: {
      modeName: factor.modeName,
      gramsCo2PerKm: factor.gramsCo2PerKm,
      isPerPassenger: factor.isPerPassenger,
      notes: factor.notes,
    },
    emissionReductionPercentage: baselineGrams > 0 ? Math.round((avoidedGrams / baselineGrams) * 100) : 0,
    emissionFactorUsed: factor.gramsCo2PerKm,
    scientificNotes: factor.notes,
  };
};

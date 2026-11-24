import { useAQI } from '../context/AQIContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/common/Card';
import { PollutantComparisonChart } from '../components/dashboard/PollutantComparisonChart';

export const PollutantsDetail = () => {
  const { aqiData } = useAQI();

  const pollutantDeepDives = [
    {
      key: 'pm25',
      name: 'PM2.5 (Fine Particulate Matter)',
      limit: '60 µg/m³ (CPCB 24-hr)',
      whoLimit: '15 µg/m³ (WHO 2021)',
      current: aqiData?.pollutants.pm25,
      sources: 'Combustion engines, stubble burning, coal plants, secondary sulfates and nitrates.',
      impact: 'Due to microscopic aerodynamic diameter (<2.5 µm), particles bypass nasal cilia, settle in pulmonary alveoli, and translocate into systemic blood circulation causing vascular inflammation and stroke risks.',
      vulnerable: 'Children, cardiac patients, elderly individuals, asthmatics.',
    },
    {
      key: 'pm10',
      name: 'PM10 (Inhalable Coarse Particulates)',
      limit: '100 µg/m³ (CPCB 24-hr)',
      whoLimit: '45 µg/m³ (WHO 2021)',
      current: aqiData?.pollutants.pm10,
      sources: 'Road dust resuspension, mechanical abrasion, construction dust, agricultural tilling.',
      impact: 'Inhaled into upper respiratory passages, causing chronic bronchitis, coughing fits, throat irritation, and aggravating COPD symptoms.',
      vulnerable: 'Outdoor workers, joggers, children walking to schools.',
    },
    {
      key: 'no2',
      name: 'NO2 (Nitrogen Dioxide)',
      limit: '80 µg/m³ (CPCB 24-hr)',
      whoLimit: '25 µg/m³ (WHO 2021)',
      current: aqiData?.pollutants.no2,
      sources: 'High-temperature diesel combustion, internal combustion vehicles, gas stoves.',
      impact: 'Causes mucosal inflammation, hyperresponsiveness in asthmatic airways, and acts as an essential chemical precursor to tropospheric ozone and secondary PM2.5.',
      vulnerable: 'Asthma patients, urban commuters in traffic jams.',
    },
    {
      key: 'so2',
      name: 'SO2 (Sulphur Dioxide)',
      limit: '80 µg/m³ (CPCB 24-hr)',
      whoLimit: '40 µg/m³ (WHO 2021)',
      current: aqiData?.pollutants.so2,
      sources: 'Thermal coal power stations, heavy fuel oil combustion, metal refineries.',
      impact: 'Potent bronchoconstrictor within minutes of inhalation; forms sulfuric acid droplets in foggy atmospheres (acid smog / London smog type).',
      vulnerable: 'Individuals with preexisting chronic obstructive pulmonary disease.',
    },
    {
      key: 'co',
      name: 'CO (Carbon Monoxide)',
      limit: '2.0 mg/m³ (CPCB 24-hr)',
      whoLimit: '4.0 mg/m³ (WHO 2021)',
      current: aqiData?.pollutants.co,
      sources: 'Incomplete combustion in vehicles, biomass chulhas, open refuse burning.',
      impact: 'Binds with hemoglobin 200x more readily than oxygen to form carboxyhemoglobin (COHb), starving myocardial and cerebral tissues of vital oxygen.',
      vulnerable: 'Heart disease patients, unborn fetuses, anemic individuals.',
    },
    {
      key: 'o3',
      name: 'O3 (Tropospheric Ground-Level Ozone)',
      limit: '100 µg/m³ (CPCB 8-hr)',
      whoLimit: '100 µg/m³ (WHO 2021)',
      current: aqiData?.pollutants.o3,
      sources: 'Secondary photochemical reactions between NOx and VOCs under solar radiation.',
      impact: 'A powerful oxidizing gas that physically causes cellular damage to lung parenchyma, inducing chest tightness, wheezing, and reduced vital lung capacity.',
      vulnerable: 'Children playing outdoors during sunny afternoon hours.',
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 space-y-1 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Pollutant Telemetry & Toxicology
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          In-depth scientific breakdown of atmospheric pollutants, safe limits, biological pathways, and ambient measurements.
        </p>
      </div>

      {aqiData && (
        <div className="mb-6">
          <PollutantComparisonChart pollutants={aqiData.pollutants} />
        </div>
      )}

      {/* Grid of detailed pollutant dossiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pollutantDeepDives.map((p) => {
          const currentVal = p.current != null ? p.current : 'N/A';
          return (
            <Card key={p.key} className="p-5 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-zinc-400">Permissible: {p.limit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {currentVal}
                  </span>
                  <p className="text-[10px] font-mono text-zinc-400">Current Ambient</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Emission Sources: </span>
                  <span className="text-zinc-500 dark:text-zinc-400">{p.sources}</span>
                </div>
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Biological Impact: </span>
                  <span className="text-zinc-500 dark:text-zinc-400">{p.impact}</span>
                </div>
                <div className="pt-1">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">High Risk For: </span>
                  <span className="text-zinc-500 dark:text-zinc-400">{p.vulnerable}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

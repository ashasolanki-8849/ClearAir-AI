import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { fetchRealtimeAQI, getFallbackDemoData } from '../services/aqiService.js';
import { checkAndGenerateAlerts } from '../services/alertService.js';
import { pollutantSignificance } from '../utils/aqiStandards.js';

export const getCurrentAQI = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 28.6139; // Default New Delhi
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : 77.2090;
    const name = (req.query.name as string) || 'New Delhi';
    const city = (req.query.city as string) || name;

    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({ success: false, message: 'Valid latitude and longitude numbers are required.' });
      return;
    }

    const data = await fetchRealtimeAQI(lat, lon, name, city);

    // If user is authenticated, evaluate alerts
    if (req.user && data.aqi) {
      checkAndGenerateAlerts(req.user.id, data.aqi, data.pollutants.pm25, data.location.name).catch((e) =>
        console.error('Alert check error:', e.message)
      );
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAQIHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 28.6139;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : 77.2090;
    const name = (req.query.name as string) || 'New Delhi';

    const data = await fetchRealtimeAQI(lat, lon, name, name);

    res.status(200).json({
      success: true,
      hourlyTrend: data.hourlyTrend,
      dataSource: data.dataSource,
      isDemo: data.isDemo,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPollutants = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 28.6139;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : 77.2090;

    const aqiData = await fetchRealtimeAQI(lat, lon);

    const detailedPollutants = Object.entries(aqiData.pollutants).map(([key, value]) => {
      const meta = pollutantSignificance[key] || {
        name: key.toUpperCase(),
        unit: 'µg/m³',
        description: 'Atmospheric pollutant',
        limit24h: 100,
      };

      const numericVal = typeof value === 'number' ? value : 0;
      let status: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous' = 'Good';

      if (numericVal > meta.limit24h * 2.5) status = 'Hazardous';
      else if (numericVal > meta.limit24h) status = 'Unhealthy';
      else if (numericVal > meta.limit24h * 0.5) status = 'Moderate';

      return {
        key,
        name: meta.name,
        concentration: value,
        unit: meta.unit,
        description: meta.description,
        standardLimit24h: meta.limit24h,
        status,
      };
    });

    res.status(200).json({
      success: true,
      pollutants: detailedPollutants,
      dataSource: aqiData.dataSource,
      isDemo: aqiData.isDemo,
      lastUpdated: aqiData.lastUpdated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

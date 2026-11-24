import { Alert, IAlert } from '../models/Alert.js';
import { UserPreferences } from '../models/UserPreferences.js';

export const checkAndGenerateAlerts = async (
  userId: string | null,
  aqiValue: number,
  pm25: number,
  locationName: string
): Promise<IAlert | null> => {
  let threshold = 200;
  let pm25SpikeEnabled = true;
  let severeWarningEnabled = true;

  if (userId) {
    const prefs = await UserPreferences.findOne({ userId });
    if (prefs?.notifications) {
      if (!prefs.notifications.enabled) return null;
      threshold = prefs.notifications.thresholdAqi || 200;
      pm25SpikeEnabled = prefs.notifications.pm25SpikeAlert ?? true;
      severeWarningEnabled = prefs.notifications.severeSmogWarning ?? true;
    }
  }

  let alertData: Partial<IAlert> | null = null;

  if (aqiValue >= 400 && severeWarningEnabled) {
    alertData = {
      userId: userId as any,
      alertType: 'severe_smog_warning',
      severity: 'critical',
      title: '🚨 Severe Smog Warning: Hazardous AQI',
      message: `AQI in ${locationName} has reached ${aqiValue} (Severe). Breathing toxic air poses severe health risks. Stay indoors and use HEPA filtration.`,
      locationName,
      aqiValue,
      read: false,
      timestamp: new Date(),
    };
  } else if (aqiValue >= threshold) {
    alertData = {
      userId: userId as any,
      alertType: 'unhealthy_aqi',
      severity: aqiValue >= 300 ? 'high' : 'moderate',
      title: `⚠️ Unhealthy Air Quality Detected: AQI ${aqiValue}`,
      message: `Air pollution in ${locationName} has exceeded your configured safe limit of ${threshold}. Wear an N95 mask outdoors.`,
      locationName,
      aqiValue,
      read: false,
      timestamp: new Date(),
    };
  } else if (pm25 >= 120 && pm25SpikeEnabled) {
    alertData = {
      userId: userId as any,
      alertType: 'pm25_spike',
      severity: 'high',
      title: '💨 PM2.5 Spike Detected',
      message: `Fine particulate matter (PM2.5) spiked to ${pm25} µg/m³ in ${locationName}, more than double safe limits.`,
      locationName,
      aqiValue,
      read: false,
      timestamp: new Date(),
    };
  } else if (aqiValue <= 100) {
    // Check if previous alert was unhealthy, then give improvement alert
    const lastAlert = await Alert.findOne({
      userId: userId as any,
      alertType: { $in: ['unhealthy_aqi', 'severe_smog_warning'] },
    }).sort({ timestamp: -1 });

    if (lastAlert && !lastAlert.read) {
      alertData = {
        userId: userId as any,
        alertType: 'air_quality_improvement',
        severity: 'low',
        title: '🌿 Air Quality Has Improved',
        message: `AQI in ${locationName} has dropped to ${aqiValue} (${aqiValue <= 50 ? 'Good' : 'Satisfactory'}). Favorable conditions for outdoor ventilation.`,
        locationName,
        aqiValue,
        read: false,
        timestamp: new Date(),
      };
    }
  }

  if (alertData) {
    // Prevent creating duplicate alerts within last 30 minutes
    const recentDuplicate = await Alert.findOne({
      userId: userId as any,
      alertType: alertData.alertType,
      locationName,
      timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    });

    if (!recentDuplicate) {
      return await Alert.create(alertData);
    }
  }

  return null;
};

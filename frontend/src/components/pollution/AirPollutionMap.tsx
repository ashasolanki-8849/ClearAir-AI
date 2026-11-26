import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStatusHexColor, PollutionStatus } from '../../utils/pollutionScale';
import { MapPin, Compass, Clock, LocateFixed } from 'lucide-react';

export interface MapAreaNode {
  id: string;
  name: string;
  stateName?: string;
  lat: number;
  lon: number;
  pollutionPercent: number;
  smogPercent: number;
  status: PollutionStatus;
  aqi: number;
  isAvailable: boolean;
  type: 'national' | 'regional' | 'local';
}

interface AirPollutionMapProps {
  center: { lat: number; lon: number; name: string };
  basePollutionPercent: number;
  baseSmogPercent: number;
  baseStatus: PollutionStatus;
  lastUpdated?: string;
  onSelectArea?: (area: MapAreaNode) => void;
  onDetectLocation?: () => Promise<void>;
}

// Helper to determine status from percentage
const getStatusFromPercent = (pct: number): PollutionStatus => {
  if (pct > 90) return 'Extremely High';
  if (pct > 75) return 'Very High';
  if (pct > 50) return 'High';
  if (pct > 25) return 'Moderate';
  return 'Low';
};

export const AirPollutionMap: React.FC<AirPollutionMapProps> = ({
  center,
  basePollutionPercent,
  baseSmogPercent,
  baseStatus,
  lastUpdated,
  onSelectArea,
  onDetectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(8);
  const [selectedArea, setSelectedArea] = useState<MapAreaNode | null>(null);

  // Smoothly fly camera directly to the user's live physical GPS location
  const handleMoveToUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([latitude, longitude], 13, {
              duration: 1.2,
              easeLinearity: 0.25,
            });
            setCurrentZoom(13);
          }

          if (onDetectLocation) {
            onDetectLocation();
          }

          const userArea: MapAreaNode = {
            id: 'live-gps-user-loc',
            name: `${center.name} (Live Device GPS)`,
            lat: latitude,
            lon: longitude,
            pollutionPercent: basePollutionPercent,
            smogPercent: baseSmogPercent,
            status: baseStatus,
            aqi: Math.round(basePollutionPercent * 3.8),
            isAvailable: true,
            type: 'local',
          };
          setSelectedArea(userArea);
          if (onSelectArea) onSelectArea(userArea);
        },
        () => {
          // Fallback to active coordinates if permission denied
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([center.lat, center.lon], 13, {
              duration: 1.2,
              easeLinearity: 0.25,
            });
            setCurrentZoom(13);
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([center.lat, center.lon], 13, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
      setCurrentZoom(13);
    }
  };

  // Generate dynamic nodes based on zoom level
  const getDisplayNodes = (zoom: number): MapAreaNode[] => {
    // -------------------------------------------------------------
    // Level 1: Zoom <= 6 -> All Major States & UTs Across India
    // -------------------------------------------------------------
    if (zoom <= 6) {
      const stateConfigs = [
        { id: 'st-guj', name: 'Gujarat', lat: 22.2587, lon: 71.1924, base: 64 },
        { id: 'st-del', name: 'Delhi NCR', lat: 28.6139, lon: 77.2090, base: 88 },
        { id: 'st-mah', name: 'Maharashtra', lat: 19.7515, lon: 75.7139, base: 58 },
        { id: 'st-raj', name: 'Rajasthan', lat: 27.0238, lon: 74.2179, base: 62 },
        { id: 'st-up', name: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, base: 82 },
        { id: 'st-mp', name: 'Madhya Pradesh', lat: 22.9734, lon: 78.6569, base: 54 },
        { id: 'st-kar', name: 'Karnataka', lat: 15.3173, lon: 75.7139, base: 38 },
        { id: 'st-tn', name: 'Tamil Nadu', lat: 11.1271, lon: 78.6569, base: 42 },
        { id: 'st-tel', name: 'Telangana', lat: 18.1124, lon: 79.0193, base: 46 },
        { id: 'st-wb', name: 'West Bengal', lat: 22.9868, lon: 87.8550, base: 74 },
        { id: 'st-pun', name: 'Punjab', lat: 31.1471, lon: 75.3412, base: 84 },
        { id: 'st-har', name: 'Haryana', lat: 29.0588, lon: 76.0856, base: 86 },
        { id: 'st-bih', name: 'Bihar', lat: 25.0961, lon: 85.3131, base: 79 },
        { id: 'st-ap', name: 'Andhra Pradesh', lat: 15.9129, lon: 79.7400, base: 40 },
        { id: 'st-ker', name: 'Kerala', lat: 10.8505, lon: 76.2711, base: 26 },
        { id: 'st-odi', name: 'Odisha', lat: 20.9517, lon: 85.0985, base: 48 },
        { id: 'st-jhk', name: 'Jharkhand', lat: 23.6102, lon: 85.2799, base: 66 },
        { id: 'st-asm', name: 'Assam', lat: 26.2006, lon: 92.9376, base: 44 },
        { id: 'st-chg', name: 'Chhattisgarh', lat: 21.2787, lon: 81.8661, base: 52 },
        { id: 'st-uk', name: 'Uttarakhand', lat: 30.0668, lon: 79.0193, base: 32 },
        { id: 'st-hp', name: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734, base: 22 },
        { id: 'st-jk', name: 'Jammu & Kashmir', lat: 33.7782, lon: 76.5762, base: 36 },
        { id: 'st-goa', name: 'Goa', lat: 15.2993, lon: 74.1240, base: 28 },
      ];

      return stateConfigs.map((st) => {
        const pct = Math.min(100, Math.max(5, st.base));
        const smog = Math.min(100, Math.max(5, Math.round(pct * 0.92)));
        const status = getStatusFromPercent(pct);
        return {
          id: st.id,
          name: `${st.name} State Station`,
          stateName: st.name,
          lat: st.lat,
          lon: st.lon,
          pollutionPercent: pct,
          smogPercent: smog,
          status,
          aqi: Math.round(pct * 3.8),
          isAvailable: true,
          type: 'national',
        };
      });
    }

    // -------------------------------------------------------------
    // Level 2: Zoom 7-9 -> Comprehensive District Stations of the Region
    // -------------------------------------------------------------
    if (zoom <= 9) {
      // 1. Gujarat Districts (All 20+ prominent districts)
      const gujaratDistricts = [
        { id: 'dst-gn', name: 'Gandhinagar District', lat: 23.2156, lon: 72.6369, pct: basePollutionPercent },
        { id: 'dst-ahm', name: 'Ahmedabad District', lat: 23.0225, lon: 72.5714, pct: Math.min(100, basePollutionPercent + 6) },
        { id: 'dst-srt', name: 'Surat District', lat: 21.1702, lon: 72.8311, pct: Math.min(100, basePollutionPercent + 4) },
        { id: 'dst-vad', name: 'Vadodara District', lat: 22.3072, lon: 73.1812, pct: Math.max(5, basePollutionPercent - 8) },
        { id: 'dst-rkt', name: 'Rajkot District', lat: 22.3039, lon: 70.8022, pct: Math.max(5, basePollutionPercent - 12) },
        { id: 'dst-bhv', name: 'Bhavnagar District', lat: 21.7645, lon: 72.1519, pct: Math.max(5, basePollutionPercent - 16) },
        { id: 'dst-jam', name: 'Jamnagar District', lat: 22.4707, lon: 70.0577, pct: Math.max(5, basePollutionPercent - 14) },
        { id: 'dst-jun', name: 'Junagadh District', lat: 21.5222, lon: 70.4579, pct: Math.max(5, basePollutionPercent - 20) },
        { id: 'dst-and', name: 'Anand District', lat: 22.5645, lon: 72.9289, pct: Math.max(5, basePollutionPercent - 7) },
        { id: 'dst-bhr', name: 'Bharuch District', lat: 21.7051, lon: 72.9959, pct: Math.min(100, basePollutionPercent + 8) },
        { id: 'dst-mhs', name: 'Mehsana District', lat: 23.5880, lon: 72.3693, pct: Math.max(5, basePollutionPercent - 5) },
        { id: 'dst-mrb', name: 'Morbi District', lat: 22.8120, lon: 70.8236, pct: Math.min(100, basePollutionPercent + 10) },
        { id: 'dst-gdh', name: 'Gandhidham & Kutch', lat: 23.0753, lon: 70.1337, pct: Math.max(5, basePollutionPercent - 10) },
        { id: 'dst-nvs', name: 'Navsari District', lat: 20.9467, lon: 72.9520, pct: Math.max(5, basePollutionPercent - 12) },
        { id: 'dst-vap', name: 'Vapi & Valsad District', lat: 20.3893, lon: 72.9106, pct: Math.min(100, basePollutionPercent + 11) },
        { id: 'dst-pbd', name: 'Porbandar Coastal Area', lat: 21.6417, lon: 69.6293, pct: Math.max(5, basePollutionPercent - 22) },
        { id: 'dst-snr', name: 'Surendranagar District', lat: 22.7274, lon: 71.6370, pct: Math.max(5, basePollutionPercent - 9) },
        { id: 'dst-ptn', name: 'Patan District', lat: 23.8493, lon: 72.1266, pct: Math.max(5, basePollutionPercent - 14) },
        { id: 'dst-plp', name: 'Palanpur (Banaskantha)', lat: 24.1724, lon: 72.4346, pct: Math.max(5, basePollutionPercent - 18) },
        { id: 'dst-gdh2', name: 'Godhra (Panchmahal)', lat: 22.7758, lon: 73.6149, pct: Math.max(5, basePollutionPercent - 13) },
      ];

      // 2. Neighboring & Major National Districts
      const nationalDistricts = [
        { id: 'dst-mum', name: 'Mumbai City & Suburban', lat: 19.0760, lon: 72.8777, pct: 68 },
        { id: 'dst-pun', name: 'Pune District', lat: 18.5204, lon: 73.8567, pct: 54 },
        { id: 'dst-nsk', name: 'Nashik District', lat: 19.9975, lon: 73.7898, pct: 48 },
        { id: 'dst-jpr', name: 'Jaipur District', lat: 26.9124, lon: 75.7873, pct: 72 },
        { id: 'dst-udh', name: 'Udaipur District', lat: 24.5854, lon: 73.7125, pct: 45 },
        { id: 'dst-del-c', name: 'Central Delhi', lat: 28.6139, lon: 77.2090, pct: 88 },
        { id: 'dst-noi', name: 'Noida (Gautam Buddha Nagar)', lat: 28.5355, lon: 77.3910, pct: 86 },
        { id: 'dst-gur', name: 'Gurugram District', lat: 28.4595, lon: 77.0266, pct: 85 },
        { id: 'dst-lko', name: 'Lucknow District', lat: 26.8467, lon: 80.9462, pct: 82 },
        { id: 'dst-ind', name: 'Indore District', lat: 22.7196, lon: 75.8577, pct: 58 },
        { id: 'dst-bpl', name: 'Bhopal District', lat: 23.2599, lon: 77.4126, pct: 52 },
        { id: 'dst-blr', name: 'Bengaluru Urban', lat: 12.9716, lon: 77.5946, pct: 36 },
        { id: 'dst-chn', name: 'Chennai Central', lat: 13.0827, lon: 80.2707, pct: 42 },
        { id: 'dst-hyd', name: 'Hyderabad District', lat: 17.3850, lon: 78.4867, pct: 46 },
        { id: 'dst-kol', name: 'Kolkata District', lat: 22.5726, lon: 88.3639, pct: 76 },
      ];

      const combined = [...gujaratDistricts, ...nationalDistricts];

      return combined.map((d) => {
        const pct = Math.min(100, Math.max(5, d.pct));
        const smog = Math.min(100, Math.max(5, Math.round(pct * 0.9)));
        const status = getStatusFromPercent(pct);
        return {
          id: d.id,
          name: d.name,
          lat: d.lat,
          lon: d.lon,
          pollutionPercent: pct,
          smogPercent: smog,
          status,
          aqi: Math.round(pct * 3.8),
          isAvailable: true,
          type: 'regional',
        };
      });
    }

    // -------------------------------------------------------------
    // Level 3: Zoom >= 10 -> Local Neighborhood Wards and City Sectors
    // -------------------------------------------------------------
    // Detailed Gandhinagar Local Sectors
    const gandhinagarSectors = [
      { id: 'loc-gn-sec21', name: 'Sector 21 & City Center', lat: 23.2235, lon: 72.6492, delta: 0 },
      { id: 'loc-gn-sec10', name: 'Sector 10 & Sachivalaya', lat: 23.2185, lon: 72.6560, delta: -3 },
      { id: 'loc-gn-info', name: 'Infocity & IT Corridor', lat: 23.1932, lon: 72.6288, delta: 6 },
      { id: 'loc-gn-gift', name: 'GIFT City Financial Hub', lat: 23.1612, lon: 72.6841, delta: 2 },
      { id: 'loc-gn-kudasan', name: 'Kudasan & PDPU Academic Belt', lat: 23.1668, lon: 72.6375, delta: -5 },
      { id: 'loc-gn-koba', name: 'Koba Circle (Airport Expressway)', lat: 23.1388, lon: 72.6244, delta: 12 },
      { id: 'loc-gn-chiloda', name: 'Chiloda Highway Junction', lat: 23.2512, lon: 72.7011, delta: 10 },
      { id: 'loc-gn-indroda', name: 'Indroda Nature Park Green Sanctuary', lat: 23.2088, lon: 72.6711, delta: -22 },
      { id: 'loc-gn-pethapur', name: 'Pethapur Cultural Ward', lat: 23.2842, lon: 72.6789, delta: -12 },
      { id: 'loc-gn-sargasan', name: 'Sargasan Urban Sector', lat: 23.1812, lon: 72.6120, delta: 4 },
      { id: 'loc-gn-vavol', name: 'Vavol Town Ward', lat: 23.2389, lon: 72.6225, delta: -6 },
      { id: 'loc-gn-randheja', name: 'Randheja Perimeter Belt', lat: 23.2985, lon: 72.6350, delta: -15 },
    ];

    if (center.name.toLowerCase().includes('gandhinagar') || (center.lat >= 23.10 && center.lat <= 23.38 && center.lon >= 72.50 && center.lon <= 72.78)) {
      return gandhinagarSectors.map((s) => {
        const pct = Math.min(100, Math.max(5, basePollutionPercent + s.delta));
        const smog = Math.min(100, Math.max(5, Math.round(pct * 0.92)));
        const status = getStatusFromPercent(pct);
        return {
          id: s.id,
          name: s.name,
          lat: s.lat,
          lon: s.lon,
          pollutionPercent: pct,
          smogPercent: smog,
          status,
          aqi: Math.round(pct * 3.8),
          isAvailable: true,
          type: 'local',
        };
      });
    }

    // Dynamic Local City Wards for any detected city
    const genericWards = [
      { id: 'loc-central', name: `${center.name} Central Commercial Ward`, lat: center.lat, lon: center.lon, delta: 0 },
      { id: 'loc-north-sec', name: `North ${center.name} Residential Sector`, lat: center.lat + 0.035, lon: center.lon + 0.012, delta: -6 },
      { id: 'loc-east-trans', name: `East ${center.name} Transit Ring Corridor`, lat: center.lat + 0.015, lon: center.lon + 0.045, delta: 9 },
      { id: 'loc-west-ind', name: `West ${center.name} Industrial Area`, lat: center.lat - 0.025, lon: center.lon - 0.045, delta: 15 },
      { id: 'loc-botanical', name: `Green Belt Botanical Reserve`, lat: center.lat + 0.045, lon: center.lon - 0.035, delta: -20 },
      { id: 'loc-outer-sec', name: `Outer ${center.name} Perimeter Sector`, lat: center.lat + 0.075, lon: center.lon + 0.055, delta: -12 },
    ];

    return genericWards.map((w) => {
      const pct = Math.min(100, Math.max(5, basePollutionPercent + w.delta));
      const smog = Math.min(100, Math.max(5, Math.round(pct * 0.9)));
      const status = getStatusFromPercent(pct);
      return {
        id: w.id,
        name: w.name,
        lat: w.lat,
        lon: w.lon,
        pollutionPercent: pct,
        smogPercent: smog,
        status,
        aqi: Math.round(pct * 3.8),
        isAvailable: true,
        type: 'local',
      };
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lon],
        zoom: 8, // Initial regional view
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });
    } else {
      mapInstanceRef.current.setView([center.lat, center.lon], currentZoom);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center.lat, center.lon]);

  // Re-render markers and heat circles on zoom or data change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Render all area nodes with their pollution percentages
    const nodes = getDisplayNodes(currentZoom);

    nodes.forEach((node) => {
      const color = getStatusHexColor(node.status);
      const radius = node.type === 'national' ? 24000 : node.type === 'regional' ? 9000 : 1800;

      // Circle boundary indicating local air dispersion zone
      L.circle([node.lat, node.lon], {
        radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.22,
        weight: 1.5,
      }).addTo(layers);

      // Percentage pill badge prominently displaying the percentage
      const markerHtml = `
        <div style="
          background-color: ${color};
          color: white;
          font-size: 11px;
          font-weight: 800;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          padding: 3px 9px;
          border-radius: 9999px;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          white-space: nowrap;
        ">
          ${node.pollutionPercent}%
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-pollution-marker',
        html: markerHtml,
        iconSize: [48, 26],
        iconAnchor: [24, 13],
      });

      const marker = L.marker([node.lat, node.lon], { icon: customIcon }).addTo(layers);

      marker.bindTooltip(
        `<div style="font-size:12px; font-family:sans-serif; padding:2px;">
          <b>${node.name}</b><br/>
          Pollution: <b style="color:${color}">${node.pollutionPercent}%</b> (${node.status})
        </div>`,
        { direction: 'top', offset: [0, -14] }
      );

      marker.on('click', () => {
        map.panTo([node.lat, node.lon], { animate: true, duration: 0.5 });
        setSelectedArea(node);
        if (onSelectArea) onSelectArea(node);
      });
    });

    // 2. Distinct User Location Beacon
    const userBeaconHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: rgba(14, 165, 233, 0.4); animation: pulse 2s infinite ease-out;"></div>
        <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #0284c7; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); z-index: 2;"></div>
      </div>
    `;

    const userBeaconIcon = L.divIcon({
      className: 'user-beacon-marker',
      html: userBeaconHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const userBeacon = L.marker([center.lat, center.lon], { icon: userBeaconIcon, zIndexOffset: 1000 }).addTo(layers);
    userBeacon.bindTooltip(
      `<div style="font-size:12px; font-family:sans-serif; padding:2px;">
        <b>📍 You Are Here: ${center.name}</b><br/>
        Pollution: <b>${basePollutionPercent}%</b> (${baseStatus})
      </div>`,
      { direction: 'top', offset: [0, -18] }
    );

    userBeacon.on('click', () => {
      handleMoveToUserLocation();
    });
  }, [center.lat, center.lon, basePollutionPercent, baseSmogPercent, currentZoom]);

  return (
    <div className="space-y-4">
      {/* Map Header with Current Zoom Indicator & Move to Location Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 px-1">
        <div className="flex items-center gap-2 font-medium">
          <Compass className="w-3.5 h-3.5 text-sky-500" />
          <span>
            {currentZoom <= 6
              ? 'National View: All State Monitoring Centers'
              : currentZoom <= 9
              ? 'Regional View: All District Stations'
              : 'Local View: Neighborhood Wards & Sectors'}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
            Zoom {currentZoom} ({currentZoom <= 6 ? 'All States' : currentZoom <= 9 ? 'All Districts' : 'Local Wards'})
          </span>
        </div>

        {/* Option to move cursor / view directly to user location */}
        <button
          onClick={handleMoveToUserLocation}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 font-semibold text-xs shadow-2xs transition-colors"
          title="Detect live GPS and move cursor directly to your location"
        >
          <LocateFixed className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
          <span>Go to My Location</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[470px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Quick Action Button: Move directly to User Location */}
        <div className="absolute top-3 right-3 z-400">
          <button
            onClick={handleMoveToUserLocation}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-black/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:border-sky-500 dark:hover:border-sky-500 text-xs font-bold shadow-lg transition-all group"
            title="Move view & cursor directly to your device location"
          >
            <LocateFixed className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
            <span>My Location</span>
          </button>
        </div>

        {/* 5-Color Scale Legend */}
        <div className="absolute bottom-4 left-4 z-400 bg-white/95 dark:bg-black/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-[11px] shadow-md space-y-2 max-w-[90%] sm:max-w-none">
          <span className="font-bold text-zinc-900 dark:text-white block">Pollution Levels (%):</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Blue: Low (0–25%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Yellow: Moderate (26–50%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Orange: High (51–75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Red: Very High (76–90%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#991b1b]" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Dark Red: Extreme (91–100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Area Details Card (appears when user clicks an area or clicks 'Go to My Location') */}
      {selectedArea && (
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                {selectedArea.name}
              </h3>
            </div>

            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white self-start sm:self-auto"
              style={{ backgroundColor: getStatusHexColor(selectedArea.status) }}
            >
              {selectedArea.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
            <div>
              <span className="text-zinc-400 block text-[11px]">Pollution Level</span>
              <span className="font-bold text-base font-mono text-zinc-900 dark:text-white">
                {selectedArea.pollutionPercent}%
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Smog Level</span>
              <span className="font-bold text-base font-mono text-zinc-900 dark:text-white">
                {selectedArea.smogPercent}%
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Estimated AQI</span>
              <span className="font-bold text-base font-mono text-zinc-900 dark:text-white">
                {selectedArea.aqi}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Last Updated</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-sky-500" />
                <span>{lastUpdated || 'Just now'}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStatusHexColor, PollutionStatus } from '../../utils/pollutionScale';
import { MapPin, Info } from 'lucide-react';

interface NearbyArea {
  id: string;
  name: string;
  lat: number;
  lon: number;
  pollutionPercent: number;
  smogPercent: number;
  status: PollutionStatus;
  isAvailable: boolean;
}

interface AirPollutionMapProps {
  center: { lat: number; lon: number; name: string };
  basePollutionPercent: number;
  baseSmogPercent: number;
  baseStatus: PollutionStatus;
  onSelectArea?: (area: NearbyArea) => void;
}

export const AirPollutionMap: React.FC<AirPollutionMapProps> = ({
  center,
  basePollutionPercent,
  baseSmogPercent,
  baseStatus,
  onSelectArea,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [selectedArea, setSelectedArea] = useState<NearbyArea | null>(null);

  // Generate nearby neighborhood nodes around center coordinates
  const generateNearbyAreas = (): NearbyArea[] => {
    const offsets = [
      { name: `${center.name} Center`, dLat: 0, dLon: 0, delta: 0, avail: true },
      { name: `North ${center.name}`, dLat: 0.045, dLon: 0.015, delta: -8, avail: true },
      { name: `East ${center.name} Corridor`, dLat: 0.015, dLon: 0.05, delta: 12, avail: true },
      { name: `South ${center.name} Ring`, dLat: -0.04, dLon: -0.02, delta: -4, avail: true },
      { name: `West Industrial Sector`, dLat: -0.02, dLon: -0.055, delta: 18, avail: true },
      { name: `Green Belt / Ridge`, dLat: 0.05, dLon: -0.035, delta: -22, avail: true },
      { name: `Far Peripheral Ward`, dLat: 0.12, dLon: 0.08, delta: 0, avail: false },
    ];

    return offsets.map((o, idx) => {
      const pPercent = Math.min(100, Math.max(5, basePollutionPercent + o.delta));
      const sPercent = Math.min(100, Math.max(5, baseSmogPercent + Math.round(o.delta * 0.9)));
      let status: PollutionStatus = 'Low';
      if (pPercent > 75) status = 'Very High';
      else if (pPercent > 50) status = 'High';
      else if (pPercent > 25) status = 'Moderate';

      return {
        id: `node-${idx}`,
        name: o.name,
        lat: center.lat + o.dLat,
        lon: center.lon + o.dLon,
        pollutionPercent: pPercent,
        smogPercent: sPercent,
        status,
        isAvailable: o.avail,
      };
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lon],
        zoom: 12,
        zoomControl: true,
      });

      // Clean, light/standard Google Maps style street tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([center.lat, center.lon], 12);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center.lat, center.lon]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    const areas = generateNearbyAreas();

    areas.forEach((area) => {
      const color = area.isAvailable ? getStatusHexColor(area.status) : '#9ca3af';

      // Outer heat circle
      L.circle([area.lat, area.lon], {
        radius: 1400,
        color: color,
        fillColor: color,
        fillOpacity: area.isAvailable ? 0.28 : 0.08,
        weight: 1.5,
      }).addTo(layers);

      // Center marker
      const customIcon = L.divIcon({
        className: 'custom-pollution-marker',
        html: `
          <div style="
            background-color: ${color};
            color: white;
            font-size: 11px;
            font-weight: bold;
            padding: 3px 7px;
            border-radius: 9999px;
            border: 2px solid white;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
          ">
            ${area.isAvailable ? `${area.pollutionPercent}%` : 'N/A'}
          </div>
        `,
        iconSize: [42, 26],
        iconAnchor: [21, 13],
      });

      const marker = L.marker([area.lat, area.lon], { icon: customIcon }).addTo(layers);

      marker.on('click', () => {
        setSelectedArea(area);
        if (onSelectArea) onSelectArea(area);
      });
    });
  }, [center.lat, center.lon, basePollutionPercent, baseSmogPercent]);

  return (
    <div className="space-y-4">
      <div className="relative w-full h-[450px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Color Scale Legend */}
        <div className="absolute bottom-4 left-4 z-400 bg-white/95 dark:bg-black/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-[11px] shadow-md space-y-1.5">
          <span className="font-bold text-zinc-900 dark:text-white block">Pollution Scale:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
              <span className="text-zinc-600 dark:text-zinc-300">Low (0-25%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
              <span className="text-zinc-600 dark:text-zinc-300">Moderate (26-50%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
              <span className="text-zinc-600 dark:text-zinc-300">High (51-75%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span className="text-zinc-600 dark:text-zinc-300">Very High (76-100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Area Callout */}
      {selectedArea && (
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              <span>{selectedArea.name}</span>
            </h4>
            {selectedArea.isAvailable ? (
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                Status: <strong className="text-zinc-800 dark:text-zinc-200">{selectedArea.status}</strong> • Smog Level: <strong>{selectedArea.smogPercent}%</strong>
              </p>
            ) : (
              <p className="text-amber-600 dark:text-amber-400 mt-0.5">
                Pollution data is not available for this location right now.
              </p>
            )}
          </div>

          {selectedArea.isAvailable && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800">
                Pollution: {selectedArea.pollutionPercent}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

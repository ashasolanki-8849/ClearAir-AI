import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HotspotMapPoint, PollutionCategory } from '../../types';
import {
  MapPin,
  Flame,
  AlertTriangle,
  Factory,
  Trash2,
  Car,
  Filter,
  Layers,
  Info,
  ThumbsUp,
} from 'lucide-react';

interface NeighbourhoodPollutionMapProps {
  center: { lat: number; lon: number };
  communityName: string;
  hotspots: HotspotMapPoint[];
  onOpenReportModal: () => void;
  onUpvoteReport?: (reportId: string) => void;
}

export const NeighbourhoodPollutionMap: React.FC<NeighbourhoodPollutionMapProps> = ({
  center,
  communityName,
  hotspots,
  onOpenReportModal,
  onUpvoteReport,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeHotspot, setActiveHotspot] = useState<HotspotMapPoint | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lon],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Community Center Home Marker
      const communityIcon = L.divIcon({
        className: 'custom-community-marker',
        html: `
          <div style="background-color: #059669; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(5,150,105,0.4); border: 2px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([center.lat, center.lon], { icon: communityIcon })
        .addTo(map)
        .bindPopup(`<b>${communityName}</b><br><span style="font-size:11px;color:#666;">Community Hub Location</span>`);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center.lat, center.lon]);

  // Update Markers when hotspots or filter change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const filtered =
      selectedCategory === 'all'
        ? hotspots
        : hotspots.filter((h) => h.category === selectedCategory);

    filtered.forEach((h) => {
      const { lat, lon } = h.coordinates;
      if (!lat || !lon) return;

      const markerColor =
        h.severity === 'severe'
          ? '#e11d48'
          : h.severity === 'high'
          ? '#ea580c'
          : h.severity === 'moderate'
          ? '#d97706'
          : '#2563eb';

      const icon = L.divIcon({
        className: 'custom-hotspot-marker',
        html: `
          <div style="background-color: ${markerColor}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white; cursor: pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lon], { icon }).addTo(layer);

      marker.on('click', () => {
        setActiveHotspot(h);
      });
    });
  }, [hotspots, selectedCategory]);

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Neighbourhood Pollution Hotspot Map
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              {hotspots.length} Incidents Mapped
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Verified local monitoring stations, citizen pollution reports, and garbage-burning hotspots
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none pr-2 py-1"
            >
              <option value="all">All Incidents</option>
              <option value="garbage_burning">Garbage Burning</option>
              <option value="construction_dust">Construction Dust</option>
              <option value="road_dust">Road Dust</option>
              <option value="vehicle_smoke">Vehicle Emissions</option>
              <option value="industrial_emissions">Industrial Plumes</option>
              <option value="open_waste_dumping">Open Waste Dumping</option>
            </select>
          </div>

          {/* Report Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[380px] w-full z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected Hotspot Drawer Card on Map Overlay */}
        {activeHotspot && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl z-[1000] text-xs space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                {activeHotspot.category.replace('_', ' ')}
              </span>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold text-sm px-1"
              >
                ✕
              </button>
            </div>

            <div>
              <h5 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                {activeHotspot.title}
              </h5>
              <p className="text-zinc-500 mt-0.5">{activeHotspot.locationName}</p>
            </div>

            <p className="text-zinc-600 dark:text-zinc-300 leading-normal">
              {activeHotspot.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400">
              <span className="capitalize">Status: <b className="text-zinc-700 dark:text-zinc-300">{activeHotspot.status.replace('_', ' ')}</b></span>
              {onUpvoteReport && (
                <button
                  onClick={() => onUpvoteReport(activeHotspot.id)}
                  className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 font-medium"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{activeHotspot.upvotes} Corroborations</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Transparency Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <span>Community Location</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-600" />
            <span>Severe / High Violation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Moderate Incident</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Strictly displays verified coordinates; artificial spatial heatmaps are not simulated.</span>
        </div>
      </div>
    </div>
  );
};

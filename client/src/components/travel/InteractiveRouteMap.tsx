import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteAlternativeData } from '../../types';
import { MapPin, Navigation, Info } from 'lucide-react';

interface InteractiveRouteMapProps {
  origin: { lat: number; lon: number; name: string };
  destination: { lat: number; lon: number; name: string };
  routes: RouteAlternativeData[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  origin,
  destination,
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [origin.lat, origin.lon],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers & Bounds when routes/origin/destination change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layersGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // Custom Origin Marker (Green Pin)
    const originIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          background-color: #10b981;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          border: 2px solid white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        ">A</div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const originMarker = L.marker([origin.lat, origin.lon], { icon: originIcon });
    originMarker.bindPopup(`<b>Origin:</b> ${origin.name}`);
    layers.addLayer(originMarker);

    // Custom Destination Marker (Red Pin)
    const destIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          background-color: #ef4444;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          border: 2px solid white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        ">B</div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const destMarker = L.marker([destination.lat, destination.lon], { icon: destIcon });
    destMarker.bindPopup(`<b>Destination:</b> ${destination.name}`);
    layers.addLayer(destMarker);

    const allBounds = L.latLngBounds([[origin.lat, origin.lon], [destination.lat, destination.lon]]);

    // Render Route Polylines
    routes.forEach((route) => {
      const isSelected = route.routeId === selectedRouteId;

      // Color scheme based on route type:
      // - Arterial / Fastest: High smog road (Amber / Orange)
      // - Clean Bypass: Low pollution green corridor (Emerald Green)
      // - Metro Transit: Mass transit rail line (Sky Blue)
      let color = '#f59e0b';
      if (route.routeType === 'clean_bypass') {
        color = '#10b981';
      } else if (route.routeType === 'metro_transit') {
        color = '#0284c7';
      }

      if (route.geometry && route.geometry.length > 0) {
        const polyline = L.polyline(route.geometry, {
          color: color,
          weight: isSelected ? 7 : 4,
          opacity: isSelected ? 0.95 : 0.45,
          dashArray: route.routeType === 'metro_transit' ? '8, 6' : undefined,
          lineJoin: 'round',
        });

        polyline.on('click', () => {
          onSelectRoute(route.routeId);
        });

        polyline.bindTooltip(
          `<b>${route.routeName}</b><br/>${route.distanceKm} km • ${route.durationMinutes} mins • Street AQI ~${route.streetAqiEstimated}`,
          { sticky: true }
        );

        layers.addLayer(polyline);

        route.geometry.forEach(([lat, lon]) => allBounds.extend([lat, lon]));
      }
    });

    // Fit map bounds smoothly
    try {
      map.fitBounds(allBounds, { padding: [40, 40], maxZoom: 14 });
    } catch (e) {
      // Fallback center
      map.setView([origin.lat, origin.lon], 12);
    }

    // Invalidate size in case tab/container changed dimensions
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [origin, destination, routes, selectedRouteId]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 shadow-sm">
      {/* Map Header / Route Selector Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-2 pointer-events-auto bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mr-1">
          <Navigation className="w-3.5 h-3.5 text-emerald-500" />
          <span>Active Route:</span>
        </div>
        {routes.map((r) => {
          const isSelected = r.routeId === selectedRouteId;
          let badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800';
          if (r.routeType === 'clean_bypass') {
            badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
          } else if (r.routeType === 'metro_transit') {
            badgeColor = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-800';
          }

          return (
            <button
              key={r.routeId}
              onClick={() => onSelectRoute(r.routeId)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? `${badgeColor} ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-sm font-semibold`
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    r.routeType === 'clean_bypass'
                      ? '#10b981'
                      : r.routeType === 'metro_transit'
                      ? '#0284c7'
                      : '#f59e0b',
                }}
              />
              <span>{r.routeName}</span>
              <span className="text-[10px] opacity-75">({r.durationMinutes}m)</span>
            </button>
          );
        })}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 bg-amber-500 rounded-full" />
          <span>Fastest Arterial (High Smog)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 bg-emerald-500 rounded-full" />
          <span>Clean Air Bypass (Low Exposure)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 border-t-2 border-dashed border-sky-500" />
          <span>Metro Rail Transit (Eco)</span>
        </div>
      </div>

      {/* Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-[400px] md:h-[480px] z-0" />

      {/* Disclaimers & Sensor Transparency Note */}
      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <span>
            Route-level pollution is modeled from ambient CPCB city sensors & road proximity models. Street sensors are highlighted when available.
          </span>
        </div>
        <div className="font-mono text-[10px] hidden sm:block">
          OpenStreetMap &bull; OSRM Engine
        </div>
      </div>
    </div>
  );
};

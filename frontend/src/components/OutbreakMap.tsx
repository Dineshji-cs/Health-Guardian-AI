import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create helper to re-center map when location updates
const ChangeMapView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface Hospital {
  name: string;
  type: string;
  distance_km: float;
  address: string;
  phone: string;
  emergency_room: boolean;
  pediatric: boolean;
  lat: number;
  lon: number;
}

interface Outbreak {
  disease_name: string;
  cases: number;
  deaths: number;
  trend: string;
  risk_level: string;
}

interface OutbreakMapProps {
  city: string;
  lat: number;
  lon: number;
  riskLevel: string;
  riskScore: number;
  outbreaks: Outbreak[];
  hospitals: Hospital[];
}

export const OutbreakMap: React.FC<OutbreakMapProps> = ({
  city,
  lat,
  lon,
  riskLevel,
  riskScore,
  outbreaks,
  hospitals,
}) => {
  const [showHospitals, setShowHospitals] = useState(true);
  const [showOutbreaks, setShowOutbreaks] = useState(true);

  // Map center coordinates
  const center: [number, number] = [lat, lon];

  // Define marker colors based on risk level
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return '#ef4444'; // Red
      case 'medium': return '#f59e0b'; // Amber
      default: return '#10b981'; // Emerald Green
    }
  };

  const riskColor = getRiskColor(riskLevel);

  // Creating custom markers using L.divIcon so we avoid Vite asset packaging bugs with static Leaflet pngs
  const createCityIcon = () => {
    return L.divIcon({
      html: `<div style="background-color: ${riskColor};" class="w-6 h-6 rounded-full border-2 border-white shadow-lg animate-ping absolute opacity-75"></div>
             <div style="background-color: ${riskColor};" class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold relative">${Math.round(riskScore)}</div>`,
      className: 'custom-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const createHospitalIcon = (isEmergency: boolean) => {
    const bgColor = isEmergency ? '#ef4444' : '#0284c7';
    return L.divIcon({
      html: `<div style="background-color: ${bgColor};" class="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
             </div>`,
      className: 'custom-hospital-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  return (
    <div className="w-full flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full">
      {/* Map Controls Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            Live Outbreak & Medical Map - {city}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Coordinates: {lat.toFixed(4)}, {lon.toFixed(4)}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setShowOutbreaks(!showOutbreaks)}
            className={`px-3 py-1.5 rounded-full font-medium transition ${
              showOutbreaks
                ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Outbreak Hotspots
          </button>
          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-3 py-1.5 rounded-full font-medium transition ${
              showHospitals
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Medical Facilities
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative flex-grow min-h-[350px] md:min-h-[450px] z-10">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            // For cool dark mode map if needed, we can toggle URLs but standard OSM is clean and accessible
          />
          
          <ChangeMapView center={center} />

          {/* Central Location Pin */}
          <Marker position={center} icon={createCityIcon()}>
            <Popup>
              <div className="p-1 dark:text-slate-900">
                <h4 className="font-bold text-sm">{city}</h4>
                <p className="text-xs font-semibold" style={{ color: riskColor }}>
                  Risk Profile: {riskLevel} ({riskScore}/10)
                </p>
                <div className="mt-1 text-xs border-t pt-1">
                  <strong>Active Threats:</strong>
                  <ul className="list-disc pl-4 mt-0.5">
                    {outbreaks.map(o => (
                      <li key={o.disease_name}>
                        {o.disease_name} (Cases: {o.cases})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Outbreak Heat Zones (Large transparent circles representing risk impact area) */}
          {showOutbreaks && (
            <Circle
              center={center}
              radius={2500}
              pathOptions={{
                fillColor: riskColor,
                fillOpacity: 0.15,
                color: riskColor,
                weight: 1.5,
                dashArray: '5, 5'
              }}
            />
          )}

          {/* Nearby Hospital Markers */}
          {showHospitals && hospitals.map((h, i) => (
            <Marker
              key={i}
              position={[h.lat, h.lon]}
              icon={createHospitalIcon(h.emergency_room)}
            >
              <Popup>
                <div className="p-1 dark:text-slate-900 w-48">
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 uppercase mb-1">
                    {h.type}
                  </span>
                  <h4 className="font-bold text-xs leading-tight mb-1">{h.name}</h4>
                  <p className="text-[10px] text-slate-500 mb-1">{h.address}</p>
                  
                  <div className="flex gap-1 mb-1.5 flex-wrap">
                    {h.emergency_room && (
                      <span className="text-[8px] bg-red-100 text-red-800 px-1 py-0.5 rounded font-medium">
                        Emergency 24/7
                      </span>
                    )}
                    {h.pediatric && (
                      <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-medium">
                        Pediatrics
                      </span>
                    )}
                  </div>
                  
                  <div className="text-[10px] border-t pt-1 flex justify-between">
                    <span className="font-semibold text-slate-700">Distance: {h.distance_km} km</span>
                    {h.phone !== 'N/A' && (
                      <a href={`tel:${h.phone}`} className="text-sky-600 font-bold hover:underline">
                        Call Clinic
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Control Legend */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[10px] text-slate-500">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span> High Risk Area
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 block"></span> Hospital/Clinic
          </span>
        </div>
        <div>
          Map sources: OpenStreetMap
        </div>
      </div>
    </div>
  );
};

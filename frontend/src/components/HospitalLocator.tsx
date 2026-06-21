import React, { useState } from 'react';
import { Search, ShieldAlert, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';

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

interface HospitalLocatorProps {
  hospitals: Hospital[];
  isLoading: boolean;
  onSelectHospital: (h: Hospital) => void;
}

export const HospitalLocator: React.FC<HospitalLocatorProps> = ({
  hospitals,
  isLoading,
  onSelectHospital,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmergency, setFilterEmergency] = useState(false);
  const [filterPediatric, setFilterPediatric] = useState(false);

  // Filter logic
  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          h.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmergency = !filterEmergency || h.emergency_room;
    const matchesPediatric = !filterPediatric || h.pediatric;
    return matchesSearch && matchesEmergency && matchesPediatric;
  });

  return (
    <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full">
      {/* Header Search and Filters Panel */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hospitals by name or address..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterEmergency(!filterEmergency)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border flex items-center gap-1.5 transition ${
              filterEmergency
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900'
                : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Emergency Room (24/7)
          </button>
          <button
            onClick={() => setFilterPediatric(!filterPediatric)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border flex items-center gap-1.5 transition ${
              filterPediatric
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900'
                : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" /> Pediatric Services
          </button>
        </div>
      </div>

      {/* Hospital List */}
      <div className="flex-grow overflow-y-auto max-h-[350px] md:max-h-[450px] divide-y divide-slate-100 dark:divide-slate-700/60 p-2 space-y-1.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
            <div className="w-8 h-8 rounded-full border-4 border-sky-600 border-t-transparent animate-spin"></div>
            <p className="text-xs font-medium">Scanning local Overpass GIS maps...</p>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-1.5">
            <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-semibold">No medical facilities match filters.</p>
            <p className="text-[10px]">Try expanding your parameters or reset filters.</p>
          </div>
        ) : (
          filteredHospitals.map((h, i) => (
            <div
              key={i}
              onClick={() => onSelectHospital(h)}
              className="p-3 bg-slate-50/40 hover:bg-slate-100/50 dark:bg-slate-850/40 dark:hover:bg-slate-700/30 border border-slate-150 dark:border-slate-700/50 rounded-xl cursor-pointer transition flex justify-between items-start gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div>
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase mr-1.5">
                    {h.type}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate inline">
                    {h.name}
                  </h4>
                </div>
                
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-sky-500" /> {h.address}
                </p>

                {h.phone !== 'N/A' && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" /> {h.phone}
                  </p>
                )}

                {/* Badges */}
                <div className="flex gap-1.5 flex-wrap">
                  {h.emergency_room && (
                    <span className="text-[9px] bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                      24/7 ER
                    </span>
                  )}
                  {h.pediatric && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                      Pediatrics
                    </span>
                  )}
                </div>
              </div>

              {/* Distance Display */}
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 block">
                  {h.distance_km} km
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Away
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Safety Notice Footer */}
      <div className="p-3 bg-red-50/60 dark:bg-red-950/10 border-t border-red-100 dark:border-red-900/30 flex items-center gap-2 text-[10px] text-red-700 dark:text-red-300">
        <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p className="leading-tight font-medium">
          In a medical emergency, call regional local emergency lines (e.g. 911 or 999) immediately instead of driving to a clinic.
        </p>
      </div>
    </div>
  );
};

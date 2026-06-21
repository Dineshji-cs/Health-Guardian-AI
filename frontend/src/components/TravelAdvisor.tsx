import React, { useState } from 'react';
import { Calendar, ClipboardList, CheckSquare, ShieldCheck, Download, Users, PlusCircle } from 'lucide-react';

interface EmergencyContacts {
  [key: string]: string;
}

interface TravelPlannerResponse {
  destination: string;
  risk_level: string;
  risk_score: number;
  advisory: string;
  checklist: string[];
  recommendations: string[];
  emergency_contacts: EmergencyContacts;
}

interface TravelAdvisorProps {
  currentCity: string;
  onCityChange: (city: string) => void;
}

const POPULAR_DESTINATIONS = [
  "New Delhi", "Mumbai", "Bengaluru", "Kolkata", "Chennai", 
  "Hyderabad", "Kochi", "Jaipur", "Goa", "Srinagar",
  "New York", "London", "Tokyo", "Sydney", "Cairo", "Rio de Janeiro", "Bangkok", "Nairobi"
];

const AVAILABLE_VACCINES = [
  "COVID-19 Booster", "Yellow Fever", "Typhoid Fever", 
  "Hepatitis A & B", "Malaria Prophylaxis (Meds)"
];

export const TravelAdvisor: React.FC<TravelAdvisorProps> = ({ currentCity, onCityChange }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState(currentCity);
  const [travelDate, setTravelDate] = useState('');
  const [duration, setDuration] = useState(7);
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState<TravelPlannerResponse | null>(null);
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});

  const handleVaccineToggle = (vac: string) => {
    setSelectedVaccines(prev => 
      prev.includes(vac) ? prev.filter(v => v !== vac) : [...prev, vac]
    );
  };

  const handleCheckboxToggle = (index: number) => {
    setCompletedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const generatePlannerAdvisory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) return;

    setIsLoading(true);
    setPlanResult(null);
    setCompletedItems({});

    try {
      const response = await fetch('http://localhost:8000/api/travel-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          travel_date: travelDate,
          travel_duration_days: duration,
          vaccine_history: selectedVaccines
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error status');
      }

      const data = await response.json();
      setPlanResult(data);
      // Sync global selection context with planner destination
      onCityChange(destination);
    } catch (error) {
      console.error("Travel advisory generation failed:", error);
      alert("Could not generate travel advisory. Please make sure the backend is running locally on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <Calendar className="w-5 h-5 text-sky-500" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            Itinerary Configurator
          </h3>
        </div>

        <form onSubmit={generatePlannerAdvisory} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
              Origin City / Country
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. New York, USA"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
              Destination City
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              required
            >
              <option value="">Select Target Destination</option>
              {POPULAR_DESTINATIONS.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Departure Date
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Vaccine Checklist logs */}
          <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-700/60 pt-3">
            <span className="block font-semibold text-slate-700 dark:text-slate-350">
              Your Recorded Vaccinations:
            </span>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {AVAILABLE_VACCINES.map(vac => (
                <label key={vac} className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={selectedVaccines.includes(vac)}
                    onChange={() => handleVaccineToggle(vac)}
                    className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 bg-transparent border-slate-300 dark:border-slate-600"
                  />
                  <span>{vac}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold py-3 rounded-xl transition shadow-sm"
          >
            {isLoading ? "Generating Custom Advisor..." : "Generate Advisory & Checklists"}
          </button>
        </form>
      </div>

      {/* Advisory Outputs Panel */}
      <div className="lg:col-span-3 space-y-4">
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 flex flex-col items-center justify-center space-y-3 h-full min-h-[300px]">
            <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Analyzing outbreaks, climatic charts, and immunization profiles...
            </p>
          </div>
        )}

        {!planResult && !isLoading && (
          <div className="bg-slate-100/50 dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-2 h-full min-h-[300px]">
            <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-350">
              No Travel Plan Configured
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Input your trip parameters on the left to synthesize personalized public health advisories, custom checklists, and emergency guides.
            </p>
          </div>
        )}

        {planResult && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-5 space-y-5 animate-fade-in">
            {/* Risk Title Panel */}
            <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Destination Advisory</span>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{planResult.destination}</h3>
              </div>
              <div className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 ${getRiskColor(planResult.risk_level)}`}>
                <span>Risk: {planResult.risk_level}</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{planResult.risk_score.toFixed(1)}/10</span>
              </div>
            </div>

            {/* Custom Description Text */}
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              {planResult.advisory}
            </div>

            {/* Interactive Packing Checklist */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 dark:text-slate-250 text-xs flex items-center gap-1.5">
                  <CheckSquare className="w-4.5 h-4.5 text-sky-500" /> Travel Health Packing Checklist
                </h4>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                  {Object.values(completedItems).filter(Boolean).length} / {planResult.checklist.length} Complete
                </span>
              </div>
              <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/40">
                {planResult.checklist.map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition text-xs leading-normal ${
                      completedItems[idx] 
                        ? 'text-slate-400 line-through bg-slate-100/40 dark:bg-slate-800/40' 
                        : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-750/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!completedItems[idx]}
                      onChange={() => handleCheckboxToggle(idx)}
                      className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 mt-0.5 border-slate-300 dark:border-slate-600 bg-transparent flex-shrink-0"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-250 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" /> Clinical & Preventive Guidelines
              </h4>
              <ul className="list-disc pl-5 text-xs text-slate-650 dark:text-slate-350 space-y-1.5">
                {planResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="leading-relaxed">{rec}</li>
                ))}
              </ul>
            </div>

            {/* Regional Contacts & Print Action */}
            <div className="flex flex-wrap gap-4 items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-4 text-xs">
              <div className="space-y-1 max-w-[70%]">
                <span className="font-bold text-[10px] text-slate-400 block uppercase tracking-wider">Emergency Contacts</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700 dark:text-slate-300">
                  {Object.entries(planResult.emergency_contacts).map(([title, num]) => (
                    <span key={title} className="text-[11px]">
                      <strong>{title}:</strong> <a href={`tel:${num}`} className="text-sky-600 dark:text-sky-400 font-medium hover:underline">{num}</a>
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 font-semibold px-4.5 py-2.5 rounded-xl transition flex items-center gap-1.5 text-xs shadow-sm"
              >
                <Download className="w-4 h-4" /> Print Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

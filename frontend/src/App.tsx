import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  Search, 
  Calendar, 
  Bot, 
  Activity, 
  Info, 
  Sun, 
  Moon, 
  AlertTriangle, 
  Thermometer, 
  Droplets,
  Heart,
  ChevronRight,
  ShieldCheck,
  Navigation,
  Compass,
  FileText,
  Languages
} from 'lucide-react';
import { OutbreakMap } from './components/OutbreakMap';
import { ChatAssistant } from './components/ChatAssistant';
import { HospitalLocator } from './components/HospitalLocator';
import { TravelAdvisor } from './components/TravelAdvisor';

// Match types from models.py
interface Outbreak {
  disease_name: string;
  cases: number;
  deaths: number;
  trend: string;
  risk_level: string;
  description: string;
  symptoms: string[];
  transmission: string;
  prevention: string[];
  vaccine_available: boolean;
  what_to_do: string;
}

interface Weather {
  temp: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  alert: string | null;
}

interface Advisory {
  city: string;
  country: string;
  risk_level: string;
  risk_score: number;
  active_outbreaks: Outbreak[];
  weather: Weather;
  emergency_contacts: Record<string, string>;
  lat: number;
  lon: number;
}

interface Hospital {
  name: string;
  type: string;
  distance_km: number;
  address: string;
  phone: string;
  emergency_room: boolean;
  pediatric: boolean;
  lat: number;
  lon: number;
}

interface DiseaseWiki {
  name: string;
  description: string;
  symptoms: string[];
  transmission: string;
  prevention: string[];
  vaccine_available: boolean;
  what_to_do: string;
}

// Multilingual labels dictionary
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    appTitle: "Health Guardian",
    subTitle: "Public Health AI (India)",
    home: "Home Dashboard",
    map: "Live Outbreak Map",
    wiki: "Disease Search",
    travel: "Travel Advisor",
    assistant: "AI Health Assistant",
    hospitals: "Nearby Hospitals",
    about: "About Info",
    activeLocation: "Active Location",
    riskLevel: "Infectious Risk Level",
    pathogens: "Active Pathogens",
    climate: "Climatic Index",
    searchPlaceholder: "Search Indian city (e.g. Mumbai, Kochi)...",
    gps: "Simulate GPS",
    emergency: "Emergency Numbers",
    langMode: "Language / भाषा",
    activeCoord: "Active Coordinate context",
    hazardAdvisory: "Active Environmental Hazard Advisory",
    outbreaksHeader: "Current Local Outbreaks",
    weatherCondition: "Condition",
    humidity: "Humidity",
    cases: "Cases",
    trend: "Trend",
    transmission: "Transmission",
    symptomsTitle: "Common Symptoms",
    preventionTitle: "Prevention Measures",
    vaccineStatus: "Vaccine status",
    actionPlan: "Medical Action Plan",
    contactsHeader: "Regional Health Contacts",
    contactsDesc: "Consult our Gemini-powered health advisor on location risks, mosquito control, and travel planners.",
    launchAssistant: "Launch Assistant",
    leafletLink: "View Live Outbreak Map",
    statsHeader: "Outbreak Stats Summary",
    statsDesc: "Local coordinates and vector analysis",
    hospitalsFound: "Medical Facilities Found",
    hospitalsDesc: "Hospitals and clinics within 5km radius plotted on mapping view.",
    viewHospitals: "Filter Hospitals list",
    wikiHeader: "Infectious Disease Directory",
    wikiDesc: "Learn about symptoms, transmission channels, and public health prevention guidelines.",
    wikiSearchPlaceholder: "Search diseases (e.g. Dengue, Malaria, Typhoid)...",
    vaccineAvailable: "Vaccine available",
    directiveProtocol: "Directive Protocol",
    disclaimerHeader: "MANDATORY CLINICAL DISCLAIMER",
    disclaimerBody: "This software application represents a simulated public health support system. It is NOT a medical device, is not designed to diagnose illness, and should not replace clinical medical evaluations by qualified doctors. If you are experiencing symptoms, seek care at a medical clinic immediately."
  },
  hi: {
    appTitle: "हेल्थ गार्जियन",
    subTitle: "सार्वजनिक स्वास्थ्य एआई (भारत)",
    home: "मुख्य डैशबोर्ड",
    map: "लाइव प्रकोप मानचित्र",
    wiki: "बीमारी खोज",
    travel: "यात्रा स्वास्थ्य सलाहकार",
    assistant: "एआई स्वास्थ्य सहायक",
    hospitals: "आस-पास के अस्पताल",
    about: "जानकारी",
    activeLocation: "सक्रिय स्थान",
    riskLevel: "संक्रामक जोखिम स्तर",
    pathogens: "सक्रिय रोगजनक",
    climate: "जलवायु सूचकांक",
    searchPlaceholder: "भारतीय शहर खोजें (जैसे मुंबई, कोच्चि)...",
    gps: "जीपीएस सिमुलेशन",
    emergency: "आपातकालीन नंबर",
    langMode: "भाषा / Language",
    activeCoord: "सक्रिय समन्वय संदर्भ",
    hazardAdvisory: "सक्रिय पर्यावरण खतरा चेतावनी",
    outbreaksHeader: "वर्तमान स्थानीय प्रकोप",
    weatherCondition: "स्थिति",
    humidity: "आर्द्रता",
    cases: "मामले",
    trend: "प्रवृत्ति",
    transmission: "संचरण",
    symptomsTitle: "सामान्य लक्षण",
    preventionTitle: "रोकथाम के उपाय",
    vaccineStatus: "टीका स्थिति",
    actionPlan: "चिकित्सा कार्य योजना",
    contactsHeader: "क्षेत्रीय स्वास्थ्य संपर्क",
    contactsDesc: "स्थान के जोखिमों, मच्छर नियंत्रण और यात्रा योजनाकारों पर हमारे जेमिनी-संचालित स्वास्थ्य सलाहकार से परामर्श लें।",
    launchAssistant: "सहायक शुरू करें",
    leafletLink: "लाइव प्रकोप मानचित्र देखें",
    statsHeader: "प्रकोप आँकड़े सारांश",
    statsDesc: "स्थानीय निर्देशांक और वेक्टर विश्लेषण",
    hospitalsFound: "चिकित्सा सुविधाएं मिलीं",
    hospitalsDesc: "मैपिंग व्यू पर 5 किमी के दायरे में अस्पताल और क्लीनिक दिखाए गए हैं।",
    viewHospitals: "अस्पतालों की सूची फ़िल्टर करें",
    wikiHeader: "संक्रामक रोग निर्देशिका",
    wikiDesc: "लक्षणों, संचरण माध्यमों और सार्वजनिक स्वास्थ्य दिशानिर्देशों के बारे में जानें।",
    wikiSearchPlaceholder: "बीमारियों की खोज करें (जैसे डेंगू, मलेरिया, टाइफाइड)...",
    vaccineAvailable: "टीका उपलब्ध है",
    directiveProtocol: "निर्देश प्रोटोकॉल",
    disclaimerHeader: "अनिवार्य नैदानिक अस्वीकरण",
    disclaimerBody: "यह सॉफ्टवेयर अनुप्रयोग एक सिम्युलेटेड सार्वजनिक स्वास्थ्य सहायता प्रणाली का प्रतिनिधित्व करता है। यह एक चिकित्सा उपकरण नहीं है, बीमारी का निदान करने के लिए डिज़ाइन नहीं किया गया है, और योग्य डॉक्टरों द्वारा नैदानिक चिकित्सा मूल्यांकन को प्रतिस्थापित नहीं करना चाहिए। यदि आप लक्षणों का अनुभव कर रहे हैं, तो तुरंत चिकित्सा क्लिनिक में देखभाल लें।"
  }
};

const TABS = [
  { id: 'home', labelKey: 'home', icon: Activity },
  { id: 'map', labelKey: 'map', icon: Compass },
  { id: 'wiki', labelKey: 'wiki', icon: FileText },
  { id: 'travel', labelKey: 'travel', icon: Calendar },
  { id: 'assistant', labelKey: 'assistant', icon: Bot },
  { id: 'hospitals', labelKey: 'hospitals', icon: Heart },
  { id: 'about', labelKey: 'about', icon: Info },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [cityInput, setCityInput] = useState('');
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  
  // Data State
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [wikiDiseases, setWikiDiseases] = useState<Record<string, DiseaseWiki>>({});
  const [wikiSearch, setWikiSearch] = useState('');
  const [expandedDisease, setExpandedDisease] = useState<string | null>(null);
  
  // Load States
  const [isAdvisoryLoading, setIsAdvisoryLoading] = useState(true);
  const [isHospitalsLoading, setIsHospitalsLoading] = useState(true);

  const t = TRANSLATIONS[lang];

  // Sync dark class on DOM element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Load advisory data when selectedCity changes
  useEffect(() => {
    const fetchAdvisory = async () => {
      setIsAdvisoryLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/advisory?city=${encodeURIComponent(selectedCity)}`);
        if (!response.ok) throw new Error('Failed to fetch advisory data');
        const data = await response.json();
        setAdvisory(data);
        
        // After loading advisory, fetch nearby hospitals
        fetchHospitals(data.lat, data.lon);
      } catch (err) {
        console.error("Advisory fetch failed:", err);
      } finally {
        setIsAdvisoryLoading(false);
      }
    };

    fetchAdvisory();
  }, [selectedCity]);

  // Fetch hospital data based on lat/lon
  const fetchHospitals = async (lat: number, lon: number) => {
    setIsHospitalsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/hospitals?lat=${lat}&lon=${lon}&radius=5000`);
      if (!response.ok) throw new Error('Failed to fetch hospital listings');
      const data = await response.json();
      setHospitals(data);
    } catch (err) {
      console.error("Hospitals fetch failed:", err);
    } finally {
      setIsHospitalsLoading(false);
    }
  };

  // Fetch disease wiki data
  useEffect(() => {
    const fetchWiki = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/diseases');
        if (!response.ok) throw new Error('Failed to fetch disease list');
        const data = await response.json();
        setWikiDiseases(data);
      } catch (err) {
        console.error("Wiki fetch failed:", err);
      }
    };
    fetchWiki();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setSelectedCity(cityInput.trim());
      setCityInput('');
    }
  };

  const simulateGPSLocation = () => {
    // GPS simulation: sets location to Mumbai, which triggers high monsoonal outbreaks risk
    setSelectedCity("Mumbai");
  };

  // Filtered Wiki list
  const filteredWiki = Object.entries(wikiDiseases).filter(([name, details]) => {
    const term = wikiSearch.toLowerCase();
    return name.toLowerCase().includes(term) || 
           details.description.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col z-30 animate-slide-in">
        {/* App Logo */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center shadow-md shadow-sky-600/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-slate-900 dark:text-white">{t.appTitle}</h1>
            <span className="text-[9px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">{t.subTitle}</span>
          </div>
        </div>

        {/* Navigation Options */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active 
                    ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-l-4 border-sky-600' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {t[tab.labelKey]}
              </button>
            );
          })}
        </nav>

        {/* Bottom Language, Theme & Location Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-sky-500" /> {t.langMode}
            </span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'hi')}
              className="text-[10px] bg-slate-100 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded px-1.5 py-1 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider">Dark Mode</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-150 dark:border-slate-850 text-center">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-semibold uppercase mb-1">{t.activeCoord}</span>
            <span className="text-xs font-bold text-slate-850 dark:text-slate-200 block truncate">
              {advisory ? `${advisory.city}, ${advisory.country}` : 'Loading...'}
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN SCREEN AREA */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* HEADER TOP BAR */}
        <header className="h-16 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-20">
          <form onSubmit={handleSearchSubmit} className="relative w-72 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-slate-100 transition"
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={simulateGPSLocation}
              className="text-[10px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-350 px-3 py-2 rounded-xl hover:border-sky-500 hover:text-sky-600 dark:hover:border-sky-500 dark:hover:text-sky-400 transition flex items-center gap-1.5 shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-500 fill-sky-500/20" /> {t.gps}
            </button>
            
            {/* Quick emergency button */}
            <button
              onClick={() => {
                if (advisory) {
                  const items = Object.entries(advisory.emergency_contacts)
                    .map(([title, num]) => `${title}: ${num}`)
                    .join('\n');
                  alert(`Local Emergency Lines (${advisory.city}):\n\n${items}`);
                }
              }}
              className="bg-red-650 hover:bg-red-750 text-white text-[10px] font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-red-600/10"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> {t.emergency}
            </button>
          </div>
        </header>

        {/* CONTENT PANELS VIEW SWITCHER */}
        <div className="flex-grow p-6 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">
          
          {isAdvisoryLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
              <div className="w-10 h-10 rounded-full border-4 border-sky-600 border-t-transparent animate-spin"></div>
              <p className="text-xs font-semibold">Synthesizing geographical outbreak databases...</p>
            </div>
          ) : !advisory ? (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-4 rounded-xl text-center text-xs">
              ⚠️ Public health databases could not be contacted. Please verify local api-server status.
            </div>
          ) : (
            <>
              {/* TAB 1: HOME DASHBOARD */}
              {activeTab === 'home' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Local weather alert notice */}
                  {advisory.weather.alert && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl flex gap-3 text-xs leading-normal">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-0.5">{t.hazardAdvisory}</h4>
                        <p className="text-amber-700 dark:text-amber-300">{advisory.weather.alert}</p>
                      </div>
                    </div>
                  )}

                  {/* Summary Metric widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Location Info Widget */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{t.activeLocation}</span>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{advisory.city}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-450">{advisory.country}</p>
                      </div>
                      <div className="w-12 h-12 bg-sky-100 dark:bg-sky-950/40 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400">
                        <MapPin className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Risk Index widget */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{t.riskLevel}</span>
                        <h3 className={`font-bold text-base block ${
                          advisory.risk_level === 'High' ? 'text-red-500' : advisory.risk_level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {advisory.risk_level === 'High' && lang === 'hi' ? 'उच्च जोखिम' : advisory.risk_level === 'Medium' && lang === 'hi' ? 'मध्यम जोखिम' : advisory.risk_level === 'Low' && lang === 'hi' ? 'कम जोखिम' : `${advisory.risk_level} Risk`}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{advisory.risk_score.toFixed(1)} / 10</span>
                          <div className="w-16 h-1.5 bg-slate-250 dark:bg-slate-750 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${advisory.risk_score * 10}%` }} 
                              className={`h-full rounded-full ${
                                advisory.risk_level === 'High' ? 'bg-red-500' : advisory.risk_level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-850 rounded-xl flex items-center justify-center text-slate-650 dark:text-slate-350">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Outbreaks widget */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{t.pathogens}</span>
                        <h3 className="font-bold text-slate-850 dark:text-slate-100 text-base">{advisory.active_outbreaks.length} Monitored</h3>
                        <p className="text-[10px] text-slate-550 leading-tight truncate w-36">
                          {advisory.active_outbreaks.map(o => o.disease_name).join(', ') || 'No outbreaks'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-xl flex items-center justify-center text-red-650 dark:text-red-400">
                        <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>

                    {/* Local Weather info */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{t.climate}</span>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{advisory.weather.temp}°C</h3>
                        <div className="flex gap-2 text-[10px] text-slate-500 mt-1 flex-wrap">
                          <span>{advisory.weather.condition}</span>
                          <span>{t.humidity}: {advisory.weather.humidity}%</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Sun className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Main section: Outbreak lists and Travel health advisory */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Outbreak list detail cards */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm pl-1">
                        {t.outbreaksHeader} ({advisory.active_outbreaks.length})
                      </h3>
                      
                      {advisory.active_outbreaks.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                          No active infectious outbreaks are currently registered for this destination.
                        </div>
                      ) : (
                        advisory.active_outbreaks.map((outbreak, idx) => (
                          <div 
                            key={idx} 
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-5 space-y-4 shadow-sm"
                          >
                            <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{outbreak.disease_name} Outbreak</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{t.transmission}: {outbreak.transmission}</p>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                <span className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 px-2.5 py-1 rounded-lg">
                                  {t.cases}: {outbreak.cases}
                                </span>
                                <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350 px-2.5 py-1 rounded-lg capitalize">
                                  {t.trend}: {outbreak.trend === 'increasing' && lang === 'hi' ? 'बढ़ रहा है' : outbreak.trend === 'stable' && lang === 'hi' ? 'स्थिर' : outbreak.trend === 'decreasing' && lang === 'hi' ? 'घट रहा है' : outbreak.trend}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                              {outbreak.description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-400 text-[10px] uppercase">{t.symptomsTitle}</span>
                                <ul className="list-disc pl-5 text-slate-650 dark:text-slate-350 space-y-0.5">
                                  {outbreak.symptoms.map(s => <li key={s}>{s}</li>)}
                                </ul>
                              </div>
                              <div className="space-y-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-400 text-[10px] uppercase">{t.preventionTitle}</span>
                                <ul className="list-disc pl-5 text-slate-650 dark:text-slate-350 space-y-0.5">
                                  {outbreak.prevention.map(p => <li key={p}>{p}</li>)}
                                </ul>
                              </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center text-xs">
                              <span className="text-[10px] text-slate-450">
                                {t.vaccineAvailable}: <strong className="text-slate-750 dark:text-slate-300">{outbreak.vaccine_available ? (lang === 'hi' ? 'हाँ' : 'Yes') : (lang === 'hi' ? 'नहीं' : 'No')}</strong>
                              </span>
                              <button 
                                onClick={() => {
                                  alert(`Public Health Directive - ${outbreak.disease_name}:\n\n${outbreak.what_to_do}`);
                                }}
                                className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
                              >
                                {t.actionPlan}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Regional health advisor dashboard summary */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm pl-1">
                        {t.contactsHeader}
                      </h3>
                      
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="space-y-3">
                          {Object.entries(advisory.emergency_contacts).map(([title, num]) => (
                            <div key={title} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40 pb-2 last:border-b-0 last:pb-0">
                              <span className="text-xs text-slate-600 dark:text-slate-450 font-medium">{title}</span>
                              <a href={`tel:${num}`} className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
                                {num}
                              </a>
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-150 dark:border-sky-900/35 p-3.5 rounded-xl text-center space-y-2">
                          <h4 className="font-bold text-xs text-sky-850 dark:text-sky-300">{lang === 'hi' ? 'मदद की ज़रूरत है?' : 'Need AI Assistance?'}</h4>
                          <p className="text-[10px] text-sky-700 dark:text-sky-400 leading-normal">
                            {t.contactsDesc}
                          </p>
                          <button
                            onClick={() => setActiveTab('assistant')}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition"
                          >
                            {t.launchAssistant}
                          </button>
                        </div>
                      </div>

                      {/* Map preview quick link */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{lang === 'hi' ? 'आउटब्रेक मैप' : 'Interactive Outbreak Maps'}</h4>
                        <p className="text-[10px] text-slate-550 dark:text-slate-450 leading-relaxed">
                          Locate active disease vectors, circular outbreak ranges, and nearby medical clinics.
                        </p>
                        <button
                          onClick={() => setActiveTab('map')}
                          className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold text-[10px] py-2 rounded-xl transition"
                        >
                          {t.leafletLink}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE OUTBREAK MAP */}
              {activeTab === 'map' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px] md:h-[650px] animate-fade-in">
                  <div className="lg:col-span-3 h-full">
                    <OutbreakMap
                      city={advisory.city}
                      lat={advisory.lat}
                      lon={advisory.lon}
                      riskLevel={advisory.risk_level}
                      riskScore={advisory.risk_score}
                      outbreaks={advisory.active_outbreaks}
                      hospitals={hospitals}
                    />
                  </div>
                  {/* Outbreaks Stats Panel beside Map */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full overflow-y-auto space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm">{t.statsHeader}</h3>
                        <p className="text-[10px] text-slate-500">{t.statsDesc}</p>
                      </div>
                      <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                        {advisory.active_outbreaks.map((o, idx) => (
                          <div key={idx} className="pt-2.5 first:pt-0 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-750 dark:text-slate-200">{o.disease_name}</span>
                              <span className="font-bold text-red-650 dark:text-red-400">{o.cases} {lang === 'hi' ? 'मामले' : 'cases'}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>{t.trend}: <strong className="capitalize">{o.trend === 'stable' && lang === 'hi' ? 'स्थिर' : o.trend}</strong></span>
                              <span>Deaths: {o.deaths}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-150 dark:border-slate-850 text-center space-y-1.5">
                      <h4 className="font-bold text-[10px] text-slate-800 dark:text-slate-350 uppercase">{t.hospitalsFound}</h4>
                      <span className="text-xl font-black text-sky-600 dark:text-sky-400 block">{hospitals.length}</span>
                      <p className="text-[9px] text-slate-450 leading-tight">{t.hospitalsDesc}</p>
                      <button 
                        onClick={() => setActiveTab('hospitals')}
                        className="text-[9px] font-bold text-sky-600 dark:text-sky-400 hover:underline block mx-auto"
                      >
                        {t.viewHospitals}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DISEASE SEARCH WIKI */}
              {activeTab === 'wiki' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-fade-in">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.wikiHeader}</h3>
                    <p className="text-xs text-slate-500">{t.wikiDesc}</p>
                    <input
                      type="text"
                      value={wikiSearch}
                      onChange={(e) => setWikiSearch(e.target.value)}
                      placeholder={t.wikiSearchPlaceholder}
                      className="w-full md:w-96 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-850 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredWiki.map(([name, details]) => {
                      const expanded = expandedDisease === name;
                      return (
                        <div 
                          key={name} 
                          className={`p-4 border rounded-xl transition ${
                            expanded 
                              ? 'border-sky-550 bg-sky-50/10 dark:bg-sky-950/5' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750'
                          }`}
                        >
                          <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedDisease(expanded ? null : name)}>
                            <div>
                              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{name}</h4>
                              <p className="text-[10px] text-slate-450 mt-0.5 leading-snug truncate max-w-sm">
                                {details.description}
                              </p>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'transform rotate-90 text-sky-600' : ''}`} />
                          </div>

                          {expanded && (
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5 text-xs animate-fade-in">
                              <p className="text-slate-700 dark:text-slate-350 leading-relaxed">
                                <strong>Description:</strong> {details.description}
                              </p>
                              <div>
                                <span className="block font-semibold text-[10px] uppercase text-slate-505 mb-1">{t.transmission}</span>
                                <p className="text-slate-700 dark:text-slate-350">{details.transmission}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="block font-semibold text-[10px] uppercase text-slate-505 mb-1">{t.symptomsTitle}</span>
                                  <ul className="list-disc pl-4 text-slate-700 dark:text-slate-350 space-y-0.5">
                                    {details.symptoms.map(s => <li key={s}>{s}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <span className="block font-semibold text-[10px] uppercase text-slate-505 mb-1">{t.preventionTitle}</span>
                                  <ul className="list-disc pl-4 text-slate-700 dark:text-slate-350 space-y-0.5">
                                    {details.prevention.map(p => <li key={p}>{p}</li>)}
                                  </ul>
                                </div>
                              </div>
                              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-[10px] text-slate-550">
                                <span>{t.vaccineAvailable}: <strong>{details.vaccine_available ? (lang === 'hi' ? 'हाँ' : 'Yes') : (lang === 'hi' ? 'नहीं' : 'No')}</strong></span>
                                <span 
                                  onClick={() => alert(`Medical Guideline:\n\n${details.what_to_do}`)}
                                  className="text-sky-650 dark:text-sky-400 hover:underline font-bold cursor-pointer"
                                >
                                  {t.directiveProtocol}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: TRAVEL HEALTH ADVISOR */}
              {activeTab === 'travel' && (
                <div className="animate-fade-in">
                  <TravelAdvisor
                    currentCity={advisory.city}
                    onCityChange={(city) => setSelectedCity(city)}
                  />
                </div>
              )}

              {/* TAB 5: AI HEALTH ASSISTANT */}
              {activeTab === 'assistant' && (
                <div className="animate-fade-in">
                  <ChatAssistant currentCity={advisory.city} />
                </div>
              )}

              {/* TAB 6: NEARBY HOSPITALS */}
              {activeTab === 'hospitals' && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[600px] md:h-[650px] animate-fade-in">
                  {/* Left hospital locator list panel */}
                  <div className="lg:col-span-2 h-full">
                    <HospitalLocator
                      hospitals={hospitals}
                      isLoading={isHospitalsLoading}
                      onSelectHospital={(h) => {
                        console.log("Selected hospital:", h);
                      }}
                    />
                  </div>
                  {/* Right leaflet map panel showing clinics */}
                  <div className="lg:col-span-3 h-full">
                    <OutbreakMap
                      city={advisory.city}
                      lat={advisory.lat}
                      lon={advisory.lon}
                      riskLevel={advisory.risk_level}
                      riskScore={advisory.risk_score}
                      outbreaks={advisory.active_outbreaks}
                      hospitals={hospitals}
                    />
                  </div>
                </div>
              )}

              {/* TAB 7: ABOUT */}
              {activeTab === 'about' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-fade-in text-xs">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                    <Shield className="w-5 h-5 text-sky-500" /> About Health Guardian AI (India)
                  </h3>
                  
                  <div className="space-y-3.5 text-slate-700 dark:text-slate-350 leading-relaxed">
                    <p>
                      <strong>Health Guardian AI</strong> is an intelligent public health awareness assistant developed to empower travelers and local populations with localized disease outbreak insights, risk forecasting, and health support resources.
                    </p>
                    <p>
                      Our system links clinical databases of endemic and epidemic pathogens with geographic mapping interfaces (powered by Leaflet and OpenStreetMap Overpass indices) and advanced LLM conversational engines (powered by the Google Gemini API) to synthesize actionable preventative checklists.
                    </p>
                    
                    <h4 className="font-bold text-slate-800 dark:text-slate-250 text-xs mt-4">Key Objectives:</h4>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li><strong>Real-time awareness</strong>: Providing live epidemiological alerts (Dengue, Malaria, Typhoid, etc.) based on environmental conditions and weather fluctuations.</li>
                      <li><strong>Autonomous triage simulations</strong>: A Clinical LLM assistant that offers advice on vector controls, vaccines, and red-flags without attempting diagnostic guesses.</li>
                      <li><strong>GIS locator integration</strong>: Mapping available hospitals, pediatric wards, and 24/7 emergency care facilities in the immediate area.</li>
                    </ul>

                    <div className="bg-red-50/60 dark:bg-red-950/10 border border-red-200/40 dark:border-red-900/30 p-4 rounded-xl text-red-750 dark:text-red-350 flex gap-2 mt-6">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold mb-0.5">{t.disclaimerHeader}:</h5>
                        <p className="leading-relaxed">
                          {t.disclaimerBody}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}

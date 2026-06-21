from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    role: str  # "user" or "model" / "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    location: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    context_used: Optional[str] = None
    sources: List[str] = []

class TravelPlannerRequest(BaseModel):
    origin: str
    destination: str
    travel_date: str
    travel_duration_days: int
    vaccine_history: List[str] = []

class TravelPlannerResponse(BaseModel):
    destination: str
    risk_level: str
    risk_score: float
    advisory: str
    checklist: List[str]
    recommendations: List[str]
    emergency_contacts: Dict[str, str]

class OutbreakDetail(BaseModel):
    disease_name: str
    cases: int
    deaths: int
    trend: str  # "increasing", "stable", "decreasing"
    risk_level: str  # "Low", "Medium", "High"
    description: str
    symptoms: List[str]
    transmission: str
    prevention: List[str]
    vaccine_available: bool
    what_to_do: str

class WeatherSummary(BaseModel):
    temp: float
    condition: str
    humidity: int
    wind_speed: float
    alert: Optional[str] = None

class LocationAdvisoryResponse(BaseModel):
    city: str
    country: str
    risk_level: str
    risk_score: float  # 0 to 10
    active_outbreaks: List[OutbreakDetail]
    weather: WeatherSummary
    emergency_contacts: Dict[str, str]
    lat: float
    lon: float

class HospitalDetail(BaseModel):
    name: str
    type: str  # "General Hospital", "Clinic", "Emergency Center", etc.
    distance_km: float
    address: str
    phone: str
    emergency_room: bool
    pediatric: bool
    lat: float
    lon: float

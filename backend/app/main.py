import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import os

from .models import (
    LocationAdvisoryResponse,
    HospitalDetail,
    ChatRequest,
    ChatResponse,
    TravelPlannerRequest,
    TravelPlannerResponse
)
from .services.disease import DiseaseService
from .services.hospital import HospitalService
from .services.gemini import GeminiService

app = FastAPI(
    title="Health Guardian AI API",
    description="Backend API for location-based infectious disease tracking, hospital locators, and travel advisories.",
    version="1.0.0"
)

# Configure CORS so our React frontend on port 5173 can make API requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development ease, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Health Guardian AI",
        "description": "Public health awareness assistant API"
    }

@app.get("/api/advisory", response_model=LocationAdvisoryResponse)
def get_location_advisory(city: str = Query(..., description="Name of the city to retrieve advisories for")):
    advisory = DiseaseService.get_location_advisory(city)
    if not advisory:
        raise HTTPException(status_code=404, detail=f"Advisory data for city '{city}' not found.")
    return advisory

@app.get("/api/diseases")
def search_diseases(q: Optional[str] = Query(None, description="Search term for diseases")):
    if q:
        return DiseaseService.search_disease(q)
    return DiseaseService.get_all_diseases()

@app.get("/api/hospitals", response_model=List[HospitalDetail])
async def get_nearby_hospitals(
    lat: float = Query(..., description="Latitude coordinate"),
    lon: float = Query(..., description="Longitude coordinate"),
    radius: float = Query(5000, description="Search radius in meters")
):
    hospitals = await HospitalService.get_nearby_hospitals(lat, lon, radius)
    return hospitals

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(payload: ChatRequest):
    # Formulate context for the LLM
    advisory = DiseaseService.get_location_advisory(payload.location)
    
    if advisory:
        active_names = [o.disease_name for o in advisory.active_outbreaks]
        context = (
            f"City: {advisory.city}, Country: {advisory.country}\n"
            f"Overall Risk Status: {advisory.risk_level} (Score: {advisory.risk_score}/10)\n"
            f"Active Outbreaks: {', '.join(active_names)}\n"
            f"Weather Condition: {advisory.weather.condition}, Temp: {advisory.weather.temp}°C, Humidity: {advisory.weather.humidity}%\n"
            f"Local Health Alert: {advisory.weather.alert}\n"
            f"Emergency Contacts: {advisory.emergency_contacts}\n"
        )
    else:
        context = f"Location: {payload.location}. No detailed outbreak data is currently registered in our database."

    result = await GeminiService.chat(
        message=payload.message,
        location_context=context,
        history=payload.history
    )
    return ChatResponse(**result)

@app.post("/api/travel-plan", response_model=TravelPlannerResponse)
async def generate_travel_plan(payload: TravelPlannerRequest):
    # Retrieve destination advisory
    advisory = DiseaseService.get_location_advisory(payload.destination)
    if not advisory:
        raise HTTPException(
            status_code=404, 
            detail=f"Could not retrieve outbreak advisory for destination '{payload.destination}'."
        )

    # Compile checklist and recommendations based on vaccines, duration, and local outbreaks
    checklist = [
        "Pack a customized health kit containing thermometer, face masks, and hand sanitizer.",
        "Check that routine immunizations are up to date (MMR, DTaP, Polio)."
    ]
    recommendations = []
    
    # Check for mosquito vector risks
    has_mosquito_risk = any(
        o.disease_name in ["Dengue", "Malaria", "Zika Virus", "Yellow Fever"] 
        for o in advisory.active_outbreaks
    )
    if has_mosquito_risk:
        checklist.append("Pack premium mosquito repellent containing DEET, Picaridin, or IR3535.")
        recommendations.append("Apply insect repellent multiple times daily, focusing on active vector periods.")
        
    has_malaria = any(o.disease_name == "Malaria" for o in advisory.active_outbreaks)
    if has_malaria:
        checklist.append("Consult travel health professional for Malaria chemoprophylaxis pills.")
        recommendations.append("Ensure sleep areas are screened or protected with insecticide-treated bed nets.")

    has_yellow_fever = any(o.disease_name == "Yellow Fever" for o in advisory.active_outbreaks)
    if has_yellow_fever:
        if "Yellow Fever" not in payload.vaccine_history:
            checklist.append("GET VACINATED: Yellow Fever vaccine is highly recommended (or mandatory) for entry.")
            recommendations.append("Obtain International Certificate of Vaccination (Yellow Card) at least 10 days before travel.")
        else:
            recommendations.append("Yellow Fever vaccine verified in vaccine history. Keep physical proof in your carry-on.")

    # Check for enteric (food/water) risks
    has_enteric_risk = any(
        o.disease_name in ["Cholera", "Typhoid Fever"] 
        for o in advisory.active_outbreaks
    )
    if has_enteric_risk:
        checklist.append("Pack water purification tablets or a portable water filter.")
        recommendations.append("Stick strictly to bottled or boiled water, and avoid uncooked foods, raw shellfish, and ice.")

    # General weather advisory
    if advisory.weather.alert:
        recommendations.append(f"Weather advisory: {advisory.weather.alert}")

    # Build custom travel advisory text
    risk_summary_text = (
        f"Travel Health Advisory for {advisory.city}, {advisory.country}. "
        f"The current public health risk is evaluated as {advisory.risk_level} (Risk Score: {advisory.risk_score}/10). "
        f"Main active infectious risks include: {', '.join([o.disease_name for o in advisory.active_outbreaks])}. "
        f"Please prepare preventive measures outlined in your customized checklist."
    )

    return TravelPlannerResponse(
        destination=advisory.city,
        risk_level=advisory.risk_level,
        risk_score=advisory.risk_score,
        advisory=risk_summary_text,
        checklist=checklist,
        recommendations=recommendations,
        emergency_contacts=advisory.emergency_contacts
    )

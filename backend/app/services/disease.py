import random
from typing import Dict, List, Optional
from ..models import OutbreakDetail, WeatherSummary, LocationAdvisoryResponse

# Pre-defined detailed disease data relevant globally
DISEASE_LIBRARY: Dict[str, Dict] = {
    "Dengue": {
        "description": "A mosquito-borne viral infection causing severe flu-like illness, primarily transmitted by Aedes aegypti mosquitoes. Highly active during and post-monsoon/rainy seasons across tropical and subtropical regions.",
        "symptoms": ["High fever", "Severe headache", "Pain behind the eyes", "Severe joint and muscle pain (breakbone fever)", "Nausea/vomiting", "Skin rash"],
        "transmission": "Bite of infected Aedes species mosquitoes, which breed in clean, standing water and are active mostly during the day.",
        "prevention": ["Use mosquito repellent (DEET/Picaridin)", "Wear full-sleeved shirts and long trousers", "Empty standing water from coolers, pots, and tires", "Install window meshes and use mosquito coils/nets"],
        "vaccine_available": False,
        "what_to_do": "Ensure complete rest, keep hydrated, and take paracetamol (acetaminophen) for fever. NEVER take aspirin, ibuprofen, or other NSAIDs, as they can cause severe internal bleeding. Seek immediate hospitalization if warning signs (abdominal pain, persistent vomiting, bleeding gums) develop."
    },
    "Malaria": {
        "description": "A life-threatening disease caused by plasmodium parasites transmitted through the bites of infected female Anopheles mosquitoes. Common in tropical and subtropical regions globally.",
        "symptoms": ["Cyclical high fever", "Chills and shivering", "Profuse sweating", "Headache", "Fatigue", "Muscle pain"],
        "transmission": "Bite of infected female Anopheles mosquitoes, which breed in dirty, stagnant pools and bite mostly between dusk and dawn.",
        "prevention": ["Use insecticide-treated bed nets", "Apply DEET mosquito repellent", "Take preventive anti-malarial medication if advised", "Clear standing pools and spray larvicides"],
        "vaccine_available": True,
        "what_to_do": "Go for a diagnostic blood smear or rapid diagnostic test immediately upon fever onset. Prompt clinical treatment with Artemisinin-based Combination Therapy (ACT) is vital to prevent progression to cerebral malaria."
    },
    "Chikungunya": {
        "description": "A viral disease transmitted to humans by infected mosquitoes. It causes high fever and severe, debilitating joint pain that can persist for months.",
        "symptoms": ["Sudden onset of fever", "Severe joint pain (typically hands/feet)", "Muscle pain", "Joint swelling", "Headache", "Rash"],
        "transmission": "Bite of infected Aedes aegypti and Aedes albopictus mosquitoes.",
        "prevention": ["Prevent mosquito breeding in municipal blocks", "Use personal mosquito barriers (repellents/nets)", "Wear light-colored clothing covering limbs"],
        "vaccine_available": True,
        "what_to_do": "No specific antiviral drug exists. Treatment focuses on symptom relief: hydration, rest, and paracetamol for joint pain and fever. Avoid NSAIDs until dengue is clinically ruled out."
    },
    "Cholera": {
        "description": "An acute diarrheal infection caused by ingestion of food or water contaminated with the bacterium Vibrio cholerae. Outbreaks often happen in flooded regions with compromised sanitation.",
        "symptoms": ["Sudden profuse watery diarrhea ('rice-water stools')", "Vomiting", "Severe muscle cramps", "Rapid dehydration", "Extreme thirst"],
        "transmission": "Ingestion of water or food contaminated with human feces containing the bacteria. Highly contagious.",
        "prevention": ["Drink only boiled, filtered, or bottled water", "Avoid raw, uncovered street foods", "Practice strict hand hygiene with soap before meals", "Receive oral cholera vaccination"],
        "vaccine_available": True,
        "what_to_do": "Initiate Oral Rehydration Salts (ORS) therapy immediately. Rehydration must start without delay to prevent hypovolemic shock. Seek emergency clinical care for intravenous fluids and antibiotics."
    },
    "Typhoid Fever": {
        "description": "A systemic bacterial infection caused by Salmonella Typhi, spreading through contaminated water and food. Widely endemic globally, especially in areas with poor food handling.",
        "symptoms": ["Sustained high fever", "Severe headache", "Stomach pain and constipation or diarrhea", "Weakness and lethargy", "Rose spots rash on chest"],
        "transmission": "Fecal-oral route through contaminated food handler vectors or drinking water reservoirs.",
        "prevention": ["Get vaccinated against Typhoid", "Eat freshly prepared hot food", "Drink clean, purified water", "Avoid ice cubes and unpeeled fruits from local vendors"],
        "vaccine_available": True,
        "what_to_do": "Consult a physician for blood culture tests. Typhoid requires prescription antibiotics. Complete the entire course even if fever goes down. Practice strict hand hygiene to avoid infecting others."
    },
    "Leptospirosis": {
        "description": "A bacterial disease contracted through contact with water or soil contaminated by urine of infected animals, primarily rodents. Outbreaks spike in waterlogged urban areas during rainy seasons.",
        "symptoms": ["High fever", "Severe headache and muscle pain (especially calves)", "Redness in eyes", "Abdominal pain", "Jaundice (yellow eyes/skin)"],
        "transmission": "Bacterial entry through cuts, eyes, or mouth during contact with floodwaters mixed with animal urine.",
        "prevention": ["Avoid wading in monsoon floodwaters", "Wear tall rubber boots and gloves if wading is unavoidable", "Wash hands and feet thoroughly with soap after outdoor exposure", "Control rodent infestation around houses"],
        "vaccine_available": False,
        "what_to_do": "Consult a doctor immediately. Leptospirosis can lead to kidney damage, meningitis, and liver failure if left untreated. Early treatment with antibiotics (such as doxycycline or penicillin) is highly effective."
    },
    "Tuberculosis (TB)": {
        "description": "A major public health challenge globally, caused by Mycobacterium tuberculosis. It primarily affects the lungs and spreads through airborne respiratory droplets.",
        "symptoms": ["Persistent cough for more than 2-3 weeks", "Coughing up blood (hemoptysis)", "Chest pain", "Fever (especially evening rise)", "Night sweats", "Unexplained weight loss"],
        "transmission": "Inhalation of microscopic droplets expelled when an active TB patient coughs, sneezes, or speaks.",
        "prevention": ["Ensure BCG vaccination for infants", "Maintain good ventilation in living quarters", "Practice cough etiquette (covering mouth)", "Avoid close prolonged contact with active untreated patients"],
        "vaccine_available": True,
        "what_to_do": "Get sputum testing and chest X-rays immediately if experiencing a chronic cough. Undergo free screening and multi-month DOTS treatment available via government health centers."
    },
    "Influenza": {
        "description": "A contagious viral respiratory disease spreading seasonally, peaking during winter months and rainy seasons globally.",
        "symptoms": ["Fever", "Dry cough", "Sore throat", "Runny or stuffy nose", "Body aches", "Headaches", "Fatigue"],
        "transmission": "Inhalation of respiratory droplets or touching virus-contaminated surfaces.",
        "prevention": ["Annual seasonal influenza vaccination", "Frequent handwashing with soap", "Avoid touching eyes/nose/mouth", "Cover mouth during coughs"],
        "vaccine_available": True,
        "what_to_do": "Rest, drink warm fluids, and take fever reducers. High-risk groups (pregnant women, elderly, asthmatics) should contact a doctor early for antiviral medication (e.g. Tamiflu)."
    }
}

# Global cities mock database
CITIES_DB = {
    "new delhi": {
        "city": "New Delhi",
        "country": "India",
        "risk_level": "Medium",
        "risk_score": 5.2,
        "lat": 28.6139,
        "lon": 77.2090,
        "emergency_contacts": {
            "National Emergency Helpline": "112",
            "Ambulance Service": "108 / 102",
            "Health Ministry Helpline": "104",
            "Delhi Police": "100"
        },
        "outbreaks": ["Dengue", "Tuberculosis (TB)", "Influenza"],
        "weather": {
            "temp": 34.5,
            "condition": "Humid / Dusty Wind",
            "humidity": 65,
            "wind_speed": 14.2,
            "alert": "Moderate Dengue vector counts detected. Seasonal respiratory advisories are in place. Keep hydrated, wash hands regularly, and prevent water stagnation in household flower pots."
        }
    },
    "mumbai": {
        "city": "Mumbai",
        "country": "India",
        "risk_level": "High",
        "risk_score": 8.4,
        "lat": 19.0760,
        "lon": 72.8777,
        "emergency_contacts": {
            "National Emergency Helpline": "112",
            "BMC Disaster Helpline": "1916",
            "Ambulance (CATs)": "108",
            "Infectious Disease Hotline": "104"
        },
        "outbreaks": ["Dengue", "Malaria", "Leptospirosis", "Typhoid Fever"],
        "weather": {
            "temp": 29.0,
            "condition": "Heavy Monsoon Rains",
            "humidity": 94,
            "wind_speed": 24.5,
            "alert": "ACTIVE MONSOON HAZARD: Severe waterlogging reported in low-lying coastal corridors. High risk of Leptospirosis infection from walking in floodwaters. Active malaria and dengue breeding indicators have peaked. Avoid raw street snacks and wade only with protective gear."
        }
    },
    "bengaluru": {
        "city": "Bengaluru",
        "country": "India",
        "risk_level": "Low",
        "risk_score": 2.2,
        "lat": 12.9716,
        "lon": 77.5946,
        "emergency_contacts": {
            "National Emergency": "112",
            "Ambulance (108 CATS)": "108",
            "Karnataka Health Line": "104",
            "City Police": "100"
        },
        "outbreaks": ["Influenza", "Tuberculosis (TB)"],
        "weather": {
            "temp": 24.5,
            "condition": "Cool Breeze",
            "humidity": 55,
            "wind_speed": 12.0,
            "alert": "Low risk levels. Pleasant weather. Standard respiratory precautions are suggested in crowded metro compartments during morning peak hours."
        }
    },
    "kolkata": {
        "city": "Kolkata",
        "country": "India",
        "risk_level": "High",
        "risk_score": 7.3,
        "lat": 22.5726,
        "lon": 88.3639,
        "emergency_contacts": {
            "National Emergency": "112",
            "Ambulance Line": "102 / 108",
            "WB Health Care Support": "1800-313-444-222",
            "Kolkata Police": "100"
        },
        "outbreaks": ["Dengue", "Cholera", "Chikungunya"],
        "weather": {
            "temp": 31.8,
            "condition": "Hot and Humid Showers",
            "humidity": 88,
            "wind_speed": 10.5,
            "alert": "Sporadic monsoonal showers have led to drainage blockages, raising Cholera risk indices. Mosquito density is high. Drink only filtered/boiled water and apply DEET repellents."
        }
    },
    "chennai": {
        "city": "Chennai",
        "country": "India",
        "risk_level": "Medium",
        "risk_score": 5.9,
        "lat": 13.0827,
        "lon": 80.2707,
        "emergency_contacts": {
            "National Emergency Helpline": "112",
            "Ambulance (CATS)": "108",
            "TN Health Support Line": "104",
            "City Police": "100"
        },
        "outbreaks": ["Chikungunya", "Dengue", "Typhoid Fever"],
        "weather": {
            "temp": 33.2,
            "condition": "Humid Coastal Fog",
            "humidity": 78,
            "wind_speed": 15.0,
            "alert": "Sporadic tropical rainfall has prompted municipal vector control sweeps. Avoid water logging near air conditioning drainage ducts and wear protective garments."
        }
    },
    "hyderabad": {
        "city": "Hyderabad",
        "country": "India",
        "risk_level": "Low",
        "risk_score": 2.9,
        "lat": 17.3850,
        "lon": 78.4867,
        "emergency_contacts": {
            "National Emergency": "112",
            "Ambulance Services": "108",
            "Telangana Health Advisor": "104"
        },
        "outbreaks": ["Typhoid Fever", "Influenza"],
        "weather": {
            "temp": 30.5,
            "condition": "Dry and Sunny",
            "humidity": 45,
            "wind_speed": 11.0,
            "alert": "Low risk profile. High heat index. Ensure drinking water is from certified RO/bottled sources to rule out enteric typhoid risks."
        }
    },
    "kochi": {
        "city": "Kochi",
        "country": "India",
        "risk_level": "Medium",
        "risk_score": 4.8,
        "lat": 9.9312,
        "lon": 76.2673,
        "emergency_contacts": {
            "Emergency Services": "112",
            "Ambulance Helpline": "108",
            "Kerala Disha Health": "1056"
        },
        "outbreaks": ["Dengue", "Typhoid Fever"],
        "weather": {
            "temp": 28.5,
            "condition": "Overcast Monsoon",
            "humidity": 92,
            "wind_speed": 18.0,
            "alert": "Active Southwest monsoon showers are generating localized pooling. Practice standard mosquito protection and take hydration measures."
        }
    },
    "jaipur": {
        "city": "Jaipur",
        "country": "India",
        "risk_level": "Low",
        "risk_score": 3.4,
        "lat": 26.9124,
        "lon": 75.7873,
        "emergency_contacts": {
            "National Emergency": "112",
            "Ambulance Line": "108",
            "Rajasthan Health Service": "104"
        },
        "outbreaks": ["Typhoid Fever", "Influenza"],
        "weather": {
            "temp": 38.0,
            "condition": "Hot and Dry",
            "humidity": 28,
            "wind_speed": 16.0,
            "alert": "High summer temperatures. Drink only safe fluids. Avoid raw salads or street food items from exposed pushcarts to avoid Typhoid."
        }
    },
    "goa": {
        "city": "Goa",
        "country": "India",
        "risk_level": "Medium",
        "risk_score": 4.5,
        "lat": 15.2993,
        "lon": 74.1240,
        "emergency_contacts": {
            "National Emergency Helpline": "112",
            "GMC Hospital Emergency": "0832-2458727",
            "Ambulance CATs": "108"
        },
        "outbreaks": ["Dengue", "Influenza"],
        "weather": {
            "temp": 30.0,
            "condition": "Tropical Sea Breeze",
            "humidity": 80,
            "wind_speed": 13.5,
            "alert": "Humidity is conducive for vector flight activity. Tourist resorts are advised to clear stagnant rainwater pools from garden borders."
        }
    },
    "srinagar": {
        "city": "Srinagar",
        "country": "India",
        "risk_level": "Low",
        "risk_score": 1.5,
        "lat": 34.0837,
        "lon": 74.7973,
        "emergency_contacts": {
            "National Emergency": "112",
            "Ambulance CATS Line": "108",
            "Srinagar Police": "100"
        },
        "outbreaks": ["Influenza"],
        "weather": {
            "temp": 15.0,
            "condition": "Cool and Overcast",
            "humidity": 60,
            "wind_speed": 9.0,
            "alert": "Cold temperatures drive social activities indoors. Protect against seasonal influenza by taking general hygiene precautions."
        }
    },
    "new york": {
        "city": "New York",
        "country": "United States",
        "risk_level": "Low",
        "risk_score": 1.8,
        "lat": 40.7128,
        "lon": -74.0060,
        "emergency_contacts": {
            "Emergency Services": "911",
            "NYC Health Dept Helpline": "311",
            "Poison Control Center": "1-800-222-1222"
        },
        "outbreaks": ["Influenza"],
        "weather": {
            "temp": 22.0,
            "condition": "Clear Sky",
            "humidity": 50,
            "wind_speed": 10.5,
            "alert": "Low risk profile. Standard seasonal respiratory precautions are suggested in crowded indoor spaces."
        }
    },
    "london": {
        "city": "London",
        "country": "United Kingdom",
        "risk_level": "Low",
        "risk_score": 1.9,
        "lat": 51.5074,
        "lon": -0.1278,
        "emergency_contacts": {
            "Emergency Services": "999 / 112",
            "NHS Health Advisory": "111"
        },
        "outbreaks": ["Influenza"],
        "weather": {
            "temp": 18.0,
            "condition": "Partly Cloudy",
            "humidity": 62,
            "wind_speed": 12.0,
            "alert": "Mild seasonal virus activity. Observe standard hygiene protocols."
        }
    },
    "tokyo": {
        "city": "Tokyo",
        "country": "Japan",
        "risk_level": "Low",
        "risk_score": 1.4,
        "lat": 35.6762,
        "lon": 139.6503,
        "emergency_contacts": {
            "Fire & Ambulance": "119",
            "Police Department": "110"
        },
        "outbreaks": ["Influenza"],
        "weather": {
            "temp": 26.5,
            "condition": "Humid / Warm",
            "humidity": 70,
            "wind_speed": 8.5,
            "alert": "Low threat level. Hand sanitizing stations are widely available."
        }
    },
    "sydney": {
        "city": "Sydney",
        "country": "Australia",
        "risk_level": "Low",
        "risk_score": 1.6,
        "lat": -33.8688,
        "lon": 151.2093,
        "emergency_contacts": {
            "Emergency Services": "000",
            "Healthdirect Line": "1800 022 222"
        },
        "outbreaks": ["Influenza"],
        "weather": {
            "temp": 16.0,
            "condition": "Cool / Clear",
            "humidity": 55,
            "wind_speed": 15.0,
            "alert": "Standard winter influenza season. Vaccinations are recommended."
        }
    },
    "cairo": {
        "city": "Cairo",
        "country": "Egypt",
        "risk_level": "Medium",
        "risk_score": 4.1,
        "lat": 30.0444,
        "lon": 31.2357,
        "emergency_contacts": {
            "Emergency Ambulance": "123",
            "Tourist Police": "126"
        },
        "outbreaks": ["Typhoid Fever", "Influenza"],
        "weather": {
            "temp": 32.0,
            "condition": "Sunny and Dusty",
            "humidity": 40,
            "wind_speed": 11.5,
            "alert": "Moderate risk of foodborne illnesses in summer. Stick to bottled water and hot, freshly prepared foods."
        }
    },
    "rio de janeiro": {
        "city": "Rio de Janeiro",
        "country": "Brazil",
        "risk_level": "Medium",
        "risk_score": 5.4,
        "lat": -22.9068,
        "lon": -43.1729,
        "emergency_contacts": {
            "Ambulance (SAMU)": "192",
            "Police Department": "190"
        },
        "outbreaks": ["Dengue", "Influenza"],
        "weather": {
            "temp": 27.0,
            "condition": "Warm and Showery",
            "humidity": 82,
            "wind_speed": 9.5,
            "alert": "Increased Dengue mosquito breeding activity reported. Wear repellents during outdoor activities."
        }
    },
    "bangkok": {
        "city": "Bangkok",
        "country": "Thailand",
        "risk_level": "Medium",
        "risk_score": 5.8,
        "lat": 13.7563,
        "lon": 100.5018,
        "emergency_contacts": {
            "Ambulance & Rescue": "1669",
            "Tourist Police": "1155"
        },
        "outbreaks": ["Dengue", "Typhoid Fever", "Influenza"],
        "weather": {
            "temp": 30.5,
            "condition": "Tropical Rains",
            "humidity": 85,
            "wind_speed": 12.0,
            "alert": "Heavy rains increase standing water and mosquito breeding. Enteric disease precautions advised."
        }
    },
    "nairobi": {
        "city": "Nairobi",
        "country": "Kenya",
        "risk_level": "High",
        "risk_score": 7.8,
        "lat": -1.2921,
        "lon": 36.8219,
        "emergency_contacts": {
            "Emergency Ambulance": "999 / 112",
            "Red Cross Hotline": "1501"
        },
        "outbreaks": ["Malaria", "Cholera", "Typhoid Fever"],
        "weather": {
            "temp": 21.0,
            "condition": "Overcast",
            "humidity": 75,
            "wind_speed": 10.0,
            "alert": "Cholera alerts in informal sectors. Malaria prophylaxis recommended. Consume only safe, purified drinking water."
        }
    }
}

class DiseaseService:
    @classmethod
    def get_all_diseases(cls) -> Dict[str, Dict]:
        return DISEASE_LIBRARY

    @classmethod
    def search_disease(cls, query: str) -> List[Dict]:
        query = query.lower()
        results = []
        for name, details in DISEASE_LIBRARY.items():
            if (query in name.lower()) or (query in details["description"].lower()) or any(query in sym.lower() for sym in details["symptoms"]):
                results.append({"name": name, **details})
        return results

    @classmethod
    def get_location_advisory(cls, city_name: str) -> Optional[LocationAdvisoryResponse]:
        city_key = city_name.lower().strip()
        if city_key not in CITIES_DB:
            # Search by prefix or substring if exact match fails
            matched_key = None
            for key in CITIES_DB.keys():
                if key in city_key or city_key in key:
                    matched_key = key
                    break
            if matched_key:
                city_key = matched_key
            else:
                # Generate dynamic advisory for unknown location (defaults to a safe Indian context)
                return cls._generate_dynamic_advisory(city_name)

        data = CITIES_DB[city_key]
        active_outbreaks = []
        for disease_name in data["outbreaks"]:
            lib_info = DISEASE_LIBRARY.get(disease_name, {})
            # Mock case statistics realistically based on risk level
            cases = random.randint(300, 2500) if data["risk_level"] == "High" else random.randint(10, 150)
            deaths = int(cases * random.uniform(0.003, 0.015))
            trend = random.choice(["increasing", "stable", "decreasing"]) if cases > 100 else "stable"
            active_outbreaks.append(
                OutbreakDetail(
                    disease_name=disease_name,
                    cases=cases,
                    deaths=deaths,
                    trend=trend,
                    risk_level=data["risk_level"],
                    description=lib_info.get("description", ""),
                    symptoms=lib_info.get("symptoms", []),
                    transmission=lib_info.get("transmission", ""),
                    prevention=lib_info.get("prevention", []),
                    vaccine_available=lib_info.get("vaccine_available", False),
                    what_to_do=lib_info.get("what_to_do", "")
                )
            )

        return LocationAdvisoryResponse(
            city=data["city"],
            country=data["country"],
            risk_level=data["risk_level"],
            risk_score=data["risk_score"],
            active_outbreaks=active_outbreaks,
            weather=WeatherSummary(**data["weather"]),
            emergency_contacts=data["emergency_contacts"],
            lat=data["lat"],
            lon=data["lon"]
        )

    @classmethod
    def _generate_dynamic_advisory(cls, city_name: str) -> LocationAdvisoryResponse:
        cleaned_name = city_name.strip().title()
        
        # Determine coordinate offsets around global latitudes and longitudes
        lat = round(random.uniform(-40.0, 60.0), 4)
        lon = round(random.uniform(-120.0, 140.0), 4)
        
        risk_level = random.choice(["Low", "Medium"])
        risk_score = round(random.uniform(1.2, 4.8), 1)
        
        # Default fallback outbreaks
        disease_name = "Influenza"
        lib_info = DISEASE_LIBRARY[disease_name]
        
        active_outbreaks = [
            OutbreakDetail(
                disease_name=disease_name,
                cases=random.randint(15, 150),
                deaths=0,
                trend="stable",
                risk_level=risk_level,
                description=lib_info["description"],
                symptoms=lib_info["symptoms"],
                transmission=lib_info["transmission"],
                prevention=lib_info["prevention"],
                vaccine_available=lib_info["vaccine_available"],
                what_to_do=lib_info["what_to_do"]
            )
        ]
        
        return LocationAdvisoryResponse(
            city=cleaned_name,
            country="Global Region",
            risk_level=risk_level,
            risk_score=risk_score,
            active_outbreaks=active_outbreaks,
            weather=WeatherSummary(
                temp=24.0,
                condition="Standard Regional Weather",
                humidity=55,
                wind_speed=12.0,
                alert="Routine local healthcare parameters. Keep vaccinations updated and observe local health warnings."
            ),
            emergency_contacts={
                "Emergency Line": "112 / 911",
                "Local Health Agency": "Consult local guide"
            },
            lat=lat,
            lon=lon
        )

import google.generativeai as genai
from typing import List, Dict, Optional
from ..config import settings
from ..models import ChatMessage

# System Instructions to ensure the AI behaves strictly as a public health advisor and avoids diagnoses.
SYSTEM_INSTRUCTION = """
You are Health Guardian AI, an intelligent, professional public health assistant. Your goal is to keep travelers and local residents informed about infectious disease risks and safety measures.

CRITICAL CLINICAL RULES:
1. DO NOT PROVIDE MEDICAL DIAGNOSES. If the user presents symptoms, explain what diseases share these symptoms and guide them to a medical professional.
2. ALWAYS INCLUDE A MEDICAL DISCLAIMER. Ensure you clearly state that you are an AI assistant, not a doctor, and this is not professional medical advice.
3. ADVISE PREVENTIVE MEASURES. Focus on vector controls, vaccines, sanitation, food safety, and travel hygiene.
4. CITE TRUSTED SOURCES. Reference health organizations like the World Health Organization (WHO), Centers for Disease Control and Prevention (CDC), and local Ministries of Health.
5. BE CONCISE AND ACCURATE. Keep answers structured, highly readable, and professional.
6. TARGET SPECIFIC ADVISORIES. If the user is asking about a location, reference the active outbreak profile provided in the context.
7. RED FLAGS. If symptoms seem severe (e.g. difficulty breathing, persistent chest pain, severe bleeding, altered consciousness, high fever with stiff neck, rice-water stools with severe dehydration), tell them to seek IMMEDIATE emergency medical assistance.
"""

class GeminiService:
    _is_configured = False
    
    @classmethod
    def _initialize(cls):
        if not cls._is_configured:
            api_key = settings.GEMINI_API_KEY
            if api_key and api_key.strip() and not api_key.startswith("your_"):
                try:
                    genai.configure(api_key=api_key)
                    cls._is_configured = True
                    print("Google Gemini API successfully configured.")
                except Exception as e:
                    print(f"Error configuring Google Gemini API: {e}. Falling back to simulation mode.")
                    cls._is_configured = False
            else:
                print("No valid GEMINI_API_KEY found. Health Guardian AI is running in high-fidelity SIMULATION mode.")
                cls._is_configured = False
                
    @classmethod
    async def chat(cls, message: str, location_context: str, history: List[ChatMessage]) -> Dict:
        cls._initialize()
        
        # Build Context Prompt
        context_prompt = f"User's Current Location Context:\n{location_context}\n\nUser Question:\n{message}\n"
        
        if cls._is_configured:
            try:
                # Configure the model
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=SYSTEM_INSTRUCTION
                )
                
                # Format history for Gemini
                contents = []
                for msg in history:
                    role = "user" if msg.role == "user" else "model"
                    contents.append({"role": role, "parts": [msg.content]})
                    
                # Append current context-loaded user prompt
                contents.append({"role": "user", "parts": [context_prompt]})
                
                # Generate Content
                # We use a standard event-loop friendly run in executor, or sync call (since SDK is synchronous)
                # But it's small, so we can call it directly
                response = model.generate_content(contents)
                
                return {
                    "reply": response.text,
                    "context_used": location_context,
                    "sources": ["Google Gemini (gemini-1.5-flash)", "WHO", "CDC"]
                }
            except Exception as e:
                print(f"Gemini API generation failed: {e}. Defaulting to simulator mode.")
                # Fall through to simulation if API call fails
                
        # High-Fidelity Simulation Mode
        return cls._generate_simulated_reply(message, location_context)

    @classmethod
    def _generate_simulated_reply(cls, message: str, location_context: str) -> Dict:
        msg_lower = message.lower()
        
        # Standard warning/disclaimer footer
        disclaimer = "\n\n*Disclaimer: I am an AI Public Health Assistant, not a medical doctor. This information is for awareness purposes based on guidelines from the WHO and CDC. If you are experiencing symptoms, please consult a healthcare professional immediately.*"
        
        # Identify location
        loc_name = "your location"
        if "bangkok" in location_context.lower():
            loc_name = "Bangkok, Thailand"
        elif "nairobi" in location_context.lower():
            loc_name = "Nairobi, Kenya"
        elif "rio" in location_context.lower():
            loc_name = "Rio de Janeiro, Brazil"
        elif "mumbai" in location_context.lower():
            loc_name = "Mumbai, India"
            
        # Context extraction helper
        outbreaks = []
        if "dengue" in location_context.lower():
            outbreaks.append("Dengue")
        if "malaria" in location_context.lower():
            outbreaks.append("Malaria")
        if "cholera" in location_context.lower():
            outbreaks.append("Cholera")
        if "zika" in location_context.lower():
            outbreaks.append("Zika Virus")
        if "typhoid" in location_context.lower():
            outbreaks.append("Typhoid Fever")
        if "covid" in location_context.lower():
            outbreaks.append("COVID-19")
            
        # Determine simulated response based on user keywords
        if "symptom" in msg_lower or "sick" in msg_lower or "fever" in msg_lower or "cough" in msg_lower:
            reply = (
                "Based on the symptoms you've mentioned, here is a public health analysis:\n\n"
                "1. **Common Disease Matches**: Fever, chills, and body aches are shared symptoms for several diseases currently monitored in your area, including **" + ", ".join(outbreaks if outbreaks else ["Influenza", "COVID-19"]) + "**.\n"
                "2. **Transmission & Risks**: Mosquito-borne diseases (Dengue/Malaria) are spreading due to local weather conditions. Waterborne diseases like Cholera spread through contaminated fluids.\n"
                "3. **What You Should Do**:\n"
                "   - **Seek Diagnosis**: Get a rapid diagnostic blood test (for malaria/dengue) or a swab test (for COVID-19/Flu) at a nearby clinic.\n"
                "   - **Hydration**: Drink plenty of fluids (ideally oral rehydration solutions). Avoid self-medicating with aspirin or ibuprofen until Dengue is ruled out, as these can exacerbate bleeding risks.\n\n"
                "⚠️ **RED FLAGS**: If you experience difficulty breathing, persistent chest pain, severe vomiting, or bleeding (nose/gums), please go to the nearest emergency hospital immediately."
            )
        elif "prevent" in msg_lower or "protect" in msg_lower or "vaccine" in msg_lower or "dengue" in msg_lower or "malaria" in msg_lower:
            reply = (
                "To prevent contracting the primary infectious diseases active in this area, public health agencies recommend these measures:\n\n"
                "1. **Mosquito Vector Prevention (Dengue, Malaria, Zika)**:\n"
                "   - Apply insect repellents containing at least 20-30% DEET, Picaridin, or IR3535 on exposed skin.\n"
                "   - Wear long-sleeved shirts, long trousers, and socks, especially at dawn and dusk.\n"
                "   - Sleep under insecticide-treated bed nets if staying in non-air-conditioned rooms.\n"
                "2. **Water & Food Safety (Cholera, Typhoid)**:\n"
                "   - Stick to the golden rule: 'Boil it, cook it, peel it, or forget it.'\n"
                "   - Avoid raw seafood, street food, ice cubes in drinks, and tap water.\n"
                "3. **Vaccinations**: Ensure routine immunizations are up to date, and consider specific travel vaccines (e.g. Yellow Fever, Typhoid) at least 2 weeks before arrival."
            )
        elif "safe to travel" in msg_lower or "is it safe" in msg_lower or "risk" in msg_lower:
            risk_level = "Medium"
            if "high" in location_context.lower():
                risk_level = "High"
            elif "low" in location_context.lower():
                risk_level = "Low"
                
            reply = (
                "Regarding travel safety for **" + loc_name + "**:\n\n"
                "The current public health alert status is **" + risk_level + "**. "
                "Travel is generally safe, provided you take target precautions against the active outbreaks in the region:\n\n"
                "• **Current Outbreaks**: " + (", ".join(outbreaks) if outbreaks else "Standard seasonal viruses only") + ".\n"
                "• **Environmental Factors**: Local weather patterns indicate increased activity for vectors/waterborne pathogens.\n"
                "• **Recommendations**: Pack a health kit with insect repellent, oral rehydration salts, and hand sanitizers. Consult your travel clinic regarding chemoprophylaxis (e.g., for Malaria) if visiting rural districts."
            )
        else:
            reply = (
                "Hello! As your Health Guardian public health assistant, I'm analyzing the advisories for **" + loc_name + "**.\n\n"
                "Here's what you need to know about the current environment:\n"
                "• **Active Risks**: " + (", ".join(outbreaks) if outbreaks else "No critical outbreaks reported") + ".\n"
                "• **Precaution Guidelines**: Keep updated on travel vaccinations, practice standard food/water hygiene, and protect yourself from mosquito bites.\n\n"
                "Please let me know if you have specific questions about travel safety, preventive steps, or what to do if you feel unwell!"
            )
            
        return {
            "reply": reply + disclaimer,
            "context_used": location_context,
            "sources": ["Health Guardian Local Clinical Expert Simulator", "CDC Travel Health guidelines", "WHO Disease Outbreak News"]
        }

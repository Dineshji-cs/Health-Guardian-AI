# Health Guardian AI 🛡️

**Health Guardian AI** is a professional-grade public health awareness assistant designed for residents and travelers globally. It detects active location risks, presents local disease outbreaks on dynamic map overlays, schedules preventative travel guides, and queries nearby hospital coordinates.

It is built to operate under severe vector-borne and waterborne risks (such as Dengue, Malaria, Leptospirosis, Typhoid, Chikungunya, and TB) and provides instant multilingual support including English and Hindi.

---

## App Workflow Diagram

Here is the operational logic of the Health Guardian AI assistant system:

![Health Guardian AI Public Health Workflow](workflow.png)

---

## Key Features

1. **Epidemic & Outbreak Monitoring**: Tracks regional disease outbreaks (like Dengue and Malaria, as well as Leptospirosis and Chikungunya).
2. **AI Public Health Assistant**: Conversational agent powered by the **Google Gemini API** (`gemini-1.5-flash`) delivering location-sensitive prevention recommendations and clinical guidelines. Includes a high-fidelity local simulator for offline testing.
3. **Multilingual Interface**: Bilingual translation toggle in **English** and **Hindi (हिंदी)** for local public health accessibility.
4. **GIS Hospital Locator**: Real-time hospital lookup using the **OpenStreetMap Overpass API** with custom maps showing 24/7 emergency rooms and pediatric clinics.
5. **Interactive Outbreak Maps**: Visualizes circular outbreak risk ranges and active cases using **Leaflet.js** maps.
6. **Travel Health Advisor**: Generates custom preventative checklists (vaccine check logs, DEET repellents, water purification) relative to destination risks.
7. **Emergency Helpline Numbers**: Regional emergency numbers active in various countries and locations.

---

## Tech Stack

* **Backend**: FastAPI (Python 3.12+), Pydantic Settings, HTTPX, google-generativeai.
* **Frontend**: React (TypeScript), Vite, Tailwind CSS, Leaflet Maps, Lucide Icons.
* **LLM Engine**: Google Gemini (`gemini-1.5-flash`).

---

## Getting Started

### Prerequisites
* **Node.js** v20.19+ or v22.12+
* **Python** 3.10+
* **Gemini API Key** (optional, fallback simulator is active)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Copy `.env` to the project root and add your key:
   ```env
   GEMINI_API_KEY=your_google_gemini_key
   PORT=8000
   HOST=127.0.0.1
   ```
4. Run the development server:
   ```bash
   python run.py
   ```
   The backend starts on `http://127.0.0.1:8000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React server:
   ```bash
   npm run dev
   ```
   Open the browser at `http://localhost:5173`.

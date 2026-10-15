# FarmWise AI - Smart Farming System

FarmWise AI is an advanced agricultural intelligence platform designed to empower farmers with data-driven insights. It utilizes the Google Gemini AI to provide crop recommendations, disease diagnostics, and regional market analysis.

## Features

- **Regional Intelligence Dashboard**: Real-time monitoring of soil health, moisture levels, and pathogen threats.
- **AI Crop Planning**: Intelligent recommendations based on soil parameters (N, P, K, pH) and seasonal trends.
- **Disease Diagnostics**: Computer vision-powered analysis of plant leaf images to identify diseases and suggest treatments.
- **Market Pulse**: Regional market sentiment analysis and crop price trend monitoring.
- **Academic Context**: Documentation of the project's technical architecture and research team.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Framer Motion.
- **Backend**: Node.js, Express.
- **AI Engine**: Google Gemini AI (Generative AI SDK).
- **Icons**: Lucide React.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Setup

1. **Clone the project** and navigate to the directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Configuration**:
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
4. **Run the Application**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Location and Soil Data (Crop Planning)

### Locations: Local Government Directory (LGD)
State → District → Sub-district (Mandal/Taluka/Tehsil) → Village lists come from the official
[Local Government Directory](https://lgdirectory.gov.in) (Ministry of Panchayati Raj). They are
served from a complete local snapshot in `data/lgd/`, so the dropdowns work even when LGD is slow
or rate-limiting.

Refresh the snapshot (e.g. after new districts are created or places are renamed):

```bash
npm run lgd:sync              # all states (~1.5 h; LGD allows ~100 requests/minute)
npm run lgd:sync -- 28 36     # only the given LGD state codes
npm run lgd:sync -- --force   # refetch states already in the snapshot
```

An interrupted sync resumes where it stopped. Restart the server after a sync. If the snapshot is
missing, the server falls back to LGD's live web service.

### Soil: Soil Health Card portal
When a district or village is selected, the server looks up government soil-test results from the
[Soil Health Card portal](https://soilhealth.dac.gov.in) using LGD codes (village → block →
district fallback). The portal publishes, per area and testing cycle, how many lab-tested samples
were rated Low/Medium/High for available N, P, K and Acidic/Neutral/Alkaline for pH. It does not
publish numeric averages, so the app shows these ratings (labelled as a location-based estimate,
with sample count, cycle, date and level) and never invents kg/ha numbers. Farmers can optionally
enter values from their own soil test report.

The portal's data service is public but not a documented API; if it is unavailable, the page says
so and the recommendation uses location and season only.

### Market prices: AGMARKNET (no API key needed)
Market Pulse shows daily wholesale (mandi) prices from AGMARKNET, Ministry of Agriculture & Farmers
Welfare. Without any key it combines two free sources:

| Source | States | Freshness |
|---|---|---|
| Mandi Price API (community mirror of data.gov.in) | Maharashtra, UP, Punjab, MP, Karnataka | usually 1-2 days |
| Open GitHub archive `herrrickshaw/agri-commodity-tracker` | ~30 reporting states/UTs | can lag by weeks |

Neither is an official government service; the page always shows the source and how old the
prices are. The archive (about 50 MB CSV) is downloaded only when it changes, processed into
`data/market/`, and re-checked every 6 hours. Refresh it manually with `npm run market:sync`.

Optional: a personal key from https://data.gov.in (`DATA_GOV_IN_API_KEY` in `.env`) gives fresh,
official prices for every state. The sample key printed in data.gov.in's docs does not work.
Agmarknet's own API now requires a captcha and is not used.

## Project Structure

- `/src/components`: UI components (Dashboard, CropPlanning, Diagnostics, etc.)
- `/src/services`: API service layers (Gemini integration)
- `/server.ts`: Express backend server
- `/src/App.tsx`: Main application router

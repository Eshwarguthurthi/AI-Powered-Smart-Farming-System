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

## Project Structure

- `/src/components`: UI components (Dashboard, CropPlanning, Diagnostics, etc.)
- `/src/services`: API service layers (Gemini integration)
- `/server.ts`: Express backend server
- `/src/App.tsx`: Main application router

## Academic Credits

- **Project Name**: AI-Powered Smart Farming System
- **Research Team**: G. Eshwar Prasad, G. Vijitha
- **Supervisor**: Dr. C. Edwin Singh, M.E., Ph.D.
- **Institution**: Major Project 2025-26

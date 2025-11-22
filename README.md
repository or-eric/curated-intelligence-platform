# Curated Intelligence Platform

A sophisticated intelligence platform designed for C-suite executives, providing AI-curated insights on AI, Technology, Security, and Governance.

## Overview

This platform ingests content from high-value sources (RSS, Web), uses Google's Gemini 1.5 Flash to analyze and score it, and presents it in a premium, executive-friendly dashboard.

### Key Features

*   **AI-Powered Curation**: Automatically scores content (0-100) based on Insight Density, Strategic Alignment, and more.
*   **Executive Summaries**: Generates "Bottom Line Up Front" summaries and strategic implications.
*   **C-Suite Lessons**: Extracts actionable best practices and governance requirements for specific roles (CISO, CAIO, etc.).
*   **Dynamic Filtering**: Filter by specific domains (AI, Geopolitics, etc.) and set a "Quality Threshold" to cut through the noise.
*   **Rich Analysis**: Detailed breakdown of scoring metrics and metadata.

## Tech Stack

*   **Frontend**: Angular 17+, TailwindCSS
*   **Backend**: Node.js, TypeScript
*   **Database**: Neon (Serverless Postgres)
*   **AI**: Google Gemini API
*   **Deployment**: Vercel

## Setup & Development

### Prerequisites

*   Node.js (v18+)
*   PostgreSQL (Neon)
*   Google Gemini API Key

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables in `.env`:
    ```env
    POSTGRES_URL="your_neon_db_url"
    GEMINI_API_KEY="your_gemini_key"
    ```

### Running Locally

1.  **Start the Backend & Frontend**:
    ```bash
    npm start
    ```
    This runs the local API server (port 3001) and the Angular dev server (port 4200) with proxy configuration.

2.  **Run the Ingestion Pipeline**:
    ```bash
    npx tsx scripts/run-pipeline.ts
    ```

## Project Structure

*   `src/app`: Angular Frontend
*   `src/backend`: Backend Logic (Workflows, Services)
*   `scripts`: Utility scripts (Ingestion, Debugging)
*   `api`: Vercel Serverless Functions

## License

Proprietary.

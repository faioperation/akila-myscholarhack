# MyScholarHack - AI-Powered Scholarship Platform

An enterprise-grade scholarship platform designed to dynamically fetch and match scholarships to student profiles, with built-in AI agents for automated scholarship recommendation, essay matching, and comprehensive essay evaluation using RAG (Retrieval-Augmented Generation).

---

## 🚀 Features

- **Profile-Driven Recommendations**: Uses LLM agents (`gpt-4o-mini`) to analyze student majors, education level, achievements, and interests against available scholarships.
- **Smart Web Scraping Engine**: Automatically harvests and filters scholarship listings using Puppeteer with stealth plugins and Cheerio.
- **AI Essay Generation & Editing**: Features step-by-step section generation (Introduction, Challenge, Action, Growth, Future Goals) with a RAG system ensuring high-quality advice and facts constraints.
- **Essay Comparison**: Dynamically assesses two essays against a scoring rubric to determine strengths, areas of improvement, and matching ratios.
- **Real-Time Notification Gateways**: Uses Socket.io to push real-time alerts.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js v15.2.3 (React 19)
- **Styling**: Tailwind CSS v4.0 & PostCSS
- **Data Fetching**: TanStack React Query v5

### Backend
- **Framework**: Node.js & Express
- **Database / ORM**: PostgreSQL via Prisma ORM
- **Cache**: Redis

### AI Agent Service
- **Orchestration**: Express API
- **AI Models**: OpenAI GPT-4o-mini & Whisper-1
- **Scraper**: Headless Puppeteer with Stealth Plugin

---

## 🐳 Docker Deployment

The platform is fully containerized for production and development.

### Start in Development (Hot Reloading Enabled)
1. Copy the `.env.example` templates in `/backend` and `/ai` to `.env` files.
2. Run:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Start in Production
Configure the root `.env` values and run:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## 📂 Architecture & Audits

For deeper architectural breakdowns, security profiles, API structures, and deployment guides, please reference our generated reports:
- [Project Audit & Architecture Report](file:///C:/Users/Night%20Shift/.gemini/antigravity-ide/brain/cd07ee6c-6495-4696-bce5-27d4ba37e0b6/project_audit_report.md)
- [API Documentation](file:///C:/Users/Night%20Shift/.gemini/antigravity-ide/brain/cd07ee6c-6495-4696-bce5-27d4ba37e0b6/api_documentation.md)
- [Production Operations & Deployment Guide](file:///C:/Users/Night%20Shift/.gemini/antigravity-ide/brain/cd07ee6c-6495-4696-bce5-27d4ba37e0b6/deployment_guide.md)
- [Walkthrough & Setup Checklist](file:///C:/Users/Night%20Shift/.gemini/antigravity-ide/brain/cd07ee6c-6495-4696-bce5-27d4ba37e0b6/walkthrough.md)

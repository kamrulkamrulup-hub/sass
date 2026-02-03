
# OpsPilot | Enterprise Operations Hub

Production-grade Operations and CRM platform for multi-tenant teams.

## 🚀 Getting Started (Preview Mode)

OpsPilot uses a single-origin architecture where the Express server hosts both the API and the Frontend.

### Installation & Launch
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the frontend assets:
   ```bash
   npm run build
   ```
3. Start the unified server:
   ```bash
   npm start
   ```

## 🏗 Architecture
- **Single Port**: The application runs on a single port (default 3000), serving API routes at `/api` and the React SPA at `/`.
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + JWT
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Gemini 3 Pro (Server-side tool calling)

## 🔧 Connectivity
If you see "API Offline", ensure you have run `npm run build` and that the server is running on the expected environment port.

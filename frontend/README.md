# Frontend - React + Vite Client

**Live Demo:** [https://mango-coast-09c5d4500.azurestaticapps.net](https://mango-coast-09c5d4500.azurestaticapps.net)

This is the React single-page frontend client for the Person Registration and Map Drawing Application.


---

## 🛠️ Key Technologies
*   **Framework**: React 19 / Vite
*   **Styling**: Tailwind CSS v4 (Sleek dark mode theme using HSL-tailored Stone & Olive palettes)
*   **Data Grid**: AG Grid Community (interactive paginated data table)
*   **Maps Integration**: `@vis.gl/react-google-maps` (declarative React components for Google Maps)
*   **Routing**: `react-router-dom`

---

## 🧪 Testing Infrastructure
The client is equipped with a robust, browser-less unit testing environment powered by:
*   **Test Runner**: Bun's native, high-performance test executor (`bun test`)
*   **DOM Simulation**: Happy DOM (via `@happy-dom/global-registrator`) for lightning-fast virtual browser APIs
*   **React Integration**: `@testing-library/react` and `@testing-library/jest-dom` for component assertion and user event triggers

---

## 📂 Project Structure
*   `happydom.ts` - Registers Happy DOM global context before imports evaluation (avoids ESM hoisting order issues).
*   `bun-setup.ts` - Sets up testing library assertions extension and automated cleanup after each test.
*   `bunfig.toml` - Preloads `happydom.ts` and `bun-setup.ts` configurations.
*   `src/` - Application source code containing views (`login.jsx`, `registration.jsx`, `map.jsx`, `personGrid.jsx`) and context boundaries.
*   `src/login.test.jsx` - Core unit test verifying form entry, state changes, mock context execution, and navigation routing.

---

## 🚀 Commands & Scripts

Make sure to install dependencies first using Bun:
```bash
bun install
```

| Task | Command | Description |
| :--- | :--- | :--- |
| **Run Dev Server** | `bun run dev` | Spins up the Vite dev server at `http://localhost:5173` |
| **Build Bundle** | `bun run build` | Builds a production-ready application bundle in `/dist` |
| **Lint Code** | `bun run lint` | Inspects code quality and rules compliance via ESLint |
| **Run Tests** | `bun test` | Executes the unit test suite |

# Music Tracks App

## Project Overview
A modern React application for managing and playing music tracks. Features include search, filtering, track creation/editing, audio playback, and more. Optimized for performance and bundle size.

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory based on the provided `.env.example`:
```env
VITE_API_URL=https://your-api-url
VITE_OTHER_KEY=your-key
```

### 3. Run the development server
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Scripts
- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run preview` — Preview the production build
- `ANALYZE=true npm run build` — Build and open bundle analyzer report

## Bundle Analysis
- Uses [rollup-plugin-visualizer] for bundle analysis.
- To analyze the bundle, run:
  ```bash
  ANALYZE=true npm run build
  # or
  npm run build -- --report
  ```
- After build, open `bundle-report.html` for a visual breakdown of the bundle.

## Code Splitting & Lazy Loading
- All modals and heavy components (e.g., audio player) are loaded dynamically using `React.lazy` and `Suspense`.
- This reduces the initial bundle size and improves load performance.

## Tree Shaking
- Vite automatically removes unused code (tree shaking).
- Imports are optimized to ensure only necessary code is included in the final bundle.

## Source Maps
- Source maps are enabled for production builds (`sourcemap: true` in `vite.config.ts`).
- This allows for easier debugging of production issues.

## Technologies Used
- React
- TypeScript
- Vite
- Apollo Client (GraphQL)
- Zustand (state management)
- Tailwind CSS
- Playwright (testing)

## Author
- [Your Name]

## License
[MIT](LICENSE)

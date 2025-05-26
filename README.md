# Frontend: Music Track Manager

This project is the frontend part of a music track management application, developed using React, TypeScript, and Vite. It interacts with a backend API to display, create, edit, delete tracks, and manage audio files.

The project is based on a minimal Vite + React + TypeScript template.

## Implemented Features

- **Track Listing:** Fetching and displaying a list of tracks with pagination.
- **Search and Filtering:** Searching by track title or artist, filtering by genre and artist.
- **Sorting:** Sorting tracks by various criteria (title, artist, creation date).
- **Track CRUD Operations:**
  - Creating a new track.
  - Editing an existing track.
  - Deleting a single track.
  - Bulk deletion of selected tracks.
- **Audio File Management:**
  - Uploading an audio file for a track.
  - Deleting a track's audio file (with confirmation).
- **Track Playback:** Integrated player for playing audio files.
- **Toast Notifications:** Showing success or error notifications for operations.
- **Custom Modals and Confirmation Dialogs:** Using custom components for modal windows and confirmation dialogs instead of standard browser ones.

## Technologies Used

- **React:** Library for building user interfaces.
- **TypeScript:** Typed superset of JavaScript for improved code reliability.
- **Vite:** Fast frontend build tool and development server.
- **Tailwind CSS:** Utility-first CSS framework for rapid styling.
- **@tanstack/react-query:** Library for data fetching, caching, and state management.
- **Lodash:** Utility library (specifically `debounce`).
- **React Toastify:** Library for toast notifications.
- **Web Audio API:** Native browser API for audio processing (used for playback controls and potential analysis).

## Setup and Running the Project

1.  **Clone the repository** (or obtain the project code).
2.  **Navigate to the project root directory** in your terminal.
3.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    # or pnpm install
    ```
4.  **Ensure the backend server is running** (according to the backend's instructions). The API should be accessible at the address specified in `src/services/api.ts` (default is `http://localhost:8000`).
5.  **Configure the frontend port:**

    - Open the `vite.config.ts` (or `vite.config.js`) file in the project root.
    - Add or update the `server` section to specify port 3000:

      ```typescript
      // vite.config.ts
      import { defineConfig } from "vite";
      import react from "@vitejs/plugin-react";

      export default defineConfig({
        plugins: [react()],
        server: {
          port: 3000, // Set port to 3000
          // host: true // May be needed if running in a container or VM
        },
      });
      ```

    - Save the file.

6.  **Start the development server:**
    ```bash
    npm run dev
    # or yarn dev
    # or pnpm dev
    ```

The project should be accessible in your browser at `https://localhost.com:3000`.

## Usage

Open `https://localhost.com:3000` in your browser. You will see the list of tracks (if the backend is running).

- Use the search bar, filters, and sort select to interact with the list.
- Click on a track item to select/deselect it for bulk operations.
- Use the buttons on a track item for editing or deleting the track.
- Click the "Create Track" button to add a new track.
- Use the buttons in the audio file section to upload or delete a file, and the Play/Pause button for playback.

## Extra Tasks Implemented

- Bulk deletion functionality is available for selected tracks.
- Optimistic updates have been implemented for single and bulk track deletions, providing faster UI feedback.
- Custom modal components and confirmation dialogs are used throughout the application.

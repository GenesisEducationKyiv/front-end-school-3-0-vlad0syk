## ADR-001: Improving Performance and Scalability of TrackItem and TrackList Components

### Status: Proposed

### Context

My application features a `TrackItem` component responsible for displaying an individual music track and managing its playback and associated files. The `App.tsx` component serves as the root component, managing the overall application state, including the list of tracks and playback state. The current `TrackItem` implementation incorporates significant audio playback and file interaction logic directly within the component. As the number of tracks in the `TrackList` grows, and as new features are developed, concerns arise regarding code **maintainability**, rendering **performance**, and overall application **scalability**.

### Decision

I propose implementing the following changes to enhance `TrackItem`, `TrackList`, and the `App.tsx` architecture:

1.  **Extract Audio Player Logic into a Custom Hook (`useAudioPlayer`)**: Encapsulate all logic related to the `<audio>` element, playback, pausing, progress tracking, and audio event handling into a specialized React hook. This will allow `TrackItem` to focus on rendering, and `App.tsx` to only manage the `playingTrackId`.
2.  **Utilize `React.memo` for `TrackItem`**: Wrap the `TrackItem` component with `React.memo` to prevent unnecessary re-renders when its props haven't changed. This is critical for `TrackList` performance.
3.  **Apply `useCallback` to Callback Functions in `App.tsx` and `TrackList.tsx`**: For `React.memo` to be effective, callback functions passed down from `App.tsx` to `TrackList.tsx` and further to `TrackItem.tsx` (e.g., `onSelect`, `onPlayToggle`, `onEdit`, `onDelete`, `onUploadFile`, `onDeleteFileWithConfirmation`) must be memoized using `useCallback`. This ensures that the references to these functions do not change on every re-render of the parent component, preventing unnecessary re-renders of child components wrapped in `React.memo`.
4.  **Implement Virtualization/Windowing for `TrackList`**: Introduce list virtualization techniques (e.g., using libraries like `react-window` or `tanstack/react-virtual`) within the parent `TrackList` component, which renders the collection of `TrackItem`s.
5.  **Event Delegation (Optional)**: Depending on profiling results, consider delegating event handling for interactive elements within `TrackItem` to the parent `TrackList` to reduce the number of event listeners.
6.  **Centralize `API_BASE_URL`**: Move the `API_BASE_URL` constant to a centralized configuration file, accessible to all components that require it.
7.  **Code Splitting and Lazy Loading (for non-critical UI parts)**: For larger applications, explore lazy loading non-critical UI sections (e.g., edit modals or administration pages) using `React.lazy` and `Suspense`.

### Rationale

- **Separation of Concerns**: Extracting audio player logic separates concerns, making `TrackItem` more focused on the track's UI, and the `useAudioPlayer` hook dedicated to audio management. `App.tsx` remains responsible for global state (like which track is playing) rather than playback details. This improves **readability** and **reusability** of the code.
- **Rendering Performance Optimization**: `React.memo`, `useCallback`, and list virtualization are crucial for **UI scalability**. They will significantly reduce the number of DOM nodes and React computations, especially with a large number of tracks, ensuring smooth scrolling and fast loading. `useCallback` is critically important for the effectiveness of `React.memo`, as without it, function props would constantly change, forcing `TrackItem` to re-render.
- **Reduced Browser Load**: Event delegation (if implemented) will decrease the number of event listeners, positively impacting memory usage and performance.
- **Simplified Configuration Management**: Centralizing `API_BASE_URL` makes configuration more **manageable** and **easier to update** across the entire application.
- **Faster Initial Load**: Code splitting will improve the Time To Interactive (TTI) of the application by loading only the code needed for the current action.

### Consequences

#### Positive

- **Significant UI Performance Improvement**: Especially when dealing with large track lists, thanks to virtualization, `React.memo`, and `useCallback`. This will lead to a smoother user experience.
- **Enhanced Code Maintainability**: Separating concerns through hooks and memoization makes components smaller, easier to understand, test, and modify.
- **Improved Scalability**: The application will be able to efficiently handle a growing number of tracks and features without substantial performance degradation.
- **Cleaner Architecture**: A clearer separation of logic between global state (`App.tsx`), list management (`TrackList.tsx`), and individual items (`TrackItem.tsx`).
- **Optimized Resource Usage**: Reduced re-renders and event listeners will lead to more efficient browser resource utilization.

#### Negative

- **Increased Initial Code Complexity**: Implementing virtualization, using `useCallback` for all function props, and creating custom hooks adds initial "boilerplate" and might increase the learning curve for new developers.
- **Potential Memoization Pitfalls**: Incorrect use of `useCallback` (e.g., incorrect dependencies) can lead to unexpected re-renders, negating the benefits of `React.memo`. This requires careful attention and testing.
- **Testing Nuances**: Event delegation could slightly complicate testing individual `TrackItem`s in isolation, as they won't have their own direct handlers.
- **Fixed Item Heights (depending on virtualization library choice)**: Some virtualization libraries perform best or require list items to have fixed heights, which might be a constraint for highly flexible designs.

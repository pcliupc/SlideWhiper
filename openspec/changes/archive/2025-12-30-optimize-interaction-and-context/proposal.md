# Proposal: Optimize Interaction and Context Management

## Goal
Improve user interaction flow by reducing friction and solving the "messy history" context issue by shifting from temporal to logical context management.

## Key Changes
1.  **Logical Context**: Use the actual previous slide in the deck (Slide N-1) as context, rather than the last generated slide.
2.  **Auto-Generation**: Add option to automatically generate speech when landing on a new slide.
3.  **Visual Feedback**: clearer cues on what the AI is processing (Analysis -> Notes -> Script) and what context it is using.

## Implementation Strategy
-   **Context**: Modify `taskpane.js` to track `SlideIndex` and query `HistoryManager` for `SlideIndex - 1`.
-   **UI**: Add step-based loading state and context chips.
-   **Settings**: Persist "Auto-Generate" preference in `ConfigManager`.

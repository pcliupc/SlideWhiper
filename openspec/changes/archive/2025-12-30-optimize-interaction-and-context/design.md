# Design: Interaction & Context Optimization

## Overview
This design addresses the "messy history" problem where the AI uses the last *generated* script as context, regardless of the actual slide order. It proposes switching to a **Logical Predecessor** model.

## Logical Predecessor Context
### Problem
Currently, context is temporal: `Context = LastGeneratedScript`.
If user goes `Slide 1 -> Generate`, then `Slide 5 -> Generate`, Slide 5 thinks Slide 1 is previous. Transitions like "As we saw in the previous slide..." become confusing.

### Solution
`Context = Script(SlideIndex - 1)`
When generating for Slide N:
1.  Check `HistoryManager` for `SlideID(N-1)`.
2.  If found, use its script as context.
3.  If not found, generate without "previous slide" context (or potentially N-2 if desired, but kept simple to N-1 for now).

### Data Flow
1.  **Capture**: get `currentSlideIndex`.
2.  **Context Lookup**: `previousScript = HistoryManager.load(currentSlideIndex - 1)?.script`.
3.  **Prompt Construction**: `AIService` injects `previousScript` if available.

## UI/UX Improvements
### Auto-Generate
-   New toggle in Settings: "Auto-generate on Slide Switch".
-   If ON: `onSlideChanged` event -> check if history exists -> if no, trigger `handleAutoCapture` + `generateSpeech`.

### Step-based Loading
-   Replace generic "Waiting..." with specific status updates:
    -   `capture`: "Analyzing visual content..."
    -   `notes`: "Reading speaker notes..."
    -   `context`: "Linking to Slide {N-1}..."
    -   `stream`: "Drafting speech..."

### Context Identification
-   Visual "Chip" above output:
    -   `[Linked to Slide 2]` (clickable to unlink?)
    -   `[Standalone]`

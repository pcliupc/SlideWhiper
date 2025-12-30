# Change: Integrate Slide Notes

## Why
Presenters often keep their key talking points, scripts, or extra context in the PowerPoint "Speaker Notes" section. Currently, SlideWhisper only "sees" what is on the slide text and the visual image. Ignoring the notes leads to generic narrations that miss the specific message the presenter intends to convey.

## What Changes
- **Breaking**: None.
- **UI**: 
  - Split "Analyze" into "Capture & Preview" -> "Generate" workflow.
  - Add a "Slide Notes" text area in the preview stage for manual input or pasting.
- **Logic**: 
  - Decouple capture from generation.
  - Pass manually entered notes to `AIService`.
  - Remove automated extraction (due to reliability issues).

## Impact
- **Affected Specs**: `notes-integration`.
- **Affected Code**: 
  - `index.html`: Restructure capture/preview UI.
  - `css/notes.css`: Styling for notes input.
  - `js/taskpane.js`: Update workflow logic.
  - `js/llm.js`: Update prompt builder to use notes.

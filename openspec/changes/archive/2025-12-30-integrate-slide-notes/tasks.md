# Task: Integrate Slide Notes (Manual Pivot)

## 1. Preparation & Cleanup
- [x] 1.1 Remove automated extraction code (`js/libs/jszip.min.js`, `js/file-parser.js`).
- [x] 1.2 Update `index.html` to remove unused scripts.

## 2. UI Implementation
- [x] 2.1 Restructure `index.html` for "Capture -> Preview -> Generate" flow.
- [x] 2.2 Implement "Notes Input" area in the preview container.
- [x] 2.3 Add "Generate Script" button logic in `js/taskpane.js`.
- [x] 2.4 Style the notes input for better usability (`css/notes.css`).

## 3. Logic Integration
- [x] 3.1 Update `handleAutoCapture` to stop at preview.
- [x] 3.2 Implement `triggerAIProcessing` trigger from the new Generate button.
- [x] 3.3 Ensure notes are passed correctly to `AIService`.

## 4. Documentation Sync
- [x] 4.1 Update OpenSpec documents (`proposal.md`, `design.md`, `specs`).

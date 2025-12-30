# Change: Add Slide History Tracking and Auto-Switching

## Why
Currently, when users navigate between PowerPoint slides, the add-in remains stuck on the previous slide's content. Users must manually click "Clear" before generating speech scripts for new slides. This creates a frustrating workflow:
1. Generated script for Slide 1
2. Switch to Slide 2 in PowerPoint
3. Add-in still shows Slide 1 content
4. Must click Clear → Capture → Generate (3 steps per slide)
5. Previously generated scripts are lost forever

This defeats the natural workflow of reviewing and editing multiple slides. Users cannot compare scripts across slides or quickly revisit previous work.

## What Changes
This change implements the MVP of slide history tracking with automatic slide detection:

- **Automatic slide detection**: Listen to PowerPoint slide selection changes and automatically update the add-in display
- **History storage**: Persist generated scripts per slide ID in Office.js document settings  
- **Auto-switching**: When user changes slides, automatically display the corresponding saved script (if it exists)
- **Simple history list**: Show a collapsible list of previously generated slides for quick access
- **State management**: Track current slide ID and maintain synchronization between PowerPoint and add-in state

**User Experience Flow:**
1. Generate script for Slide 1 → Automatically saved
2. Switch to Slide 2 → Add-in detects change and shows "Not generated yet"
3. Click generate → Script saved for Slide 2
4. Switch back to Slide 1 → Add-in automatically displays saved Slide 1 script
5. View history list → See all generated slides, click to navigate

This reduces per-slide workflow from 3 steps to 1 step, while preserving all historical work.

## Impact
- **Affected specs**: Creates new capability `slide-history`
- **Affected code**: 
  - `js/taskpane.js` - Add slide change event listener, history management logic
  - `js/config.js` - Extend storage to use Office.context.document.settings for per-document history
  - `index.html` - Add history list UI section
  - `css/styles.css` - Style history list display
- **User experience**: Dramatically improved workflow efficiency, non-breaking change (purely additive)
- **Storage**: Uses Office.js document settings API (slides stored within PPT file, not localStorage)

# slide-history Specification

## Purpose
TBD - created by archiving change add-slide-history-tracking. Update Purpose after archive.
## Requirements
### Requirement: Automatic Slide Change Detection
The add-in MUST automatically detect when the user navigates to a different slide in PowerPoint and update the UI accordingly.

#### Scenario: Slide Navigation Detection
- **GIVEN** the add-in is loaded in PowerPoint
- **WHEN** the user clicks on a different slide in the slide navigation panel
- **THEN** the add-in MUST detect the slide change within 500ms
- **AND** trigger an update to display content for the newly selected slide

#### Scenario: Auto-Detection Not Available
- **GIVEN** the Office.js API does not support DocumentSelectionChanged events (older Office versions)
- **WHEN** the add-in initializes
- **THEN** the add-in MUST gracefully fall back to manual mode
- **AND** display a message indicating automatic detection is unavailable

---

### Requirement: Slide History Persistence
The add-in MUST save generated speech scripts per slide and persist them within the PowerPoint document file.

#### Scenario: Script Auto-Save After Generation
- **GIVEN** a speech script has been successfully generated for the current slide
- **WHEN** the generation completes
- **THEN** the script MUST be automatically saved to the document's settings
- **AND** associated with the current slide ID
- **AND** include metadata: slide title, timestamp, and generation options (tone, length, language)

#### Scenario: History Retrieval on Slide Change
- **GIVEN** the user has previously generated a script for Slide 3
- **WHEN** the user navigates to Slide 3
- **THEN** the add-in MUST retrieve the saved script from document settings
- **AND** display it in the output area
- **AND** restore the original generation options (tone, length, language)

#### Scenario: No History for Current Slide
- **GIVEN** the user navigates to Slide 5
- **AND** no script has been generated for Slide 5 yet
- **WHEN** the UI updates
- **THEN** the add-in MUST display a "not generated" state
- **AND** show the "Analyze Current Slide" button prominently
- **AND** clear any previous slide's content from the output area

#### Scenario: History Persists Across Sessions
- **GIVEN** the user has generated scripts for multiple slides
- **WHEN** the user closes and reopens the PowerPoint file
- **THEN** all previously generated scripts MUST be available
- **AND** automatically loaded when navigating to corresponding slides

---

### Requirement: History List Display
The add-in MUST provide a UI element displaying all slides with generated scripts for quick access.

#### Scenario: History List Rendering
- **GIVEN** the user has generated scripts for Slides 1, 3, and 5
- **WHEN** the add-in UI renders
- **THEN** a history list section MUST be visible
- **AND** display entries for Slides 1, 3, and 5
- **AND** each entry MUST show: slide number, slide title (if available), and timestamp

#### Scenario: Current Slide Indicator in History
- **GIVEN** the user is viewing Slide 3
- **AND** Slide 3 has a saved script
- **WHEN** the history list renders
- **THEN** the Slide 3 entry MUST be visually marked as current
- **AND** use a distinct style or indicator (e.g., background color, icon)

#### Scenario: Empty History State
- **GIVEN** no scripts have been generated yet
- **WHEN** the add-in loads
- **THEN** the history list section MUST display an empty state message
- **AND** the message SHOULD encourage the user to generate their first script

---

### Requirement: History Navigation
Users MUST be able to click on history entries to navigate to the corresponding slide.

#### Scenario: Navigate to Slide via History Click
- **GIVEN** the history list contains an entry for Slide 5
- **WHEN** the user clicks the Slide 5 history entry
- **THEN** the PowerPoint application MUST navigate to Slide 5
- **AND** the add-in MUST display the saved script for Slide 5
- **AND** update the current slide indicator in the history list

#### Scenario: Navigation Updates Both App and Add-in
- **GIVEN** the user is currently viewing Slide 1
- **WHEN** the user clicks the history entry for Slide 7
- **THEN** PowerPoint MUST make Slide 7 the active slide
- **AND** the add-in MUST synchronize to show Slide 7's content

---

### Requirement: History Item Deletion
Users MUST be able to delete individual history items.

#### Scenario: Delete Single History Entry
- **GIVEN** the history list contains entries for Slides 1, 2, and 3
- **WHEN** the user clicks the delete button next to Slide 2's entry
- **THEN** the Slide 2 entry MUST be removed from the history list
- **AND** the script data for Slide 2 MUST be deleted from document settings
- **AND** the history list MUST update to show only Slides 1 and 3

#### Scenario: Delete Current Slide Script
- **GIVEN** the user is viewing Slide 4
- **AND** Slide 4 has a saved script displayed
- **WHEN** the user deletes Slide 4 from the history
- **THEN** the script MUST be removed from storage
- **AND** the output area MUST switch to "not generated" state
- **AND** the history list MUST no longer show Slide 4

---

### Requirement: Clear All History
Users MUST be able to delete all saved scripts at once.

#### Scenario: Clear All History Confirmation
- **GIVEN** the user clicks the "Clear All History" button
- **WHEN** the confirmation dialog appears
- **THEN** the user MUST be able to confirm or cancel the action

#### Scenario: Clear All Deletes All Scripts
- **GIVEN** the user has confirmed clearing all history
- **WHEN** the clear operation executes
- **THEN** all slide scripts MUST be deleted from document settings
- **AND** the history list MUST display the empty state
- **AND** the current output area MUST switch to "not generated" state

---

### Requirement: Slide Identification
The add-in MUST uniquely identify slides to map saved scripts correctly.

#### Scenario: Use Slide Index as Identifier
- **GIVEN** the add-in needs to save or retrieve a script
- **WHEN** identifying the current slide
- **THEN** the slide's 1-based index MUST be used as the unique identifier
- **AND** retrieved using the existing `CaptureService.getSlideIndex()` method

#### Scenario: Handle Slide Reordering Limitation
- **GIVEN** slides may be reordered by users
- **WHEN** a user reorders slides in their presentation
- **THEN** history mappings MAY become incorrect (known limitation)
- **AND** this limitation MUST be documented in the README

---

### Requirement: Storage Service Integration
The add-in MUST implement a dedicated service for managing slide history data.

#### Scenario: HistoryManager Service Exists
- **GIVEN** the codebase structure
- **WHEN** history functionality is implemented
- **THEN** a new file `js/history.js` MUST be created
- **AND** expose a `HistoryManager` object following the IIFE pattern
- **AND** provide methods: `save()`, `load()`, `getAll()`, `delete()`, `clearAll()`

#### Scenario: Use Document Settings for Storage
- **GIVEN** the `HistoryManager` needs to persist data
- **WHEN** saving or loading history
- **THEN** `Office.context.document.settings` API MUST be used
- **AND** NOT localStorage (to ensure portability with the PPT file)
- **AND** store all history as a single JSON object under key `slideHistory`


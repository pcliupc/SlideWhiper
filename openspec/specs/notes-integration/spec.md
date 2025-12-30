# notes-integration Specification

## Purpose
TBD - created by archiving change integrate-slide-notes. Update Purpose after archive.
## Requirements
### Requirement: Manual Notes Entry
The system MUST provide a text input field for users to manually enter or paste speaker notes and requirements before generating the script.

#### Scenario: User Adds Notes
- **GIVEN** the user has captured a slide
- **WHEN** the user types "Focus on the Q3 growth" into the Notes field
- **AND** clicks "Generate Script"
- **THEN** the system MUST include "Focus on the Q3 growth" in the AI prompt context

#### Scenario: User Leaves Notes Empty
- **GIVEN** the user has captured a slide
- **WHEN** the user leaves the Notes field empty
- **AND** clicks "Generate Script"
- **THEN** the system MUST generate the script based on the slide content/image only

### Requirement: Preview Workflow
The system MUST display a preview of the captured slide and the notes input field BEFORE triggering the AI generation process.

#### Scenario: Workflow Step
- **GIVEN** the user clicks "Analyze Current Slide"
- **THEN** the system MUST display the slide screenshot
- **AND** display the "Slide Notes" input area
- **AND** display a "Generate Script" button


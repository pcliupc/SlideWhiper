## ADDED Requirements
### Requirement: Notes UI Design
The notes integration UI MUST adhere to the project's visual design system.

#### Scenario: Notes Section Appearance
- **GIVEN** the notes section is rendered
- **WHEN** displayed in the UI
- **THEN** it MUST use a collapsible "accordion" style container
- **AND** the header MUST include a status indicator (icon + text)
- **AND** the container MUST have a subtle border and shadow consistent with `--shadow-md`

#### Scenario: Notes Status Indicators
- **GIVEN** the notes status changes (Extraction vs Manual)
- **WHEN** the status updates
- **THEN** "Extraction Success" MUST be indicated with a green/success color accent
- **AND** "Manual Input" or "Fallack" MUST be indicated with a neutral or warning color accent

#### Scenario: Textarea Styling
- **GIVEN** the notes manual input textarea
- **WHEN** visible
- **THEN** it MUST use the standard form input styling (border, padding, font)
- **AND** use the `Inter` font family (monospaced font is NOT required)

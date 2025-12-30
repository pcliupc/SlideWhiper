# slide-history Spec Delta

## ADDED Requirements

### Requirement: Logical Context Resolution
The AI MUST use the logically preceding slide's script as context, not the temporally last generated one.

#### Scenario: Contiguous Context Retrieval
- **GIVEN** the user is on Slide 5
- **AND** a script exists in history for Slide 4
- **WHEN** generating speech for Slide 5
- **THEN** the system MUST retrieve the script for Slide 4
- **AND** use it as volume context for the AI prompt
- **AND** the UI MUST indicate "Context: Slide 4"

#### Scenario: Non-Contiguous / Missing Predecessor
- **GIVEN** the user is on Slide 5
- **AND** NO script exists for Slide 4
- **WHEN** generating speech for Slide 5
- **THEN** the system MUST NOT include any previous slide context
- **AND** the UI MUST indicate "Context: None" or "Standalone"

### Requirement: Auto-Generation Trigger
The add-in MUST support automatic generation upon navigation to a new slide.

#### Scenario: Auto-Generate on Navigation
- **GIVEN** "Auto-generate" setting is ENABLED
- **WHEN** the user navigates to Slide 6
- **AND** Slide 6 has NO existing history
- **THEN** the add-in MUST automatically capture the slide
- **AND** initiate speech generation without user intervention

#### Scenario: Skip Auto-Generate if History Exists
- **GIVEN** "Auto-generate" setting is ENABLED
- **WHEN** the user navigates to Slide 6
- **AND** Slide 6 ALREADY has a saved script
- **THEN** the add-in MUST load the saved script
- **AND** MUST NOT re-generate automatically

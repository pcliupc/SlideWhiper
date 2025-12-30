# visual-design Spec Delta

## ADDED Requirements

### Requirement: Detailed Loading State
The UI MUST provide granular feedback during the AI generation process.

#### Scenario: Step-by-Step Status Updates
- **GIVEN** the generation process has started
- **WHEN** the system progresses through stages
- **THEN** the status indicator MUST update text to reflect current state:
  1. "Analyzing..." (Image processing)
  2. "Reading Notes..." (Context gathering)
  3. "Writing..." (Streaming response)

### Requirement: Context Context Indicators
The UI MUST visibly display the context source being used for generation.

#### Scenario: Context Chip Display
- **GIVEN** a generation is complete or context is loaded
- **WHEN** the result is displayed
- **THEN** a small "Context Chip" element MUST appear above the text
- **AND** it MUST state the source (e.g., "Linked to Slide 3")

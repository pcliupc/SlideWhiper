## Context
Users want a way to include specific context (like speaker notes or key points) into the AI generation process. While automated extraction proved unreliable, a manual input workflow offers 100% control and reliability.

## Goals / Non-Goals
- **Goal**: Allow users to manually input or paste slide notes/requirements before generation.
- **Goal**: Provide a clear "Capture -> Review -> Generate" workflow.
- **Non-Goal**: Automated extraction of notes from .pptx files (abandoned due to complexity/stability).
- **Non-Goal**: Write notes back to the file.

## Decisions
- **Decision**: Split the "Analyze" action into two steps:
    1.  **Capture & Preview**: Gets the slide image and shows it.
    2.  **Generate**: Triggers AI only when user confirms.
    - **Rationale**: Gives users a chance to verify the image and add missing context (Notes) before spending AI tokens/time.

- **Decision**: Place Notes Input in the "Preview" stage.
    - **Rationale**: Immediate context association. User sees the slide and typed notes together.

- **Decision**: Remove `JSZip` and file parsing logic.
    - **Rationale**: Simplicity and robust deployment. No external dependencies needed.

## Risks / Trade-offs
- **Trade-off**: More clicks (Capture then Generate).
    - **Mitigation**: The "Generate" button is prominent. The intermediate step adds value (validation/customization).
- **Risk**: User might forget to paste notes.
    - **Mitigation**: Label clearly indicates "Optional Notes / Requirements".

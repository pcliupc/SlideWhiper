# plugin-config Specification

## Purpose
TBD - created by archiving change add-backend-service-config. Update Purpose after archive.
## Requirements
### Requirement: Backend Service URL Configuration
The add-in MUST allow users to configure the backend service URL where the add-in is hosted.

#### Scenario: Default Backend URL
- **GIVEN** the add-in is loaded for the first time
- **WHEN** no backend URL has been configured
- **THEN** the backend URL MUST default to `localhost:3000`

#### Scenario: Custom Backend URL
- **GIVEN** the user opens the settings panel
- **WHEN** the user enters a custom backend URL (e.g., `https://slidewhisper.example.com`)
- **AND** saves the settings
- **THEN** the custom URL MUST be persisted in localStorage
- **AND** the URL MUST be available on subsequent add-in loads

---

### Requirement: Backend Service API Key Configuration
The add-in MUST allow users to configure an optional API key for backend service authentication.

#### Scenario: API Key Not Required
- **GIVEN** the backend service does not require authentication
- **WHEN** the user leaves the Backend API Key field empty
- **THEN** the add-in MUST function normally without sending authentication headers

#### Scenario: API Key Configured
- **GIVEN** the user opens the settings panel
- **WHEN** the user enters a Backend API Key
- **AND** saves the settings
- **THEN** the API key MUST be persisted securely in localStorage
- **AND** the input field MUST mask the API key (password input type)

---

### Requirement: Backend Configuration Persistence
Backend configuration settings MUST persist across browser sessions.

#### Scenario: Settings Persistence
- **GIVEN** the user has configured backend URL and API key
- **WHEN** the user closes and reopens the add-in
- **THEN** the previously configured settings MUST be restored
- **AND** the settings fields MUST display the saved values


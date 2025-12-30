# Change: Add Backend Service Configuration

## Why
Currently, the SlideWhisper add-in can only be loaded from a hardcoded localhost:3000 address, requiring users to run their own local server. To support a SaaS model where users can subscribe to a hosted backend service, we need to make the backend service URL configurable, with an optional API key for authentication.

This enables two deployment modes:
1. **Self-hosted mode** (current): Users run `npx http-server` locally
2. **SaaS mode** (new): Users connect to a hosted backend service via configured URL and API key

## What Changes
- Add "Backend Service URL" configuration field in settings (default: `localhost:3000`)
- Add optional "Backend Service API Key" configuration field in settings
- Store backend configuration in localStorage
- Support multiple manifest templates for different deployment scenarios
- Add backend connection validation

## Impact
- Affected specs: `plugin-config` (new capability)
- Affected code:
  - `js/config.js` - Add backend URL and API key management
  - `index.html` - Add settings UI fields
  - `js/taskpane.js` - Handle backend config UI
  - `manifest.xml` - Document template usage pattern

## Architecture Notes

> [!IMPORTANT]
> The `manifest.xml` cannot be dynamically configured at runtime. The backend URL in manifest is set at installation time. This proposal focuses on:
> 1. Making the **plugin settings** configurable for different backend modes
> 2. Providing **manifest templates** for different deployment scenarios (localhost vs production)

For SaaS deployment, you would:
1. Deploy your backend at a production URL (e.g., `https://slidewhisper.yourservice.com`)
2. Create a production `manifest.xml` with that URL
3. Users install using the production manifest and configure their API key in settings

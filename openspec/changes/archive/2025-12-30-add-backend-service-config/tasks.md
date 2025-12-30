# Tasks: Add Backend Service Configuration

## 1. Configuration Manager Updates
- [x] 1.1 Add `BACKEND_URL` and `BACKEND_API_KEY` keys to `ConfigManager.KEYS`
- [x] 1.2 Add default backend URL (`localhost:3000`) to `ConfigManager.DEFAULTS`
- [x] 1.3 Update `getConfig()` to include backend settings
- [x] 1.4 Update `saveConfig()` to persist backend settings

## 2. Settings UI Updates
- [x] 2.1 Add "Backend Service" section to settings view in `index.html`
- [x] 2.2 Add Backend URL input field with placeholder
- [x] 2.3 Add Backend API Key input field (password type, optional)
- [x] 2.4 Update `loadConfig()` in `taskpane.js` to populate new fields
- [x] 2.5 Update `saveSettings()` in `taskpane.js` to save new fields

## 3. Manifest Templates
- [x] 3.1 Create `manifest.dev.xml` for localhost development
- [x] 3.2 Create `manifest.prod.xml` template for production deployment
- [x] 3.3 Update README with deployment instructions for SaaS mode

## 4. Validation
- [x] 4.1 Manual test: Verify settings save/load for backend URL (verified in browser)
- [x] 4.2 Manual test: Verify settings save/load for backend API key (verified in browser)
- [x] 4.3 Manual test: Verify default localhost:3000 works as before (verified in browser)

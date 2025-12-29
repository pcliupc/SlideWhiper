# Project Context

## Purpose
SlideWhisper is an AI-powered Microsoft PowerPoint Add-in that automatically generates professional speech scripts from presentation slides. The tool analyzes both visual elements and text content from slides, then uses AI to create ready-to-use speech scripts tailored to user preferences (tone, length, language). It aims to help presenters prepare more effectively by automating the speechwriting process and maintaining natural flow continuity between consecutive slides.

**Key Goals:**
- Generate contextual speech scripts from PowerPoint slides in real-time
- Support multiple presentation styles (professional, energetic, storytelling, casual)
- Provide flexible script lengths (short ~30s, medium ~1min, long ~2min)
- Support multi-language output (auto-detect, English, Chinese)
- Enable seamless integration into PowerPoint workflow

## Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Office Integration**: Office.js API (PowerPointApi 1.8+)
- **UI Framework**: None (pure vanilla JS for lightweight performance)
- **AI Service**: OpenAI-compatible Chat Completions API with streaming support
- **Storage**: Browser localStorage for configuration persistence
- **Development Server**: http-server (Node.js) for local development
- **API Compatibility**: Supports OpenAI, Azure OpenAI, GitHub Models, and local LLMs

## Project Conventions

### Code Style
- **Language**: Vanilla JavaScript (no TypeScript, no frameworks)
- **Module Pattern**: IIFE (Immediately Invoked Function Expressions) for encapsulation
  - Example: `const ConfigManager = (function() { ... })();`
- **Naming Conventions**:
  - camelCase for variables and functions: `currentImageBase64`, `handleAutoCapture()`
  - PascalCase for service objects: `ConfigManager`, `CaptureService`, `AIService`
  - UPPER_SNAKE_CASE for constants: `KEYS`, `DEFAULTS`
  - Descriptive button IDs with prefixes: `btn-auto-capture`, `btn-settings`
  - View/section IDs: `view-main`, `result-section`
- **Comments**: Inline comments with `// ---` for section separators
- **Error Handling**: Try-catch blocks with user-friendly error messages in status bar
- **Async/Await**: Preferred over promise chains for readability

### Architecture Patterns
- **Service Layer Pattern**: 
  - `ConfigManager`: localStorage management and configuration
  - `CaptureService`: slide capture and text extraction
  - `AIService`: LLM API integration with streaming
- **State Management**: Local variables and session memory object
  - `sessionMemory` tracks previous slide scripts for flow continuity
  - `currentImageBase64` stores captured slide image
- **Event-Driven UI**: Direct DOM manipulation with event listeners
- **View Management**: Simple view toggling between main and settings
- **Capability Detection**: Runtime checks for Office.js API support
- **Streaming Response**: Real-time AI output rendering with chunk processing

### Testing Strategy
- **Manual Testing**: Primary testing method through PowerPoint add-in sideloading
- **Local Development**: Use `npx http-server -p 3000 --cors` for testing
- **Browser Console**: Console logging for debugging (`console.error`, `console.warn`)
- **No Automated Tests**: Currently no unit tests or integration tests
- **User Feedback**: Status message bar for operation feedback

### Git Workflow
- **Branching**: Feature branches recommended (`feature/AmazingFeature`)
- **Commit Messages**: Descriptive messages (e.g., "Add some AmazingFeature")
- **License**: MIT License
- **Ignored Files**: See `.gitignore` for build artifacts, IDE configs, environment files

## Domain Context

### PowerPoint Add-in Development
- **Office.js API**: Must initialize with `Office.onReady()` before accessing PowerPoint APIs
- **Host Detection**: Check `Office.HostType.PowerPoint` for environment validation
- **Manifest**: Uses `manifest.xml` for add-in registration and permissions
- **Sideloading**: Development add-ins loaded via "Upload My Add-in" in PowerPoint
- **CORS Requirements**: Local server must support CORS for Office.js communication

### AI Speech Generation
- **Vision + Text Analysis**: Combines slide screenshots (base64) with extracted text
- **Context Awareness**: Uses previous slide scripts for natural transitions
- **Flow Continuity**: Maintains conversation flow across consecutive slides
- **Streaming**: Incremental response rendering for better UX
- **Session Memory**: Tracks `previousSlideId` and `previousScript` to avoid self-referencing

### Configuration Management
- **Persistent Settings**: API credentials stored in localStorage
- **Required Fields**: `apiKey` must be set; `baseUrl` and `model` have defaults
- **Default Values**: `https://api.openai.com` for base URL, `gpt-4o` for model
- **Validation**: Config validation before AI processing

## Important Constraints

### Technical Constraints
- **Office.js API Limitations**: 
  - Cannot directly write to speaker notes (requires user manual paste)
  - Slide capture requires PowerPointApi 1.8+ (may not work on older Office versions)
- **Browser Compatibility**: Must work in Office add-in webview (Edge-based)
- **No Build Process**: Pure vanilla JS with no transpilation or bundling
- **localStorage Dependency**: Configuration tied to browser localStorage (not cloud-synced)
- **CORS Requirements**: Development server must enable CORS headers

### API Constraints
- **OpenAI-Compatible Only**: Requires Chat Completions API format with streaming
- **Vision Model Required**: Must support base64 image input in messages
- **Rate Limits**: Subject to external LLM provider rate limits
- **API Key Security**: Stored in localStorage (user's responsibility to protect)

### User Experience Constraints
- **Manual Notes Insertion**: Users must manually paste scripts into PowerPoint notes
- **Single Slide Processing**: Processes one slide at a time (no batch mode)
- **Network Dependency**: Requires internet connection for AI API calls

## External Dependencies

### Microsoft Office Platform
- **Office.js**: Core PowerPoint integration library
- **PowerPointApi 1.8+**: Required for slide capture functionality
- **Documentation**: [Office Add-ins Documentation](https://docs.microsoft.com/en-us/office/dev/add-ins/)

### AI Services
- **Primary**: OpenAI Chat Completions API
- **Alternatives**: Azure OpenAI, GitHub Models, local LLMs (any OpenAI-compatible endpoint)
- **API Documentation**: [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- **Required Capabilities**: Vision model support, streaming responses

### Development Tools
- **http-server**: Node.js package for local development server
- **Installation**: `npx http-server -p 3000 --cors` (no global install needed)

### Browser APIs
- **Clipboard API**: `navigator.clipboard.writeText()` for copy functionality
- **localStorage**: Configuration persistence
- **Fetch API**: HTTP requests to LLM endpoints

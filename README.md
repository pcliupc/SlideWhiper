# SlideWhisper 🎤

**AI-Powered Speech Script Generator for PowerPoint**

SlideWhisper is a Microsoft PowerPoint Add-in that uses AI to automatically generate professional speech scripts from your presentation slides. Simply capture a slide and get a ready-to-use speech script tailored to your presentation style.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Smart Analysis** | Analyzes slide visuals + text content for accurate scripts |
| 🎨 **Tone Control** | Professional, Energetic, Storytelling, or Casual |
| ⏱️ **Length Options** | Short (~30s), Medium (~1min), or Long (~2min) |
| 🌍 **Multi-language** | Auto-detect, English, or Chinese output |
| 🔄 **Regenerate** | Instantly regenerate with different settings |
| 📝 **Insert to Notes** | Save scripts directly to PowerPoint speaker notes |
| 🔗 **Flow Continuity** | Smart transitions between consecutive slides |
| 🔍 **Slide History** | Automatically saves and tracks scripts for each slide |
| ⚡ **Auto-Switch** | Detects slide changes and loads corresponding scripts |
| 📚 **History List** | View and navigate all generated scripts in one place |

---

## 🚀 Quick Start

### Prerequisites
- Microsoft PowerPoint (Office 365 / 2019+)
- Node.js (for local development server)
- OpenAI API key or compatible LLM API

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SlideWhisper.git
   cd SlideWhisper
   ```

2. **Start the local server**
   ```bash
   npx http-server -p 3000 --cors
   ```

3. **Sideload the add-in in PowerPoint**
   - Open PowerPoint
   - Go to **Insert** → **Add-ins** → **My Add-ins**
   - Click **Upload My Add-in**
   - Select the `manifest.xml` file from this project

4. **Configure API settings**
   - Click the ⚙️ settings icon in the add-in
   - Enter your API Base URL and API Key
   - Save and start using!

---

## 🛠️ Configuration

### Backend Service Settings
| Setting | Description | Default |
|---------|-------------|---------|
| Backend URL | The server hosting this add-in | `localhost:3000` |
| Backend API Key | Optional API key for SaaS subscriptions | (empty) |

### AI Service Settings
| Setting | Description | Example |
|---------|-------------|---------|
| API Base URL | Your LLM API endpoint | `https://api.openai.com` |
| API Key | Your API authentication key | `sk-...` |
| Model Name | The model to use | `gpt-4o` |

> **Note**: SlideWhisper supports any OpenAI-compatible API, including Azure OpenAI, GitHub Models, and local LLMs.

---

## 📖 Usage

### Basic Workflow

1. **Select options** - Choose your preferred Tone, Length, and Language
2. **Capture slide** - Click "Analyze Current Slide" (or paste a screenshot)
3. **Review script** - Edit the generated script if needed
4. **Take action**:
   - 📋 **Copy** - Copy to clipboard
   - 🔄 **Regenerate** - Try again with same or different options  
   - 📝 **Insert to Notes** - Save directly to PowerPoint speaker notes

### Slide History Management

**Automatic Tracking**: SlideWhisper now automatically detects when you navigate between slides and saves your generated scripts:

- **Auto-save**: Every generated script is automatically saved for its slide
- **Auto-switch**: When you click on a different slide in PowerPoint, the add-in automatically displays the saved script (if one exists)
- **History list**: View all slides with generated scripts in the "Generated History" section
- **Quick navigation**: Click any history item to view that slide's script
- **Delete options**: Remove individual scripts or clear all history

**Example Workflow**:
1. Generate script for Slide 1 → Saved automatically
2. Navigate to Slide 3 in PowerPoint → Add-in detects change
3. Generate script for Slide 3 → Saved automatically
4. Navigate back to Slide 1 → Previous script loads automatically
5. Click history item for Slide 5 → View that slide's script

> **Note**: Script history is saved within the PowerPoint file itself, so it persists across sessions and devices.

> **Known Limitation**: History uses slide IDs for tracking. If you reorder slides in your presentation, history mappings may become incorrect.

### Flow Continuity
When generating scripts for consecutive slides, SlideWhisper remembers the previous script and creates natural transitions like:
- *"Building on that..."*
- *"Now let's look at..."*
- *"Moving forward..."*

---

## 🏗️ Project Structure

```
SlideWhisper/
├── manifest.xml       # Office Add-in manifest
├── index.html         # Main UI
├── css/
│   └── styles.css     # Styling
├── js/
│   ├── config.js      # Configuration manager
│   ├── capture.js     # Slide capture & text extraction
│   ├── llm.js         # AI service integration
│   └── taskpane.js    # Main application logic
└── assets/
    ├── icon-32.png    # Add-in icons
    └── icon-64.png
```

---

## 🔧 Development

### Local Development
```bash
# Start development server
npx http-server -p 3000 --cors

# The add-in will be available at http://localhost:3000
```

### Tech Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Office Integration**: Office.js (PowerPointApi 1.8+)
- **AI**: OpenAI-compatible Chat Completions API with streaming

### Deployment Modes

SlideWhisper supports two deployment modes:

#### 1. Self-hosted Mode (Development)
Run your own local server for development or personal use:
```bash
npx http-server -p 3000 --cors
```
Use `manifest.dev.xml` for sideloading.

#### 2. SaaS Mode (Production)
Deploy as a hosted service for your users:

1. **Deploy to production server**
   - Host all files on your production domain (e.g., `https://slidewhisper.yourcompany.com`)
   - Ensure HTTPS is configured

2. **Configure production manifest**
   - Copy `manifest.prod.xml` and replace `YOUR_PRODUCTION_DOMAIN` with your actual domain
   - Generate a new unique GUID for the `<Id>` element
   - Update `SupportUrl` with your support page

3. **Distribute to users**
   - Users install using your production manifest
   - Users configure their Backend API Key in settings (if you require authentication)

#### Manifest Files
| File | Purpose |
|------|---------|
| `manifest.xml` | Default manifest (localhost:3000) |
| `manifest.dev.xml` | Explicit development manifest |
| `manifest.prod.xml` | Production template with placeholders |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Office Add-ins Documentation](https://docs.microsoft.com/en-us/office/dev/add-ins/)
- [OpenAI API](https://platform.openai.com/docs/api-reference)

---

<p align="center">
  Made with ❤️ for better presentations
</p>

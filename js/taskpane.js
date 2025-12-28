Office.onReady((info) => {
    if (info.host === Office.HostType.PowerPoint) {
        initApp();
    }
});

function initApp() {
    // UI Elements
    const viewMain = document.getElementById("view-main");
    const viewSettings = document.getElementById("view-settings");
    const btnSettings = document.getElementById("btn-settings");
    const btnSaveSettings = document.getElementById("btn-save-settings");
    const btnCancelSettings = document.getElementById("btn-cancel-settings");

    // Capture Elements
    const btnAutoCapture = document.getElementById("btn-auto-capture");
    const manualCaptureHint = document.getElementById("manual-capture-hint");
    const previewContainer = document.getElementById("preview-container");
    const imgPreview = document.getElementById("img-preview");
    const btnClear = document.getElementById("btn-clear");

    // Result Elements
    const resultSection = document.getElementById("result-section");
    const aiOutput = document.getElementById("ai-output");
    const btnCopy = document.getElementById("btn-copy");
    const btnRegenerate = document.getElementById("btn-regenerate");
    const btnInsertNotes = document.getElementById("btn-insert-notes");
    const statusMessage = document.getElementById("status-message");

    // State
    let currentImageBase64 = null;

    // --- Navigation & Checks ---

    function showView(viewName) {
        if (viewName === 'settings') {
            viewMain.classList.add('hidden');
            viewSettings.classList.remove('hidden');
            loadSettingsToUI();
        } else {
            viewMain.classList.remove('hidden');
            viewSettings.classList.add('hidden');
        }
    }

    function checkCapabilities() {
        if (CaptureService.isSupported()) {
            btnAutoCapture.classList.remove('hidden');
            manualCaptureHint.classList.add('hidden');
        } else {
            btnAutoCapture.classList.add('hidden');
            manualCaptureHint.classList.remove('hidden');
        }
    }

    // --- Settings Logic ---

    function loadSettingsToUI() {
        const config = ConfigManager.get();
        document.getElementById('config-base-url').value = config.baseUrl;
        document.getElementById('config-api-key').value = config.apiKey;
        document.getElementById('config-model').value = config.model;
    }

    function saveSettingsFromUI() {
        const config = {
            baseUrl: document.getElementById('config-base-url').value,
            apiKey: document.getElementById('config-api-key').value,
            model: document.getElementById('config-model').value
        };
        ConfigManager.save(config);
        showView('main');
        statusMessage.textContent = "Settings saved.";
    }

    // --- Core Action Logic ---

    async function handleAutoCapture() {
        try {
            statusMessage.textContent = "Capturing slide...";
            const base64 = await CaptureService.captureAuto();
            showPreview(base64);
            statusMessage.textContent = "Slide captured. Analyzing...";
            triggerAIProcessing(base64);
        } catch (error) {
            statusMessage.textContent = "Capture failed: " + error.message;
            console.error(error);
        }
    }

    function handlePaste(event) {
        if (CaptureService.isSupported()) return; // Ignore paste if auto is supported (optional UX choice)

        CaptureService.captureManual(event.clipboardData.items)
            .then((base64) => {
                showPreview(base64);
                statusMessage.textContent = "Pasted image. Analyzing...";
                triggerAIProcessing(base64);
            })
            .catch((err) => {
                statusMessage.textContent = "Paste error: " + err.message;
            });
    }

    function showPreview(base64) {
        currentImageBase64 = base64;
        imgPreview.src = `data:image/png;base64,${base64}`;
        previewContainer.classList.remove('hidden');
        manualCaptureHint.classList.add('hidden'); // Hide hint once we have an image
        btnAutoCapture.classList.add('hidden');    // Hide auto button to focus on result
    }

    function clearState() {
        currentImageBase64 = null;
        imgPreview.src = "";
        previewContainer.classList.add('hidden');
        resultSection.classList.add('hidden');
        aiOutput.textContent = "Waiting for AI...";
        checkCapabilities(); // Restore initial buttons
        statusMessage.textContent = "Ready";
    }

    function getSelectedOptions() {
        return {
            tone: document.getElementById('option-tone').value,
            length: document.getElementById('option-length').value,
            language: document.getElementById('option-language').value
        };
    }

    async function triggerAIProcessing(base64) {
        if (!ConfigManager.isValid()) {
            statusMessage.textContent = "Please configure API Key first.";
            showView('settings');
            return;
        }

        resultSection.classList.remove('hidden');
        aiOutput.textContent = ""; // Clear previous

        try {
            const config = ConfigManager.get();
            const options = getSelectedOptions();
            await AIService.generateSpeech(base64, config, options, (chunk) => {
                aiOutput.textContent += chunk;
                // Basic auto-scroll
                // aiOutput.scrollTop = aiOutput.scrollHeight; 
            });
            statusMessage.textContent = "Speech generated successfully.";
        } catch (error) {
            aiOutput.textContent = "Error generating speech: " + error.message;
            statusMessage.textContent = "Error occurred.";
        }
    }

    // --- Event Listeners ---

    btnSettings.onclick = () => showView('settings');
    btnCancelSettings.onclick = () => showView('main');
    btnSaveSettings.onclick = saveSettingsFromUI;

    btnAutoCapture.onclick = handleAutoCapture;
    btnCopy.onclick = () => {
        const text = aiOutput.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originText = btnCopy.textContent;
            btnCopy.textContent = "Copied!";
            setTimeout(() => btnCopy.textContent = originText, 2000);
        });
    };

    btnClear.onclick = clearState;

    // Regenerate button - re-run AI with current image
    btnRegenerate.onclick = () => {
        if (currentImageBase64) {
            statusMessage.textContent = "Regenerating...";
            triggerAIProcessing(currentImageBase64);
        } else {
            statusMessage.textContent = "No slide image available. Capture a slide first.";
        }
    };

    // Insert to Notes - write to PowerPoint speaker notes
    btnInsertNotes.onclick = async () => {
        const scriptText = aiOutput.innerText;
        if (!scriptText || scriptText === "Waiting for AI...") {
            statusMessage.textContent = "No script to insert.";
            return;
        }

        try {
            statusMessage.textContent = "Inserting to notes...";
            await PowerPoint.run(async (context) => {
                const selectedSlides = context.presentation.getSelectedSlides();
                selectedSlides.load("items");
                await context.sync();

                if (selectedSlides.items.length === 0) {
                    throw new Error("No slide selected.");
                }

                const currentSlide = selectedSlides.items[0];
                // Use setNotes API if available, otherwise fallback
                // For PowerPoint API 1.3+, we can set notes
                currentSlide.notesSlide.load("shapes");
                await context.sync();

                // Find the notes text frame
                const shapes = currentSlide.notesSlide.shapes;
                shapes.load("items");
                await context.sync();

                // Notes placeholder is typically shape index 1 (body placeholder)
                let notesShape = null;
                for (const shape of shapes.items) {
                    shape.load("type, textFrame");
                }
                await context.sync();

                for (const shape of shapes.items) {
                    if (shape.textFrame) {
                        notesShape = shape;
                        break;
                    }
                }

                if (notesShape) {
                    notesShape.textFrame.textRange.text = scriptText;
                    await context.sync();
                    statusMessage.textContent = "Script inserted to speaker notes!";

                    // Visual feedback
                    const originText = btnInsertNotes.textContent;
                    btnInsertNotes.textContent = "✓ Inserted!";
                    setTimeout(() => btnInsertNotes.textContent = originText, 2000);
                } else {
                    throw new Error("Could not find notes text frame.");
                }
            });
        } catch (error) {
            console.error("Insert to Notes failed:", error);
            statusMessage.textContent = "Insert failed: " + error.message;
        }
    };

    // Global Paste Listener
    document.addEventListener("paste", handlePaste);

    // Init
    checkCapabilities();
}

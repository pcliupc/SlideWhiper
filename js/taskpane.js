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

    // Session Memory - tracks previous slide scripts for flow continuity
    let sessionMemory = {
        previousSlideId: null,
        previousScript: null
    };

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

            // Phase 3: Get slide text and slide ID for context
            let slideText = "";
            let currentSlideId = null;

            try {
                statusMessage.textContent = "Extracting slide context...";
                slideText = await CaptureService.getSlideText();
                currentSlideId = await CaptureService.getSlideIndex();
            } catch (e) {
                console.warn("Could not extract slide context:", e);
            }

            // Build context object
            const context = {
                slideText: slideText,
                previousScript: null
            };

            // Only use previous script if it's from a different slide (for flow continuity)
            if (sessionMemory.previousSlideId !== null &&
                sessionMemory.previousSlideId !== currentSlideId &&
                sessionMemory.previousScript) {
                context.previousScript = sessionMemory.previousScript;
            }

            statusMessage.textContent = "Generating speech...";

            await AIService.generateSpeech(base64, config, options, context, (chunk) => {
                aiOutput.textContent += chunk;
                // Basic auto-scroll
                // aiOutput.scrollTop = aiOutput.scrollHeight; 
            });

            // Update session memory with current slide's script
            sessionMemory.previousSlideId = currentSlideId;
            sessionMemory.previousScript = aiOutput.textContent;

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

    // Insert to Notes - copy to clipboard with instructions (Office.js doesn't support notes API)
    btnInsertNotes.onclick = async () => {
        const scriptText = aiOutput.innerText;
        if (!scriptText || scriptText === "Waiting for AI...") {
            statusMessage.textContent = "No script to insert.";
            return;
        }

        try {
            // Copy to clipboard
            await navigator.clipboard.writeText(scriptText);

            statusMessage.textContent = "📋 Copied! Click Notes area in PPT and press Ctrl+V (Cmd+V on Mac) to paste.";

            // Visual feedback
            const originText = btnInsertNotes.textContent;
            btnInsertNotes.textContent = "✓ Copied!";
            setTimeout(() => {
                btnInsertNotes.textContent = originText;
            }, 2000);

        } catch (error) {
            console.error("Copy failed:", error);
            statusMessage.textContent = "Copy failed: " + error.message;
        }
    };

    // Global Paste Listener
    document.addEventListener("paste", handlePaste);

    // Init
    checkCapabilities();
}

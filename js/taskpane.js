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
            await AIService.generateSpeech(base64, config, (chunk) => {
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

    // Global Paste Listener
    document.addEventListener("paste", handlePaste);

    // Init
    checkCapabilities();
}

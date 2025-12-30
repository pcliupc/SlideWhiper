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
    const loadingIndicator = document.getElementById("loading-indicator");
    const btnCopy = document.getElementById("btn-copy");
    const btnRegenerate = document.getElementById("btn-regenerate");
    const btnInsertNotes = document.getElementById("btn-insert-notes");
    const statusMessage = document.getElementById("status-message");

    // History Elements
    const historySection = document.getElementById("history-section");
    const historyList = document.getElementById("history-list");
    const btnToggleHistory = document.getElementById("btn-toggle-history");
    const btnClearAllHistory = document.getElementById("btn-clear-all-history");
    const slideIndicator = document.getElementById("slide-indicator");

    // State
    let currentImageBase64 = null;
    let currentSlideId = null;

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
        document.getElementById('config-backend-url').value = config.backendUrl;
        document.getElementById('config-backend-api-key').value = config.backendApiKey;
        document.getElementById('config-base-url').value = config.baseUrl;
        document.getElementById('config-api-key').value = config.apiKey;
        document.getElementById('config-model').value = config.model;
    }

    function saveSettingsFromUI() {
        const config = {
            backendUrl: document.getElementById('config-backend-url').value,
            backendApiKey: document.getElementById('config-backend-api-key').value,
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

    // --- History Management Functions ---

    /**
     * Extract slide title from slide text (first non-empty line)
     */
    async function getSlideTitle() {
        try {
            const slideText = await CaptureService.getSlideText();
            const lines = slideText.split('\n').filter(line => line.trim());
            return lines[0] || '';
        } catch (error) {
            return '';
        }
    }

    /**
     * Update slide indicator in header
     */
    function updateSlideIndicator(slideId) {
        if (slideId) {
            slideIndicator.textContent = `(Slide ID: ${slideId})`;
        } else {
            slideIndicator.textContent = '';
        }
    }

    /**
     * Load slide content from history or show empty state
     */
    async function loadSlideContent(slideId) {
        const historyItem = HistoryManager.load(slideId);

        if (historyItem) {
            // Load saved script
            currentImageBase64 = null;
            aiOutput.textContent = historyItem.script;

            // Restore options
            document.getElementById('option-tone').value = historyItem.options.tone || 'professional';
            document.getElementById('option-length').value = historyItem.options.length || 'medium';
            document.getElementById('option-language').value = historyItem.options.language || 'auto';

            resultSection.classList.remove('hidden');
            previewContainer.classList.add('hidden');
            btnAutoCapture.classList.add('hidden');
            manualCaptureHint.classList.add('hidden');
            statusMessage.textContent = `Loaded saved script for slide ${slideId}`;
        } else {
            // No history for this slide - reset to capture state
            clearState();
            statusMessage.textContent = `Ready to analyze slide ${slideId}`;
        }
    }

    /**
     * Handle slide change events from PowerPoint
     */
    async function onSlideChanged() {
        try {
            const slideId = await CaptureService.getSlideIndex();
            if (slideId === currentSlideId) {
                return; // No change
            }

            currentSlideId = slideId;
            updateSlideIndicator(slideId);
            await loadSlideContent(slideId);
            renderHistoryList();
        } catch (error) {
            console.error('Failed to handle slide change:', error);
        }
    }

    /**
     * Render history list from all saved slides
     */
    function renderHistoryList() {
        const allHistory = HistoryManager.getAll();
        const historyEntries = Object.values(allHistory);

        if (historyEntries.length === 0) {
            historySection.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyList.innerHTML = '';

        // Sort by slide ID
        historyEntries.sort((a, b) => {
            // Handle both numeric and string IDs
            const aId = typeof a.slideId === 'string' ? a.slideId : String(a.slideId);
            const bId = typeof b.slideId === 'string' ? b.slideId : String(b.slideId);
            return aId.localeCompare(bId);
        });

        historyEntries.forEach(item => {
            const itemEl = createHistoryItemElement(item);
            historyList.appendChild(itemEl);
        });
    }

    /**
     * Create a single history item element
     */
    function createHistoryItemElement(item) {
        const div = document.createElement('div');
        const isCurrent = item.slideId === currentSlideId;
        div.className = 'history-item' + (isCurrent ? ' current' : '');

        const title = item.slideTitle || 'Untitled';
        const timestamp = new Date(item.timestamp).toLocaleString();

        div.innerHTML = `
            <div class="history-item-info">
                <div class="history-item-title">Slide ID ${item.slideId}: ${title}</div>
                <div class="history-item-meta">${timestamp}</div>
            </div>
            <button class="history-item-delete" data-slide-id="${item.slideId}" title="Delete">🗑️</button>
        `;

        // Click on info to navigate to slide
        div.querySelector('.history-item-info').onclick = () => navigateToSlide(item.slideId);

        // Click on delete button
        div.querySelector('.history-item-delete').onclick = (e) => {
            e.stopPropagation();
            deleteHistoryItem(item.slideId);
        };

        return div;
    }

    /**
     * Navigate to a specific slide in PowerPoint
     */
    async function navigateToSlide(slideId) {
        try {
            statusMessage.textContent = `Navigating to slide ${slideId}...`;

            // Note: We can't directly set a slide by ID in PowerPoint API
            // The slide change event will trigger automatically if user manually navigates
            // For now, just load the content - user controls navigation in PPT
            currentSlideId = slideId;
            updateSlideIndicator(slideId);
            await loadSlideContent(slideId);
            renderHistoryList();

            statusMessage.textContent = `Viewing slide ${slideId}`;
        } catch (error) {
            statusMessage.textContent = "Failed to navigate: " + error.message;
            console.error(error);
        }
    }

    /**
     * Delete a single history item
     */
    async function deleteHistoryItem(slideId) {
        try {
            await HistoryManager.delete(slideId);

            // If deleting current slide, reset UI
            if (slideId === currentSlideId) {
                clearState();
            }

            renderHistoryList();
            statusMessage.textContent = `Deleted history for slide ${slideId}`;
        } catch (error) {
            statusMessage.textContent = "Failed to delete: " + error.message;
            console.error(error);
        }
    }

    /**
     * Clear all history with confirmation
     */
    async function clearAllHistory() {
        if (!confirm("Delete all saved scripts? This cannot be undone.")) {
            return;
        }

        try {
            await HistoryManager.clearAll();
            clearState();
            historySection.classList.add('hidden');
            statusMessage.textContent = "All history cleared";
        } catch (error) {
            statusMessage.textContent = "Failed to clear history: " + error.message;
            console.error(error);
        }
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

        // Show loading indicator, hide output
        loadingIndicator.classList.remove('hidden');
        aiOutput.classList.add('hidden');
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
                // Hide loading indicator and show output on first chunk
                if (loadingIndicator && !loadingIndicator.classList.contains('hidden')) {
                    loadingIndicator.classList.add('hidden');
                    aiOutput.classList.remove('hidden');
                }

                aiOutput.textContent += chunk;
                // Basic auto-scroll
                // aiOutput.scrollTop = aiOutput.scrollHeight; 
            });

            // Save to history after successful generation
            const slideTitle = await getSlideTitle();
            await HistoryManager.save(currentSlideId, {
                slideId: currentSlideId,
                slideTitle: slideTitle,
                script: aiOutput.textContent,
                timestamp: Date.now(),
                options: options
            });

            // Update session memory with current slide's script
            sessionMemory.previousSlideId = currentSlideId;
            sessionMemory.previousScript = aiOutput.textContent;

            // Refresh history list
            renderHistoryList();

            statusMessage.textContent = "Speech generated successfully.";
        } catch (error) {
            // Hide loading indicator on error
            loadingIndicator.classList.add('hidden');
            aiOutput.classList.remove('hidden');

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

    btnClear.onclick = async () => {
        if (currentSlideId) {
            await deleteHistoryItem(currentSlideId);
        } else {
            clearState();
        }
    };

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

    // History event listeners
    if (btnClearAllHistory) {
        btnClearAllHistory.onclick = clearAllHistory;
        console.log('Clear All History button listener attached');
    } else {
        console.error('btnClearAllHistory element not found - check HTML ID');
    }

    if (btnToggleHistory) {
        btnToggleHistory.onclick = () => {
            const isHidden = historyList.classList.toggle('hidden');
            btnToggleHistory.textContent = isHidden ? 'Show' : 'Hide';
        };
        console.log('Toggle History button listener attached');
    } else {
        console.error('btnToggleHistory element not found - check HTML ID');
    }

    // --- Slide Change Detection Setup ---

    /**
     * Register slide change event listener
     */
    function setupSlideChangeDetection() {
        try {
            Office.context.document.addHandlerAsync(
                Office.EventType.DocumentSelectionChanged,
                onSlideChanged,
                (result) => {
                    if (result.status === Office.AsyncResultStatus.Failed) {
                        console.warn('Auto slide detection not available:', result.error);
                        statusMessage.textContent = 'Auto slide detection unavailable. Use Analyze button manually.';
                    } else {
                        console.log('Slide change detection enabled');
                    }
                }
            );
        } catch (error) {
            console.warn('Could not setup slide change detection:', error);
        }
    }

    // --- Initialization ---

    async function initialize() {
        checkCapabilities();
        setupSlideChangeDetection();

        // Load initial slide
        try {
            const slideId = await CaptureService.getSlideIndex();
            currentSlideId = slideId;
            updateSlideIndicator(slideId);
            await loadSlideContent(slideId);
            renderHistoryList();
        } catch (error) {
            console.error('Failed to load initial slide:', error);
        }
    }

    // Init
    initialize();
}

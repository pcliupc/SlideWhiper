/**
 * HistoryManager - Manages slide script history using Office.js document settings
 * 
 * Stores all slide scripts within the PowerPoint document itself, ensuring history
 * travels with the file across devices and sessions.
 * 
 * Storage key: 'slideHistory'
 * Data structure: { slideId: { slideId, slideTitle, script, timestamp, options } }
 */
const HistoryManager = (function () {
    const STORAGE_KEY = 'slideHistory';
    const MAX_HISTORY_ITEMS = 50; // Prevent storage overflow

    // --- Private Methods ---

    /**
     * Hydrate (load) history data from Office document settings
     * @returns {Object} History data object keyed by slide ID
     */
    function _hydrate() {
        try {
            if (!Office.context || !Office.context.document || !Office.context.document.settings) {
                console.warn('Office.context.document.settings not available');
                return {};
            }

            const data = Office.context.document.settings.get(STORAGE_KEY);
            if (!data) {
                return {};
            }

            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to hydrate history:', error);
            return {};
        }
    }

    /**
     * Persist (save) history data to Office document settings
     * @param {Object} historyData - History data object to save
     */
    function _persist(historyData) {
        return new Promise((resolve, reject) => {
            try {
                if (!Office.context || !Office.context.document || !Office.context.document.settings) {
                    reject(new Error('Office.context.document.settings not available'));
                    return;
                }

                const jsonData = JSON.stringify(historyData);
                Office.context.document.settings.set(STORAGE_KEY, jsonData);

                // saveAsync to persist to document
                Office.context.document.settings.saveAsync((asyncResult) => {
                    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                        resolve();
                    } else {
                        reject(new Error('Failed to save settings: ' + asyncResult.error.message));
                    }
                });
            } catch (error) {
                console.error('Failed to persist history:', error);
                reject(error);
            }
        });
    }

    /**
     * Enforce max history limit by removing oldest entries
     * @param {Object} historyData - History data object
     * @returns {Object} Pruned history data
     */
    function _enforceLimit(historyData) {
        const entries = Object.values(historyData);
        if (entries.length <= MAX_HISTORY_ITEMS) {
            return historyData;
        }

        // Sort by timestamp (oldest first) and remove excess
        const sorted = entries.sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = sorted.slice(0, entries.length - MAX_HISTORY_ITEMS);

        const pruned = { ...historyData };
        toRemove.forEach(item => {
            delete pruned[item.slideId];
        });

        console.log(`Pruned ${toRemove.length} old history items`);
        return pruned;
    }

    // --- Public API ---

    /**
     * Save slide script to history
     * @param {string|number} slideId - Unique slide identifier
     * @param {Object} slideData - { slideId, slideTitle, script, timestamp, options }
     * @returns {Promise<void>}
     */
    async function save(slideId, slideData) {
        try {
            const historyData = _hydrate();

            // Store with slideId as key
            historyData[slideId] = {
                slideId: slideId,
                slideTitle: slideData.slideTitle || '',
                script: slideData.script || '',
                timestamp: slideData.timestamp || Date.now(),
                options: slideData.options || {}
            };

            // Enforce storage limit
            const prunedData = _enforceLimit(historyData);

            await _persist(prunedData);
            console.log(`Saved history for slide ${slideId}`);
        } catch (error) {
            console.error(`Failed to save history for slide ${slideId}:`, error);
            throw error;
        }
    }

    /**
     * Load slide script from history
     * @param {string|number} slideId - Unique slide identifier
     * @returns {Object|null} Slide data or null if not found
     */
    function load(slideId) {
        try {
            const historyData = _hydrate();
            return historyData[slideId] || null;
        } catch (error) {
            console.error(`Failed to load history for slide ${slideId}:`, error);
            return null;
        }
    }

    /**
     * Get all saved slide histories
     * @returns {Object} All history data keyed by slide ID
     */
    function getAll() {
        return _hydrate();
    }

    /**
     * Delete a single slide's history
     * @param {string|number} slideId - Unique slide identifier
     * @returns {Promise<void>}
     */
    async function deleteItem(slideId) {
        try {
            const historyData = _hydrate();

            if (historyData[slideId]) {
                delete historyData[slideId];
                await _persist(historyData);
                console.log(`Deleted history for slide ${slideId}`);
            }
        } catch (error) {
            console.error(`Failed to delete history for slide ${slideId}:`, error);
            throw error;
        }
    }

    /**
     * Clear all slide history
     * @returns {Promise<void>}
     */
    async function clearAll() {
        try {
            await _persist({});
            console.log('Cleared all history');
        } catch (error) {
            console.error('Failed to clear all history:', error);
            throw error;
        }
    }

    // Public API
    return {
        save: save,
        load: load,
        getAll: getAll,
        delete: deleteItem,
        clearAll: clearAll
    };

})();

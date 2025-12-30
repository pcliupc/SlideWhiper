const ConfigManager = (function () {
    const KEYS = {
        BASE_URL: 'sw_base_url',
        API_KEY: 'sw_api_key',
        MODEL: 'sw_model',
        BACKEND_URL: 'sw_backend_url',
        BACKEND_API_KEY: 'sw_backend_api_key',
        AUTO_GENERATE: 'sw_auto_generate'
    };

    const DEFAULTS = {
        BASE_URL: 'https://api.openai.com',
        MODEL: 'gpt-4o',
        BACKEND_URL: 'localhost:3000'
    };

    function getConfig() {
        return {
            baseUrl: localStorage.getItem(KEYS.BASE_URL) || DEFAULTS.BASE_URL,
            apiKey: localStorage.getItem(KEYS.API_KEY) || '',
            model: localStorage.getItem(KEYS.MODEL) || DEFAULTS.MODEL,
            backendUrl: localStorage.getItem(KEYS.BACKEND_URL) || DEFAULTS.BACKEND_URL,
            backendApiKey: localStorage.getItem(KEYS.BACKEND_API_KEY) || '',
            autoGenerate: localStorage.getItem(KEYS.AUTO_GENERATE) === 'true'
        };
    }

    function saveConfig(config) {
        if (config.baseUrl) localStorage.setItem(KEYS.BASE_URL, config.baseUrl);
        if (config.apiKey) localStorage.setItem(KEYS.API_KEY, config.apiKey);
        if (config.model) localStorage.setItem(KEYS.MODEL, config.model);
        if (config.backendUrl !== undefined) localStorage.setItem(KEYS.BACKEND_URL, config.backendUrl);
        if (config.backendApiKey !== undefined) localStorage.setItem(KEYS.BACKEND_API_KEY, config.backendApiKey);
        if (config.autoGenerate !== undefined) localStorage.setItem(KEYS.AUTO_GENERATE, config.autoGenerate.toString());
    }

    function isValid() {
        const config = getConfig();
        return config.apiKey && config.apiKey.length > 0;
    }

    return {
        get: getConfig,
        save: saveConfig,
        isValid: isValid
    };
})();


const ConfigManager = (function() {
    const KEYS = {
        BASE_URL: 'sw_base_url',
        API_KEY: 'sw_api_key',
        MODEL: 'sw_model'
    };

    const DEFAULTS = {
        BASE_URL: 'https://api.openai.com',
        MODEL: 'gpt-4o'
    };

    function getConfig() {
        return {
            baseUrl: localStorage.getItem(KEYS.BASE_URL) || DEFAULTS.BASE_URL,
            apiKey: localStorage.getItem(KEYS.API_KEY) || '',
            model: localStorage.getItem(KEYS.MODEL) || DEFAULTS.MODEL
        };
    }

    function saveConfig(config) {
        if (config.baseUrl) localStorage.setItem(KEYS.BASE_URL, config.baseUrl);
        if (config.apiKey) localStorage.setItem(KEYS.API_KEY, config.apiKey);
        if (config.model) localStorage.setItem(KEYS.MODEL, config.model);
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

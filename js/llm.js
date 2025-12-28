const AIService = (function () {

    function buildPrompt(options, context) {
        const toneDescriptions = {
            professional: "formal, confident, and business-appropriate",
            energetic: "enthusiastic, dynamic, and high-energy",
            storytelling: "narrative-driven, engaging, and memorable",
            casual: "relaxed, conversational, and friendly"
        };

        const lengthDescriptions = {
            short: "very brief (around 30 seconds when spoken)",
            medium: "moderate length (around 1 minute when spoken)",
            long: "detailed and comprehensive (around 2 minutes when spoken)"
        };

        const tone = toneDescriptions[options.tone] || toneDescriptions.professional;
        const length = lengthDescriptions[options.length] || lengthDescriptions.medium;

        let languageInstruction = "";
        if (options.language === "english") {
            languageInstruction = "Respond ONLY in English.";
        } else if (options.language === "chinese") {
            languageInstruction = "Respond ONLY in Chinese (中文).";
        } else {
            languageInstruction = "Respond in the same language as the slide content.";
        }

        // Build context section
        let contextSection = "";

        if (context.slideText) {
            contextSection += `\n\nSlide Text Content (for reference, may contain exact names/numbers):\n${context.slideText}`;
        }

        if (context.previousScript) {
            contextSection += `\n\nPrevious Slide's Script (for flow continuity):\n${context.previousScript}`;
            contextSection += `\n\nIMPORTANT: Start with a natural transition from the previous slide. Use phrases like "Building on that...", "Now let's look at...", "Moving forward...", etc.`;
        }

        return `You are an expert speech coach. Generate a speech script based on the visual content of this presentation slide.

Requirements:
- Tone: ${tone}
- Length: ${length}
- ${languageInstruction}

Make it natural and suitable for a verbal presentation. Do not include stage directions or speaker notes - just the speech text itself.${contextSection}`;
    }

    async function generateSpeech(base64Image, config, options, context, onChunk) {
        if (!config.apiKey) {
            throw new Error("API Key is missing. Please configure it in settings.");
        }

        // Check if the user provided a full URL (including /chat/completions)
        let endpoint = config.baseUrl;
        if (!endpoint.includes('/chat/completions')) {
            // Append standard OpenAI path if not present
            endpoint = `${endpoint.replace(/\/+$/, '')}/chat/completions`;
        }

        const promptText = buildPrompt(options || {}, context || {});

        const payload = {
            model: config.model,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: promptText },
                        { type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}` } }
                    ]
                }
            ],
            stream: true // Enable streaming
        };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split("\n");
                buffer = lines.pop(); // Keep the last partial line

                for (const line of lines) {
                    const message = line.trim();
                    if (message.startsWith("data: ")) {
                        const jsonStr = message.substring(6);
                        if (jsonStr === "[DONE]") return;

                        try {
                            const parsed = JSON.parse(jsonStr);
                            const content = parsed.choices[0]?.delta?.content || "";
                            if (content && onChunk) {
                                onChunk(content);
                            }
                        } catch (e) {
                            console.warn("Error parsing stream chunk", e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error("AI Request Failed:", error);
            throw error;
        }
    }

    return {
        generateSpeech: generateSpeech
    };

})();

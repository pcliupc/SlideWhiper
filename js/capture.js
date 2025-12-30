const CaptureService = (function () {

    // Check if Auto Capture is supported (PowerPointApi 1.8+)
    function isAutoCaptureSupported() {
        if (typeof Office !== "undefined" && Office.context && Office.context.requirements) {
            return Office.context.requirements.isSetSupported('PowerPointApi', '1.8');
        }
        return false;
    }

    // Auto Capture via Office.js API
    async function getSlideImageAuto() {
        try {
            return await PowerPoint.run(async (context) => {
                const selectedSlides = context.presentation.getSelectedSlides();
                selectedSlides.load("items");
                await context.sync();

                if (selectedSlides.items.length === 0) {
                    throw new Error("No slide selected.");
                }

                const currentSlide = selectedSlides.items[0];
                const imageResult = currentSlide.getImageAsBase64({
                    format: "Png",
                    width: 1280,
                    height: 720
                });
                await context.sync();

                return imageResult.value; // Returns Base64 string
            });
        } catch (error) {
            console.error("Auto Capture Failed:", error);
            throw error;
        }
    }

    // Extract text from current slide shapes
    async function getSlideText() {
        try {
            return await PowerPoint.run(async (context) => {
                const selectedSlides = context.presentation.getSelectedSlides();
                selectedSlides.load("items");
                await context.sync();

                if (selectedSlides.items.length === 0) {
                    return "";
                }

                const currentSlide = selectedSlides.items[0];
                const shapes = currentSlide.shapes;
                shapes.load("items");
                await context.sync();

                const textParts = [];
                for (const shape of shapes.items) {
                    try {
                        shape.load("textFrame");
                        await context.sync();

                        if (shape.textFrame) {
                            shape.textFrame.load("textRange");
                            await context.sync();

                            if (shape.textFrame.textRange) {
                                shape.textFrame.textRange.load("text");
                                await context.sync();

                                const text = shape.textFrame.textRange.text;
                                if (text && text.trim()) {
                                    textParts.push(text.trim());
                                }
                            }
                        }
                    } catch (e) {
                        // Some shapes don't have text frames, skip them
                        continue;
                    }
                }

                return textParts.join("\n");
            });
        } catch (error) {
            console.warn("Could not extract slide text:", error);
            return "";
        }
    }

    // Get current slide index for session tracking
    async function getSlideIndex() {
        try {
            return await PowerPoint.run(async (context) => {
                const selectedSlides = context.presentation.getSelectedSlides();
                selectedSlides.load("items");
                await context.sync();

                if (selectedSlides.items.length === 0) {
                    return -1;
                }

                const currentSlide = selectedSlides.items[0];
                currentSlide.load("id");
                await context.sync();

                return currentSlide.id;
            });
        } catch (error) {
            console.warn("Could not get slide index:", error);
            return -1;
        }
    }

    // Manual Capture helper (processes clipboard items)
    function getSlideImageFromClipboard(clipboardItems) {
        return new Promise((resolve, reject) => {
            let foundImage = false;
            for (let i = 0; i < clipboardItems.length; i++) {
                if (clipboardItems[i].type.indexOf("image") !== -1) {
                    foundImage = true;
                    const blob = clipboardItems[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        // result is data:image/png;base64,.....
                        // We need the raw base64 part often, but keeping metadata is fine for display
                        // For API, we might need to strip the prefix.
                        const rawBase64 = e.target.result.split(',')[1];
                        resolve(rawBase64);
                    };
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(blob);
                    break;
                }
            }
            if (!foundImage) {
                reject(new Error("No image found in clipboard."));
            }
        });
    }

    // Get 1-based slide position (index) in the presentation
    async function getSlideIndexNumber() {
        try {
            return await PowerPoint.run(async (context) => {
                const slides = context.presentation.slides;
                slides.load("items");
                const selectedSlides = context.presentation.getSelectedSlides();
                selectedSlides.load("items");
                await context.sync();

                if (selectedSlides.items.length === 0) {
                    return -1;
                }

                const currentSlide = selectedSlides.items[0];
                currentSlide.load("id");
                await context.sync();

                // Find the index of current slide in all slides
                for (let i = 0; i < slides.items.length; i++) {
                    slides.items[i].load("id");
                }
                await context.sync();

                const index = slides.items.findIndex(s => s.id === currentSlide.id);
                return index >= 0 ? index + 1 : -1; // 1-based index
            });
        } catch (error) {
            console.warn("Could not get slide index number:", error);
            return -1;
        }
    }

    return {
        isSupported: isAutoCaptureSupported,
        captureAuto: getSlideImageAuto,
        captureManual: getSlideImageFromClipboard,
        getSlideText: getSlideText,
        getSlideIndex: getSlideIndex,
        getSlideIndexNumber: getSlideIndexNumber
    };

})();

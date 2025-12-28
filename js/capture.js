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

    return {
        isSupported: isAutoCaptureSupported,
        captureAuto: getSlideImageAuto,
        captureManual: getSlideImageFromClipboard
    };

})();

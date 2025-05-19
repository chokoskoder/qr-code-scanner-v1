// content.js
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.type === "SCAN_QR") {
        const imageUrl = msg.imageUrl;

        const img = new Image();
        img.crossOrigin = "anonymous"; // Essential for cross-origin images

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    const qrData = code.data;

                    // Option 1: Confirm with the user before redirecting
                    if (confirm("QR code detected: " + qrData + "\n\nDo you want to go to this URL?")) {
                        window.location.href = qrData;
                    } else {
                        // User cancelled the redirect
                        alert("Redirection cancelled.");
                    }

                    // Option 2 (Less user-friendly, redirects immediately):
                    // window.location.href = qrData;

                } else {
                    alert("No QR code found in the image.");
                }
            } catch (error) {
                console.error("Error scanning QR code:", error);
                alert("Error scanning QR code. Check console for details.");
            }
        };

        img.onerror = (e) => {
            console.error("Failed to load image:", imageUrl, e);
            alert("Failed to load image for QR scanning. Make sure the image is accessible.");
        };

        img.src = imageUrl;
    }
});
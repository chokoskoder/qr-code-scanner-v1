//content.js 
// this script will run on every web page where it is called and can interact with it 
//doubt : wont there be some sites which dont allow such a script to run ? what about sites that dont allow js injection at all ? what other cases are there ?
// so there are certain problems one might face which have been discussed in the notion doc 

//1.now we need to listen to other parts of this extension which will give us our cue to move forward , namely background.js 
chrome.runtime.onMessage.addListener( async(msg , sender , sendResponse ) => {
    //msg : the message the objecy we are listening to will be sending , in this project we are waiting for SCAN_QR
    //sender : to identify which tab it came from 
    //sendResposne : a function to reply back to the the sender 

    //2. check if the recieved message is what we want to start our operation on 
    if(msg.type === "SCAN_QR"){
        //3.extract the image url from the message and 
        const imageUrl = msg.imageUrl;

        //4. now we create a new image html tag which will basically help us do something very important in the future  ,use the canvas api to copy the image PIXEL by PIXEL
        //and thus feed into our qrJS to work just fineee
        const img = new Image();

        //5. now its time to deal with CORS :
        //Set the crossOrigin attribute. This tells the browser to request the image
        //    with CORS (Cross-Origin Resource Sharing) headers.
        //    IMPORTANT: This only *requests* CORS; the server must *respond* with it.
        //    If the server doesn't, you'll get a "tainted canvas" error when using getImageData().          MOTA DOUBT BC , KYA HO RHA HAI YE ?
        //    (This is why we discussed proxying the image through the background script later).
        img.crossOrigin = "anonymous "


        // here comes CANVAS!! just like we discussed above
        // 7. Create an in-memory canvas element (not added to the webpage's DOM)
        img.onload = () => {
            const canvas = document.createElement("canvas")
        }

        // 8. Set the canvas dimensions to match the loaded image
            canvas.width = img.width;
            canvas.height = img.height;

        // 9. Get the 2D rendering context of the canvas (DOUBT : why do we need to do this ??)
            const ctx = canvas.getContext("2d"); 

        ctx.drawImage(img, 0, 0); //this draws the image onto the canvas 

        //entering the try catch area , now all we need to do is make sure that the above logic is working and then feed it into jsQR library and extract the data we get from it , to 
        //re route our users to the place their preferred QR takes them to 

        try{
            const imageData = ctx.getImageData( 0 , 0 , canvas.width , canvas.height) //This returns an ImageData object.
            // `imageData.data` is a Uint8ClampedArray containing R, G, B, A values for each pixel.

            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if(code){
                const qrData = code.data
                if (!qrData.startsWith("http://") && !qrData.startsWith("https://")) {
                        qrData = "https://" + qrData; // Prepend https:// as a reasonable default
                    }
                    if (confirm("QR code detected: " + qrData + "\n\nDo you want to go to this URL?")) {
                        // 18. If user confirms, redirect the current browser tab to the decoded URL
                        window.location.href = qrData;
                    } else {
                        // 19. If user cancels, inform them.
                        alert("Redirection cancelled.");
                    }

                } else {
                    // 20. If no QR code was found, alert the user
                    alert("No QR code found in the image.");
                }
        }
        catch(error){
            console.error("Error scanning QR code:", error);
            alert("Error scanning QR code. Check console for details.");
        }

        // 22. Define what happens if the image fails to load
        img.onerror = (e) => {
            // `e` is the error event object.
            console.error("Failed to load image:", imageUrl, e);
            alert("Failed to load image for QR scanning. Make sure the image is accessible.");
        };

        // 23. Set the image source. This starts the loading process.
        //     The `onload` or `onerror` handler will fire once loading is complete or fails.
        img.src = imageUrl;

    }
})
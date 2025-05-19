chrome.runtime.onInstalled.addListener(()=>{
    chrome.contextMenus.create({
        id : "scanQrCode" , 
        title : "Scan QR code from image",
        contexts : ["image"]
    });
});

chrome.contextMenus.onClicked.addListener((info , tab ) => { 
    if(info.menuItemId === "scanQrCode"){
        chrome.tabs.sendMessage(tab.id , {
            type : "SCAN_QR",
            imageUrl : info.srcUrl
        });
    }
});
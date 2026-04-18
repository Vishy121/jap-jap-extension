async function fetchAILearningTips(tier) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "fetchTips", tier: tier }, (response) => {
            if (chrome.runtime.lastError) {
                resolve({ 
                    success: false, 
                    error: "Extension communication error. Try reloading the extension." 
                });
            } else {
                resolve(response);
            }
        });
    });
}

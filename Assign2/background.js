const GEMINI_API_KEY = "AIzaSyBxRBhE92TXUndXVvvnZzCGr9YUDzwuDRQ";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchTips") {
        fetchAILearningTips(request.tier)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }
});

async function fetchAILearningTips(tier) {
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError = null;

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            const prompt = `
                You are an expert AI Research Curator. Provide information on 10 recent technical AI papers relevant to the "${tier}" level.
                
                Order the papers by publication date, with the newest papers appearing first.
                
                For each paper, you MUST include:
                1. Paper Title
                2. Authors
                3. Date of Publication
                4. A concise summary (exactly one paragraph) based on the paper's abstract. Do not synthesize a conversational summary; provide the technical core.
                
                Return the result in JSON format:
                {
                    "topic": "Research Field",
                    "papers": [
                        {
                            "title": "Paper Title",
                            "authors": "Author Names",
                            "date": "Publication Date",
                            "summary": "Technical summary paragraph"
                        }
                    ]
                }
            `;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) return { success: true, data: JSON.parse(jsonMatch[0]) };
            
        } catch (error) {
            console.error(`Failed with model ${model}:`, error);
            lastError = error.message;
        }
    }
    return { success: false, error: lastError || "All models failed to load." };
}

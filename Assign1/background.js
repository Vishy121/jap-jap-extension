chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) {
    return;
  }

  if (message.type === "TRANSLATE_SELECTION") {
    translateSelection(message.text)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === "SPEAK_TEXT") {
    speakJapanese(message.text)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});

async function translateSelection(rawText) {
  const sentences = splitIntoSentences(rawText);
  const pairs = [];

  for (const original of sentences) {
    const translated = await translateToJapanese(original);
    pairs.push({
      original,
      japanese: translated
    });
  }

  return pairs;
}

function splitIntoSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}

async function translateToJapanese(text) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=" +
    encodeURIComponent(text);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to reach translation service.");
  }

  const data = await response.json();
  return (data?.[0] || []).map((chunk) => chunk[0]).join("").trim();
}

function speakJapanese(text) {
  const cleaned = (text || "").trim();
  if (!cleaned) return Promise.resolve();

  return new Promise((resolve, reject) => {
    chrome.tts.stop();
    chrome.tts.speak(cleaned, {
      lang: "ja-JP",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      onEvent: (event) => {
        if (event.type === "error") {
          reject(new Error(event.errorMessage || "TTS playback failed."));
        }
        if (event.type === "end" || event.type === "interrupted" || event.type === "cancelled") {
          resolve();
        }
      }
    });
  });
}

let cardEl = null;
let requestId = 0;

document.addEventListener("mouseup", handleSelection);
document.addEventListener("keyup", (event) => {
  if (event.key === "Shift" || event.key.startsWith("Arrow")) {
    handleSelection();
  }
});
document.addEventListener("mousedown", (event) => {
  if (cardEl && !cardEl.contains(event.target)) {
    removeCard();
  }
});
document.addEventListener("click", (event) => {
  const button = event.target.closest(".jap-jap-play-btn");
  if (!button) return;
  const text = button.getAttribute("data-japanese-text");
  if (!text) return;
  speakText(text);
});

function handleSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    removeCard();
    return;
  }

  const text = selection.toString().trim();
  if (!text) {
    removeCard();
    return;
  }

  let rect;
  try {
    rect = selection.getRangeAt(0).getBoundingClientRect();
  } catch (_error) {
    removeCard();
    return;
  }

  if (!rect || (rect.width === 0 && rect.height === 0)) {
    return;
  }

  const id = ++requestId;
  renderLoading(rect);

  translateSelection(text)
    .then((pairs) => {
      if (id !== requestId) return;
      renderResult(rect, pairs);
    })
    .catch((error) => {
      if (id !== requestId) return;
      renderError(rect, error.message || "Translation failed.");
    });
}

function ensureCard() {
  if (cardEl) return cardEl;
  cardEl = document.createElement("div");
  cardEl.className = "jap-jap-card";
  document.documentElement.appendChild(cardEl);
  return cardEl;
}

function placeCard(rect) {
  const card = ensureCard();
  const top = window.scrollY + rect.bottom + 8;
  const left = window.scrollX + rect.left;
  card.style.top = `${Math.max(8, top)}px`;
  card.style.left = `${Math.max(8, left)}px`;
}

function renderLoading(rect) {
  placeCard(rect);
  cardEl.innerHTML = `<div class="jap-jap-title">Jap-Jap</div><div>Translating...</div>`;
}

function renderError(rect, message) {
  placeCard(rect);
  cardEl.innerHTML = `<div class="jap-jap-title">Jap-Jap</div><div class="jap-jap-error">${escapeHtml(
    message
  )}</div>`;
}

function renderResult(rect, pairs) {
  placeCard(rect);
  const rows = pairs
    .map(
      (pair) => `
      <div class="jap-jap-item">
        <div class="jap-jap-label">Original</div>
        <div>${escapeHtml(pair.original)}</div>
        <div class="jap-jap-label">Japanese</div>
        <div>${escapeHtml(pair.japanese)}</div>
        <div class="jap-jap-label">Sample Japanese (< 5 words)</div>
        <div>${escapeHtml(pair.sampleJapanese || "Select one word to get a real-world sample sentence.")}</div>
        <div class="jap-jap-label">Sample English</div>
        <div>${escapeHtml(pair.sampleEnglish || "-")}</div>
        <button class="jap-jap-play-btn" data-japanese-text="${escapeHtml(
          pair.japanese || ""
        )}">Play Audio</button>
      </div>
    `
    )
    .join("");

  cardEl.innerHTML = `<div class="jap-jap-title">Jap-Jap</div>${rows}`;
}

function removeCard() {
  if (!cardEl) return;
  cardEl.remove();
  cardEl = null;
}

function speakText(text) {
  const cleaned = (text || "").trim();
  if (!cleaned) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = "ja-JP";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  } catch (_error) {
    // Do not block translation UI when speech is unavailable.
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function translateSelection(rawText) {
  const sentences = splitIntoSentences(rawText);
  const pairs = [];

  for (const original of sentences) {
    let japanese = "";
    try {
      japanese = await translateToJapanese(original);
    } catch (_error) {
      // Keep UI usable even when translation endpoint is temporarily unavailable.
      japanese = original;
    }
    let sampleJapanese = "";
    let sampleEnglish = "";

    if (getWordCount(original) === 1) {
      try {
        const sample = await fetchRealWorldSample(japanese);
        sampleJapanese = sample.japanese;
        sampleEnglish = sample.english;
      } catch (_error) {
        sampleJapanese = "";
        sampleEnglish = "";
      }
    }

    pairs.push({ original, japanese, sampleJapanese, sampleEnglish });
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
  const urls = [
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=" +
      encodeURIComponent(text),
    "https://translate.google.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=" +
      encodeURIComponent(text)
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const result = (data?.[0] || []).map((chunk) => chunk[0]).join("").trim();
      if (result) return result;
    } catch (_error) {
      // Try next endpoint.
    }
  }

  throw new Error("Translation service unavailable. Please try again.");
}

async function fetchRealWorldSample(japaneseWord) {
  const queryWord = normalizeJapaneseQuery(japaneseWord);
  if (!queryWord) return { japanese: "", english: "" };

  const url =
    "https://tatoeba.org/en/api_v0/search?from=jpn&to=eng&sort=relevance&page=1&query=" +
    encodeURIComponent(queryWord);
  const response = await fetch(url);
  if (!response.ok) return { japanese: "", english: "" };

  const data = await response.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  const candidates = results.filter(
    (row) => typeof row?.text === "string" && row.text.includes(queryWord)
  );
  if (!candidates.length) return { japanese: "", english: "" };

  const picked = pickBestSample(candidates);
  if (!picked) return { japanese: "", english: "" };

  return {
    japanese: picked.text || "",
    english: extractEnglishTranslation(picked.translations)
  };
}

function pickBestSample(rows) {
  const scored = rows
    .map((row) => {
      const text = row?.text || "";
      const words = countJapaneseWords(text);
      return {
        row,
        withinFive: words <= 5 ? 0 : 1,
        words,
        length: text.length
      };
    })
    .sort((a, b) => {
      if (a.withinFive !== b.withinFive) return a.withinFive - b.withinFive;
      if (a.words !== b.words) return a.words - b.words;
      return a.length - b.length;
    });

  return scored[0]?.row || null;
}

function extractEnglishTranslation(translations) {
  if (!Array.isArray(translations)) return "";
  for (const bucket of translations) {
    if (!Array.isArray(bucket)) continue;
    const item = bucket.find(
      (entry) => typeof entry?.text === "string" && entry.text.trim()
    );
    if (item?.text) return item.text.trim();
  }
  return "";
}

function normalizeJapaneseQuery(value) {
  return (value || "")
    .trim()
    .replace(/[。、「」『』（）()!?.,]/g, "")
    .split(/\s+/)[0] || "";
}

function countJapaneseWords(text) {
  const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
  let count = 0;
  for (const part of segmenter.segment(text || "")) {
    if (part.segment.trim()) count += 1;
  }
  return count;
}

function getWordCount(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

# Jap-Jap Extension

`Jap-Jap` is a Chrome extension that translates selected webpage text into Japanese, provides click-to-play audio, and shows a real-world sample sentence (Japanese + English) when a single word is selected.

## Project Summary

- **Type:** Chrome Extension (Manifest V3)
- **Primary use case:** Learn Japanese from text directly on webpages
- **Core interaction:** Select text on page -> translation card appears near selection
- **Current behavior:**
  - Shows original text and Japanese translation
  - Audio plays only when user clicks `Play Audio` (no autoplay)
  - Sample sentence is fetched from real-world sentence corpus (not generated)
  - If user selects multiple words, sample sentence lookup is skipped

## Final Prompt To Agent

The final user instruction that shaped the delivered behavior was:

> "the sample sentence should use the word selected , as part of it. if more than 1 word is selected, in that case only word can be displayed. The sentence should not be constucted, and should be picked up from real world sentences"

## Prompt Journey (Major Iterations)

Below is the implementation journey from the prompt chain:

1. Build a Chrome extension to translate to simple Japanese and retain original sentence.
2. Add one-click translation for selected text on any webpage.
3. Rename extension to `Jap-Jap` and place project in `Assign1`.
4. Add audio playback.
5. Remove the 5-word translation constraint (full translation output).
6. Add sample sentence and English meaning.
7. Restrict audio to click-only; no autoplay.
8. Keep sample sentence displayed (Japanese + English).
9. Ensure sample uses selected word, and for multi-word selection skip sentence generation.
10. Use real-world sample sentences instead of constructing synthetic samples.
11. Prioritize shortest valid real-world sample sentence first (while preferring <= 5-word options when available).

## Models Used

Development and iteration were done through Cursor's integrated coding assistant workflow.

- **Assistant role:** End-to-end coding agent for design, coding, debugging, and git operations.
- **Model family used for implementation session:** GPT-5 class coding model via Cursor agent runtime.
- **Subagents:** Not required for this implementation path.

## Technical Architecture

### Runtime Components

- **`Assign1/manifest.json`**
  - Manifest V3 config
  - Content script injection on all URLs
  - Host permissions for translation and sentence lookup APIs
- **`Assign1/content.js`**
  - Listens for text selection on pages
  - Renders floating translation card near selected text
  - Calls translation and real-world sample APIs
  - Handles click-to-play Japanese audio via Web Speech API
- **`Assign1/content.css`**
  - Styles card layout, labels, and audio button
- **`Assign1/background.js`**
  - Present in project from earlier iterations; current stable flow is content-script-led

### External Data Sources

- **Japanese translation:** Google Translate public endpoint  
  `https://translate.googleapis.com/translate_a/single`
- **Real-world sentence examples:** Tatoeba API  
  `https://tatoeba.org/en/api_v0/search`

## GPU Consumption Details

This project has two compute contexts: extension runtime and AI-assisted development.

### 1) Chrome Extension Runtime (End User Machine)

- **Primary workload:** text selection handling, network calls, DOM updates, and speech synthesis.
- **GPU usage expectation:** minimal to none for translation logic itself.
- **Why:** translation/sample lookup are HTTP requests + JS parsing (CPU/network bound), not local ML inference.
- **Possible indirect GPU activity:** normal browser rendering/compositing of floating UI card.
- **Audio path:** Web Speech synthesis uses browser/OS speech engine; typically CPU bound and lightweight.

### 2) AI Development Workflow (Cursor/Cloud Inference)

- **LLM inference GPU usage:** occurs on model provider infrastructure, not in the extension runtime.
- **Local machine impact while developing:** mostly editor + browser + git process load; no dedicated local GPU inference required by this project setup.

### Practical Performance Notes

- Selection and popup rendering should feel near-instant for short text.
- Network latency dominates response time (translation + sample lookup endpoints).
- For slower networks, UI shows `Translating...` until responses arrive.

## Limitations and Notes

- Public API behavior may vary (rate limits, availability, response structure changes).
- Sample sentence quality depends on available Tatoeba entries for the selected word.
- Multi-word selections intentionally skip sample sentence generation by design.
- Audio quality/voice depends on browser and system voice support for `ja-JP`.

## How To Run

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select folder `Assign1`
5. Open any webpage and select text

## Repository Layout

- `Assign1/manifest.json`
- `Assign1/content.js`
- `Assign1/content.css`
- `Assign1/background.js`

## Video Demo (Slashdot Flow)

Demo target action:

1. Open Slashdot.
2. Select a random word.
3. Show Jap-Jap popup with translation.
4. Click audio and verify playback is captured in recording.

Demo source page: [Slashdot](https://slashdot.org/)

Upload status: pending (will be uploaded as non-public).

Video link : https://youtu.be/li4wsdr8O2w


# AI Research Repository: Chrome Extension Journey

This project is a high-performance Chrome Extension that provides a curated dashboard of the latest AI technical papers, powered by Google's Gemini generative models. It features a tiered learning system and a glassmorphism design.

## 🎥 Project Demo
**Watch the demo:** [https://youtu.be/GawPqlGLXP4](https://youtu.be/GawPqlGLXP4)

## 🚀 Project Evolution & Prompt Journey

### 1. The Foundation
**Prompt:** *I want you to make a chrome plugin by using the gemini api kile in the .env file... 3 tiers of learning, with detailing to the last level.*
- **Outcome:** Established the core 3-tier structure and standard popup UI.

### 2. Side Panel Integration
**Prompt:** *the extension should be accessible via a click on the menu bar*
- **Outcome:** Migrated to the Chrome **Side Panel API**, enabling the extension to open as a persistent sidebar.

### 3. Content Pivot
**Prompt:** *Give only summaries of technical papers, and do not summarize. Give names of authors and time of publication. Do not synthesize a summary*
- **Outcome:** Transformed from a general tips aggregator to a professional **Research Repository**.

### 4. Scale & Recency
**Prompt:** *Publish the latest files on the top. and include 10 papers in each level.*
- **Outcome:** Optimized the research engine to fetch 10 papers per tier, sorted by the most recent publication date.

## 🛠 Technical Details

### Models Used
The extension utilizes a fallback chain to ensure high availability and compatibility with API key permissions:
1.  **Gemini 2.5 Flash** (Primary - high speed & latest)
2.  **Gemini 2.0 Flash** (Secondary)
3.  **Gemini 1.5 Flash** (Stable fallback)

### API Orchestration
- **Calls per Session**: 1 call is made per tier selection (e.g., clicking "Level 2: Builder" triggers 1 API request).
- **Concurrency**: Handled via Chrome's background service worker to prevent UI blocking.
- **Security**: Implemented a custom Content Security Policy (CSP) and background-to-UI messaging.

## 📦 Features
- **3-Tier Research**: Categorized into Beginner, Intermediate, and Advanced papers.
- **Glassmorphism UI**: Modern aesthetic with dark mode and neon accents.
- **Technical Abstracts**: Direct, non-synthesized summaries of research papers.
- **Full Metadata**: Displays Title, Authors, and Publication Date for every entry.

## 🛠 Installation
1.  Clone this repository.
2.  Go to `chrome://extensions/` in Google Chrome.
3.  Enable **Developer mode**.
4.  Click **Load unpacked** and select the project directory.
5.  Pin the extension to your toolbar for easy access.

## 📖 Usage
- Click the **AI Learn** icon in your browser's menu bar/toolbar.
- The **Side Panel** will open automatically.
- Navigate between levels (Novice, Builder, Expert) to see the latest 10 papers for that category.

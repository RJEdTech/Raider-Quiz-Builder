# Raider Quiz Builder

Browser-based tool that converts plain text, Markdown, or Word documents into Canvas-importable quiz packages. Built for Regis Jesuit High School.

**Live site:** https://rjedtech.github.io/Raider-Quiz-Builder/

## What it does

- Convert a Word doc quiz into a Canvas `.zip` you can import
- Expand a small question bank into a comprehensive one with help from the included AI prompt
- Build a full exam with stratified random draws via `GROUP` blocks (e.g., 9 from a Recall pool + 3 from an Apply pool)
- Per-question feedback (general, correct/incorrect, per-answer choice)
- All 7 Canvas question types: multiple choice, true/false, multiple answer, numerical, short answer, essay, file upload
- Light and dark themes (preference persists across visits)
- Runs entirely in the browser — quiz content never leaves your computer

## How to use it

**Most teachers should start with the [how-to guide](how-to.html)** — recipe-style walkthroughs for the most common workflows (convert a Word doc, build with AI, grow a small bank, build random-draw exams, fix common issues).

Quick version of the workflow:

1. Write your quiz in a `.txt`, `.md`, or `.docx` file using the [format reference](docs/format-reference.html) (or start from a [template](templates/)).
2. Open the [live site](https://rjedtech.github.io/Raider-Quiz-Builder/) and drop your file in.
3. Review the validation results &mdash; errors are shown with line numbers if anything's wrong.
4. Click **Convert to Canvas quiz** and download the `.zip`.
5. In Canvas: **Settings &rarr; Import Course Content &rarr; QTI .zip file** &rarr; choose your file &rarr; Import.

To have an AI build the quiz file for you, click the **AI prompt** card on the site, paste the prompt into Claude, Flint, or ChatGPT, and ask for a quiz on your topic. If your school has a deployed Raider Quiz Builder Assistant (GPT or Flint Activity), use that instead &mdash; one-step generation with no copy-paste.

## Repository layout

```
├── README.md
├── index.html                       Main UI
├── how-to.html                      Teacher-facing recipe guide
├── favicon.svg
├── lib/
│   └── raider-quiz-builder.js       Parser, QTI generator, ZIP bundler
├── docs/
│   ├── format-reference.html          Full syntax for every question type
│   ├── for-your-ai.md               Drop into any AI to write quiz files
│   ├── ai-prompt.md                 Paste-ready prompt for LLMs
│   └── ai-deployment.md             Setup instructions for the GPT and Flint Activity
├── templates/                       Starter files (txt, docx, GROUP example)
└── samples/                         Ready-to-import sample .zip files
```

## Format origin

The marker conventions — `*a)` for the correct multiple choice answer, `[*]` for multi-answer, `____` for essay, `^^^^` for file upload, `GROUP`/`END_GROUP` blocks, and the rest — were originally established by [text2qti](https://github.com/gpoore/text2qti) (Geoffrey Poore, MIT-licensed). Several Canvas QTI converters use the same conventions because they map cleanly to the QTI 1.2 elements Canvas accepts on import. Raider Quiz Builder is another implementation; files written for one converter are generally portable to another.

## What's not supported

- Matching, multiple fill-in-the-blank, and multiple-dropdown question types. The conventions for these vary between converters; will be added in a future version.
- Images embedded directly in `.docx` files. To include images, use Markdown image syntax `![alt](url)` and upload the image to Canvas separately.
- One source file produces one quiz (and on Canvas import, one question bank). For multiple banks, run the converter once per bank file — see the format reference for the workflow.

## Privacy

No analytics, no server, no third-party tracking. The page loads two libraries (JSZip and Mammoth.js) from cdnjs at first visit, then runs entirely locally. Quiz content is parsed and packaged in the browser tab; nothing is uploaded anywhere. Theme preference is stored in `localStorage`.

## Acknowledgments

- [text2qti](https://github.com/gpoore/text2qti) — Geoffrey Poore, MIT-licensed — for the marker syntax conventions.
- [JSZip](https://stuk.github.io/jszip/) — client-side ZIP bundling.
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) — `.docx` text extraction.

---

Part of the Raider EdTech family: [Randomizer](https://rjedtech.github.io/raider-randomizer/) · [Timer](https://rjedtech.github.io/raider-timer/) · [Pods](https://rjedtech.github.io/raider-pods/) · [Quiz Studio](https://rjedtech.github.io/raider-quiz-studio/) · Quiz Builder

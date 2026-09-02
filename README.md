# Raider Quiz Builder

Browser-based tool that converts plain text, Markdown, or Word documents into Canvas-importable quiz packages. Built for Regis Jesuit High School.

**Live site:** https://rjedtech.github.io/Raider-Quiz-Builder/

## What it does

- Convert a Word doc quiz into a Canvas `.zip` you can import
- Expand a small question bank into a comprehensive one with help from the included AI prompt
- Build a full exam with stratified random draws via `GROUP` blocks (e.g., 3 from a Recall pool + 2 from an Apply pool, different for every student)
- Per-question feedback (general, correct/incorrect, per-answer choice)
- All 7 Canvas question types: multiple choice, true/false, multiple answer, numerical, short answer, essay, file upload
- Light and dark themes (preference persists across visits)
- Runs entirely in the browser — quiz content never leaves your computer

## How to use it

**Most teachers should start with the [how-to guide](https://rjedtech.github.io/Raider-Quiz-Builder/how-to.html)** — recipe-style walkthroughs for the most common workflows (convert a Word doc, build with AI, grow a small bank, build random-draw exams, fix common issues).

Quick version of the workflow:

1. Write your quiz in a `.txt`, `.md`, or `.docx` file using the [format reference](https://rjedtech.github.io/Raider-Quiz-Builder/docs/format-reference.html) (or start from a [template](templates/)).
2. Open the [live site](https://rjedtech.github.io/Raider-Quiz-Builder/) and drop your file in.
3. Review the validation results &mdash; errors are shown with line numbers if anything's wrong.
4. Click **Convert to Canvas quiz** and download the `.zip`.
5. In Canvas, import the `.zip` &mdash; the path depends on which quiz engine you want:
   - **New Quizzes:** create a blank New Quiz, then on its **Build** page use the **&#8942;** menu &rarr; **Import Content** &rarr; drop the `.zip` &rarr; Import.
   - **Classic Quizzes:** **Settings &rarr; Import Course Content &rarr; QTI .zip file** &rarr; choose your file &rarr; Import.

   Both are covered step by step on the site, under *Importing into Canvas*. The Classic route is a course-level import: unless your admin has enabled *New Quizzes Migration During Course Import/Copy*, it produces a Classic quiz and a question bank, not a New Quiz.

To have an AI build the quiz file for you, click the **AI prompt** card on the site, paste the prompt into Claude, Flint, or ChatGPT, and ask for a quiz on your topic. Or use the [Raider Quiz Builder Assistant](https://chatgpt.com/g/g-6a075cc27a0481918450f67b4c852a58-raider-quiz-builder-assistant), the school's custom GPT &mdash; it interviews you about the unit first and hands back a ready-to-convert file, no copy-paste. Requires a ChatGPT for Teachers account.

## Repository layout

```
├── README.md
├── index.html                          Main UI
├── how-to.html                         Teacher-facing recipe guide (linked from the site)
├── favicon.svg, favicon.ico, *.png     Icons and logos
├── lib/
│   └── raider-quiz-builder.js          Parser, validator, QTI 1.2 generator, ZIP bundler
├── docs/
│   ├── format-reference.html           Full syntax for every question type (linked from the site)
│   ├── format-reference.md             Earlier Markdown draft of the above — not linked anywhere
│   ├── for-your-ai.md                  Drop into any AI to write quiz files
│   ├── ai-prompt.md                    Paste-ready prompt for LLMs
│   ├── ai-deployment.md                Setup instructions for the GPT and Flint Activity
│   ├── gpt-instructions-trimmed.txt    The Assistant GPT's live system prompt
│   └── how-to.md                       Earlier Markdown draft of how-to.html — not linked anywhere
├── templates/                          Starter files (txt, docx, GROUP example)
└── samples/                            Ready-to-import sample .zip files
```

## Format origin

The marker conventions — `*a)` for the correct multiple choice answer, `[*]` for multi-answer, `____` for essay, `^^^^` for file upload, `GROUP`/`END_GROUP` blocks, and the rest — were originally established by [text2qti](https://github.com/gpoore/text2qti) (Geoffrey Poore, MIT-licensed). Several Canvas QTI converters use the same conventions because they map cleanly to the QTI 1.2 elements Canvas accepts on import. Raider Quiz Builder is another implementation; files written for one converter are generally portable to another.

## What's not supported

- Matching, multiple fill-in-the-blank, and multiple-dropdown question types. The conventions for these vary between converters; will be added in a future version.
- Images embedded directly in `.docx` files. To include images, use Markdown image syntax `![alt](url)` and upload the image to Canvas separately.
- One source file produces one quiz (and on Canvas import, one question bank). For multiple banks, run the converter once per bank file — see the format reference for the workflow.
- Question groups (`GROUP` blocks) map to Canvas *Question Groups*, a Classic Quizzes construct. They import cleanly on the Classic route; on the New Quizzes route, preview the imported quiz and confirm the random draw survived. The New Quizzes equivalent is an item bank plus **Add from Item Bank → Randomized**.
- Feedback on multiple-answer, essay, and file-upload questions renders in Classic Quizzes only — New Quizzes drops it silently. Multiple choice and true/false feedback works in both.

## Privacy

No analytics, no server, no third-party tracking. The page loads two libraries (JSZip and Mammoth.js) from cdnjs at first visit, then runs entirely locally. Quiz content is parsed and packaged in the browser tab; nothing is uploaded anywhere. Theme preference is stored in `localStorage`.

## Acknowledgments

- [text2qti](https://github.com/gpoore/text2qti) — Geoffrey Poore, MIT-licensed — for the marker syntax conventions.
- [JSZip](https://stuk.github.io/jszip/) — client-side ZIP bundling.
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) — `.docx` text extraction.

---

Part of the RJ Ed Tech family: [Randomizer](https://rjedtech.github.io/Raider-Randomizer/) · [Timer](https://rjedtech.github.io/Raider-Timer/) · [Pod Generator](https://rjedtech.github.io/Raider-Pods/) · [MyRJ Schedule Cleaner](https://rjedtech.github.io/MyRJScheduleCleaner/) · [Cooperative Learning Toolkit](https://rjedtech.github.io/cooperative-learning-toolkit/) · [EdTech Status](https://rjedtech.github.io/EdTech-Status/) · [Incoming Raider FAQ](https://rjedtech.github.io/Incoming-Raider-FAQ/) · [New Ignatian Educator FAQ](https://rjedtech.github.io/New-Ignatian-Educator-FAQ/) · Quiz Builder

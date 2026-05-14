# Raider Quiz Builder — Format Reference

Raider Quiz Builder converts simple text files into Canvas-importable quiz packages. You write your quiz in plain text, Markdown, or Word using a few simple markers — one line per question, an asterisk before the correct answer — and the tool produces a `.zip` you can drop straight into Canvas.

The format is the same across `.txt`, `.md`, and `.docx`. Word documents are read as text, so visual formatting (bold styling, italics applied via the toolbar, font choices) is dropped. Inline Markdown like `**bold**` *is* preserved in question content.

A teacher writing by hand and an AI assistant generating questions both produce the same kind of file. Once you know the format, you can paste this reference into Claude, Flint, or ChatGPT and ask for a quiz on any topic — output drops straight into the converter without further cleanup.

---

## Quick start

The simplest possible file:

```
Quiz title: Mitosis Vocabulary Check

1. What stage of mitosis is characterized by chromosomes aligning along the cell's equator?
a) Prophase
*b) Metaphase
c) Anaphase
d) Telophase

2. The structure that holds sister chromatids together at the centromere is the:
a) spindle fiber
*b) kinetochore
c) cleavage furrow
d) cytoskeleton
```

Save it, drop it into the converter, get a `.zip` back, import it into Canvas. Done.

---

## The Golden Rule

Markers must start at the very first character of a line — **no leading spaces or tabs**. Most markers also require a space *after* them, before the content begins.

This is how the converter tells a new question or answer apart from a continuation of the line above. A line starting at column 1 with a recognized marker means a new element. An indented line is treated as continuation of whatever came before it.

The single most common cause of conversion errors is invisible leading whitespace — usually from copy-pasting out of Word or a website. If a question isn't being recognized, suspect a leading space first.

---

## Marker reference

| Marker | Creates | Example |
|---|---|---|
| `1. ` | New question | `1. What is 2+2?` |
| `a) ` | Answer choice | `a) Four` |
| `*a) ` | Correct multiple-choice answer | `*a) Four` |
| `[*]` or `[ ]` | Multi-answer checkbox | `[*] Mercury` |
| `= ` | Numerical answer | `= 42` |
| `* ` | Short-answer accepted value | `* Paris` |
| `____` | Essay response area | `____` |
| `^^^^` | File upload | `^^^^` |
| `... ` | General feedback | `... Remember to show units.` |
| `+ ` | Feedback when correct | `+ Nicely done.` |
| `- ` | Feedback when incorrect | `- Take another look at section 4.2.` |
| `% ` | Line comment (ignored) | `% replace this question next semester` |
| `GROUP` / `END_GROUP` | Random-draw question pool | (see below) |
| `COMMENT` / `END_COMMENT` | Block comment (ignored) | (see below) |

---

## Quiz header

Optional. Goes at the top of the file, before any questions:

```
Quiz title: Unit 4 Mid-Chapter Check
Quiz description: Covers sections 4.1 through 4.3. 25 minutes.
```

Skip it and your quiz imports as "Quiz" with no description — easy to fix in Canvas, but most teachers want the title set in the file.

---

## Quiz settings

Optional. Go after the header, before any questions. Each on its own line, `true` or `false` only:

```
Quiz title: Unit 4 Check
Quiz description: 25 minutes. No notes.
shuffle answers: true
show correct answers: false
one question at a time: true
can't go back: false
```

| Setting | Default | Effect |
|---|---|---|
| `shuffle answers` | `false` | Randomize answer order for each student |
| `show correct answers` | `true` | Students see correct answers after submission |
| `one question at a time` | `false` | One question per page |
| `can't go back` | `false` | Prevent returning to a previous question (only with one-at-a-time) |

Verify settings landed correctly in the Canvas quiz panel after import — Canvas's handling of imported settings can be inconsistent, particularly between Classic and New Quizzes.

---

## Question types

Seven types, each with examples below.

### 1. Multiple choice

Asterisk directly before the letter marks the correct answer:

```
1. Which event marked the start of the Reformation in 1517?
a) The Council of Trent
*b) Luther's posting of the Ninety-five Theses
c) The Edict of Worms
d) The Diet of Augsburg
```

Rules:
- The asterisk must touch the letter — `*b)` works, `* b)` does not.
- Answer text must be unique within a question.
- Any number of choices is fine; any letter range works.

### 2. True/False

Multiple choice with True and False as the only options:

```
1. Mitochondria contain their own DNA.
*a) True
b) False
```

### 3. Multiple answer

Use `[*]` for correct options and `[ ]` for incorrect:

```
1. Which of these are noble gases? (Select all that apply.)
[*] Helium
[ ] Oxygen
[*] Neon
[*] Argon
[ ] Hydrogen
```

At least one correct answer required. Most teachers want at least two so the question type is obviously distinct from single-answer multiple choice.

### 4. Numerical

Three formats supported, each on a line beginning with `= `:

```
1. What is 12 × 8?
= 96

2. The boiling point of water at standard pressure falls within what range, in °C?
= [99, 101]

3. To three decimal places, what is the value of pi?
= 3.142 +- 0.001
```

- **Exact match:** `= 96`
- **Range:** `= [low, high]` — both endpoints accepted
- **Margin of error:** `= 3.142 +- 0.001` — value plus or minus the tolerance

A note for New Quizzes: margin-of-error doesn't reliably round-trip. Use the range format if you're targeting New Quizzes specifically.

**Don't add feedback to numerical questions.** It causes conversion errors.

### 5. Short answer / Fill in the blank

Each acceptable answer is a separate line beginning with `* `:

```
1. The Spanish word for "library" is _____.
* biblioteca
* la biblioteca
```

- Canvas matches case-insensitively, but list common variants (with and without article, common misspellings you want to accept) explicitly.
- Imports as Open Entry in New Quizzes. Word-bank or dropdown variants need to be set manually in Canvas after import.
- **Don't add feedback to short answer questions.** It causes conversion errors.

### 6. Essay

Four underscores on a line by themselves:

```
1. Compare the role of the chorus in two of the plays we read this semester. Use specific examples and at least three terms from our literary devices unit.
____
```

Essay questions don't auto-grade. Teacher reviews each in SpeedGrader. Only general feedback (`...`) is supported on essay questions.

### 7. File upload

Four carets on a line by themselves:

```
1. Submit your completed lab report as a PDF. Be sure your data table and conclusion are on the same page.
^^^^
```

File uploads also need manual grading. Only general feedback supported.

---

## Feedback

Three feedback markers. All require a space after the marker.

**General feedback** — shown to every student regardless of how they answered. Place it after the question line (before answers) or right after a specific answer choice:

```
1. What is 2 + 3?
... Double-check your basic addition before moving on.
*a) 5
b) 4
```

**Correct/Incorrect feedback** — shown depending on whether the student answered correctly. Place after the question line, before the answers:

```
1. What is 2 + 3?
+ Right — basic addition like this should be quick.
- Worth a second look. Try counting on your fingers if it helps.
*a) 5
b) 4
```

**Per-answer feedback** — shown only when the student picks that specific choice. Place right after the answer it applies to:

```
1. Which is the sum of 2 and 3?
a) 6
... Close, but that's 2 × 3, not 2 + 3.
*b) 5
... Yes — basic addition.
c) 4
... Not quite. You may have subtracted instead of added.
```

### Feedback compatibility

Not every question type accepts every feedback marker. The grid:

| Question type | General (`...`) | Correct/Incorrect (`+`/`-`) | Per-answer (`...` after a choice) |
|---|---|---|---|
| Multiple choice | Classic + New | Classic + New | Classic + New |
| Multiple answer | Classic only | Classic only | Not supported |
| True/False | Classic + New | Classic + New | Classic + New |
| Essay | Classic only | Not supported | Not supported |
| File upload | Classic only | Not supported | Not supported |
| Numerical | **Skip — causes errors** | **Skip — causes errors** | **Skip — causes errors** |
| Short answer | **Skip — causes errors** | **Skip — causes errors** | **Skip — causes errors** |

The validator will flag feedback on numerical and short-answer before conversion runs.

---

## Question groups (random draw)

A `GROUP` block tells Canvas to randomly select N questions from a pool every time a student takes the quiz. This is how you build a single quiz that draws, for example, 9 random questions from a Recall pool plus 3 from an Application pool — without writing the same quiz multiple times.

```
GROUP
pick: 9
points per question: 1

1. What does mitosis mean?
*a) Cell division producing genetically identical daughter cells
b) The process of meiosis
c) Cellular respiration
d) DNA replication

2. The function of a ribosome is to:
*a) Synthesize proteins
b) Produce ATP
c) Store genetic information
d) Filter waste

[as many recall questions as you want in this pool]

END_GROUP

GROUP
pick: 3
points per question: 2

1. A patient's white blood cell count is rising rapidly during an infection. Which cellular process is most directly accelerated?
*a) Mitosis in lymphocyte precursors
b) Meiosis in germ cells
c) Apoptosis in red blood cells
d) Photosynthesis

[as many application questions as you want in this pool]

END_GROUP
```

A student taking this quiz gets 12 questions total: 9 randomly chosen from the recall pool, 3 randomly chosen from the application pool. Different students see different selections.

Rules:
- `GROUP` and `END_GROUP` must be in **ALL CAPS**, on their own lines, starting at column 1.
- `pick:` sets how many questions each student sees from the pool. Defaults to 1 if omitted.
- `points per question:` sets the value of each question in the group. Defaults to 1.
- Every question inside one group must be worth the same number of points.
- You can mix GROUP blocks and standalone questions in the same file. Standalone questions appear in every attempt; group questions are randomized.

---

## Per-question metadata

Two optional lines can appear right above any question:

```
Title: Mitosis vocabulary
Points: 2
1. What does mitosis produce?
*a) Two genetically identical daughter cells
b) Four haploid gametes
c) One polyploid cell
d) Cells with random genetic variation
```

- `Title:` shows up in Canvas SpeedGrader and item analytics. Worth setting on every question if you plan to look at item analysis.
- `Points:` overrides the default of 1. Decimals are allowed (`Points: 0.5`).

---

## Comments

Notes for yourself that won't appear in the final quiz.

**Line comments** start with `% `:

```
% Replace this with the new version after the curriculum review
% TODO: add 3 more application questions before midterm

1. What does mitosis produce?
*a) Two genetically identical daughter cells
b) Distractor
```

**Block comments** wrap content between `COMMENT` and `END_COMMENT`, each on its own line, all caps, no leading whitespace:

```
COMMENT
Pulled this question for now — the wording was confusing students.
1. The phase between cell divisions is called:
*a) Interphase
END_COMMENT

1. What does mitosis produce?
*a) Two genetically identical daughter cells
```

The block comment makes it easy to "park" questions you might want back later without deleting them.

---

## Markdown formatting

Question text, answer choices, and feedback support standard Markdown:

| You write | It renders as |
|---|---|
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `` `code` `` | `code` |
| `[link text](https://example.com)` | clickable link |
| `![alt](image.jpg)` | embedded image (file uploaded separately to Canvas) |

Markdown only works in content areas — quiz titles and question titles are always plain text, no rendering.

**Asterisk conflict:** `*` is used both for Markdown italics and for marking correct answers. To avoid ambiguity, prefer `**bold**` over `*italic*` in answer choices. The validator generally handles it, but two asterisks is safer than one.

---

## Multiple question banks

Raider Quiz Builder converts one source file into one quiz, which lands in one question bank on Canvas import. Canvas's QTI workflow is fundamentally one-file-one-bank — Canvas asks "which question bank?" at the import dialog and puts everything from your file into that one bank.

For most "stratified by taxonomy" use cases, **GROUP blocks are the right tool** — write all your Recall, Application, and Analysis questions in one file, each in their own GROUP block, and Canvas does the random draw at quiz time within a single quiz.

If you want **reusable banks** (a Recall bank that several different quizzes draw from across a semester), write each bank as its own source file and run the converter once per bank. After importing each into Canvas, build the quiz manually:

- *Classic Quizzes:* New Quiz → New Question Group → Link to Question Bank → "9 questions, randomly selected"
- *New Quizzes:* New Quiz → Add from Item Bank → "Randomized, 9 questions"

This is the same approach publisher test banks use (Pearson, McGraw-Hill, etc. ship one ZIP per chapter).

---

## Common gotchas

The things that actually trip teachers up:

- **Smart quotes from Word.** Word and Google Docs auto-replace `"` with `"` `"` and `'` with `'` `'`. The validator normalizes most of these, but if you're hand-editing in Word, turn off AutoCorrect → AutoFormat As You Type → "Straight quotes with smart quotes." Or paste through Notepad first.
- **`+-` becoming `±`.** Word's autocorrect will silently turn `+-` into the plus-minus symbol. Numerical ranges with `±` won't parse. Type `+-` and double-check it stayed as two characters.
- **`--` becoming an em-dash.** Same problem. The validator usually catches it, but the safer move is to disable Word's dash autocorrect.
- **The asterisk position in MC.** `*a)` is correct (correct multiple-choice answer); `* Paris` is correct (short-answer option); `* a)` (with a space between `*` and the letter) is invalid and confuses the parser.
- **Leading whitespace as continuation.** If your question won't be recognized, look for an invisible space or tab before the `1`. The parser treats anything indented as a continuation of the previous element.
- **Multi-line questions.** A question or answer that wraps to a second line needs the continuation indented. Four spaces or one tab is the convention. Without indentation, the parser treats the second line as a new element.
- **Don't add feedback to numerical or short-answer questions.** It causes conversion errors. Validator will catch it before conversion runs.
- **Blank lines between questions.** Optional but strongly recommended. Two questions back-to-back with no blank line will eventually cause a parse error you spend ten minutes hunting for.
- **Image references.** `![alt](image.jpg)` is supported syntactically, but the image file itself has to be uploaded separately to Canvas after import. The QTI carries only the reference. For v1 of Raider Quiz Builder, plan on this being a manual two-step.
- **Tables in DOCX.** Get flattened to plain text on parse. Don't write a multiple-choice question as a Word table.
- **Equations in DOCX.** Complex equations don't round-trip. Paste LaTeX or unicode directly into the question stem if math notation matters.

---

## Validation

Before generating the QTI bundle, Raider Quiz Builder validates the source file and shows results inline with line numbers. **Errors** block conversion until fixed. **Notes** are advisory and don't block — bypass with the "Convert anyway" option if you understand the consequences.

Common errors that block conversion:
- Question with no answers
- Multiple choice with no `*` marker
- Multiple answer with no `[*]` markers
- Numerical question with no `=` line
- Duplicate answer text within a question
- Feedback on a numerical or short-answer question
- Mismatched `GROUP` / `END_GROUP`
- Mismatched `COMMENT` / `END_COMMENT`
- Leading whitespace on marker lines

Common notes (advisory only):
- Smart quotes auto-normalized
- Em-dashes or `±` auto-normalized
- Feedback that only renders in Classic Quizzes (silently dropped by New Quizzes)
- Question groups with `pick:` larger than the pool size

---

## Format origin

The marker conventions used here — `*a)` for correct MC, `[*]` for multi-answer, `____` for essay, `^^^^` for file upload, `GROUP / END_GROUP`, and the rest — were originally established by [text2qti](https://github.com/gpoore/text2qti), a Python library by Geoffrey Poore (MIT-licensed, public on GitHub since 2019). Multiple Canvas QTI converters have adopted these conventions because they're simple, human-readable, and map cleanly to the QTI 1.2 XML elements Canvas accepts on import. Raider Quiz Builder uses the same conventions for the same reasons. Files written for one converter are generally portable to another.

---

## File ends here

If you're using this document as an AI prompt: stop reading at this line. Don't include this header text in any quiz file you generate. Output only the quiz content following the rules above, with no commentary or markdown fences around it.

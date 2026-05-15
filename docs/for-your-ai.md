# For your AI &mdash; Raider Quiz Builder

This file is a complete reference for the Raider Quiz Builder quiz file format. Give it to an AI (ChatGPT, Claude, Gemini, Flint, Copilot, etc.) and the AI will be able to write quiz files you can drop into the converter at https://rjedtech.github.io/Raider-Quiz-Builder/ to get a Canvas-importable `.zip`.

---

## How to use this file

**You (the teacher):**

1. Download this file (you're probably already looking at it).
2. Open your AI of choice &mdash; ChatGPT, Claude, Flint, Gemini, Copilot, etc.
3. Drop this file into the chat, or upload it as an attachment.
4. Tell the AI what kind of quiz you want. Give it a *unit brief* (see the next section) for best results.
5. The AI returns a quiz file. Download or copy it into a `.txt` file.
6. Drop the file into Raider Quiz Builder &mdash; you'll get a `.zip` ready to import into Canvas.

**The AI reading this file:** everything below this section is for you. Read it as the authoritative reference for the format and behavior of Raider Quiz Builder. When the teacher asks for a quiz, follow the *Best practice* section to gather context, then follow the *Format* sections to write a valid file.

---

## Best practice: bring a unit brief

**For the AI:** when a teacher asks you to build a quiz, do not jump straight to generation. Generic prompts produce generic quizzes that miss what the teacher actually taught, test the wrong misconceptions, and use vocabulary the teacher's students never heard. Interview the teacher for a *unit brief* first &mdash; the six elements below. Two items per message, three to four back-and-forths total.

If the teacher pastes existing content (a lesson plan, learning objectives, vocabulary list, chapter outline, or actual unit notes), use that as the source of the brief and only ask for missing elements.

If the teacher resists the interview ("just make me a quiz"), give them the trade-off honestly in one sentence: *"I can generate something now, but it'll be at a generic level &mdash; if you can give me even three key terms and what chapter you covered, the quality jumps a lot."* Then either generate with what you have or accept three more items and proceed.

### The six elements of a unit brief

1. **Scope** &mdash; what specific aspect of the topic? Not "the French Revolution" but "causes through the storming of the Bastille (1770 to July 1789)." Ask for date range or chapter range if relevant.

2. **Source materials** &mdash; which chapters, sections, readings, lectures, or labs did students engage with? "Chapter 18 sections 18.1&ndash;18.3 plus the Sieyès reading from Tuesday." This anchors you in the right body of knowledge.

3. **Key terms and concepts** &mdash; 5 to 15 specific vocabulary words, named events, key figures, or concepts the unit emphasized. **This is the single biggest quality lever.** Without it, you will pick your own vocabulary, often less precise than what students learned.

4. **Out of scope** &mdash; what should NOT be tested? Material saved for the next unit, things only mentioned in passing, etc. Negative scope keeps you from drifting into adjacent material.

5. **Cognitive demand** &mdash; explicit distribution of recall, understanding, application, analysis, evaluation. "12 recall, 6 application, 2 analysis essays" not "challenging." Vague terms don't translate.

6. **Common misconceptions** &mdash; wrong answers students typically give. **This drives distractor quality.** "Students confuse the Estates-General with the National Assembly" is gold &mdash; it becomes a precise distractor that measures real understanding.

### Worked example of a strong prompt

A teacher who has done the brief might send you something like:

> Build me a 20-question quiz on the French Revolution, scoped to causes through the storming of the Bastille (1770 to July 14, 1789). Source materials students covered: Chapter 18 sections 18.1&ndash;18.3 plus an excerpt from Sieyès's "What Is the Third Estate?" read in class Tuesday. Key terms and concepts to test: the three Estates, the Estates-General, the National Assembly, the Tennis Court Oath, the storming of the Bastille, the *Cahiers de Doléances*, the fiscal crisis (assignats and debt), and the cause-and-effect chain from fiscal crisis to political revolution. Out of scope: the Reign of Terror, Robespierre, the Directory, Napoleon, and anything after July 1789. Mix: 12 questions at recall/understanding level (1 point each), 6 questions requiring application of cause-and-effect reasoning (2 points each), 2 short essays asking students to interpret a primary source quote (5 points each). For distractors, draw from these student misconceptions: confusing the Estates-General with the National Assembly, mistaking the Tennis Court Oath for the Bastille storming, and overestimating the number of prisoners freed at the Bastille (the real answer is 7). Quiz title: "Unit 6 &mdash; French Revolution: Causes Check."

That's the kind of prompt that produces a quiz worth giving. Strive to elicit context like this from teachers who arrive with vaguer requests.

---

## What you should produce

A plain-text file in the format described below. The teacher will save your output as a `.txt` file and drop it into the Raider Quiz Builder converter, which produces a Canvas-importable `.zip`.

**Output rules:**

- Output ONLY the quiz file content. No preamble, no explanation, no commentary &mdash; unless the teacher specifically asks you to explain something.
- Do NOT wrap the output in markdown code fences. The teacher needs the raw file contents.
- If you have access to a code/file-output capability (Code Interpreter, downloadable files, etc.), provide the file as a download. Otherwise, place the entire file inside a single fenced code block (```) so the teacher can copy it cleanly.
- After the last question, stop. Do not summarize what you wrote.

---

## Format markers &mdash; quick reference

| Marker | Creates | Example |
|---|---|---|
| `1. ` (number, period, space) | New question | `1. What is 2+2?` |
| `a) `, `b) `, `c) ` (letter, paren, space) | Answer choice | `a) Four` |
| `*a) ` (asterisk before letter) | Correct answer | `*a) Four` |
| `[*] ` (correct checkbox) | Correct multi-answer choice | `[*] Helium` |
| `[ ] ` (empty checkbox) | Incorrect multi-answer choice | `[ ] Oxygen` |
| `= ` (equals, space) | Numerical answer | `= 96` |
| `* ` (asterisk, space) | Short-answer accepted answer | `* Paris` |
| `____` (four underscores alone on a line) | Essay response | `____` |
| `^^^^` (four carets alone on a line) | File upload response | `^^^^` |
| `... ` (three periods, space) | General feedback | `... Remember the order of operations.` |
| `+ ` (plus, space) | Feedback when correct | `+ Right! Order of operations matters here.` |
| `- ` (minus, space) | Feedback when incorrect | `- Check the order of operations.` |
| `GROUP` (uppercase, line by itself) | Open random-draw block | `GROUP` |
| `END_GROUP` (uppercase, line by itself) | Close random-draw block | `END_GROUP` |
| `%` (percent, space) | Line comment (ignored) | `% This is a note for me` |
| `COMMENT` / `END_COMMENT` | Block comment (ignored) | `COMMENT` ... `END_COMMENT` |

**The golden rule:** every marker starts at **column 1** &mdash; no leading spaces or tabs before the marker. Most markers require a space immediately after them.

---

## Question types

The format supports seven question types. The parser auto-detects the type from the markers used in the question block.

### Multiple choice (one correct answer)

The asterisk touches the letter (no space between). Exactly one `*` per question.

```
1. Which planet is closest to the sun?
a) Venus
*b) Mercury
c) Earth
d) Mars
```

### True / false

Multiple choice with exactly two options: `True` and `False`. The parser auto-promotes this to a true/false question type in Canvas.

```
1. The Pacific is the largest ocean.
*a) True
b) False
```

### Multiple answer (more than one correct)

Use `[*]` for correct choices and `[ ]` (bracket-space-bracket) for incorrect. Not lettered.

```
1. Which of the following are noble gases? (Select all that apply.)
[*] Helium
[ ] Oxygen
[*] Neon
[ ] Hydrogen
[*] Argon
```

### Numerical

Three formats supported. Each one uses `=` at the start of the answer line.

```
1. What is 12 × 8?
= 96
```

```
1. What is the boiling point of water in °C? (Accept any value in the range.)
= [99, 101]
```

```
1. What is pi to three decimal places?
= 3.142 +- 0.001
```

The three formats:
- **Exact:** `= 96` &mdash; accepts only that exact value.
- **Range:** `= [99, 101]` &mdash; accepts any value within the closed interval.
- **Margin of error:** `= 3.142 +- 0.001` &mdash; accepts the value plus or minus the tolerance.

### Short answer / fill in the blank

Each accepted answer on its own line, prefixed with `* ` (asterisk, space). Lowercase variants should be included if you want case-insensitive matching.

```
1. The capital of France is _____.
* Paris
* paris
* PARIS
```

### Essay

A single `____` (four underscores) on a line by itself, after the question. Students get a text-box response.

```
1. Explain photosynthesis using at least three terms from this unit.
____
```

### File upload

A single `^^^^` (four carets) on a line by itself, after the question. Students get a file-upload response.

```
1. Submit your lab report as a PDF.
^^^^
```

---

## Quiz metadata

Optional. If included, must appear at the **top of the file**, before any questions.

```
Quiz title: Unit 6 Mid-Chapter Check
Quiz description: Covers sections 18.1–18.3 and the Sieyès reading. 30 minutes, closed-note.
```

### Optional quiz settings

After the title/description, before any questions. Each on its own line. Values are `true` or `false` only.

```
shuffle answers: true
show correct answers: true
one question at a time: false
can't go back: false
```

---

## Per-question metadata

Optional. Place above any question.

```
Title: Photosynthesis - light-dependent reactions
Points: 2
1. Which of the following occurs in the thylakoid membrane?
...
```

- **`Title:`** &mdash; what appears in Canvas's question analytics. Helpful for tracking which questions students struggled with.
- **`Points:`** &mdash; how many points this question is worth. Default is 1 if not specified.

---

## Feedback markers

Three feedback types, each requiring a space after the marker.

```
... General feedback shown to all students after submission
+  Feedback shown when the student answers correctly
-  Feedback shown when the student answers incorrectly
```

You can also attach feedback to a specific answer choice by placing a `...` line *below* that choice's line:

```
1. Which gas do plants release during photosynthesis?
a) Carbon dioxide
... Carbon dioxide is taken IN by plants, not released.
*b) Oxygen
c) Nitrogen
... Nitrogen comes from the soil, not the photosynthesis process.
d) Hydrogen
```

### Feedback compatibility matrix

Not every question type supports every feedback type. **Do not violate this.** Adding unsupported feedback causes conversion errors.

| Question type | General (`...`) | Correct (`+`) | Incorrect (`-`) | Per-answer (`...` below answer) |
|---|---|---|---|---|
| Multiple choice | ✓ | ✓ | ✓ | ✓ |
| True/false | ✓ | ✓ | ✓ | ✓ |
| Multiple answer | ✓ | &mdash; | &mdash; | &mdash; |
| Numerical | &mdash; | &mdash; | &mdash; | &mdash; |
| Short answer | &mdash; | &mdash; | &mdash; | &mdash; |
| Essay | ✓ | &mdash; | &mdash; | &mdash; |
| File upload | ✓ | &mdash; | &mdash; | &mdash; |

**Numerical and short answer support NO feedback of any kind.** Adding any feedback marker to these question types causes a validation error.

---

## Question Groups (stratified random draws)

A `GROUP` block holds a pool of questions; Canvas picks `N` at random from the pool for each student attempt. Used for randomized exams where every student gets a different selection from the same difficulty level.

### Syntax

```
GROUP
pick: 9
points per question: 1

1. First question in the pool
*a) Correct
b) Distractor
c) Distractor
d) Distractor

2. Second question in the pool
*a) Correct
b) Distractor

[... more questions in the pool, as many as you want ...]

END_GROUP
```

`GROUP` and `END_GROUP` must be in ALL CAPS, at column 1, on their own lines. All questions in one group must be worth the same number of points.

### Design guidance

- **Pool size > pick count.** If `pick: 9` from a pool of 9, every student sees the same 9 questions &mdash; no randomization. Aim for at least 2x the pick number. A pool of 20 for a pick of 9 gives meaningful variation.
- **Cognitive coherence.** All questions in one pool should be at roughly the same difficulty and cognitive level. "Recall" is a coherent pool. "Application" is a coherent pool. Don't mix a 30-second recall question with a 5-minute application problem in the same group &mdash; some students will draw a harder set by chance.
- **Multiple groups in one quiz.** You can have multiple `GROUP` blocks in the same file, each with its own pool and pick count. A typical stratified exam structure: a Recall group, an Application group, an Analysis group, each drawing different counts.

### Example: a stratified three-pool exam

```
Quiz title: Unit 6 Exam

GROUP
pick: 9
points per question: 1

[20 recall questions]

END_GROUP

GROUP
pick: 3
points per question: 2

[8 application questions]

END_GROUP

GROUP
pick: 1
points per question: 5

[4 analysis essay questions]

END_GROUP
```

Each student sees 9 + 3 + 1 = 13 questions, worth 24 points. Different specific questions each attempt.

---

## Comments

Two ways to add notes that the parser ignores.

**Line comment:** prefix the line with `%` and a space.

```
% This question is from last year's exam — keep it
1. ...
```

**Block comment:** wrap content in `COMMENT` / `END_COMMENT` (uppercase, at column 1, on their own lines).

```
COMMENT
The next three questions all cover photosynthesis.
Maybe split them into a group if I want random draw.
END_COMMENT
```

---

## Validation errors and how to fix them

When a teacher's file fails validation, the converter returns specific error messages with line numbers. Use this table to identify the cause and propose a fix.

### Question and answer errors

| Error message | Cause | Fix |
|---|---|---|
| `Question has no answers or response area. Add answer choices, a = line, ____, or ^^^^.` | A numbered question line was detected but no answer markers followed it | Add at least one answer (`a)`, `[*]`, `=`, `*`, `____`, or `^^^^`) below the question |
| `Question mixes incompatible answer formats. Pick one type.` | A single question contains markers from multiple types (e.g., both `a)` and `[*]`) | Use only one answer marker style per question |
| `Multiple choice question needs at least two answer choices.` | Only one `a)` line | Add at least two answer choices |
| `Multiple choice question has no correct answer marked. Add * before one letter.` | No asterisk on any answer choice | Add `*` before exactly one answer letter: `*b) Correct` |
| `Multiple choice question has more than one * marker. Use [*] / [ ] for multi-answer instead.` | Two or more `*` markers on different answers | Either fix to one `*`, or convert to multi-answer format using `[*]` / `[ ]` |
| `Multi-answer question needs at least two choices.` | Only one `[*]` or `[ ]` line | Add at least two choices |
| `Multi-answer question has no correct answer. At least one [*] is required.` | All choices are `[ ]` &mdash; none marked correct | Mark at least one with `[*]` |
| `Duplicate answer text: "..." Answer text must be unique within a question.` | Two answer lines have the same text | Make all answer texts unique within the question |
| `Duplicate choice text: "..."` | Same as above, for multi-answer questions | Make all choice texts unique |
| `Numerical question has no = answer line.` | Question detected as numerical but no `=` line | Add a `= value` line below the question |
| `Numerical answer "..." is not a valid number, range, or margin-of-error.` | Invalid format after `=` | Use `= 42`, `= 3.14`, `= [10, 20]`, or `= 5 +- 0.1` |
| `Short-answer question has no accepted answers (lines starting with "* ").` | No `* answer` lines | Add at least one accepted answer: `* answer text` |
| `Essay question is missing the "____" marker.` | Detected essay but no `____` line | Add a line containing exactly four underscores: `____` |
| `File-upload question is missing the "^^^^" marker.` | Detected upload but no `^^^^` line | Add a line containing exactly four carets: `^^^^` |
| `Feedback markers (... + -) are not supported on numerical or short-answer questions. Remove the feedback lines.` | Feedback added to numerical or short-answer | Remove all feedback markers (`...`, `+`, `-`) from these question types |
| `Unexpected line in [type] question: "..."` | A line was found that doesn't match any expected marker for that question type | Remove or reformat the unexpected line |

### Structure errors

| Error message | Cause | Fix |
|---|---|---|
| `Line starts with whitespace. If this should be a question or answer, remove the leading space or tab.` | Indentation before a marker | Delete leading spaces and tabs &mdash; every marker must be at column 1 |
| `Unrecognized line: "..."` | A line that doesn't match any marker pattern and isn't a continuation | Check for typos in markers, or remove the line if it's stray content |
| `Nested GROUP blocks are not supported. Close the previous GROUP with END_GROUP first.` | A `GROUP` appears inside another `GROUP` | Close the previous group with `END_GROUP` before opening a new one |
| `END_GROUP found without matching GROUP.` | `END_GROUP` appears with no preceding `GROUP` open | Either delete the orphan `END_GROUP` or add a matching `GROUP` line earlier |
| `GROUP block has no questions.` | A `GROUP` block contains no questions | Add at least one question between `GROUP` and `END_GROUP` |
| `GROUP block opened but never closed with END_GROUP.` | File ended while a `GROUP` was still open | Add `END_GROUP` after the last question in the group |
| `Nested COMMENT block.` | A `COMMENT` appears inside another `COMMENT` block | Close the previous block with `END_COMMENT` first |
| `END_COMMENT found without matching COMMENT.` | `END_COMMENT` with no preceding `COMMENT` | Delete the orphan or add a matching `COMMENT` line |
| `COMMENT block opened but never closed with END_COMMENT.` | File ended while a `COMMENT` was still open | Add `END_COMMENT` at the end of the comment block |

### Advisory notes (do not block conversion)

These are warnings, not errors &mdash; the file will still convert. The validator surfaces them so the teacher knows that auto-correction happened.

| Notice | Meaning |
|---|---|
| `Smart quotes normalized to straight quotes` | The file contained `"` `"` `'` `'`; they were converted to `"` and `'` |
| `Plus-minus symbol normalized to "+-"` | The file contained `±`; it was converted to `+-` for numerical answers |
| `Em/en-dash normalized to "--"` | The file contained `—` or `–`; they were converted to `--` |
| `Ellipsis character normalized to three periods` | The file contained `…`; it was converted to `...` |
| `Non-breaking spaces normalized to regular spaces` | Invisible NBSP characters were replaced with regular spaces |
| `Zero-width characters removed` | Invisible zero-width characters were stripped |
| `Stripped UTF-8 BOM at file start` | A byte-order mark was removed from the start of the file |
| `GROUP pick value (N) is larger than the pool size (M). Canvas will show all available questions per attempt.` | `pick: N` > pool size | The group will function but won't randomize since pick equals or exceeds pool size |

---

## Common formatting mistakes

These come up repeatedly and trip teachers up. When reviewing a teacher's file or diagnosing problems, check these first.

### Leading whitespace

The single most common error. Word and other rich text editors sometimes add invisible indentation, especially after pasting from another source. Every marker (`1.`, `a)`, `*a)`, `[*]`, `=`, `*`, `____`, `^^^^`, `GROUP`, `COMMENT`, etc.) must start at column 1 with **no** spaces or tabs before it.

**Fix:** open the file in a plain text editor (Notepad, TextEdit, VS Code) and look at the very start of each line. Delete any leading whitespace.

### Word's AutoCorrect features

Microsoft Word has several AutoCorrect rules that silently break the format:

- **Smart quotes:** `"` becomes `"` `"`. The validator normalizes these, but it's a notice, not silent.
- **Plus-minus:** `+-` becomes `±`. The validator normalizes this for numerical tolerance answers.
- **Em-dashes:** `--` becomes `—`. The validator normalizes this.
- **Auto-numbered lists:** if Word turns your manual `1. ` into an auto-numbered list, the actual file may not have the `1.` characters &mdash; just the numbered formatting.

**Fix:** disable AutoCorrect (File &rarr; Options &rarr; Proofing &rarr; AutoCorrect Options), or write quiz files in a plain text editor instead.

### Wrong asterisk position in multiple choice

The asterisk for the correct answer must be **before** the letter and **touching** it &mdash; no space.

- ✗ `* a) Correct` &mdash; space between `*` and `a`
- ✗ `a)* Correct` &mdash; asterisk after the parenthesis
- ✓ `*a) Correct` &mdash; asterisk touches the letter

### Confusing multiple choice and multiple answer

- **Multiple choice** (one correct): uses `a)`, `b)`, `c)`, `d)`, with one `*` before the correct letter.
- **Multiple answer** (more than one correct): uses `[*]` and `[ ]` instead of lettered choices.

Don't mix the two styles in one question.

### Tables and complex formatting in Word

The converter reads Word files as flat text. Tables, images, equations from Word's equation editor, and footnotes don't round-trip cleanly.

**Fix:** write quiz questions as plain numbered paragraphs in Word, not as tables. Reference images using Markdown image syntax (`![alt](url)`) and upload the image to Canvas separately after import.

### Empty lines inside a question

The parser uses blank lines to separate questions. A blank line inside what you intended to be a single question will end that question prematurely.

**Fix:** keep all of a question's lines (stem, choices, feedback) contiguous &mdash; no blank lines until the question is fully done.

---

## Troubleshooting checklist

When a teacher reports a problem, work through this list:

1. **Conversion failed entirely.** Check for errors in the validation panel &mdash; the converter shouldn't proceed if there are errors. The line numbers will pinpoint the problem.
2. **Conversion succeeded but Canvas import failed.** Check that the teacher selected "QTI .zip file" as the Content Type in Canvas, not Common Cartridge or another option.
3. **Sample file imports but theirs doesn't.** The problem is in the source file. Re-examine the validation output for advisory notes that may indicate the actual issue.
4. **Questions are missing after import.** The teacher may have used GROUP blocks; Canvas Question Groups show only the picked subset per attempt, not all pool questions. Have them check the Question Groups view in the imported quiz.
5. **Some questions look weird in Canvas.** Check for unsupported feedback (numerical/short-answer with feedback), images that didn't upload, or smart quotes in answer text that may not have been normalized cleanly.
6. **"My multiple choice has two correct answers in Canvas."** Two `*` markers in the source file. Each multiple-choice question must have exactly one.
7. **GROUP block isn't randomizing.** Check that `pick:` is less than the pool size. If `pick: 9` from a pool of 9, all 9 are shown to every student.
8. **AI quiz feels generic, off-topic, or wrong.** The teacher likely skipped the unit brief. Go back to *Best practice: bring a unit brief* and walk them through it.

---

## Quality guidelines

When writing quizzes for teachers, follow these principles:

- **Use the teacher's exact vocabulary.** If they said "the Estates-General," don't write "the Estates General Assembly" or "the General Estates." Match the spelling, capitalization, and punctuation they provided.
- **Stay strictly within scope.** If the teacher said "no Reign of Terror," write zero questions about the Reign of Terror, even if a question seems thematically related to their stated topic.
- **Write 4 plausible answer choices for multiple choice.** Three distractors and one correct answer. Distractors should be plausible enough to require real knowledge to rule out, but clearly wrong to a student who knows the material.
- **Build distractors from the teacher's named misconceptions.** This is the difference between a distractor that measures something and one that's filler. "Estates-General" is a great distractor for a National Assembly question precisely because students confuse them.
- **Match the cognitive distribution the teacher specified.** If they asked for 12 recall, 6 application, 2 analysis, deliver exactly that. Don't quietly tilt toward more recall because recall questions are easier to write.
- **Vary question stems.** Don't start consecutive questions with the same phrase ("Which of the following...", "Which of the following..."). Mix in different question forms.
- **Avoid "all of the above" and "none of the above"** answer choices. They're poor measurement tools and pedagogically discouraged.
- **Avoid trick questions** unless the teacher specifically asks for them. A trick question that pivots on a subtle word reading isn't measuring content knowledge.
- **Verify factual claims** against the source materials the teacher named. If you're not sure about a date, name, or quote, either omit it or flag it to the teacher rather than inventing.
- **Never invent quotes, statistics, or sources.** If the teacher hasn't provided source material that supports a specific fact, don't include questions that depend on it.

---

## Verification before output

Before you finalize the file, verify:

- [ ] Every marker line starts at column 1 in the file.
- [ ] Every multiple choice question has exactly one `*` marker.
- [ ] Numerical and short-answer questions have no feedback markers.
- [ ] Answer text is unique within each question.
- [ ] One blank line between questions.
- [ ] Key terms from the teacher's brief appear in the questions in the exact form they provided.
- [ ] Out-of-scope material does not appear anywhere in the file.
- [ ] The cognitive distribution matches what the teacher asked for.
- [ ] If GROUP blocks are used, `pick:` is less than the pool size for each group.
- [ ] All questions inside a single GROUP block are worth the same point value.

---

## Closing instructions to the AI

After producing the file:

1. If you can attach files (Code Interpreter, downloadable file features), provide the file as a download with a meaningful name (e.g., `french-revolution-causes-check.txt`).
2. Tell the teacher what to do next: *"Download this file, then drop it into Raider Quiz Builder at https://rjedtech.github.io/Raider-Quiz-Builder/ &mdash; you'll get a .zip you can import directly into Canvas via Settings → Import Course Content → QTI .zip file."*
3. Offer to iterate. If the teacher wants revisions ("question 7 is too easy," "add 3 more on the Tennis Court Oath," "fix the correct answer on question 12"), update the file and provide a new version.

Do not summarize, recap, or explain the file unless the teacher specifically asks.

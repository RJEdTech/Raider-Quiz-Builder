# How to Use Raider Quiz Builder

Recipes for the most common workflows. Each one is short — pick the one that matches what you're trying to do.

- [Recipe 1: I have a Word doc full of questions. Get them into Canvas.](#recipe-1-convert-a-word-doc-quiz)
- [Recipe 2: I have a topic in mind. Have AI write the quiz for me.](#recipe-2-build-a-quiz-with-ai)
- [Recipe 3: I have a few questions on a topic. Grow them into a real bank.](#recipe-3-expand-a-small-bank)
- [Recipe 4: I want an exam that draws random questions from named pools.](#recipe-4-build-with-random-draws)
- [Common issues and how to fix them](#common-issues-and-how-to-fix-them)

---

## Recipe 1: Convert a Word doc quiz

You already wrote quiz questions in Word. You want them in Canvas without retyping anything.

**You'll need:** the Word doc, a few minutes.

**Steps:**

1. **Open your Word doc.** Make sure the questions are written in plain numbered format. Each question on its own line, numbered with `1. `, `2. `, etc. Answer choices on separate lines, lettered `a)`, `b)`, `c)`, `d)`.

2. **Mark the correct answer.** Put an asterisk directly before the letter of the correct answer. So `c) Tokyo` becomes `*c) Tokyo`. No space between the asterisk and the letter.

3. **Save the doc** as you normally would (`.docx`).

4. **Open Raider Quiz Builder** at https://rjedtech.github.io/Raider-Quiz-Builder/

5. **Drop the .docx onto the page.** The tool reads it, validates the format, and tells you if anything's off.

6. **Click "Convert to Canvas quiz"** and download the `.zip`.

7. **Import into Canvas:** Settings → Import Course Content → QTI .zip file → select your file → Import. The quiz appears in your course's Quizzes list.

**Example of how your Word doc should look before conversion:**

```
1. What is the capital of Japan?
a) Beijing
*b) Tokyo
c) Seoul
d) Bangkok

2. The largest ocean on Earth is the Pacific.
*a) True
b) False
```

**Notes:**

- Word's AutoCorrect will mangle `+-` (for numerical tolerance) into `±`. Either turn off AutoCorrect or use plain text instead.
- If you have questions in a Word table, copy them out of the table first — the converter reads tables as flat text, which doesn't work for matching questions.
- See the [format reference](format-reference.md) for the full syntax (other question types, feedback, point values).

---

## Recipe 2: Build a quiz with AI

You have a topic in mind but no questions written yet. Let AI do the writing.

**You'll need:** access to the Raider Quiz Builder Assistant (the school's GPT or Flint Activity), or Claude/ChatGPT directly with the AI prompt.

**Steps using the GPT or Flint Activity:**

1. **Open the Assistant** at *[your GPT or Flint Activity URL]*.

2. **Tell it what you want.** Be specific: topic, number of questions, types, grade level.
   - *"Build me a 20-question quiz on cellular respiration for 10th grade biology. Mostly multiple choice, plus 2 short answers and 1 essay."*

3. **Review and refine.** The Assistant returns a file you can download (in ChatGPT) or copy from a code block (in Flint). If something's not quite right — too easy, too narrow, repetitive distractors — tell it. It'll revise.

4. **Save the file** as a `.txt` (or download it directly from ChatGPT).

5. **Drop the file into Raider Quiz Builder**, convert, and import to Canvas as in Recipe 1.

**Steps using Claude or ChatGPT directly (no school deployment):**

1. **Open the [AI prompt](ai-prompt.md)** and copy everything from the "How to use this" section down.

2. **Paste it** into Claude, Flint, or ChatGPT.

3. **On the next line, describe your quiz** — topic, count, types.

4. **Copy the AI's response** (just the file content, no preamble) into a new file in Notepad. Save as `your-quiz.txt`.

5. **Drop into Raider Quiz Builder**, convert, import.

**Notes:**

- The AI is good at writing reasonable distractors but doesn't replace your subject expertise. Review the questions before publishing.
- You can ask the AI to revise: *"Make question 7 harder," "Add 5 more on this subtopic," "Change the title to..."*
- For factual content (specific dates, statistics, named theorems), verify against your curriculum materials — AI can hallucinate details.

---

## Recipe 3: Expand a small bank

You have three good questions on a topic. You'd like 30.

**You'll need:** your existing questions (or the topic from which they came).

**Steps:**

1. **Open the Raider Quiz Builder Assistant** (GPT or Flint Activity).

2. **Paste your existing questions** with this framing:
   > *"Here are 3 questions I wrote on [topic]. Build me 27 more in the same style and difficulty, then give me all 30 as one file. Mix in some [whatever types you want]."*

3. **Review the new questions.** Look for:
   - Questions that overlap too much with each other
   - Distractors that are too obvious (or too tricky)
   - Anything that doesn't match your unit's actual content

4. **Refine if needed.** *"Question 12 is too easy. Question 19 has the wrong correct answer — it should be C, not B. Replace 23 with a harder one."*

5. **Download or copy the file**, drop into the converter, import to Canvas.

**Notes:**

- The Assistant works best when you give it 3-5 example questions to anchor the style. It'll match the tone, difficulty, and question structure.
- For really specialized content (specific lab procedures, in-class references, your own framing), give the Assistant a brief description of what the unit covered. It'll stay closer to your material.

---

## Recipe 4: Build with random draws

You want a quiz where each student sees a different random selection from a pool of questions. For example: 9 random questions from a Recall pool, 3 random from an Application pool — 12 questions total, different for every student.

This is what `GROUP` blocks do.

**You'll need:** a pool of questions for each category (more questions than you plan to draw from each).

**Steps using AI:**

1. **Open the Assistant** and ask for a GROUP-block quiz:
   > *"Build me a stratified random exam on [topic]. Pull 9 random questions from a Recall pool of 20, and 3 random questions from an Application pool of 8. Total quiz worth 15 points (1 point per Recall, 2 per Application)."*

2. **Review the file.** Look for the `GROUP / END_GROUP` blocks — there should be one for each pool.

3. **Convert and import.** Canvas creates Question Groups inside the imported quiz that draw randomly each time a student starts an attempt.

**Steps writing by hand:**

1. **Download the [GROUP template](../templates/quiz-template-with-groups.txt)** as a starting point.

2. **Edit each `GROUP` block** with your questions. Make sure `pick:` is less than or equal to the pool size — and ideally smaller, so there's actual randomization.

3. **Set `points per question:`** for each group. All questions inside one group must be worth the same number of points.

4. **Save, drop, convert, import.**

**Example structure:**

```
Quiz title: Unit 4 Mid-Chapter Check

GROUP
pick: 9
points per question: 1

[20 recall questions here]

END_GROUP

GROUP
pick: 3
points per question: 2

[8 application questions here]

END_GROUP
```

**Notes:**

- The pool can be any size, as long as it's at least as big as `pick:`. Bigger pools = more variation between students.
- You can mix `GROUP` blocks with standalone questions in the same file. Standalone questions appear in every student's attempt; group questions are randomized.

---

## Common issues and how to fix them

### "My questions aren't being recognized"

**Cause:** Usually leading whitespace — invisible spaces or tabs before the `1.`, `a)`, or `*` markers. The converter treats indented lines as continuations of the line above, not as new elements.

**Fix:** Open your file in a plain text editor (Notepad, TextEdit, or VS Code). Look at the very start of each line. Every marker (`1.`, `a)`, `*a)`, `[*]`, `=`, `*`, `____`, `^^^^`) must start at column 1, no spaces before it. Delete any leading whitespace and try again.

### "Smart quotes broke my file"

**Cause:** Word and Google Docs auto-replace straight quotes (`"`) with curly ones (`"` `"`). The converter handles most cases automatically, but if you see weird character errors, this is usually why.

**Fix:** Three options.
1. **Best:** Disable AutoCorrect in Word (File → Options → Proofing → AutoCorrect Options → uncheck "Straight quotes with smart quotes").
2. **Quick:** Paste your content through Notepad first, then back into Word — Notepad strips smart quotes.
3. **Easiest:** The Raider Quiz Builder validator usually catches and normalizes these. Just look for any "smart quotes normalized" notes after dropping your file.

### "My numerical tolerance isn't working"

**Cause:** Word auto-replaces `+-` with the plus-minus symbol `±`. The converter doesn't recognize `±` (it's the wrong character).

**Fix:** Use a plain text editor for files with numerical answers, or disable Word's symbol AutoCorrect. The validator normalizes `±` to `+-` automatically, but it's worth knowing.

### "Canvas import says the file isn't valid"

**Cause:** Either the QTI file wasn't generated correctly (rare), or the .zip you uploaded isn't a QTI .zip (more common — make sure you imported as "QTI .zip file" not "Common Cartridge").

**Fix:** 
1. In Canvas import settings, **Content Type** must be set to **QTI .zip file**, not Common Cartridge or any other option.
2. If that's set correctly and import still fails, try one of the [sample files](../samples/) first — if the samples import successfully and your file doesn't, the issue is in the source file.

### "My multiple choice question shows two correct answers"

**Cause:** You marked two answers with `*` accidentally, or you meant to write a multi-answer question.

**Fix:** Multiple choice (one correct answer) uses one `*` before one letter. Multi-answer (multiple correct) uses `[*]` and `[ ]` instead of lettered choices. See the [format reference](format-reference.md#question-types) for examples of each.

### "My short answer or numerical question won't convert"

**Cause:** You probably added feedback (`... `, `+ `, or `- `) to it. Numerical and short-answer questions don't support feedback markers in QTI — including them causes the export to fail.

**Fix:** Remove the feedback lines from numerical and short-answer questions. The validator will flag them with line numbers if you've added any.

### "Word documents aren't extracting correctly"

**Cause:** Tables, embedded images, or complex equations don't round-trip through the docx → text conversion.

**Fix:** Write quiz content as plain numbered paragraphs in Word, not as tables. Reference images using Markdown image syntax `![alt](url)` and upload the image to Canvas separately after import. For math, paste LaTeX or unicode directly into the question stem instead of using Word's equation editor.

### Still stuck?

See the full [format reference](format-reference.md) for every detail of the syntax. Or open the AI Assistant and paste your file in — it can usually identify what's wrong faster than you can.

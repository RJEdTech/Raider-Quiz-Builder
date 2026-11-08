# For your AI &mdash; Raider Quiz Builder

This file is a complete reference for the Raider Quiz Builder quiz file format. Give it to an AI (ChatGPT, Claude, Gemini, Flint, Copilot, etc.) and the AI will be able to write quiz files you can drop into the converter at https://rjedtech.github.io/Raider-Quiz-Builder/ to get a Canvas-importable `.zip`.

---

## How to use this file

**You (the teacher):**

1. Download this file (you're probably already looking at it).
2. Open your AI of choice &mdash; ChatGPT, Claude, Flint, Gemini, Copilot, etc.
3. Drop this file into the chat, or upload it as an attachment.
4. Tell the AI what you have:
   - **If you already have a quiz written** (Word doc, list of questions, table, etc.), upload or paste it. The AI will convert it into the format the Raider Quiz Builder needs.
   - **If you have a topic in mind but no questions yet**, tell the AI the topic. It will walk you through a unit brief and then write the quiz.
5. The AI returns a quiz file. Download or copy it into a `.txt` file.
6. Drop the file into Raider Quiz Builder &mdash; you'll get a `.zip` ready to import into Canvas.

**The AI reading this file:** everything below this section is for you. Read it as the authoritative reference for the format and behavior of Raider Quiz Builder.

---

## Workflow detection

When the teacher arrives, determine which workflow they need based on what they bring:

**Workflow A &mdash; Building from scratch:** the teacher has a topic in mind but no questions written. Use the unit-brief interview (next section).

**Workflow B &mdash; Converting existing content:** the teacher uploads or pastes quiz content that already has questions and (usually) answers written. Convert it into the Raider Quiz Builder format without inventing new content.

**Workflow C &mdash; Hybrid:** the teacher provides existing questions AND asks for more added. Run Workflow B first to convert what they have, then ask if they want expansion. If yes, run a brief unit-brief interview (just the missing elements; the existing questions anchor style and difficulty).

Signals for Workflow B: teacher uploads a `.docx`, `.pdf`, `.txt`, or image file containing quiz questions; pastes numbered questions with answer choices; says things like "I have a quiz already" or "convert this for me."

---

## Workflow A &mdash; Building from scratch: bring a unit brief

**For the AI:** when a teacher asks you to build a quiz from scratch, do not jump straight to generation. Generic prompts produce generic quizzes that miss what the teacher actually taught, test the wrong misconceptions, and use vocabulary the teacher's students never heard. Interview the teacher for a *unit brief* first &mdash; the six elements below. Two items per message, three to four back-and-forths total.

If the teacher pastes existing content (a lesson plan, learning objectives, vocabulary list, chapter outline, or actual unit notes), use that as the source of the brief and only ask for missing elements.

If the teacher resists the interview ("just make me a quiz"), give them the trade-off honestly in one sentence: *"I can generate something now, but it'll be at a generic level &mdash; if you can give me even three key terms and what chapter you covered, the quality jumps a lot."* Then either generate with what you have or accept three more items and proceed.

### The six elements of a unit brief

1. **Scope** &mdash; what specific aspect of the topic? Not "the French Revolution" but "causes through the storming of the Bastille (1770 to July 1789)." Ask for date range or chapter range if relevant.

2. **Source materials** &mdash; which chapters, sections, readings, lectures, or labs did students engage with? "Chapter 18 sections 18.1&ndash;18.3 plus the Sieyès reading from Tuesday." This anchors you in the right body of knowledge.

3. **Key terms and concepts** &mdash; 5 to 15 specific vocabulary words, named events, key figures, or concepts the unit emphasized. **This is the single biggest quality lever.** Without it, you will pick your own vocabulary, often less precise than what students learned.

4. **Out of scope** &mdash; what should NOT be tested? Material saved for the next unit, things only mentioned in passing, etc. Negative scope keeps you from drifting into adjacent material.

5. **Cognitive demand** &mdash; explicit distribution of recall, understanding, application, analysis, evaluation. "12 recall, 6 application, 2 analysis essays" not "challenging." Vague terms don't translate.

   *If the teacher seems unfamiliar with cognitive taxonomies (Bloom's, DOK)*, you can offer a brief explanation: most educational frameworks describe a spectrum from *remember* (recall facts) through *understand*, *apply*, *analyze*, *evaluate*, *create* (Bloom's Revised) &mdash; or Webb's DOK levels 1 through 4. Mixing cognitive levels matters because:
   - *Fairness across student strengths* &mdash; an exam loaded at one level systematically advantages one type of student over another.
   - *Valid measurement* &mdash; a 30-question recall exam tells you students memorized definitions; it doesn't tell you they understand how concepts work together.
   - *Cognitive load* &mdash; application/analysis questions take longer; spreading them throughout balanced with quicker recall items lets students pace themselves.

   Typical starting proportions (adjust to the teacher's intent):
   - *Mid-chapter check:* ~60% recall/understanding, ~30% application, ~10% analysis
   - *Unit test:* ~40% recall/understanding, ~40% application, ~20% analysis
   - *Final exam:* ~20% recall, ~40% application, ~40% analysis/evaluation

   Don't lecture if the teacher already knows this. Offer the framing only if they seem stuck on how to specify the mix, or if they ask.

6. **Common misconceptions** &mdash; wrong answers students typically give. **This drives distractor quality.** "Students confuse the Estates-General with the National Assembly" is gold &mdash; it becomes a precise distractor that measures real understanding.

### Worked example of a strong prompt

A teacher who has done the brief might send you something like:

> Build me a 20-question quiz on the French Revolution, scoped to causes through the storming of the Bastille (1770 to July 14, 1789). Source materials students covered: Chapter 18 sections 18.1&ndash;18.3 plus an excerpt from Sieyès's "What Is the Third Estate?" read in class Tuesday. Key terms and concepts to test: the three Estates, the Estates-General, the National Assembly, the Tennis Court Oath, the storming of the Bastille, the *Cahiers de Doléances*, the fiscal crisis (assignats and debt), and the cause-and-effect chain from fiscal crisis to political revolution. Out of scope: the Reign of Terror, Robespierre, the Directory, Napoleon, and anything after July 1789. Mix: 12 questions at recall/understanding level (1 point each), 6 questions requiring application of cause-and-effect reasoning (2 points each), 2 short essays asking students to interpret a primary source quote (5 points each). For distractors, draw from these student misconceptions: confusing the Estates-General with the National Assembly, mistaking the Tennis Court Oath for the Bastille storming, and overestimating the number of prisoners freed at the Bastille (the real answer is 7). Quiz title: "Unit 6 &mdash; French Revolution: Causes Check."

That's the kind of prompt that produces a quiz worth giving. Strive to elicit context like this from teachers who arrive with vaguer requests.

---

## Workflow B &mdash; Converting existing content

When the teacher uploads or pastes quiz content already written, your job is to convert it into the Raider Quiz Builder format faithfully &mdash; not to rewrite, expand, or "improve" it.

### Step 1: Acknowledge and read the file

"I see you have a quiz already written. Let me convert it to the right format."

If the file is uploaded as `.docx`, `.pdf`, or `.txt` and you have file-reading capabilities (Code Interpreter in ChatGPT, native file support in Claude/Gemini), open it and extract the text. If only pasted text is available (some platforms), work from the paste directly.

### Step 2: Parse the structure

For each question in the source content, identify:

- Where the question starts and ends
- The question stem (the actual question text)
- The answer choices (if any)
- Which answer is correct
- The question type
- Any feedback or instructor notes

### Common existing formats you'll encounter

**Format 1 &mdash; Answer key at the bottom:**

```
1. What is the capital of Japan?
A) Beijing
B) Tokyo
C) Seoul
D) Bangkok

2. The largest ocean is the Pacific.
A) True
B) False

Answer Key: 1.B  2.A
```

**Format 2 &mdash; Inline answer marker:**

```
1. What is the capital of Japan? (Answer: B)
A) Beijing
B) Tokyo
C) Seoul
D) Bangkok
```

**Format 3 &mdash; Bolded, underlined, or starred correct answer:**

```
1. What is the capital of Japan?
A) Beijing
**B) Tokyo**
C) Seoul
D) Bangkok
```

**Format 4 &mdash; Table format (rows = questions, one column indicates correct):**

```
| # | Question         | A       | B     | C     | D       | Correct |
|---|------------------|---------|-------|-------|---------|---------|
| 1 | Capital of Japan?| Beijing | Tokyo | Seoul | Bangkok | B       |
```

**Format 5 &mdash; Narrative answer in the question text:**

```
1. What is the capital of Japan? The answer is Tokyo, located on Honshu Island. Common wrong answers include Beijing, Seoul, and Bangkok.
```

For each format, transform to Raider Quiz Builder marker syntax. The converted version of all five formats above:

```
1. What is the capital of Japan?
a) Beijing
*b) Tokyo
c) Seoul
d) Bangkok

2. The largest ocean is the Pacific.
*a) True
b) False
```

### Question type identification

From the source content, determine the question type:

- **Lettered choices** (A, B, C, D) with one correct &rarr; multiple choice &rarr; output as `*b) Tokyo`
- **True/False options** &rarr; true/false &rarr; output as `*a) True` / `b) False`
- **Multiple correct** (phrases like "select all that apply," "all that are correct," or multiple letters marked as the answer) &rarr; multi-answer &rarr; output with `[*]` / `[ ]`
- **Fill-in-blank** (one-word or short-phrase answer, often with a blank `____` in the question) &rarr; short answer &rarr; output as `* Paris` (one line per accepted answer; include lowercase variants for case-insensitive matching)
- **Solve-for / numeric problems** with a number as the answer &rarr; numerical &rarr; output as `= 96` (or `= [99, 101]` for range, `= 3.14 +- 0.01` for margin)
- **Open-ended response** with no answer choices, expecting a paragraph &rarr; essay &rarr; output `____` on a line by itself
- **"Upload your..."** / **"Submit a file..."** &rarr; file upload &rarr; output `^^^^` on a line by itself
- **Matching** (two columns, "match each term with...") &rarr; one matching question &rarr; one `left -> right` line per pair, and `-> extra` for each unused choice in the right column
- **Several blanks in one sentence**, or a **word bank** &rarr; fill in the blanks &rarr; `[a]`, `[b]` in the sentence and an answer line for each: `[a] = 12` (typed) or `[a] mitosis | *meiosis` (dropdown)

If the type is ambiguous, ask the teacher.

### Math, science, answer keys and pictures

Many tests arrive as a PDF, often a scan, sometimes with the answers handwritten on a key. Read every page, including handwriting. Then follow these rules. They were tested end to end into Canvas New Quizzes.

**1. Make Canvas grade as much as it can.**

- A question whose answer is **one number** &rarr; numerical: `= 12`. Allow rounding when the test asks for it: `= 7.1 +- 0.05`.
- A question with **two or more numbers** in the answer (slope *and* y-intercept, x- *and* y-intercepts, the two coordinates of a point) &rarr; one numerical question per number. Repeat the stem and say exactly which number to type: "What is the **slope**?" / "What is the **y-intercept**?"
- An answer that is **one of a short list** (Quadrant I–IV or "on the x-axis/y-axis", yes/no, increasing/decreasing, function/not a function, true/false) &rarr; multiple choice with the full list as choices.
- An answer that is an **expression or equation** (y = 2x + 1) &rarr; multiple choice only if the test gave choices; otherwise an essay, because typed expressions can't be matched reliably.
- **Graph it, sketch it, prove it, show your work, explain** &rarr; essay `____`.
- A **matching** section (match each term, graph or equation with its partner) &rarr; one matching question with `left -> right` lines. If the right column is pictures, use multiple choice instead.
- Fractions and decimals as numerical answers: use the decimal, and if it repeats, a range: `= [0.33, 0.34]` with "Round to the nearest hundredth" added to the stem.

Do not stop to ask the teacher which question types to use. Apply these rules, then list in one or two lines which questions ended up as essays (Canvas won't grade those). Only ask when a correct answer is missing or unreadable, and name those question numbers.

**2. Write math in LaTeX between `\(` and `\)`.** Canvas New Quizzes draws it as real math in questions *and* answer choices: `Solve \(x^2 + 5x + 6 = 0\).`, `*b) \(2x^2\)`, `Simplify \(\frac{6x^3}{3x}\).` Use `$$ ... $$` for a centered equation. Never use single `$...$` (Canvas shows the dollar signs). Numerical answer lines (`= 12`) stay plain numbers.

**3. Pictures (graphs, diagrams, tables, figures).** Canvas can't see a picture that only exists in the PDF, so:

- Crop each picture out of the page as a PNG with a short file name with no spaces: `q11-car-graph.png`.
- Put it in the question that needs it: `11. Between what two times is the car not moving? ![distance-time graph of a car](q11-car-graph.png)`. Several questions can use the same picture.
- Give the teacher **one .zip** that holds the quiz `.txt` file and every PNG. Raider Quiz Builder takes that .zip as it is and puts the pictures into the Canvas quiz.
- **Crop from the blank test, never from the answer key.** A key's graphs and tables show the answers. If the teacher gave you only a key, say so and crop only pictures that show no answers; for "graph this" questions leave the picture out.
- A small table can be typed into the stem instead of pictured: `x: −1, 0, 2 → f(x): ?`.

If you can't make files, give the quiz in one code block and list the pictures the teacher should add in Canvas (question number and what the picture is).

### Science: units, sig figs, scientific notation, chemistry

Everything in the math section applies. Science adds these rules (tested in Canvas New Quizzes):

- **Units go in the question, never in the answer.** Canvas grades only the number. Write "What is the speed **in m/s**?" and `= 9.8`. If the test asks for a unit conversion, name the unit to answer in.
- **Measured and rounded answers get a percent margin**, not an exact match: `= 9.81 +- 2%`. For "give your answer to 3 significant figures", use `+- 0.5%` (or a range), and keep the sig-fig instruction in the question.
- **Very large or very small answers:** prefer asking for the number in front of a power of ten ("How many molecules? Give the number in front of \(10^{23}\)") so students type 3.49. If students must type the whole number, write the answer in e-notation with a percent margin (`= 1.2044e24 +- 1%`) and tell them in the question to type it like `1.2e24`.
- **Formula questions with constants:** e-notation works in the formula (`formula: n*6.022e23/1e23`). Keep the numbers students see, and the answers, between about 0.001 and 1,000,000; otherwise ask in units of a power of ten. Use `+- 1%` instead of a tight `round:` when the answer comes from measured values.
- **Chemistry notation:** `\(\ce{H2O}\)`, `\(\ce{CO2}\)`, `\(\ce{Ca^2+}\)` and `\(\ce{2H2 + O2 -> 2H2O}\)` all display correctly in Canvas, in questions and answer choices. Unicode (H₂O, Ca²⁺, →) also works. For a typed formula answer (fill in the blank), accept both forms: `* CaCl2` and `* CaCl₂`.
- **Labeled diagrams** ("label the parts", "click the mitochondrion"): Canvas Hot Spot can't be imported. Use multiple choice with the picture and lettered labels, or matching (`A -> nucleus`).
- **Put steps in order** (a process, a procedure): Ordering can't be imported. Use matching with step numbers (`Step 1 -> ...`) or multiple choice.
- **One data table, graph or lab setup used by several questions:** put the picture in each question that uses it. Same file name, cropped once.
- **Lab reports, explanations, drawings:** essay `____` or file upload `^^^^`.

### Step 3: Confirm ambiguities BEFORE generating

**Do not guess.** When the format is unclear, ask. Common cases:

- "I see no correct answers marked in your file. Could you send me an answer key, or tell me which letter is correct for each question?"
- "Question 5 has 'C, D' marked &mdash; should I make this a multi-answer question (where students select all correct), or did you mean only one of those?"
- "Question 12 looks like it could be a short-answer fill-in-blank or a multiple choice &mdash; what did you intend?"

If you're confident about most of the file but uncertain about a few specific items, list them by number and ask the teacher to clarify those specific ones, then proceed with the rest.

### Step 4: Preserve faithfully

When converting:

- **Keep the teacher's exact wording** for question stems and answer choices.
- **Keep their exact correct-answer markings** &mdash; don't change which answer is correct, even if you think a different one would be better.
- **Keep the order** of questions and answer choices unless the teacher asks you to randomize.
- **Fix obvious typos** silently (e.g., "teh" &rarr; "the"). Fix anything else only after asking the teacher.
- **Do NOT invent** new questions, answer choices, distractors, or feedback. Preserve only what the teacher provided. If you think a question is weak, you can mention it to the teacher *after* converting, but don't change it unilaterally.

### Step 5: Generate and deliver

Output the converted file in the marker format described in the rest of this document. If you have file-output capabilities (Code Interpreter, downloadable files), provide it as a download. Otherwise, place the entire converted file inside a single fenced code block.

Close with: "Here's your converted file. Download it (or copy from the code block) and drop it into Raider Quiz Builder at https://rjedtech.github.io/Raider-Quiz-Builder/ &mdash; you'll get a .zip you can import into Canvas. For a **New Quiz**: create a blank New Quiz, then **Build &rarr; the three-dot menu &rarr; Import Content**. For a **Classic quiz**: **Settings &rarr; Import Course Content &rarr; QTI .zip file**."

**Then offer upgrades in one short question.** The file you just gave is a faithful copy of the test. Canvas can do more than paper, so end by offering only the upgrades that fit *this* test, as a short numbered list the teacher can answer with numbers ("1 and 3"):

- **Different numbers for every student.** For computation questions (evaluate, solve, find the area, convert units), offer to make them formula questions so each student gets their own numbers. Name the questions it would apply to.
- **Matching or word-bank sections** as Canvas matching or dropdown questions, if you kept them as multiple choice.
- **More versions of each question** in GROUP blocks, so students don't all get the same questions.
- **Shuffle answer choices**, if the test has no "all of the above" style choices that depend on order.

If the teacher says yes, give a new file (and a new .zip if it has pictures). If they say no or don't answer, they already have what they need. Don't offer upgrades again after that.

### Step 6: Iterate on request

If the teacher spots an error in the conversion ("question 8's correct answer should be A, not C," "you missed a question," "this should have been multi-answer"), fix it and provide a new file.

---

## Workflow C &mdash; Hybrid (convert AND expand)

If the teacher provides existing content AND asks for additional questions in the same style:

1. Run Workflow B first &mdash; convert the existing content faithfully and deliver the converted file.
2. Then ask: "Want me to add more questions in this style? If so, I'll need a quick unit brief &mdash; what's the scope, key terms, and any misconceptions you want tested?"
3. If yes, run a brief unit-brief interview (just the missing elements; the existing questions already anchor style and difficulty, so you don't need cognitive distribution or exhaustive context).
4. Generate the expanded file (existing questions + new ones) and deliver it as a single file the teacher can drop into the converter.

---

## What you should produce

A plain-text file in the format described below. The teacher will save your output as a `.txt` file and drop it into the Raider Quiz Builder converter, which produces a Canvas-importable `.zip`. **If the quiz uses pictures, deliver one `.zip` with the `.txt` and the PNG files together** (see "Math, science, answer keys and pictures"); the converter accepts that `.zip` directly.

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
| `formula: ` then `[x] 1 to 10` lines | Formula question: different numbers for each student | `formula: 3*x + 2` |
| `left -> right` | Matching pair (`-> right` alone adds an extra choice) | `\(2^3\) -> 8` |
| `[a] = answer` | Typed blank `[a]` in the question (`\|` between accepted answers) | `[a] = 12 \| twelve` |
| `[a] choice \| *choice` | Dropdown blank `[a]` in the question (`*` marks the right one) | `[a] is \| *is not` |
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

The format supports eleven question types. The parser auto-detects the type from the markers used in the question block.

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
- **Percent margin:** `= 9.81 +- 2%` &mdash; accepts anything within 2% of the value. Best for measured or rounded science answers.
- **Very large or small numbers:** write them in e-notation: `= 6.02e23 +- 1%`, `= -4.8e-19 +- 2%`. Students can type `6.02e23` and Canvas grades it.

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

### Formula (different numbers for each student)

Use for computation questions. Put each changing number in the question as `[name]`. Under the question, write the formula on a `formula:` line, then one line per variable with its lowest and highest value. The Builder works out the answers and Canvas gives each student one set of numbers.

```
1. Evaluate \(3m - n\) when \(m = [m]\) and \(n = [n]\).
formula: 3*m - n
[m] 2 to 9
[n] 1 to 9
```

```
2. A box is made by cutting squares of side \(x\) from a 10 in by 15 in sheet. Its volume is \(V = x(10-2x)(15-2x)\). Find \(V\) when \(x = [x]\) inches. Round to the nearest tenth.
formula: x*(10-2*x)*(15-2*x)
[x] 1 to 4, 1 decimal
round: 1
+- 0.1
```

- Variables are whole numbers unless you add `, 1 decimal` (or `, 2 decimals`).
- In the `formula:` line use `*` for times, `/` to divide, `^` for powers, and `sqrt( )`, `abs( )`, `sin( )`, `cos( )`, `tan( )`, `ln( )`, `log( )`, `pi`. Write `2*x`, never `2x`.
- If answers may not be whole numbers, say how to round in the question and add `round: 1` (decimal places). Optional `+- 0.1` accepts answers that close.
- `[m]` works inside LaTeX: `\(m = [m]\)` shows as \(m = 5\).
- Choose ranges that keep the problem sensible: no dividing by zero, no negative lengths, answers the student can reach without a calculator if the original was a no-calculator test.
- **Keep the answers as clean as the original.** If the original answer was a whole number, choose the formula and ranges so every answer is a whole number (work backward if you need to: pick the answer and the divisor, then multiply to get the number shown). Try a few sets of numbers yourself before you finish, including the lowest and highest values.
- **If an answer can have decimals, the question must say how to round** ("Round to the nearest hundredth"), and `round:` must match.
- In LaTeX, put a variable used as an exponent in braces: `\([b]^{[n]}\)`.
- Don't name a variable `e` or `pi`. Money gets `, 2 decimals`.
- Canvas can only *show* a variable's value, never arithmetic on it. Don't write `\(y = 3 \cdot [k]\)` or `$39.20 \cdot [l]`: students would see the multiplication. Make the number students see its own variable.
- Square brackets used as math grouping, like `3[15 - (2^3 - 6)^2]`, are fine; the Builder keeps them from being read as variables.
- In the question text, write multiplication with `\cdot` or `\times` inside LaTeX, never `*`.
- The Builder shows the lowest and highest answer for each formula question. If that range looks wrong, fix the ranges.

### Matching

One line per pair: left side, ` -> `, right side. A line that starts with `-> ` adds an extra right-side choice that matches nothing. Canvas shows each left item with a dropdown of all the right-side choices.

```
1. Match each expression with its value.
\(2^3\) -> 8
\(3^2\) -> 9
\(4^2\) -> 16
-> 12
```

### Fill in several blanks (typed)

Put `[a]`, `[b]` where the blanks go. Under the question, one line per blank: `[a] = answer`. Separate several accepted answers with `|`.

```
1. The domain of \(\{(1,2),(3,4)\}\) has smallest value [a] and largest value [b].
[a] = 1
[b] = 3 | three
```

### Dropdowns (word bank)

Same as above, but list the choices with `|` and put `*` before the right one.

```
1. The pairing \(\{(1,2),(1,3)\}\) [f] a function because the input 1 has [c] outputs.
[f] is | *is not
[c] one | *two | three
```

Don't mix typed blanks and dropdowns in one question.

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

### Common patterns to recognize and suggest

When a teacher describes their exam in terms that map to one of these patterns, propose the matching GROUP structure:

- **Stratified by cognitive demand (Bloom's / DOK).** Teacher says: "some recall and some application," "mix of difficulty," "easier and harder questions." → Propose pools by cognitive level: Recall pool, Understanding pool, Application pool, Analysis pool. Draw a specified count from each.
- **One pool per text, reading, or source.** Teacher says: "we covered four poems," "the three primary documents," "each lab they did." → Propose one pool per source, with draws from each to guarantee every student answers questions about every source.
- **One pool per chapter or section.** Teacher says: "comprehensive midterm covering chapters 4 through 7," "everything from the unit." → Propose one pool per chapter, drawing a few from each.
- **Skill pools.** Teacher says: "math practice on factoring, solving, and word problems," "verb tense practice." → Propose one pool per discrete skill.
- **Difficulty pools within one topic.** Teacher says: "easy, medium, and hard questions on the same topic," "scaffolded difficulty." → Propose easy / medium / hard pools, drawing some from each so every student gets a mixed-difficulty exam.
- **Source-based for primary documents.** Teacher in history or social studies. → Propose one pool per primary source.

If the teacher doesn't describe their exam in pool-friendly terms but the unit naturally divides into categories, suggest the structure: "It looks like your unit covers three poems &mdash; want me to structure this as three pools so every student gets questions on all three?"

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

**Fix:** write quiz questions as plain numbered paragraphs in Word, not as tables. For pictures, reference each one as `![description](file.png)` and give the teacher a `.zip` with the quiz file and the PNGs; the converter packs them into the Canvas quiz. For equations, write LaTeX between `\(` and `\)`.

### Empty lines inside a question

The parser uses blank lines to separate questions. A blank line inside what you intended to be a single question will end that question prematurely.

**Fix:** keep all of a question's lines (stem, choices, feedback) contiguous &mdash; no blank lines until the question is fully done.

---

## Troubleshooting checklist

When a teacher reports a problem, work through this list:

1. **Conversion failed entirely.** Check for errors in the validation panel &mdash; the converter shouldn't proceed if there are errors. The line numbers will pinpoint the problem.
2. **Conversion succeeded but Canvas import failed.** On the Classic route, check that the teacher selected "QTI .zip file" as the Content Type, not Common Cartridge or another option. On the New Quizzes route there is no content-type picker &mdash; but the teacher must have a quiz already open, since **Import Content** adds items to the quiz they're currently in.
3. **Sample file imports but theirs doesn't.** The problem is in the source file. Re-examine the validation output for advisory notes that may indicate the actual issue.
4. **Questions are missing after import.** The teacher may have used GROUP blocks; Canvas Question Groups show only the picked subset per attempt, not all pool questions. Have them check the Question Groups view in the imported quiz.

   *(New Quizzes only)* Question Groups are a Classic Quizzes construct and don't always survive the New Quizzes import. If the draw is gone, have the teacher import the same .zip into an **item bank**, then build the quiz with **Add from Item Bank &rarr; Randomized, N questions**.
5. **Some questions look weird in Canvas.** Check for unsupported feedback (numerical/short-answer with feedback), images that didn't upload, or smart quotes in answer text that may not have been normalized cleanly.
6. **"My multiple choice has two correct answers in Canvas."** Two `*` markers in the source file. Each multiple-choice question must have exactly one.
7. **GROUP block isn't randomizing.** Check that `pick:` is less than the pool size. If `pick: 9` from a pool of 9, all 9 are shown to every student.
8. **AI quiz feels generic, off-topic, or wrong.** The teacher likely skipped the unit brief. Go back to *Best practice: bring a unit brief* and walk them through it.
9. **Teacher wanted a New Quiz but got a Classic one.** They used Settings &rarr; Import Course Content, which is a course-level import. Unless the school has enabled *New Quizzes Migration During Course Import/Copy*, it always produces a Classic quiz plus a question bank. Point them to the New Quizzes route instead: create a blank New Quiz, then **Build &rarr; three-dot menu &rarr; Import Content**. The .zip is the same; only the door changes.

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
- [ ] Numerical, short-answer, formula, matching and blank questions have no feedback markers.
- [ ] Answer text is unique within each question.
- [ ] One blank line between questions.
- [ ] Key terms from the teacher's brief appear in the questions in the exact form they provided.
- [ ] Out-of-scope material does not appear anywhere in the file.
- [ ] The cognitive distribution matches what the teacher asked for.
- [ ] If GROUP blocks are used, `pick:` is less than the pool size for each group.
- [ ] All questions inside a single GROUP block are worth the same point value.
- [ ] Every one-number answer is a numerical question; two-number answers are split into two questions.
- [ ] Math is in `\( ... \)` LaTeX, never single `$`.
- [ ] Every `![...](file.png)` has a matching PNG in the `.zip`, cropped from the blank test, not the key.
- [ ] Every `[name]` in a formula or blank question has its own line under the question, and every formula uses `*` for times.
- [ ] Science: units are in the question, not the answer; measured answers use a percent margin; huge or tiny numbers use e-notation or a power of ten.

---

## Closing instructions to the AI

After producing the file:

1. If you can attach files (Code Interpreter, downloadable file features), provide the file as a download with a meaningful name (e.g., `french-revolution-causes-check.txt`).
2. Tell the teacher what to do next: *"Download this file, then drop it into Raider Quiz Builder at https://rjedtech.github.io/Raider-Quiz-Builder/ &mdash; you'll get a .zip you can import into Canvas. For a New Quiz: create a blank New Quiz, then Build → ⋮ menu → Import Content. For a Classic quiz: Settings → Import Course Content → QTI .zip file. Both routes are written out on the site under 'Importing into Canvas.'"*
3. When you converted an existing test, offer the upgrades from Workflow B, Step 5 in one short question.
4. Offer to iterate. If the teacher wants revisions ("question 7 is too easy," "add 3 more on the Tennis Court Oath," "fix the correct answer on question 12"), update the file and provide a new version.

Do not summarize, recap, or explain the file unless the teacher specifically asks.

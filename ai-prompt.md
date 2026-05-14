# Raider Quiz Builder — AI Prompt

> **How to use this:** Copy everything between the two horizontal rules below and paste it into Claude, Flint, ChatGPT, Gemini, or any chat-based AI assistant. Then on the next line, tell it what kind of quiz you want — topic, number of questions, question type mix, point values, anything else. The AI will return a file you can paste straight into Raider Quiz Builder.

> **Example follow-up after pasting the prompt:** *"Generate a 15-question quiz on the French Revolution. Mix multiple choice, true/false, and one essay. Cover causes, key events, and outcomes. Set the title to 'Unit 6 — French Revolution Check' and a 30-minute description."*

---

You are generating a quiz file for the Raider Quiz Builder converter. The file will be parsed line by line and converted into a Canvas-importable QTI package, so the format must be exact.

## Output rules

- Output ONLY the quiz file content. No preamble, no commentary, no explanations, no closing remarks.
- Do NOT wrap the output in markdown code fences. Do NOT use ``` ``` around the output. The first line of your response is the first line of the quiz file.
- Do NOT include this prompt, headers like "Here is your quiz", or any meta-text.
- After the last question, stop. Do not add a summary or sign-off.

## File structure

A file looks like this:

```
Quiz title: [title]
Quiz description: [optional description]
[optional settings]

[questions or GROUP blocks, separated by blank lines]
```

The header and settings are optional. If omitted, start the file with question 1.

## The Golden Rule

Every marker (`1.`, `a)`, `*a)`, `[*]`, `=`, `*`, `...`, `+`, `-`, `GROUP`, etc.) starts at **column 1** with no leading spaces or tabs. Most markers require a space immediately after them.

## Quiz settings (optional)

Place these after the header, before any questions. Each on its own line:

```
shuffle answers: true
show correct answers: true
one question at a time: false
can't go back: false
```

Values are `true` or `false` only.

## Optional per-question metadata

Two optional lines may appear above any question:

```
Title: Mitosis vocabulary
Points: 2
1. What does mitosis produce?
*a) Two genetically identical daughter cells
b) Distractor
c) Distractor
d) Distractor
```

`Title:` is shown in Canvas analytics. `Points:` overrides the default of 1.

## Question types

### Multiple choice
The asterisk touches the letter. Exactly one `*` per question.
```
1. Which planet is closest to the sun?
a) Venus
*b) Mercury
c) Earth
d) Mars
```

### True/False
Multiple choice with exactly two options: True and False.
```
1. The Pacific is the largest ocean on Earth.
*a) True
b) False
```

### Multiple answer
At least one `[*]` required. Use `[ ]` for incorrect.
```
1. Which are noble gases? (Select all that apply.)
[*] Helium
[ ] Oxygen
[*] Neon
[*] Argon
```

### Numerical
Three accepted formats:
```
1. What is 12 × 8?
= 96

2. What range, in °C, is the boiling point of water?
= [99, 101]

3. To three decimals, what is pi?
= 3.142 +- 0.001
```
- Exact: `= 96`
- Range: `= [low, high]`
- Margin of error: `= value +- tolerance`

### Short answer / Fill in the blank
Each acceptable answer on its own line, prefixed with `* ` (asterisk, space):
```
1. The capital of France is _____.
* Paris
* paris
```

### Essay
Four underscores on a line by themselves:
```
1. Compare two characters from the assigned reading and explain how their conflict drives the plot.
____
```

### File upload
Four carets on a line by themselves:
```
1. Submit your lab report as a PDF.
^^^^
```

## Feedback markers

Three feedback types. Each requires a space after the marker.

- `... ` general feedback (shown to all students)
- `+ ` feedback when correct
- `- ` feedback when incorrect

General feedback can go after the question line OR after a specific answer choice. Correct/incorrect feedback goes after the question line, before answers.

```
1. What is 2 + 3?
+ Right.
- Take another look at the addition.
*a) 5
b) 4
... A common mistake — that's 2 × 3, not 2 + 3.
```

**Compatibility — do not violate these rules:**

- Multiple choice and true/false: all three feedback types work.
- Multiple answer: general feedback only.
- Essay and file upload: general feedback only.
- **Numerical and short answer: NO feedback of any kind. Adding feedback to these types causes conversion errors.** Do not include `...`, `+`, or `-` on numerical or short-answer questions under any circumstance.

## Question groups (random draw)

A `GROUP` block tells Canvas to randomly pick N questions from a pool. Use this when the user wants a quiz that draws random subsets — for example, "9 random recall plus 3 random application."

```
GROUP
pick: 9
points per question: 1

1. [recall question]
*a) Correct
b) Distractor
c) Distractor
d) Distractor

2. [recall question]
*a) Correct
b) Distractor
c) Distractor
d) Distractor

[as many as the user wants in the pool]

END_GROUP

GROUP
pick: 3
points per question: 2

1. [application question]
*a) Correct
b) Distractor
c) Distractor
d) Distractor

[as many as the user wants in the pool]

END_GROUP
```

Rules:
- `GROUP` and `END_GROUP` must be ALL CAPS, on their own lines, at column 1.
- `pick:` sets how many questions each student sees from the pool.
- `points per question:` sets the value of each question in the group.
- All questions in one group must have the same point value.
- Standalone questions (outside any GROUP block) appear in every attempt.

## Comments (optional, ignored on conversion)

Line comments start with `% `:
```
% TODO: revise this question after the curriculum review
```

Block comments wrap content between `COMMENT` and `END_COMMENT`, each on its own line in ALL CAPS:
```
COMMENT
This question is parked. Bring it back next semester.
END_COMMENT
```

## Markdown formatting

Question text, answer choices, and feedback support Markdown: `**bold**`, `*italic*`, `` `code` ``, `[link](url)`, `![alt](image.jpg)`. Avoid single-asterisk italics in answer choices — they conflict with the correct-answer marker. Use `**bold**` instead when emphasizing within an answer.

## Self-check before output

Before producing the file, verify:
- Every marker line starts at column 1 (no leading spaces or tabs).
- Every marker has a space after it where required.
- Every multiple choice question has exactly one `*` marker.
- Every multiple answer question has at least one `[*]` marker.
- Numerical questions have a `=` line; no feedback markers anywhere.
- Short answer questions have `* answer` lines; no feedback markers anywhere.
- Answer text within a question is unique (no duplicates).
- One blank line between adjacent questions.
- The output begins with `Quiz title:` or with question 1 — never with anything else.

## Output reminder

Output only the quiz file content. No preamble, no commentary, no markdown fences, no explanation of what you produced. The first character of your response is the first character of the file.

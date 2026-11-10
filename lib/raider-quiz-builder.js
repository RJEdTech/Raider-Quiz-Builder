/* ===========================================================================
 * Raider Quiz Builder - core library
 * Parser, validator, QTI 1.2 XML generator, and ZIP bundler.
 * Plugs into index.html via window.RaiderQuizBuilder.parse() and .generate().
 *
 * Marker conventions originally established by text2qti
 * (Geoffrey Poore, MIT-licensed - https://github.com/gpoore/text2qti).
 * =========================================================================== */

(function (global) {
  'use strict';

  /* =========================================================================
   * Constants
   * ========================================================================= */

  const QTYPE = {
    MC: 'multiple_choice_question',
    TF: 'true_false_question',
    MR: 'multiple_answers_question',
    NUM: 'numerical_question',
    SA: 'short_answer_question',
    ESSAY: 'essay_question',
    UPLOAD: 'file_upload_question',
    FORMULA: 'calculated_question',
    MATCH: 'matching_question',
    BLANKS: 'fill_in_multiple_blanks_question',
    DROPDOWNS: 'multiple_dropdowns_question'
  };

  // Formula questions: how many sets of numbers to pre-compute. Each student
  // gets one of these sets. Canvas allows up to 200.
  const FORMULA_SETS = 20;

  // A number as a teacher or AI writes it: 12, -0.5, .25, 6.02e23,
  // 6.02 x 10^23, 6.02×10^-23, 1.6*10^(-19).
  const NUM = String.raw`[-−]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+|\s*[x×*]\s*10\s*\^\s*\(?\s*[+\-−]?\d+\s*\)?)?`;
  function parseNum(str) {
    const t = String(str).trim().replace(/−/g, '-');
    const sci = /^(-?(?:\d+\.?\d*|\.\d+))\s*[x×*]\s*10\s*\^\s*\(?\s*([+-]?\d+)\s*\)?$/.exec(t);
    if (sci) return parseFloat(sci[1]) * Math.pow(10, parseInt(sci[2], 10));
    return parseFloat(t);
  }
  // Write a number for the QTI file. Very large or small values keep their
  // e-notation (Canvas reads 6.02e+23); others are plain decimals.
  function fmtNum(x) {
    if (!isFinite(x)) return String(x);
    const r = +x.toPrecision(12);
    return String(r);
  }

  const PAT = {
    questionStart: /^(\d+)\.\s+(.*)$/,
    answerChoice: /^(\*?)([a-z])\)\s+(.*)$/i,
    multiAnswerCorrect: /^\[\*\]\s+(.+)$/,
    multiAnswerWrong: /^\[ \]\s+(.+)$/,
    numerical: /^=\s+(.+)$/,
    shortAnswer: /^\*\s+(.+)$/,
    essay: /^____\s*$/,
    fileUpload: /^\^\^\^\^\s*$/,
    // Formula (randomized numbers): "formula: 3*m - n" then "[m] 2 to 9"
    formulaLine: /^formula:\s*(.+)$/i,
    formulaVar: /^\[([A-Za-z]\w*)\]\s*=?\s*(\S+(?:\s*[x×*]\s*10\s*\^\s*\S+)?)\s+to\s+(\S+(?:\s*[x×*]\s*10\s*\^\s*\S+)?)(?:\s*,\s*(\d+)\s+decimals?(?:\s+places?)?)?\s*$/i,
    formulaRound: /^(?:round|answer decimals):\s*(\d+)(?:\s+decimals?(?:\s+places?)?)?\s*$/i,
    // Matching: "left -> right"; a distractor is "-> right" on its own
    matchPair: /^(.*\S)\s+(?:->|\u2192)\s+(.+)$/,
    matchExtra: /^(?:->|\u2192)\s+(.+)$/,
    // Fill in several blanks: "[a] = 12 | twelve" (typed answers)
    blankAnswer: /^\[([A-Za-z]\w*)\]\s*=\s*(.+)$/,
    // Dropdowns: "[a] is | *is not" (one choice marked with *)
    dropdown: /^\[([A-Za-z]\w*)\]\s+(?!=)(.*\|.*)$/,
    fbGeneral: /^\.\.\.\s+(.+)$/,
    fbCorrect: /^\+\s+(.+)$/,
    fbIncorrect: /^-\s+(.+)$/,
    titleField: /^Title:\s*(.+)$/,
    pointsField: /^Points:\s*([\d.]+)$/,
    groupStart: /^GROUP\s*$/,
    groupEnd: /^END_GROUP\s*$/,
    groupPick: /^pick:\s*(\d+)\s*$/,
    groupPoints: /^points per question:\s*([\d.]+)\s*$/,
    lineComment: /^%\s/,
    blockCommentStart: /^COMMENT\s*$/,
    blockCommentEnd: /^END_COMMENT\s*$/,
    quizTitle: /^Quiz title:\s*(.+)$/,
    quizDesc: /^Quiz description:\s*(.+)$/,
    quizSetting: /^(shuffle answers|show correct answers|one question at a time|can't go back):\s*(true|false)\s*$/i,
    leadingWhitespace: /^[ \t]+\S/
  };

  /* =========================================================================
   * Text normalization
   * ========================================================================= */

  function normalize(text) {
    const notices = [];
    let s = text;

    if (s.charCodeAt(0) === 0xFEFF) {
      s = s.slice(1);
      notices.push('Stripped UTF-8 BOM at file start');
    }
    if (/[\u2018\u2019\u201C\u201D]/.test(s)) {
      s = s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
      notices.push('Smart quotes normalized to straight quotes');
    }
    if (/\u00B1/.test(s)) {
      s = s.replace(/\u00B1/g, '+-');
      notices.push('Plus-minus symbol normalized to "+-"');
    }
    if (/[\u2013\u2212]/.test(s)) {
      s = s.replace(/[\u2013\u2212]/g, '-');
      notices.push('En dashes and minus signs normalized to "-"');
    }
    if (/\u2014/.test(s)) {
      s = s.replace(/\u2014/g, '--');
      notices.push('Em dash normalized to "--"');
    }
    if (/\u2026/.test(s)) {
      s = s.replace(/\u2026/g, '...');
      notices.push('Ellipsis character normalized to three periods');
    }
    if (/\u00A0/.test(s)) {
      s = s.replace(/\u00A0/g, ' ');
      notices.push('Non-breaking spaces normalized to regular spaces');
    }
    if (/[\u200B-\u200D]/.test(s)) {
      s = s.replace(/[\u200B-\u200D]/g, '');
      notices.push('Zero-width characters removed');
    }
    s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    s = s.replace(/\n{3,}/g, '\n\n');

    return { text: s, notices };
  }

  /* =========================================================================
   * Parser
   * ========================================================================= */

  function parse(rawText, filename) {
    const { text, notices } = normalize(rawText);
    const lines = text.split('\n');
    const errors = [];
    const warnings = notices.map(n => ({ line: null, message: n }));

    const result = {
      title: deriveDefaultTitle(filename),
      description: '',
      settings: {},
      items: []
    };

    let i = 0;
    let inComment = false;
    let inGroup = false;
    let currentGroup = null;
    let pendingTitle = null;
    let pendingPoints = null;
    let headerPhase = true;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (PAT.blockCommentStart.test(line)) {
        if (inComment) errors.push({ line: i + 1, message: 'Nested COMMENT block.' });
        else inComment = true;
        i++; continue;
      }
      if (PAT.blockCommentEnd.test(line)) {
        if (!inComment) errors.push({ line: i + 1, message: 'END_COMMENT found without matching COMMENT.' });
        inComment = false;
        i++; continue;
      }
      if (inComment) { i++; continue; }

      if (trimmed === '') { i++; continue; }
      if (PAT.lineComment.test(line)) { i++; continue; }

      if (headerPhase) {
        const titleMatch = PAT.quizTitle.exec(line);
        const descMatch = PAT.quizDesc.exec(line);
        const settingMatch = PAT.quizSetting.exec(line);
        if (titleMatch) { result.title = titleMatch[1].trim(); i++; continue; }
        if (descMatch) { result.description = descMatch[1].trim(); i++; continue; }
        if (settingMatch) {
          const key = settingMatch[1].toLowerCase();
          result.settings[key] = settingMatch[2].toLowerCase() === 'true';
          i++; continue;
        }
        headerPhase = false;
      }

      if (PAT.groupStart.test(line)) {
        if (inGroup) {
          errors.push({ line: i + 1, message: 'Nested GROUP blocks are not supported. Close the previous GROUP with END_GROUP first.' });
          i++; continue;
        }
        currentGroup = { isGroup: true, pick: 1, pointsPerQuestion: 1, questions: [], startLine: i + 1 };
        inGroup = true;
        i++;
        while (i < lines.length) {
          const opt = lines[i];
          if (opt.trim() === '') { i++; continue; }
          if (PAT.lineComment.test(opt)) { i++; continue; }
          const pickMatch = PAT.groupPick.exec(opt);
          const ppMatch = PAT.groupPoints.exec(opt);
          if (pickMatch) { currentGroup.pick = parseInt(pickMatch[1], 10); i++; }
          else if (ppMatch) { currentGroup.pointsPerQuestion = parseFloat(ppMatch[1]); i++; }
          else break;
        }
        continue;
      }

      if (PAT.groupEnd.test(line)) {
        if (!inGroup) {
          errors.push({ line: i + 1, message: 'END_GROUP found without matching GROUP.' });
        } else {
          if (currentGroup.questions.length === 0) {
            errors.push({ line: currentGroup.startLine, message: 'GROUP block has no questions.' });
          }
          if (currentGroup.pick > currentGroup.questions.length) {
            warnings.push({
              line: currentGroup.startLine,
              message: `GROUP pick value (${currentGroup.pick}) is larger than the pool size (${currentGroup.questions.length}). Canvas will show all available questions per attempt.`
            });
          }
          for (const q of currentGroup.questions) {
            q.points = currentGroup.pointsPerQuestion;
          }
          result.items.push(currentGroup);
          currentGroup = null;
          inGroup = false;
        }
        i++; continue;
      }

      const titleField = PAT.titleField.exec(line);
      if (titleField) { pendingTitle = titleField[1].trim(); i++; continue; }
      const pointsField = PAT.pointsField.exec(line);
      if (pointsField) { pendingPoints = parseFloat(pointsField[1]); i++; continue; }

      if (PAT.questionStart.test(line)) {
        const parsedQ = parseQuestion(lines, i);
        const q = parsedQ.question;
        if (pendingTitle) { q.title = pendingTitle; pendingTitle = null; }
        if (pendingPoints !== null) { q.points = pendingPoints; pendingPoints = null; }
        if (parsedQ.errors.length) errors.push(...parsedQ.errors);
        if (parsedQ.warnings.length) warnings.push(...parsedQ.warnings);
        if (inGroup) currentGroup.questions.push(q);
        else result.items.push(q);
        i = parsedQ.nextIndex;
        continue;
      }

      if (PAT.leadingWhitespace.test(line)) {
        errors.push({ line: i + 1, message: 'Line starts with whitespace. If this should be a question or answer, remove the leading space or tab.' });
      } else {
        errors.push({ line: i + 1, message: `Unrecognized line: "${line.slice(0, 60)}${line.length > 60 ? '...' : ''}"` });
      }
      i++;
    }

    if (inComment) errors.push({ line: lines.length, message: 'COMMENT block opened but never closed with END_COMMENT.' });
    if (inGroup) errors.push({ line: lines.length, message: 'GROUP block opened but never closed with END_GROUP.' });

    let questionCount = 0;
    for (const item of result.items) {
      questionCount += item.isGroup ? item.questions.length : 1;
    }

    return { questionCount, errors, warnings, parsed: result };
  }

  function parseQuestion(lines, startIdx) {
    const errors = [];
    const warnings = [];
    const startMatch = PAT.questionStart.exec(lines[startIdx]);
    let stem = startMatch ? startMatch[2] : '';
    let i = startIdx + 1;

    while (i < lines.length && PAT.leadingWhitespace.test(lines[i]) && !startsNewElement(lines[i].trimStart())) {
      // An indented line under the question is more of the question, on its
      // own line (free-response parts: "  Part A", "  i. Identify ...").
      stem += '\n' + lines[i].trim();
      i++;
    }

    const blockLines = [];
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '') break;
      if (PAT.questionStart.test(line)) break;
      if (PAT.groupStart.test(line) || PAT.groupEnd.test(line)) break;
      if (PAT.titleField.test(line) || PAT.pointsField.test(line)) break;
      if (PAT.blockCommentStart.test(line) || PAT.blockCommentEnd.test(line)) break;
      if (PAT.lineComment.test(line)) { i++; continue; }
      blockLines.push({ text: line, num: i + 1 });
      i++;
    }
    while (i < lines.length && lines[i].trim() === '') i++;

    const q = classifyAndBuild(stem, blockLines, startIdx + 1, errors, warnings);
    q.lineNum = startIdx + 1;
    return { question: q, nextIndex: i, errors, warnings };
  }

  function startsNewElement(line) {
    return PAT.questionStart.test(line)
      || PAT.answerChoice.test(line)
      || PAT.multiAnswerCorrect.test(line) || PAT.multiAnswerWrong.test(line)
      || PAT.numerical.test(line)
      || PAT.shortAnswer.test(line)
      || PAT.essay.test(line) || PAT.fileUpload.test(line)
      || PAT.formulaLine.test(line) || PAT.formulaVar.test(line) || PAT.formulaRound.test(line)
      || PAT.matchExtra.test(line)
      || PAT.blankAnswer.test(line) || PAT.dropdown.test(line)
      || PAT.fbGeneral.test(line) || PAT.fbCorrect.test(line) || PAT.fbIncorrect.test(line)
      || PAT.titleField.test(line) || PAT.pointsField.test(line)
      || PAT.groupStart.test(line) || PAT.groupEnd.test(line);
  }

  function classifyAndBuild(stem, blockLines, stemLineNum, errors, warnings) {
    const q = {
      type: null, stem, title: '', points: 1,
      answers: [], feedback: { general: '', correct: '', incorrect: '' },
      lineNum: stemLineNum
    };

    const hasMC = blockLines.some(l => PAT.answerChoice.test(l.text));
    const hasMR = blockLines.some(l => PAT.multiAnswerCorrect.test(l.text) || PAT.multiAnswerWrong.test(l.text));
    const hasNum = blockLines.some(l => PAT.numerical.test(l.text));
    const hasSA = blockLines.some(l => PAT.shortAnswer.test(l.text));
    const hasEssay = blockLines.some(l => PAT.essay.test(l.text));
    const hasUpload = blockLines.some(l => PAT.fileUpload.test(l.text));
    const hasFormula = blockLines.some(l => PAT.formulaLine.test(l.text));
    const isOther = t => PAT.answerChoice.test(t) || PAT.multiAnswerCorrect.test(t) || PAT.multiAnswerWrong.test(t)
      || PAT.numerical.test(t) || PAT.shortAnswer.test(t) || PAT.fbGeneral.test(t) || PAT.fbCorrect.test(t) || PAT.fbIncorrect.test(t)
      || PAT.leadingWhitespace.test(t);
    const hasMatch = !hasFormula && blockLines.some(l => !isOther(l.text) && (PAT.matchPair.test(l.text) || PAT.matchExtra.test(l.text)));
    const hasDrop = !hasFormula && blockLines.some(l => PAT.dropdown.test(l.text));
    const hasBlanks = !hasFormula && !hasDrop && blockLines.some(l => PAT.blankAnswer.test(l.text));

    const typeCount = [hasMC, hasMR, hasNum, hasSA, hasEssay, hasUpload, hasFormula, hasMatch, hasDrop, hasBlanks].filter(Boolean).length;
    if (typeCount === 0) {
      errors.push({ line: stemLineNum, message: 'Question has no answers or response area. Add answer choices, a `=` line, `____`, or `^^^^`.' });
      q.type = QTYPE.ESSAY;
      return q;
    }
    if (typeCount > 1) {
      errors.push({ line: stemLineNum, message: 'Question mixes incompatible answer formats. Pick one type.' });
    }

    if (hasFormula) { q.type = QTYPE.FORMULA; buildFormula(q, blockLines, errors, warnings); }
    else if (hasMatch) { q.type = QTYPE.MATCH; buildMatch(q, blockLines, errors); }
    else if (hasDrop) { q.type = QTYPE.DROPDOWNS; buildBlanks(q, blockLines, errors, warnings, true); }
    else if (hasBlanks) { q.type = QTYPE.BLANKS; buildBlanks(q, blockLines, errors, warnings, false); }
    else if (hasMC) {
      q.type = QTYPE.MC;
      buildMC(q, blockLines, errors);
      if (q.answers.length === 2) {
        const texts = q.answers.map(a => a.text.trim().toLowerCase());
        if (texts.includes('true') && texts.includes('false')) q.type = QTYPE.TF;
      }
    } else if (hasMR) { q.type = QTYPE.MR; buildMR(q, blockLines, errors); }
    else if (hasNum) { q.type = QTYPE.NUM; buildNum(q, blockLines, errors); }
    else if (hasSA) { q.type = QTYPE.SA; buildSA(q, blockLines, errors); }
    else if (hasEssay) { q.type = QTYPE.ESSAY; buildEssay(q, blockLines, errors); }
    else if (hasUpload) { q.type = QTYPE.UPLOAD; buildUpload(q, blockLines, errors); }

    if ([QTYPE.NUM, QTYPE.SA, QTYPE.FORMULA, QTYPE.MATCH, QTYPE.BLANKS, QTYPE.DROPDOWNS].includes(q.type) && hasAnyFeedback(blockLines)) {
      errors.push({ line: stemLineNum, message: 'Feedback markers (... + -) are only supported on multiple-choice, multi-answer, essay and file-upload questions. Remove the feedback lines.' });
    }
    return q;
  }

  function hasAnyFeedback(blockLines) {
    return blockLines.some(l => PAT.fbGeneral.test(l.text) || PAT.fbCorrect.test(l.text) || PAT.fbIncorrect.test(l.text));
  }

  function buildMC(q, blockLines, errors) {
    let lastAnswer = null;
    for (const { text, num } of blockLines) {
      const ac = PAT.answerChoice.exec(text);
      if (ac) {
        lastAnswer = { text: ac[3], correct: ac[1] === '*', feedback: '', lineNum: num };
        q.answers.push(lastAnswer); continue;
      }
      const fbG = PAT.fbGeneral.exec(text);
      const fbC = PAT.fbCorrect.exec(text);
      const fbI = PAT.fbIncorrect.exec(text);
      if (fbG) { if (lastAnswer) lastAnswer.feedback = fbG[1]; else q.feedback.general = fbG[1]; continue; }
      if (fbC) { q.feedback.correct = fbC[1]; continue; }
      if (fbI) { q.feedback.incorrect = fbI[1]; continue; }
      if (PAT.leadingWhitespace.test(text) && lastAnswer) { lastAnswer.text += ' ' + text.trim(); continue; }
      errors.push({ line: num, message: `Unexpected line in multiple-choice question: "${text.slice(0, 50)}"` });
    }
    if (q.answers.length < 2) errors.push({ line: q.lineNum, message: 'Multiple choice question needs at least two answer choices.' });
    const correctCount = q.answers.filter(a => a.correct).length;
    if (correctCount === 0) errors.push({ line: q.lineNum, message: 'Multiple choice question has no correct answer marked. Add * before one letter.' });
    else if (correctCount > 1) errors.push({ line: q.lineNum, message: 'Multiple choice question has more than one * marker. Use [*] / [ ] for multi-answer instead.' });
    const seen = new Set();
    for (const a of q.answers) {
      const key = a.text.trim().toLowerCase();
      if (seen.has(key)) errors.push({ line: a.lineNum, message: `Duplicate answer text: "${a.text.slice(0, 40)}". Answer text must be unique within a question.` });
      seen.add(key);
    }
  }

  function buildMR(q, blockLines, errors) {
    for (const { text, num } of blockLines) {
      const cm = PAT.multiAnswerCorrect.exec(text);
      const wm = PAT.multiAnswerWrong.exec(text);
      if (cm) { q.answers.push({ text: cm[1], correct: true, lineNum: num }); continue; }
      if (wm) { q.answers.push({ text: wm[1], correct: false, lineNum: num }); continue; }
      const fbG = PAT.fbGeneral.exec(text);
      const fbC = PAT.fbCorrect.exec(text);
      const fbI = PAT.fbIncorrect.exec(text);
      if (fbG) { q.feedback.general = fbG[1]; continue; }
      if (fbC) { q.feedback.correct = fbC[1]; continue; }
      if (fbI) { q.feedback.incorrect = fbI[1]; continue; }
      if (PAT.leadingWhitespace.test(text) && q.answers.length) { q.answers[q.answers.length - 1].text += ' ' + text.trim(); continue; }
      errors.push({ line: num, message: `Unexpected line in multi-answer question: "${text.slice(0, 50)}"` });
    }
    if (q.answers.length < 2) errors.push({ line: q.lineNum, message: 'Multi-answer question needs at least two choices.' });
    if (q.answers.filter(a => a.correct).length === 0) errors.push({ line: q.lineNum, message: 'Multi-answer question has no correct answer. At least one [*] is required.' });
    const seen = new Set();
    for (const a of q.answers) {
      const key = a.text.trim().toLowerCase();
      if (seen.has(key)) errors.push({ line: a.lineNum, message: `Duplicate choice text: "${a.text.slice(0, 40)}".` });
      seen.add(key);
    }
  }

  function buildNum(q, blockLines, errors) {
    for (const { text, num } of blockLines) {
      const m = PAT.numerical.exec(text);
      if (m) {
        const val = m[1].trim();
        const range = new RegExp(`^\\[\\s*(${NUM})\\s*,\\s*(${NUM})\\s*\\]$`).exec(val);
        const margin = new RegExp(`^(${NUM})\\s*\\+-\\s*(${NUM})\\s*(%?)$`).exec(val);
        if (range) q.answers.push({ kind: 'range', low: parseNum(range[1]), high: parseNum(range[2]), lineNum: num });
        else if (margin) {
          const v = parseNum(margin[1]);
          const tol = margin[3] ? Math.abs(v) * parseNum(margin[2]) / 100 : parseNum(margin[2]);
          q.answers.push({ kind: 'margin', value: v, tolerance: tol, lineNum: num });
        }
        else if (new RegExp(`^${NUM}$`).test(val)) q.answers.push({ kind: 'exact', value: parseNum(val), lineNum: num });
        else errors.push({ line: num, message: `Numerical answer "${val}" is not a valid number, range, or margin-of-error.` });
        continue;
      }
      if (PAT.leadingWhitespace.test(text)) continue;
      errors.push({ line: num, message: `Unexpected line in numerical question: "${text.slice(0, 50)}"` });
    }
    if (q.answers.length === 0) errors.push({ line: q.lineNum, message: 'Numerical question has no = answer line.' });
  }

  function buildSA(q, blockLines, errors) {
    for (const { text, num } of blockLines) {
      const m = PAT.shortAnswer.exec(text);
      if (m) { q.answers.push({ text: m[1], lineNum: num }); continue; }
      if (PAT.leadingWhitespace.test(text)) continue;
      errors.push({ line: num, message: `Unexpected line in short-answer question: "${text.slice(0, 50)}"` });
    }
    if (q.answers.length === 0) errors.push({ line: q.lineNum, message: 'Short-answer question has no accepted answers (lines starting with "* ").' });
  }

  function buildEssay(q, blockLines, errors) {
    let found = false;
    for (const { text, num } of blockLines) {
      if (PAT.essay.test(text)) { found = true; continue; }
      const fbG = PAT.fbGeneral.exec(text);
      if (fbG) { q.feedback.general = fbG[1]; continue; }
      if (PAT.leadingWhitespace.test(text)) continue;
      errors.push({ line: num, message: `Unexpected line in essay question: "${text.slice(0, 50)}"` });
    }
    if (!found) errors.push({ line: q.lineNum, message: 'Essay question is missing the "____" marker.' });
  }

  function buildUpload(q, blockLines, errors) {
    let found = false;
    for (const { text, num } of blockLines) {
      if (PAT.fileUpload.test(text)) { found = true; continue; }
      const fbG = PAT.fbGeneral.exec(text);
      if (fbG) { q.feedback.general = fbG[1]; continue; }
      if (PAT.leadingWhitespace.test(text)) continue;
      errors.push({ line: num, message: `Unexpected line in file-upload question: "${text.slice(0, 50)}"` });
    }
    if (!found) errors.push({ line: q.lineNum, message: 'File-upload question is missing the "^^^^" marker.' });
  }

  /* =========================================================================
   * Formula questions (randomized numbers)
   * ========================================================================= */

  // A small, safe calculator for the formula line: numbers, variables,
  // + - * / ^, parentheses and a few functions. No eval().
  const FUNCS = {
    sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan, exp: Math.exp,
    ln: Math.log, log: Math.log10, floor: Math.floor, ceil: Math.ceil, round: Math.round
  };
  const CONSTS = { pi: Math.PI, e: Math.E };

  function compileFormula(src, varNames) {
    const known = new Set(varNames || []);
    const toks = [];
    const re = /\s*(?:((?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)|([A-Za-z_]\w*)|(\*\*|[-+*/^(),]))/y;
    let pos = 0;
    const s = src.trim();
    while (pos < s.length) {
      re.lastIndex = pos;
      const m = re.exec(s);
      if (!m) throw new Error(`can't read "${s.slice(pos).trim().slice(0, 12)}"`);
      pos = re.lastIndex;
      if (m[1] !== undefined) toks.push({ t: 'num', v: parseFloat(m[1]) });
      else if (m[2] !== undefined) toks.push({ t: 'id', v: m[2] });
      else if (m[3] !== undefined) toks.push({ t: 'op', v: m[3] === '**' ? '^' : m[3] });
      while (pos < s.length && /\s/.test(s[pos])) pos++;
    }
    let i = 0;
    const vars = new Set();
    const peek = () => toks[i];
    const eat = v => { if (toks[i] && toks[i].v === v) { i++; return true; } return false; };
    function expr() { let n = term(); for (;;) { if (eat('+')) { const a = n, b = term(); n = e => a(e) + b(e); } else if (eat('-')) { const a = n, b = term(); n = e => a(e) - b(e); } else return n; } }
    function term() { let n = unary(); for (;;) { if (eat('*')) { const a = n, b = unary(); n = e => a(e) * b(e); } else if (eat('/')) { const a = n, b = unary(); n = e => a(e) / b(e); } else return n; } }
    function unary() { if (eat('-')) { const a = unary(); return e => -a(e); } if (eat('+')) return unary(); return power(); }
    function power() { const a = atom(); if (eat('^')) { const b = unary(); return e => Math.pow(a(e), b(e)); } return a; }
    function atom() {
      const t = peek();
      if (!t) throw new Error('ends too soon');
      if (t.t === 'num') { i++; const v = t.v; return () => v; }
      if (t.t === 'id') {
        i++;
        const name = t.v;
        if (FUNCS[name.toLowerCase()] && eat('(')) {
          const f = FUNCS[name.toLowerCase()]; const a = expr();
          if (!eat(')')) throw new Error(`missing ) after ${name}(`);
          return e => f(a(e));
        }
        if (CONSTS[name.toLowerCase()] !== undefined && !known.has(name)) { const v = CONSTS[name.toLowerCase()]; return () => v; }
        vars.add(name);
        return e => e[name];
      }
      if (eat('(')) { const a = expr(); if (!eat(')')) throw new Error('missing )'); return a; }
      throw new Error(`unexpected "${t.v}"`);
    }
    const fn = expr();
    if (i < toks.length) throw new Error(`unexpected "${toks[i].v}"`);
    return { fn, vars: [...vars] };
  }

  // Decimal places written in a number: "2.50" -> 2, "1.5e-3" -> 4, "6.02 x 10^23" -> 0.
  function decimalsOf(str) {
    const t = String(str).trim().replace(/−/g, '-');
    const m = /^-?(?:\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+)|\s*[x×*]\s*10\s*\^\s*\(?\s*([+-]?\d+)\s*\)?)?$/.exec(t);
    if (!m) return 0;
    const frac = (m[1] || '').length;
    const exp = parseInt(m[2] || m[3] || '0', 10);
    return Math.max(0, frac - exp);
  }

  function roundTo(x, d) { return +(Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d); }

  function buildFormula(q, blockLines, errors, warnings) {
    q.vars = [];
    q.formula = '';
    q.decimals = null;
    q.tolerance = null;
    for (const { text, num } of blockLines) {
      const f = PAT.formulaLine.exec(text);
      if (f) { q.formula = f[1].trim(); continue; }
      const v = PAT.formulaVar.exec(text);
      if (v) {
        const min = parseNum(v[2]), max = parseNum(v[3]);
        if (isNaN(min) || isNaN(max)) { errors.push({ line: num, message: `Variable [${v[1]}]: "${v[2]} to ${v[3]}" isn't two numbers.` }); continue; }
        const scale = v[4] !== undefined ? parseInt(v[4], 10) : Math.max(decimalsOf(v[2]), decimalsOf(v[3]));
        if (!(max >= min)) errors.push({ line: num, message: `Variable [${v[1]}]: the second number must be bigger than the first.` });
        q.vars.push({ name: v[1], min, max, scale });
        continue;
      }
      const r = PAT.formulaRound.exec(text);
      if (r) { q.decimals = parseInt(r[1], 10); continue; }
      const tol = new RegExp(`^\\+-\\s*(${NUM})\\s*(%?)\\s*$`).exec(text.trim());
      if (tol) { q.tolerance = tol[2] ? `${parseNum(tol[1])}%` : fmtNum(parseNum(tol[1])); continue; }
      if (PAT.leadingWhitespace.test(text)) continue;
      errors.push({ line: num, message: `Unexpected line in formula question: "${text.slice(0, 50)}". Use "formula: ...", "[x] 1 to 10", "round: 2", or "+- 0.5".` });
    }
    if (!q.formula) { errors.push({ line: q.lineNum, message: 'Formula question is missing its "formula:" line.' }); return; }
    let compiled;
    try { compiled = compileFormula(q.formula, q.vars.map(v => v.name)); }
    catch (e) { errors.push({ line: q.lineNum, message: `The formula "${q.formula}" ${e.message}. Write it with * for times and ^ for powers, like 3*x^2 - 4.` }); return; }
    const defined = new Set(q.vars.map(v => v.name));
    compiled.vars.forEach(n => { if (!defined.has(n)) errors.push({ line: q.lineNum, message: `The formula uses ${n} but there's no "[${n}] low to high" line for it.` }); });
    const inStem = new Set([...q.stem.matchAll(/\[([A-Za-z]\w*)\]/g)].map(m => m[1]));
    q.vars.forEach(v => {
      if (!inStem.has(v.name)) warnings.push({ line: q.lineNum, message: `Variable [${v.name}] isn't shown in the question text, so students won't see its value.` });
      if (!compiled.vars.includes(v.name)) warnings.push({ line: q.lineNum, message: `Variable [${v.name}] isn't used in the formula.` });
    });
    inStem.forEach(n => { if (!defined.has(n)) errors.push({ line: q.lineNum, message: `The question shows [${n}] but there's no "[${n}] low to high" line for it.` }); });
    if (errors.some(e => e.line === q.lineNum)) return;

    // Pre-compute the sets of numbers students will get.
    const sets = [];
    let tries = 0;
    while (sets.length < FORMULA_SETS && tries < FORMULA_SETS * 50) {
      tries++;
      const vals = {};
      q.vars.forEach(v => { vals[v.name] = roundTo(v.min + Math.random() * (v.max - v.min), v.scale); });
      const ans = compiled.fn(vals);
      if (!isFinite(ans)) continue;
      sets.push({ vals, raw: ans });
    }
    if (sets.length === 0) { errors.push({ line: q.lineNum, message: `The formula "${q.formula}" never gives a number with these ranges (dividing by zero, or the square root of a negative?).` }); return; }
    // Fewest decimal places that show every answer exactly (up to 4).
    const exactAt = d => sets.every(s => Math.abs(s.raw - roundTo(s.raw, d)) < 1e-9);
    let exactDecimals = null;
    for (let d = 0; d <= 4; d++) { if (exactAt(d)) { exactDecimals = d; break; } }
    const saysRound = /round|nearest|decimal/i.test(q.stem);
    // "Round to the nearest tenth" in the question sets the answer's decimals
    // when there's no "round:" line.
    const said = /nearest\s+(whole|integer|tenth|hundredth|thousandth)/i.exec(q.stem);
    if (q.decimals === null && said) q.decimals = { whole: 0, integer: 0, tenth: 1, hundredth: 2, thousandth: 3 }[said[1].toLowerCase()];
    if (q.decimals === null) {
      q.decimals = exactDecimals !== null ? exactDecimals : 2;
      if (exactDecimals === null && !saysRound) {
        warnings.push({ line: q.lineNum, message: 'Some answers have long decimals, so they are rounded to 2 decimal places. Say how to round in the question, or add a "round: 1" line.' });
      }
    } else if (!saysRound && !exactAt(q.decimals)) {
      warnings.push({ line: q.lineNum, message: `Answers are rounded to ${q.decimals} decimal place${q.decimals === 1 ? '' : 's'}, but the question doesn't tell students how to round. Add "Round to the nearest ..." to the question.` });
    }
    if (q.tolerance === null) q.tolerance = '0';
    q.sets = sets.map(s => ({ vals: s.vals, answer: roundTo(s.raw, q.decimals) }));
    q.vars.forEach(v => {
      if (/^(e|pi)$/i.test(v.name)) warnings.push({ line: q.lineNum, message: `Rename variable [${v.name}]: Canvas reads "${v.name}" as a math constant.` });
    });
    const answers = q.sets.map(s => s.answer);
    const lo = Math.min(...answers), hi = Math.max(...answers);
    const big = Math.max(...answers.map(Math.abs));
    const nonzero = sets.map(s => Math.abs(s.raw)).filter(x => x > 0);
    const small = nonzero.length ? Math.min(...nonzero) : 0;
    if (sets.some((s, k) => s.raw !== 0 && q.sets[k].answer === 0)) {
      errors.push({ line: q.lineNum, message: `Some answers round to 0 with ${q.decimals} decimal places. Ask for the answer in bigger units (for example "in units of 10^-3 m"), or add a "round:" line with more places.` });
    } else if (big >= 1e7 || (small > 0 && small < 1e-4)) {
      warnings.push({ line: q.lineNum, message: 'Answers are very large or very small. Students type them more easily if the question asks for the number in front of a power of ten ("Give your answer in units of 10^23 atoms"). A percent margin like "+- 1%" also helps.' });
    }
    const ex = q.sets[0];
    warnings.push({ line: q.lineNum, message: `Formula check: answers run from ${lo} to ${hi}. One student might see ${q.vars.map(v => `${v.name} = ${ex.vals[v.name]}`).join(', ')} and need ${ex.answer}. If that range looks wrong, change the low/high numbers.` });
  }

  function splitChoices(s) { return s.split('|').map(x => x.trim()).filter(x => x !== ''); }

  function buildMatch(q, blockLines, errors) {
    q.pairs = [];
    q.extras = [];
    for (const { text, num } of blockLines) {
      const ex = PAT.matchExtra.exec(text);
      if (ex) { q.extras.push(ex[1].trim()); continue; }
      const m = PAT.matchPair.exec(text);
      if (m) { q.pairs.push({ left: m[1].trim(), right: m[2].trim(), lineNum: num }); continue; }
      if (PAT.leadingWhitespace.test(text)) continue;
      errors.push({ line: num, message: `Unexpected line in matching question: "${text.slice(0, 50)}". Use "left -> right".` });
    }
    if (q.pairs.length < 2) errors.push({ line: q.lineNum, message: 'Matching question needs at least two "left -> right" lines.' });
    const seen = new Set();
    q.pairs.forEach(p => {
      const k = p.left.toLowerCase();
      if (seen.has(k)) errors.push({ line: p.lineNum, message: `Matching question repeats the left side "${p.left.slice(0, 40)}".` });
      seen.add(k);
    });
  }

  function buildBlanks(q, blockLines, errors, warnings, dropdowns) {
    q.blanks = [];
    for (const { text, num } of blockLines) {
      const d = PAT.dropdown.exec(text);
      const b = PAT.blankAnswer.exec(text);
      if (dropdowns && d) {
        const opts = splitChoices(d[2]).map(o => ({ text: o.replace(/^\*\s*/, ''), correct: /^\*/.test(o) }));
        const nCorrect = opts.filter(o => o.correct).length;
        if (nCorrect !== 1) errors.push({ line: num, message: `Dropdown [${d[1]}] needs exactly one choice marked with *.` });
        q.blanks.push({ name: d[1], options: opts, lineNum: num });
        continue;
      }
      if (!dropdowns && b) {
        q.blanks.push({ name: b[1], options: splitChoices(b[2]).map(o => ({ text: o, correct: true })), lineNum: num });
        continue;
      }
      if (dropdowns && b) { errors.push({ line: num, message: `Don't mix typed blanks ([${b[1]}] = ...) and dropdowns in one question.` }); continue; }
      if (PAT.leadingWhitespace.test(text)) continue;
      errors.push({ line: num, message: `Unexpected line in fill-in-the-blanks question: "${text.slice(0, 50)}"` });
    }
    const inStem = [...q.stem.matchAll(/\[([A-Za-z]\w*)\]/g)].map(m => m[1]);
    const defined = new Set(q.blanks.map(b => b.name));
    inStem.forEach(n => { if (!defined.has(n)) errors.push({ line: q.lineNum, message: `The question shows [${n}] but has no answer line for it.` }); });
    q.blanks.forEach(b => { if (!inStem.includes(b.name)) errors.push({ line: b.lineNum, message: `[${b.name}] has answers but doesn't appear in the question text.` }); });
    if (q.blanks.length === 0) errors.push({ line: q.lineNum, message: 'Fill-in-the-blanks question has no answer lines.' });
  }

  /* =========================================================================
   * Markdown -> HTML and CDATA helpers
   * ========================================================================= */

  function md(s) {
    if (!s) return '';
    let t = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Math is left exactly as written: "\(t^*\) or \(z^*\)" must not turn
    // the text between the two stars into italics.
    const math = [];
    t = t.replace(/\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$/g, m => `\u0000${math.push(m) - 1}\u0000`);
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
    t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1"/>');
    // Only real web links. "[x](10-2[x])" in a formula question is math, not a link.
    t = t.replace(/\[([^\]]+)\]\(((?:https?:|mailto:)[^)\s]+)\)/g, '<a href="$2">$1</a>');
    t = t.replace(/\n/g, '<br/>');
    t = t.replace(/\u0000(\d+)\u0000/g, (m, n) => math[+n]);
    return t;
  }

  function cdata(s) {
    if (s == null || s === '') return '';
    const safe = String(s).replace(/\]\]>/g, ']]]]><![CDATA[>');
    return `<![CDATA[${safe}]]>`;
  }

  function escapeXml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  /* =========================================================================
   * QTI 1.2 XML generation
   * ========================================================================= */

  // Every quiz gets its own ID prefix. With a fixed prefix, every quiz the
  // Builder made shared one assessment ID, so a second course import could be
  // matched to (and replace) the first quiz instead of creating a new one.
  function makeIdGen() {
    const salt = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    let n = 1000;
    return () => 'g' + salt + '_' + (++n).toString(16).padStart(4, '0');
  }

  function metaField(label, entry) {
    return `<qtimetadatafield><fieldlabel>${escapeXml(label)}</fieldlabel><fieldentry>${escapeXml(entry)}</fieldentry></qtimetadatafield>`;
  }

  function buildAssessmentXml(parsed) {
    const id = makeIdGen();
    const quizId = id();
    const rootSecId = id();
    const items = parsed.items.map(item => item.isGroup ? emitGroup(item, id) : emitItem(item, id));

    const s = parsed.settings;
    const settingFields = [];
    if (s['shuffle answers']) settingFields.push(metaField('shuffle_answers', 'true'));
    if (s['show correct answers'] === false) settingFields.push(metaField('show_correct_answers', 'false'));
    if (s['one question at a time']) settingFields.push(metaField('one_question_at_a_time', 'true'));
    if (s["can't go back"]) settingFields.push(metaField('cant_go_back', 'true'));

    const description = parsed.description ? `<description>${escapeXml(parsed.description)}</description>` : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/ims_qtiasiv1p2 http://www.imsglobal.org/profile/cc/ccv1p1/ccv1p1_qtiasiv1p2p1_v1p0.xsd">
  <assessment ident="${quizId}" title="${escapeXml(parsed.title || 'Quiz')}">
    <qtimetadata>
      <qtimetadatafield><fieldlabel>cc_maxattempts</fieldlabel><fieldentry>1</fieldentry></qtimetadatafield>
${settingFields.map(f => '      ' + f).join('\n')}
    </qtimetadata>
    ${description}
    <section ident="${rootSecId}">
${items.join('\n')}
    </section>
  </assessment>
</questestinterop>`;
  }

  function emitGroup(group, id) {
    const secId = id();
    const items = group.questions.map(q => emitItem(q, id)).join('\n');
    // Canvas reads point values for randomly-drawn (grouped) questions from the
    // group level, NOT from each item's points_possible. Without points_per_item
    // here, Canvas defaults every drawn question to 1 point and the value cannot
    // be corrected by hand after import. Emit it inside selection_extension.
    const ppi = (typeof group.pointsPerQuestion === 'number' ? group.pointsPerQuestion : 1).toFixed(1);
    return `      <section ident="${secId}">
        <selection_ordering>
          <selection>
            <selection_number>${group.pick}</selection_number>
            <selection_extension>
              <points_per_item>${ppi}</points_per_item>
            </selection_extension>
          </selection>
        </selection_ordering>
${items}
      </section>`;
  }

  function emitItem(q, id) {
    switch (q.type) {
      case QTYPE.MC: case QTYPE.TF: return emitMC(q, id);
      case QTYPE.MR: return emitMR(q, id);
      case QTYPE.NUM: return emitNum(q, id);
      case QTYPE.SA: return emitSA(q, id);
      case QTYPE.ESSAY: return emitEssay(q, id);
      case QTYPE.UPLOAD: return emitUpload(q, id);
      case QTYPE.FORMULA: return emitFormula(q, id);
      case QTYPE.MATCH: return emitMatch(q, id);
      case QTYPE.BLANKS: case QTYPE.DROPDOWNS: return emitBlanks(q, id);
      default: return `<!-- unsupported question type: ${q.type} -->`;
    }
  }

  function itemFeedback(ident, text) {
    return `
        <itemfeedback ident="${ident}">
          <flow_mat><material><mattext texttype="text/html">${cdata(md(text))}</mattext></material></flow_mat>
        </itemfeedback>`;
  }

  function emitMC(q, id) {
    const itemId = id();
    const responseId = id();
    const answers = q.answers.map(a => ({ ...a, id: id() }));
    const correct = answers.find(a => a.correct);

    const labels = answers.map(a => `
            <response_label ident="${a.id}">
              <material><mattext texttype="text/plain">${cdata(a.text)}</mattext></material>
            </response_label>`).join('');

    const fbBlocks = [];
    if (q.feedback.general) fbBlocks.push(itemFeedback('general_fb', q.feedback.general));
    if (q.feedback.correct) fbBlocks.push(itemFeedback('correct_fb', q.feedback.correct));
    if (q.feedback.incorrect) fbBlocks.push(itemFeedback('general_incorrect_fb', q.feedback.incorrect));
    answers.forEach(a => { if (a.feedback) fbBlocks.push(itemFeedback(a.id + '_fb', a.feedback)); });

    // --- Response processing ---------------------------------------------
    // Canvas determines the correct answer by scanning for the SINGLE
    // respcondition that sets SCORE to the max and reading its <varequal>.
    // It must see exactly ONE <varequal> reference to the correct answer id.
    // Emitting extra <varequal> references to that same id -- a duplicate
    // "correct feedback" condition, or a <not><varequal>...</not> for the
    // incorrect-feedback path -- makes the correct answer ambiguous and
    // triggers "The importer couldn't determine the correct answers for this
    // question." So: fold correct-answer feedback INTO the scoring condition,
    // and drive incorrect feedback from an <other/> catch-all instead of a
    // negated varequal. Per-answer feedback stays keyed to its own answer id.
    const conditions = [];

    if (q.feedback.general) {
      conditions.push(`
        <respcondition continue="Yes">
          <conditionvar><other/></conditionvar>
          <displayfeedback feedbacktype="Response" linkrefid="general_fb"/>
        </respcondition>`);
    }

    if (correct) {
      let scoreCond = `
        <respcondition continue="No">
          <conditionvar><varequal respident="${responseId}">${correct.id}</varequal></conditionvar>
          <setvar action="Set" varname="SCORE">100</setvar>`;
      if (q.feedback.correct) {
        scoreCond += `
          <displayfeedback feedbacktype="Response" linkrefid="correct_fb"/>`;
      }
      scoreCond += `
        </respcondition>`;
      conditions.push(scoreCond);
    }

    if (q.feedback.incorrect) {
      conditions.push(`
        <respcondition continue="Yes">
          <conditionvar><other/></conditionvar>
          <displayfeedback feedbacktype="Response" linkrefid="general_incorrect_fb"/>
        </respcondition>`);
    }

    // Per-answer feedback: reference each answer's own id (never negated).
    answers.forEach(a => {
      if (a.feedback) {
        conditions.push(`
        <respcondition continue="Yes">
          <conditionvar><varequal respident="${responseId}">${a.id}</varequal></conditionvar>
          <displayfeedback feedbacktype="Response" linkrefid="${a.id}_fb"/>
        </respcondition>`);
      }
    });

    const qType = q.type === QTYPE.TF ? 'true_false_question' : 'multiple_choice_question';

    return `      <item ident="${itemId}" title="${escapeXml(q.title || 'Question')}">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield><fieldlabel>question_type</fieldlabel><fieldentry>${qType}</fieldentry></qtimetadatafield>
            <qtimetadatafield><fieldlabel>points_possible</fieldlabel><fieldentry>${q.points.toFixed(1)}</fieldentry></qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material><mattext texttype="text/html">${cdata(md(q.stem))}</mattext></material>
          <response_lid ident="${responseId}" rcardinality="Single">
            <render_choice>${labels}
            </render_choice>
          </response_lid>
        </presentation>
        <resprocessing>
          <outcomes><decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/></outcomes>${conditions.join('')}
        </resprocessing>${fbBlocks.join('')}
      </item>`;
  }

  function emitMR(q, id) {
    const itemId = id();
    const responseId = id();
    const answers = q.answers.map(a => ({ ...a, id: id() }));
    const correctIds = answers.filter(a => a.correct).map(a => a.id);
    const wrongIds = answers.filter(a => !a.correct).map(a => a.id);

    const labels = answers.map(a => `
            <response_label ident="${a.id}">
              <material><mattext texttype="text/plain">${cdata(a.text)}</mattext></material>
            </response_label>`).join('');

    const correctCond = `<and>${correctIds.map(cid => `<varequal respident="${responseId}">${cid}</varequal>`).join('')}${wrongIds.map(wid => `<not><varequal respident="${responseId}">${wid}</varequal></not>`).join('')}</and>`;

    const fbBlocks = [];
    if (q.feedback.general) fbBlocks.push(itemFeedback('general_fb', q.feedback.general));
    if (q.feedback.correct) fbBlocks.push(itemFeedback('correct_fb', q.feedback.correct));
    if (q.feedback.incorrect) fbBlocks.push(itemFeedback('general_incorrect_fb', q.feedback.incorrect));

    // Feedback needs a <displayfeedback> pointing at each <itemfeedback>, or the
    // blocks ship in the XML and Canvas never renders them. Same shape as emitMC:
    // correct-answer feedback folds INTO the scoring condition so the <and> stays
    // the only SCORE-setting condition; general and incorrect ride an <other/>
    // catch-all with continue="Yes".
    const conditions = [];

    if (q.feedback.general) {
      conditions.push(`
          <respcondition continue="Yes">
            <conditionvar><other/></conditionvar>
            <displayfeedback feedbacktype="Response" linkrefid="general_fb"/>
          </respcondition>`);
    }

    let scoreCond = `
          <respcondition continue="No">
            <conditionvar>${correctCond}</conditionvar>
            <setvar action="Set" varname="SCORE">100</setvar>`;
    if (q.feedback.correct) {
      scoreCond += `
            <displayfeedback feedbacktype="Response" linkrefid="correct_fb"/>`;
    }
    scoreCond += `
          </respcondition>`;
    conditions.push(scoreCond);

    if (q.feedback.incorrect) {
      conditions.push(`
          <respcondition continue="Yes">
            <conditionvar><other/></conditionvar>
            <displayfeedback feedbacktype="Response" linkrefid="general_incorrect_fb"/>
          </respcondition>`);
    }

    return `      <item ident="${itemId}" title="${escapeXml(q.title || 'Question')}">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield><fieldlabel>question_type</fieldlabel><fieldentry>multiple_answers_question</fieldentry></qtimetadatafield>
            <qtimetadatafield><fieldlabel>points_possible</fieldlabel><fieldentry>${q.points.toFixed(1)}</fieldentry></qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material><mattext texttype="text/html">${cdata(md(q.stem))}</mattext></material>
          <response_lid ident="${responseId}" rcardinality="Multiple">
            <render_choice>${labels}
            </render_choice>
          </response_lid>
        </presentation>
        <resprocessing>
          <outcomes><decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/></outcomes>${conditions.join('')}
        </resprocessing>${fbBlocks.join('')}
      </item>`;
  }

  function emitNum(q, id) {
    const itemId = id();
    const responseId = id();
    const conditions = q.answers.map(a => {
      let cond;
      // New Quizzes drops a numerical item whose only condition is a bare
      // <varequal>. Canvas's own exports wrap an exact answer as
      // <or><varequal/><and><vargte/><varlte/></and></or>, which imports.
      if (a.kind === 'exact') cond = `<or><varequal respident="${responseId}">${fmtNum(a.value)}</varequal><and><vargte respident="${responseId}">${fmtNum(a.value)}</vargte><varlte respident="${responseId}">${fmtNum(a.value)}</varlte></and></or>`;
      else if (a.kind === 'range') cond = `<and><vargte respident="${responseId}">${fmtNum(a.low)}</vargte><varlte respident="${responseId}">${fmtNum(a.high)}</varlte></and>`;
      else if (a.kind === 'margin') cond = `<and><vargte respident="${responseId}">${fmtNum(a.value - a.tolerance)}</vargte><varlte respident="${responseId}">${fmtNum(a.value + a.tolerance)}</varlte></and>`;
      return `<respcondition continue="No">
            <conditionvar>${cond}</conditionvar>
            <setvar action="Set" varname="SCORE">100</setvar>
          </respcondition>`;
    }).join('\n          ');

    return `      <item ident="${itemId}" title="${escapeXml(q.title || 'Question')}">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield><fieldlabel>question_type</fieldlabel><fieldentry>numerical_question</fieldentry></qtimetadatafield>
            <qtimetadatafield><fieldlabel>points_possible</fieldlabel><fieldentry>${q.points.toFixed(1)}</fieldentry></qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material><mattext texttype="text/html">${cdata(md(q.stem))}</mattext></material>
          <response_str ident="${responseId}" rcardinality="Single">
            <render_fib fibtype="Decimal"><response_label ident="answer1"/></render_fib>
          </response_str>
        </presentation>
        <resprocessing>
          <outcomes><decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/></outcomes>
          ${conditions}
        </resprocessing>
      </item>`;
  }

  function emitSA(q, id) {
    const itemId = id();
    const responseId = id();
    const conds = q.answers.map(a =>
      `<respcondition continue="No"><conditionvar><varequal respident="${responseId}" case="No">${escapeXml(a.text)}</varequal></conditionvar><setvar action="Set" varname="SCORE">100</setvar></respcondition>`
    ).join('\n          ');

    return `      <item ident="${itemId}" title="${escapeXml(q.title || 'Question')}">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield><fieldlabel>question_type</fieldlabel><fieldentry>short_answer_question</fieldentry></qtimetadatafield>
            <qtimetadatafield><fieldlabel>points_possible</fieldlabel><fieldentry>${q.points.toFixed(1)}</fieldentry></qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material><mattext texttype="text/html">${cdata(md(q.stem))}</mattext></material>
          <response_str ident="${responseId}" rcardinality="Single">
            <render_fib><response_label ident="answer1" rshuffle="No"/></render_fib>
          </response_str>
        </presentation>
        <resprocessing>
          <outcomes><decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/></outcomes>
          ${conds}
        </resprocessing>
      </item>`;
  }

  function emitEssay(q, id) {
    const itemId = id();
    const responseId = id();
    const fb = q.feedback.general ? itemFeedback('general_fb', q.feedback.general) : '';
    const fbDisplay = q.feedback.general
      ? `<respcondition continue="No"><conditionvar><other/></conditionvar><displayfeedback feedbacktype="Response" linkrefid="general_fb"/></respcondition>` : '';
    return `      <item ident="${itemId}" title="${escapeXml(q.title || 'Question')}">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield><fieldlabel>question_type</fieldlabel><fieldentry>essay_question</fieldentry></qtimetadatafield>
            <qtimetadatafield><fieldlabel>points_possible</fieldlabel><fieldentry>${q.points.toFixed(1)}</fieldentry></qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material><mattext texttype="text/html">${cdata(md(q.stem))}</mattext></material>
          <response_str ident="${responseId}" rcardinality="Single">
            <render_fib><response_label ident="answer1" rshuffle="No"/></render_fib>
          </response_str>
        </presentation>
        <resprocessing>
          <outcomes><decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/></outcomes>
          ${fbDisplay}
        </resprocessing>${fb}
      </item>`;
  }

  function emitUpload(q, id) {
    const itemId = id();
    const responseId = id();
    const fb = q.feedback.general ? itemFeedback('general_fb', q.feedback.general) : '';
    // As in emitEssay: without this <displayfeedback> the itemfeedback block is
    // emitted but never referenced, so Canvas renders nothing.
    const fbDisplay = q.feedback.general
      ? `<respcondition continue="No"><conditionvar><other/></conditionvar><displayfeedback feedbacktype="Response" linkrefid="general_fb"/></respcondition>` : '';
    return `      <item ident="${itemId}" title="${escapeXml(q.title || 'Question')}">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield><fieldlabel>question_type</fieldlabel><fieldentry>file_upload_question</fieldentry></qtimetadatafield>
            <qtimetadatafield><fieldlabel>points_possible</fieldlabel><fieldentry>${q.points.toFixed(1)}</fieldentry></qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material><mattext texttype="text/html">${cdata(md(q.stem))}</mattext></material>
          <response_str ident="${responseId}" rcardinality="Single">
            <render_fib><response_label ident="answer1" rshuffle="No"/></render_fib>
          </response_str>
        </presentation>
        <resprocessing>
          <outcomes><decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/></outcomes>
          ${fbDisplay}
        </resprocessing>${fb}
      </item>`;
  }

  // In formula and blank questions Canvas reads every [ ... ] as a variable or
  // a blank. Math brackets like 3[15 - 2^2] would be swallowed, so keep only
  // the [name] references and turn other brackets into \lbrack / \rbrack
  // (inside math) or &#91; / &#93; (in plain text). \[ ... \] becomes $$ ... $$.
  function protectBrackets(html, names) {
    const known = new Set(names);
    const t = html.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
    let out = '';
    let inMath = false;
    let i = 0;
    while (i < t.length) {
      if (t.startsWith('\\(', i) || t.startsWith('\\)', i)) { inMath = t[i + 1] === '('; out += t.slice(i, i + 2); i += 2; continue; }
      if (t.startsWith('$$', i)) { inMath = !inMath; out += '$$'; i += 2; continue; }
      const ref = /^\[([A-Za-z]\w*)\]/.exec(t.slice(i, i + 40));
      if (ref && known.has(ref[1])) { out += ref[0]; i += ref[0].length; continue; }
      if (t[i] === '[') { out += inMath ? '\\lbrack ' : '&#91;'; i++; continue; }
      if (t[i] === ']') { out += inMath ? '\\rbrack ' : '&#93;'; i++; continue; }
      out += t[i]; i++;
    }
    return out;
  }

  function itemHead(q, itemId, type) {
    return `      <item ident="${itemId}" title="${escapeXml(q.title || 'Question')}">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield><fieldlabel>question_type</fieldlabel><fieldentry>${type}</fieldentry></qtimetadatafield>
            <qtimetadatafield><fieldlabel>points_possible</fieldlabel><fieldentry>${q.points.toFixed(1)}</fieldentry></qtimetadatafield>
          </qtimetadata>
        </itemmetadata>`;
  }
  const SCORE_OUT = '<outcomes><decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/></outcomes>';

  // Same shape Canvas uses when it exports a formula question. New Quizzes
  // imports it as a Formula question: [x] in the text becomes the variable,
  // and each student gets one of the pre-computed sets.
  function emitFormula(q, id) {
    const itemId = id();
    const sets = (q.sets || []).map((s, k) => `<var_set ident="${k + 1}">${q.vars.map(v => `<var name="${escapeXml(v.name)}">${s.vals[v.name]}</var>`).join('')}<answer>${s.answer}</answer></var_set>`).join('\n              ');
    return `${itemHead(q, itemId, 'calculated_question')}
        <presentation>
          <material><mattext texttype="text/html">${cdata(protectBrackets(md(q.stem), q.vars.map(v => v.name)))}</mattext></material>
          <response_str ident="response1" rcardinality="Single">
            <render_fib fibtype="Decimal"><response_label ident="answer1"/></render_fib>
          </response_str>
        </presentation>
        <resprocessing>
          ${SCORE_OUT}
          <respcondition title="correct"><conditionvar><other/></conditionvar><setvar varname="SCORE" action="Set">100</setvar></respcondition>
          <respcondition title="incorrect"><conditionvar><not><other/></not></conditionvar><setvar varname="SCORE" action="Set">0</setvar></respcondition>
        </resprocessing>
        <itemproc_extension>
          <calculated>
            <answer_tolerance>${escapeXml(q.tolerance)}</answer_tolerance>
            <formulas decimal_places="${q.decimals}"><formula>${escapeXml(q.formula)}</formula></formulas>
            <vars>${q.vars.map(v => `<var name="${escapeXml(v.name)}" scale="${v.scale}"><min>${v.min}</min><max>${v.max}</max></var>`).join('')}</vars>
            <var_sets>
              ${sets}
            </var_sets>
          </calculated>
        </itemproc_extension>
      </item>`;
  }

  function emitMatch(q, id) {
    const itemId = id();
    const rights = [];
    const rightId = {};
    [...q.pairs.map(p => p.right), ...q.extras].forEach(r => {
      if (rightId[r] === undefined) { rightId[r] = id(); rights.push(r); }
    });
    const each = (100 / q.pairs.length).toFixed(2);
    const lids = q.pairs.map(() => id());
    const labels = rights.map(r => `<response_label ident="${rightId[r]}"><material><mattext>${escapeXml(r)}</mattext></material></response_label>`).join('');
    const prompts = q.pairs.map((p, k) => `
          <response_lid ident="response_${lids[k]}">
            <material><mattext texttype="text/plain">${escapeXml(p.left)}</mattext></material>
            <render_choice>${labels}</render_choice>
          </response_lid>`).join('');
    const conds = q.pairs.map((p, k) => `
          <respcondition><conditionvar><varequal respident="response_${lids[k]}">${rightId[p.right]}</varequal></conditionvar><setvar varname="SCORE" action="Add">${each}</setvar></respcondition>`).join('');
    return `${itemHead(q, itemId, 'matching_question')}
        <presentation>
          <material><mattext texttype="text/html">${cdata(md(q.stem))}</mattext></material>${prompts}
        </presentation>
        <resprocessing>
          ${SCORE_OUT}${conds}
        </resprocessing>
      </item>`;
  }

  function emitBlanks(q, id) {
    const itemId = id();
    const each = (100 / q.blanks.length).toFixed(2);
    let parts = '';
    let conds = '';
    q.blanks.forEach(b => {
      const opts = b.options.map(o => ({ ...o, id: id() }));
      parts += `
          <response_lid ident="response_${escapeXml(b.name)}">
            <material><mattext>${escapeXml(b.name)}</mattext></material>
            <render_choice>${opts.map(o => `<response_label ident="${o.id}"><material><mattext texttype="text/plain">${escapeXml(o.text)}</mattext></material></response_label>`).join('')}</render_choice>
          </response_lid>`;
      opts.filter(o => o.correct).forEach(o => {
        conds += `
          <respcondition><conditionvar><varequal respident="response_${escapeXml(b.name)}">${o.id}</varequal></conditionvar><setvar varname="SCORE" action="Add">${each}</setvar></respcondition>`;
      });
    });
    return `${itemHead(q, itemId, q.type)}
        <presentation>
          <material><mattext texttype="text/html">${cdata(protectBrackets(md(q.stem), q.blanks.map(b => b.name)))}</mattext></material>${parts}
        </presentation>
        <resprocessing>
          ${SCORE_OUT}${conds}
        </resprocessing>
      </item>`;
  }

  /* =========================================================================
   * Manifest XML, assessment meta, and ZIP bundling
   * ========================================================================= */

  function buildManifest(assessId, metaResId, quizHref, metaHref, manifestId, extraFiles) {
    const extra = (extraFiles || []).map(h => `\n      <file href="${escapeXml(h)}"/>`).join('');
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifestId}" xmlns="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1" xmlns:lom="http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1 http://www.imsglobal.org/profile/cc/ccv1p1/ccv1p1_imscp_v1p2_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource http://www.imsglobal.org/profile/cc/ccv1p1/LOM/ccv1p1_lomresource_v1p0.xsd">
  <metadata>
    <schema>IMS Content</schema>
    <schemaversion>1.1.3</schemaversion>
  </metadata>
  <organizations/>
  <resources>
    <resource identifier="${assessId}" type="imsqti_xmlv1p2" href="${escapeXml(quizHref)}">
      <file href="${escapeXml(quizHref)}"/>${extra}
      <dependency identifierref="${metaResId}"/>
    </resource>
    <resource identifier="${metaResId}" type="associatedcontent/imscc_xmlv1p1/learning-application-resource" href="${escapeXml(metaHref)}">
      <file href="${escapeXml(metaHref)}"/>
    </resource>
  </resources>
</manifest>`;
  }

  function buildAssessmentMeta(parsed, assessId) {
    const s = parsed.settings || {};
    const shuffle = s['shuffle answers'] ? 'true' : 'false';
    const showCorrect = s['show correct answers'] === false ? 'false' : 'true';
    const oneAtATime = s['one question at a time'] ? 'true' : 'false';
    const cantGoBack = s["can't go back"] ? 'true' : 'false';

    let total = 0;
    for (const item of parsed.items) {
      if (item.isGroup) total += (item.pick || 0) * (item.pointsPerQuestion || 0);
      else total += (typeof item.points === 'number' ? item.points : 1);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<quiz identifier="${assessId}" xmlns="http://canvas.instructure.com/xsd/cccv1p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://canvas.instructure.com/xsd/cccv1p0 https://canvas.instructure.com/xsd/cccv1p0.xsd">
  <title>${escapeXml(parsed.title || 'Quiz')}</title>
  <description>${escapeXml(parsed.description || '')}</description>
  <shuffle_answers>${shuffle}</shuffle_answers>
  <scoring_policy>keep_highest</scoring_policy>
  <quiz_type>assignment</quiz_type>
  <points_possible>${total.toFixed(1)}</points_possible>
  <show_correct_answers>${showCorrect}</show_correct_answers>
  <allowed_attempts>1</allowed_attempts>
  <one_question_at_a_time>${oneAtATime}</one_question_at_a_time>
  <cant_go_back>${cantGoBack}</cant_go_back>
  <available>false</available>
</quiz>`;
  }

  /* Picture references in the quiz: ![alt](file.png). Returns the src
   * values that point at a local file (not a web address). */
  function imageRefs(parsed) {
    const xml = buildAssessmentXml(parsed);
    const refs = new Set();
    const re = /<img src="([^"]+)"/g;
    let m;
    while ((m = re.exec(xml))) {
      if (!/^(https?:|data:|\$IMS)/i.test(m[1])) refs.add(m[1]);
    }
    return [...refs];
  }

  function baseName(p) {
    return decodeURIComponent(String(p)).split(/[\\/]/).pop().toLowerCase();
  }

  async function generate(parseResult, opts) {
    if (!parseResult || !parseResult.parsed) throw new Error('No parsed quiz data provided.');
    if (typeof JSZip === 'undefined') throw new Error('JSZip library is not loaded. Make sure jszip.min.js is included in the page.');
    const parsed = parseResult.parsed;

    // The assessment file is generated first; its <assessment ident> is the id
    // Canvas keys the quiz on, so reuse it as the resource id / folder name so
    // the manifest, meta file, and QTI all agree (this is how Canvas exports).
    const assessmentXml = buildAssessmentXml(parsed);
    const assessId = (assessmentXml.match(/<assessment ident="([^"]+)"/) || [])[1] || 'g_assessment';

    const quizHref = `${assessId}/${assessId}.xml`;
    const metaHref = `${assessId}/assessment_meta.xml`;
    const metaResId = `${assessId}_meta`;
    const manifestId = `${assessId}_manifest`;

    // Pictures: opts.images maps a file name to its bytes (Blob, ArrayBuffer
    // or Uint8Array). Each picture the quiz references is packed next to the
    // assessment file and listed in the manifest; Canvas uploads it and
    // rewrites the <img> to its own copy on import.
    const images = (opts && opts.images) || {};
    const byBase = {};
    Object.keys(images).forEach(k => { byBase[baseName(k)] = images[k]; });
    const packed = [];
    const zip = new JSZip();
    const re = /<img src="([^"]+)"/g;
    let m;
    const seen = new Set();
    while ((m = re.exec(assessmentXml))) {
      const src = m[1];
      if (seen.has(src) || /^(https?:|data:|\$IMS)/i.test(src)) continue;
      seen.add(src);
      const data = byBase[baseName(src)];
      if (!data) continue;
      const href = `${assessId}/${decodeURIComponent(src)}`;
      zip.file(href, data);
      packed.push(href);
    }
    zip.file('imsmanifest.xml', buildManifest(assessId, metaResId, quizHref, metaHref, manifestId, packed));
    zip.file(quizHref, assessmentXml);
    zip.file(metaHref, buildAssessmentMeta(parsed, assessId));

    return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  }

  /* =========================================================================
   * Helpers
   * ========================================================================= */

  function deriveDefaultTitle(filename) {
    if (!filename) return 'Quiz';
    return filename.replace(/\.(txt|md|docx)$/i, '').replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase());
  }

  /* =========================================================================
   * Public API
   * ========================================================================= */

  global.RaiderQuizBuilder = {
    parse: parse,
    generate: generate,
    imageRefs: imageRefs
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parse, generate, imageRefs, buildAssessmentXml, buildManifest, buildAssessmentMeta, normalize };
  }
})(typeof window !== 'undefined' ? window : globalThis);

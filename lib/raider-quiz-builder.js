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
    UPLOAD: 'file_upload_question'
  };

  const PAT = {
    questionStart: /^(\d+)\.\s+(.*)$/,
    answerChoice: /^(\*?)([a-z])\)\s+(.*)$/i,
    multiAnswerCorrect: /^\[\*\]\s+(.+)$/,
    multiAnswerWrong: /^\[ \]\s+(.+)$/,
    numerical: /^=\s+(.+)$/,
    shortAnswer: /^\*\s+(.+)$/,
    essay: /^____\s*$/,
    fileUpload: /^\^\^\^\^\s*$/,
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
    if (/[\u2013\u2014]/.test(s)) {
      s = s.replace(/[\u2013\u2014]/g, '--');
      notices.push('Em/en-dash normalized to "--"');
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
      stem += ' ' + lines[i].trim();
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

    const typeCount = [hasMC, hasMR, hasNum, hasSA, hasEssay, hasUpload].filter(Boolean).length;
    if (typeCount === 0) {
      errors.push({ line: stemLineNum, message: 'Question has no answers or response area. Add answer choices, a `=` line, `____`, or `^^^^`.' });
      q.type = QTYPE.ESSAY;
      return q;
    }
    if (typeCount > 1) {
      errors.push({ line: stemLineNum, message: 'Question mixes incompatible answer formats. Pick one type.' });
    }

    if (hasMC) {
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

    if ((q.type === QTYPE.NUM || q.type === QTYPE.SA) && hasAnyFeedback(blockLines)) {
      errors.push({ line: stemLineNum, message: 'Feedback markers (... + -) are not supported on numerical or short-answer questions. Remove the feedback lines.' });
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
        const range = /^\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]$/.exec(val);
        const margin = /^(-?[\d.]+)\s*\+-\s*([\d.]+)$/.exec(val);
        if (range) q.answers.push({ kind: 'range', low: parseFloat(range[1]), high: parseFloat(range[2]), lineNum: num });
        else if (margin) q.answers.push({ kind: 'margin', value: parseFloat(margin[1]), tolerance: parseFloat(margin[2]), lineNum: num });
        else if (/^-?[\d.]+$/.test(val)) q.answers.push({ kind: 'exact', value: parseFloat(val), lineNum: num });
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
   * Markdown -> HTML and CDATA helpers
   * ========================================================================= */

  function md(s) {
    if (!s) return '';
    let t = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
    t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1"/>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
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

  function makeIdGen() {
    let n = 1000;
    return () => 'g_' + (++n).toString(16).padStart(6, '0');
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
          <outcomes><decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/></outcomes>
          <respcondition continue="No">
            <conditionvar>${correctCond}</conditionvar>
            <setvar action="Set" varname="SCORE">100</setvar>
          </respcondition>
        </resprocessing>${fbBlocks.join('')}
      </item>`;
  }

  function emitNum(q, id) {
    const itemId = id();
    const responseId = id();
    const conditions = q.answers.map(a => {
      let cond;
      if (a.kind === 'exact') cond = `<varequal respident="${responseId}">${a.value}</varequal>`;
      else if (a.kind === 'range') cond = `<and><vargte respident="${responseId}">${a.low}</vargte><varlte respident="${responseId}">${a.high}</varlte></and>`;
      else if (a.kind === 'margin') cond = `<and><vargte respident="${responseId}">${a.value - a.tolerance}</vargte><varlte respident="${responseId}">${a.value + a.tolerance}</varlte></and>`;
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
        </resprocessing>${fb}
      </item>`;
  }

  /* =========================================================================
   * Manifest XML, assessment meta, and ZIP bundling
   * ========================================================================= */

  function buildManifest(assessId, metaResId, quizHref, metaHref, manifestId) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifestId}" xmlns="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1" xmlns:lom="http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1 http://www.imsglobal.org/profile/cc/ccv1p1/ccv1p1_imscp_v1p2_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource http://www.imsglobal.org/profile/cc/ccv1p1/LOM/ccv1p1_lomresource_v1p0.xsd">
  <metadata>
    <schema>IMS Content</schema>
    <schemaversion>1.1.3</schemaversion>
  </metadata>
  <organizations/>
  <resources>
    <resource identifier="${assessId}" type="imsqti_xmlv1p2" href="${escapeXml(quizHref)}">
      <file href="${escapeXml(quizHref)}"/>
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

  async function generate(parseResult) {
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

    const zip = new JSZip();
    zip.file('imsmanifest.xml', buildManifest(assessId, metaResId, quizHref, metaHref, manifestId));
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
    generate: generate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parse, generate, buildAssessmentXml, buildManifest, buildAssessmentMeta, normalize };
  }
})(typeof window !== 'undefined' ? window : globalThis);

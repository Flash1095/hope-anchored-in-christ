/* Hope Anchored in Christ — single-page app.
   Data is NOT inlined: every collection is fetched at runtime from content/*.json
   (same-origin, relative paths), so editing the JSON — via /admin or by hand —
   updates the site. */
(function () {
  "use strict";

  var COLLECTIONS = [
    { id: "timeline", label: "Biblical Timeline", file: "content/timeline.json", primary: "Title",
      blurb: "The whole story, era by era, from Creation to the Early Church.",
      filters: [{ label: "Era", field: "Era" }, { label: "Verification", field: "VerificationStatus" }], meta: ["DateApprox", "Era"] },
    { id: "books", label: "Books of the Bible", file: "content/books.json", primary: "Book",
      blurb: "All 66 books: author, date, theme, outline, and context.",
      filters: [{ label: "Testament", field: "Testament" }, { label: "Era", field: "TimelineEra" }, { label: "Verification", field: "VerificationStatus" }],
      meta: ["Testament", "Category", "DateApprox"] },
    { id: "questions", label: "Questions and Answers", file: "content/questions.json", primary: "Question",
      blurb: "Searchable Bible Q&A — short answers and full studies.",
      filters: [{ label: "Category", field: "Category" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Category", "Subcategory"] },
    { id: "people", label: "Biblical People", file: "content/people.json", primary: "Name",
      blurb: "Every major person of Scripture, from Adam to the apostles.",
      filters: [{ label: "Testament", field: "Testament" }, { label: "Era", field: "TimelineEra" }, { label: "Verification", field: "VerificationStatus" }],
      meta: ["Role", "Testament"] },
    { id: "finds", label: "Ancient Discoveries", file: "content/finds.json", primary: "FindName",
      blurb: "Archaeological finds that illuminate the Bible.",
      filters: [{ label: "Era", field: "TimelineEra" }, { label: "Evidence", field: "EvidenceClass" }, { label: "Verification", field: "VerificationStatus" }], meta: ["DiscoveryLocation", "ArtifactDate"] },
    { id: "places", label: "Biblical Places", file: "content/places.json", primary: "Name",
      blurb: "Where the story happened, and where those places are today.",
      filters: [{ label: "Testament", field: "Testament" }, { label: "Era", field: "TimelineEra" }, { label: "Verification", field: "VerificationStatus" }],
      meta: ["ModernLocation", "Testament"] },
    { id: "topics", label: "Topics and Themes", file: "content/topics.json", primary: "Topic",
      blurb: "Central topics and the great themes woven through Scripture, linking passages, people, doctrines, and questions.",
      filters: [{ label: "Category", field: "Category" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Category"] },
    { id: "doctrines", label: "Theology and Doctrine", file: "content/doctrines.json", primary: "Doctrine",
      blurb: "What Christians believe, with biblical support and history." },
    { id: "heresies", label: "Heretical Teachings", file: "content/heresies.json", primary: "Heresy",
      blurb: "False teachings answered, with the Christian response.",
      meta: ["Founder"] },
    { id: "wordstudies", label: "Word Studies", file: "content/wordstudies.json", primary: "Transliteration",
      blurb: "Hebrew and Greek words, with Strong's numbers and meaning.",
      filters: [{ label: "Language", field: "Language" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Language", "StrongsNumber", "PartOfSpeech"] },
    { id: "prophecies", label: "Biblical Prophecies", file: "content/prophecies.json", primary: "Prophecy",
      blurb: "What was foretold, how it was fulfilled — marked honestly.",
      filters: [{ label: "Status", field: "FulfillmentStatus" }, { label: "Era", field: "TimelineEra" }, { label: "Verification", field: "VerificationStatus" }],
      meta: ["Prophet", "DateApprox"] },
    { id: "typology", label: "Foreshadows of Christ", file: "content/typology.json", primary: "Type",
      blurb: "Old Testament shadows fulfilled in Christ.",
      filters: [{ label: "Category", field: "Category" }, { label: "Verification", field: "VerificationStatus" }] },
    { id: "fallacies", label: "Logical Fallacies", file: "content/fallacies.json", primary: "Fallacy",
      blurb: "Spot bad reasoning in faith discussions — and answer graciously.",
      filters: [{ label: "Category", field: "Category" }, { label: "Verification", field: "VerificationStatus" }] },
    { id: "courses", label: "Courses", file: "content/courses.json", primary: "Course",
      blurb: "Guided studies, from Foundations of Faith to Hebrew and Greek.",
      filters: [{ label: "Level", field: "Level" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Level", "Duration"] },
    { id: "quizzes", label: "Quizzes", file: "content/quizzes.json", primary: "Question",
    blurb: "Test what you've learned — every answer teaches.", special: "quizzes" },
  { id: "hymns", label: "Hymns", file: "content/hymns.json", primary: "Hymn",
    blurb: "Great hymns and the stories behind them — how each song was born.",
    meta: ["Author", "Year"] },
  { id: "nature", label: "Nature & Creation", file: "content/nature.json", primary: "Name",
    blurb: "Birds, plants, and animals that point to the Creator — with photos from Lorraine.",
    meta: ["Category"] },
  { id: "apologetics", label: "Defend your faith", file: "content/apologetics.json", primary: "Argument",
    blurb: "Why Christianity best explains reality — the cumulative case from philosophy, science, history, and experience.",
    filters: [{ label: "Category", field: "Category" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Category"] },
  { id: "objections", label: "Objections & Answers", file: "content/objections.json", primary: "Objection",
    blurb: "Honest objections from atheists, Muslims, Jews, and others — stated fairly and answered with grace and truth.",
    filters: [{ label: "Worldview", field: "Worldview" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Worldview"] },
  { id: "perspectives", label: "Different Perspectives", file: "content/perspectives.json", primary: "Profession",
    blurb: "How journalists, detectives, doctors, and other professionals shed light on the truth of the Bible.",
    meta: ["Exemplar"] },
  { id: "heritage", label: "Christian Heritage", file: "content/heritage.json", primary: "Name",
    blurb: "Writings, commentaries, church history, and the men and women whose testimonies shaped Christianity.",
    filters: [{ label: "Type", field: "Type" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Type", "Era"] },
  { id: "politics", label: "Faith & Politics", file: "content/politics.json", primary: "Issue",
    blurb: "Political issues and current events — and how to respond to them biblically." },
  { id: "socialmedia", label: "Social Media Responses", file: "content/socialmedia.json", primary: "Post",
    blurb: "Viral posts, trends, and hot takes from TikTok, X, Facebook, Instagram, and beyond — addressed with grace and truth.",
    filters: [{ label: "Platform", field: "Platform" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Platform"] },
  { id: "stories", label: "Biblical Stories & Events", file: "content/stories.json", primary: "Story",
    blurb: "Beloved Bible stories and events retold in detail — with the people, the meaning, and what they mean for us today.",
    filters: [{ label: "Testament", field: "Testament" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Testament"] },
  { id: "hermeneutics", label: "Biblical Hermeneutics", file: "content/hermeneutics.json", primary: "Principle",
    blurb: "How to interpret Scripture rightly — context, literary genres, literary devices, and principles for handling God's Word with care.",
    filters: [{ label: "Category", field: "Category" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Category"] },
  { id: "jewishculture", label: "Jewish Cultural Backgrounds", file: "content/jewishculture.json", primary: "Topic",
    blurb: "Jewish culture, feasts, and traditions \u2014 and how each one points to Jesus the Messiah.",
    filters: [{ label: "Category", field: "Category" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Category"] },
  { id: "studyguides", label: "Bible Study Guides", file: "content/studyguides.json", primary: "Guide",
    blurb: "Step-by-step guides for studying a book, a topic, a person, or a passage — with questions and application for every study.",
    filters: [{ label: "Category", field: "Category" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Category"] },
  { id: "civilizations", label: "Ancient Civilizations", file: "content/civilizations.json", primary: "Civilization",
    blurb: "The empires and peoples around Israel — Egypt, Assyria, Babylon, Persia, Greece, Rome, and their neighbors — and how each one touches the Bible story.",
    filters: [{ label: "Region", field: "Region" }, { label: "Verification", field: "VerificationStatus" }], meta: ["Region"] },
  { id: "manuscripts", label: "Dead Sea Scrolls Manuscripts", file: "content/manuscripts.json", primary: "Manuscript",
    blurb: "Qumran manuscripts of the Bible — the best-preserved copy of each book, with its cave, date, language, material, and the passages that actually survive. Search by book, cave, period, language, or completeness.",
    filters: [{ label: "Book", field: "Work" }, { label: "Cave", field: "Cave" }, { label: "Period", field: "Period" }, { label: "Language", field: "Language" }, { label: "Category", field: "Category" }, { label: "Completeness", field: "Completeness" }, { label: "Verification", field: "VerificationStatus" }], meta: ["ManuscriptID", "Cave", "DateApprox"] },
];
  /* Explore tile order, as a study journey: the story first, then the
     world behind it, then deeper study, then discernment, then the
     learn-and-practice trio in taxonomy order (take a course, use a
     guide, test with a quiz), then worship and wonder. This order is
     display-only: COLLECTIONS itself stays untouched, because its order
     decides link-index tie-breaking. Any collection missing here falls
     back to the end of the tiles, so nothing can ever disappear. */
  var EXPLORE_ORDER = ["timeline", "books", "stories", "people", "places",
    "finds", "manuscripts", "civilizations", "questions", "hermeneutics", "jewishculture",
    "topics", "wordstudies", "doctrines", "prophecies", "typology", "apologetics",
    "objections", "heresies", "fallacies", "perspectives", "heritage",
    "politics", "socialmedia", "courses", "studyguides", "quizzes", "hymns",
    "nature"];
  /* Section headings for the Explore tiles, keyed by the collection that
     starts each section. The first section combines the story and the
     world behind it under one title, Discover the Bible. */
  var SECTION_HEADINGS = { timeline: "Discover the Bible", questions: "Ask and Understand",
    courses: "Learn and Practice",
    hymns: "Worship and Wonder" };

  var REL_FIELDS = ["RelatedBooks", "RelatedPeople", "RelatedEvents", "RelatedTopics",
    "RelatedDoctrines", "RelatedQuestions", "RelatedFinds", "RelatedBook",
    "KeyPersons", "KeyPeople", "BibleBooks", "Places", "Events",
    "KeyScriptures", "KeyPassages", "KeyVerses", "ScriptureReference",
    "ScriptureIlluminated", "BibleReferences", "Tags", "Themes", "Place", "Prophet", "Course"];
  /* Bible book study sections (Genesis page): full markdown sections
     rendered as expandable <details> blocks below the overview. The
     section titles come from STUDY_LABELS; nothing here is hand-listed
     per book, so the same rendering works if another book gains study
     sections later. */
  var STUDY_FIELDS = ["StudyOverview", "StudyAuthorship", "StudyHistoricalBackground",
    "StudyCulturalContext", "StudyLiteraryStructure", "StudyChapterByChapter",
    "StudyMajorThemes", "StudyTheologyDoctrine", "StudyChristMessianic",
    "StudyProphecyFulfillment", "StudyPeopleGenealogies", "StudyGeographyMaps",
    "StudyArchaeology", "StudyLanguages", "StudyManuscriptsCanon", "StudyApologetics",
    "StudyCrossReferences", "StudyJewishBackground", "StudyEthicsApplication",
    "StudyResourcesActivities", "StudyQuizzesTrivia", "StudyImportantVerses",
    "StudyEventsChronology", "StudyCovenantsLaws", "StudyMiraclesParables",
    "StudySymbolism", "StudyInterpretations", "StudyMisconceptions",
    "StudyQuestionsAnswers", "StudyChurchHistory", "StudyTranslations",
    "StudyRelatedPosts", "StudySources", "StudyTakeaways"];
  var STUDY_LABELS = {
    "StudyOverview": "Basic Book Information & Overview",
    "StudyAuthorship": "Authorship & Composition",
    "StudyHistoricalBackground": "Historical Background",
    "StudyCulturalContext": "Cultural & Religious Context",
    "StudyLiteraryStructure": "Literary Structure & Book Outline",
    "StudyChapterByChapter": "Chapter-by-Chapter Studies",
    "StudyMajorThemes": "Major Themes",
    "StudyTheologyDoctrine": "Theology & Doctrine",
    "StudyChristMessianic": "Jesus Christ & Messianic Connections",
    "StudyProphecyFulfillment": "Biblical Prophecy & Fulfillment",
    "StudyPeopleGenealogies": "Biblical People & Genealogies",
    "StudyGeographyMaps": "Biblical Geography & Maps",
    "StudyArchaeology": "Archaeology & Historical Evidence",
    "StudyLanguages": "Original Languages & Word Studies",
    "StudyManuscriptsCanon": "Ancient Manuscripts, Textual Criticism & Canon",
    "StudyApologetics": "Apologetics & Difficult Bible Passages",
    "StudyCrossReferences": "Cross-References & Biblical Connections",
    "StudyJewishBackground": "Jewish Background & Interpretation",
    "StudyEthicsApplication": "Ethics & Practical Application",
    "StudyResourcesActivities": "Bible Study Resources & Interactive Activities",
    "StudyQuizzesTrivia": "Bible Quizzes & Trivia",
    "StudyImportantVerses": "Important Bible Verses",
    "StudyEventsChronology": "Biblical Events & Chronology",
    "StudyCovenantsLaws": "Covenants, Laws & Commandments",
    "StudyMiraclesParables": "Miracles, Parables & Teachings",
    "StudySymbolism": "Symbolism, Imagery & Literary Devices",
    "StudyInterpretations": "Historical & Theological Interpretations",
    "StudyMisconceptions": "Common Misconceptions & Misinterpretations",
    "StudyQuestionsAnswers": "Questions & Answers",
    "StudyChurchHistory": "Christian Church History & Historical Reception",
    "StudyTranslations": "Bible Translation Comparisons",
    "StudyRelatedPosts": "Related Blog Posts & Articles",
    "StudySources": "Scholarly Sources, References & Further Reading",
    "StudyTakeaways": "Key Takeaways & Book Summary"
  };
  var SNIPPET_FIELDS = ["Summary", "Description", "Story", "Definition", "ShortAnswer",
    "ProphecySummary", "Explanation", "BiblicalUsage", "Beliefs"];
  var SKIP_FIELDS = ["Slug", "Maps", "Image", "ImageCredit", "ImageSource", "PanelImage", "PanelImageCredit"];
  var VERIF_FIELDS = ["VerificationStatus", "Sources", "LastReviewed"];

  var data = {};      // collection id -> array of rows
  var posts = [];     // blog manifest
  var maps = {};      // map id -> {title, file, credit, source}
  var explorePage = {}; // editable Explore page text (content/pages/explore.json)
  var petStories = [];  // storybook shelf: pet stories (content/petstories.json)
  var childStories = []; // storybook shelf: children's stories (content/childrenstories.json)
  var galleryItems = []; // art gallery (content/gallery.json)
  var genealogyData = null; // Biblical Genealogies (content/genealogy.json)
  var lookupDates = []; // DSS passage-lookup dates (content/dss_lookup_dates.json)
  var atlasItems = []; // biblical atlas (content/atlas.json)
  var ASSET_V = "168";  // bump when site code or content changes, so browsers fetch fresh copies
  var linkIndex = {}; // exact value -> {coll, idx}
  var linkIndexByColl = {}; // coll id -> exact value -> {coll, idx}
  // A related field's home collection: a RelatedEvents token that matches a
  // story title must land on the story page, not on a timeline/topic page
  // that happens to share the name and comes first in COLLECTIONS order.
  var FIELD_HOME = { RelatedBooks: "books", RelatedBook: "books", BibleBooks: "books",
    RelatedPeople: "people", KeyPeople: "people", KeyPersons: "people", Prophet: "people",
    RelatedEvents: "stories", Events: "stories", RelatedTopics: "topics", Themes: "topics",
    RelatedDoctrines: "doctrines", RelatedQuestions: "questions", RelatedFinds: "finds",
    Places: "places", Place: "places", Course: "courses" };
  var app = document.getElementById("app");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  // Blog dates: the editor stores full timestamps (2026-10-25T15:00:00.000-05:00)
  // but the blog displays plain dates like the older posts, so trim to YYYY-MM-DD.
  function shortDate(s) {
    s = String(s == null ? "" : s);
    return s.length > 10 ? s.slice(0, 10) : s;
  }
  // Instant blog posts: the editor commits straight to main, but the built
  // posts.json only refreshes after the site rebuild, so a new post used to
  // take minutes to appear. Instead the blog lists posts live from the repo:
  // the GitHub contents API shows the post seconds after publishing, and the
  // body is read from raw.githubusercontent.com, which also updates in
  // seconds — no rebuild or page deploy needed. If GitHub is unreachable
  // (or rate-limited), the built posts.json is used as before.
  function parsePostFrontmatter(text, file) {
    var meta = {};
    var m = text.match(/^---\s*([\s\S]*?)\n---/);
    if (m) {
      var lastKey = null;
      m[1].split("\n").forEach(function (line) {
        /* YAML folds an indented continuation line into the previous
           value (the Testing post's scripture wraps this way); without
           this the value is cut off at the wrap point. */
        if (/^\s/.test(line) && lastKey) { meta[lastKey] += " " + line.trim(); return; }
        var i = line.indexOf(":");
        if (i > 0) {
          var val = line.slice(i + 1).trim();
          if ((val.charAt(0) === '"' && val.slice(-1) === '"') || (val.charAt(0) === "'" && val.slice(-1) === "'")) val = val.slice(1, -1);
          lastKey = line.slice(0, i).trim();
          meta[lastKey] = val;
        }
      });
    }
    var slug = file.split("/").pop().replace(/\.md$/, "");
    return { slug: slug, title: meta.title || slug, date: meta.date || "", category: meta.category || "", scripture: meta.scripture || "", series: meta.series || "", part: meta.part || "", file: file };
  }
  function loadPostsFromGithub() {
    return fetch("https://api.github.com/repos/Flash1095/hope-anchored-in-christ/contents/content/posts?ref=main", { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("github posts list");
      return r.json();
    }).then(function (items) {
      var files = items.filter(function (it) { return it.type === "file" && /\.md$/.test(it.name); });
      return Promise.all(files.map(function (it) {
        return fetch(it.download_url, { cache: "no-store" }).then(function (r) {
          if (!r.ok) throw new Error("github post file");
          return r.text();
        }).then(function (text) {
          var p = parsePostFrontmatter(text, "content/posts/" + it.name);
          p.raw = it.download_url;
          return p;
        });
      }));
    }).then(function (list) {
      list.sort(function (a, b) { return (b.date || "") < (a.date || "") ? -1 : ((b.date || "") > (a.date || "") ? 1 : 0); });
      return list;
    });
  }
  function label(field) {
    if (field === "Places") return "Related Places";
    if (field === "Place") return "Related Place";
    if (STUDY_LABELS[field]) return STUDY_LABELS[field];
    return field.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/^./, function (c) { return c.toUpperCase(); });
  }
  function coll(id) { return COLLECTIONS.filter(function (c) { return c.id === id; })[0]; }
  function val(row, field) {
    var v = row[field];
    if (v == null) return "";
    if (Array.isArray(v)) return v.join("; ");
    return String(v);
  }
  function isEmpty(v) { return v == null || String(v).trim() === ""; }
  function splitList(v) {
    return String(v).split(";").map(function (t) { return t.trim(); }).filter(Boolean);
  }
  function snippet(row) {
    for (var i = 0; i < SNIPPET_FIELDS.length; i++) {
      var v = val(row, SNIPPET_FIELDS[i]);
      if (!isEmpty(v)) return v.length > 170 ? v.slice(0, 170).replace(/\s+\S*$/, "") + "…" : v;
    }
    return "";
  }
  function statusClass(status) {
    if (status === "Fulfilled") return "badge fulfilled";
    if (status === "Partially Fulfilled") return "badge partial";
    if (status === "Future") return "badge future";
    if (status === "Debated") return "badge debated";
    return "badge";
  }

  /* ---------- cross-link index ---------- */
  function buildLinkIndex() {
    COLLECTIONS.forEach(function (c) {
      (data[c.id] || []).forEach(function (row, idx) {
        var p = val(row, c.primary);
        if (!linkIndexByColl[c.id]) linkIndexByColl[c.id] = {};
        var put = function (key) {
          if (isEmpty(key)) return;
          if (!linkIndexByColl[c.id][key]) linkIndexByColl[c.id][key] = { coll: c.id, idx: idx, display: p };
          if (!linkIndexByColl[c.id][key.toLowerCase()]) linkIndexByColl[c.id][key.toLowerCase()] = { coll: c.id, idx: idx, display: p };
        };
        if (!isEmpty(p) && !linkIndex[p]) linkIndex[p] = { coll: c.id, idx: idx, display: p };
        put(p);
        if (c.id === "wordstudies") {
          var w = val(row, "Word");
          if (!isEmpty(w) && !linkIndex[w]) linkIndex[w] = { coll: c.id, idx: idx, display: p };
          put(w);
        }
        if (c.id === "questions") {
          // RelatedQuestions stores slugs in most collections, not titles.
          var s = val(row, "Slug");
          if (!isEmpty(s) && !linkIndex[s]) linkIndex[s] = { coll: c.id, idx: idx, display: p };
          put(s);
        }
      });
    });
    // Short-name aliases: a related token like "Augustine" should reach
    // "Augustine of Hippo". Only ever add an alias when exactly one entry
    // proposes it — ambiguous names (Peter, Saul, Joseph, Mary) stay plain
    // text rather than linking to the wrong person.
    var proposed = {};
    COLLECTIONS.forEach(function (c) {
      if (c.id === "quizzes") return;
      (data[c.id] || []).forEach(function (row) {
        var p = val(row, c.primary);
        if (isEmpty(p)) return;
        var cands = {};
        if (p.indexOf(",") !== -1) cands[p.split(",")[0].trim()] = true;
        if (p.indexOf(" of ") !== -1) cands[p.split(" of ")[0].trim()] = true;
        var words = p.replace(/,/g, "").split(/\s+/);
        if (words.length > 1) { cands[words[0]] = true; cands[words[words.length - 1]] = true; }
        // Lowercase form, so lowercase tags ("forgiveness", "trinity") reach
        // their topic/theme pages. Same uniqueness rule applies.
        cands[p.toLowerCase()] = true;
        Object.keys(cands).forEach(function (a) {
          if (a && a !== p && a.length > 1) {
            if (!proposed[a]) proposed[a] = {};
            proposed[a][p] = true;
          }
        });
      });
    });
    Object.keys(proposed).forEach(function (a) {
      var owners = Object.keys(proposed[a]);
      if (owners.length === 1 && !linkIndex[a]) linkIndex[a] = linkIndex[owners[0]];
    });
  }
  function linkifyField(field, value) {
    if (REL_FIELDS.indexOf(field) === -1) return esc(value);
    return splitList(value).map(function (token) {
      // The field's home collection first (a RelatedEvents token goes to its
      // story page even when a timeline/topic entry shares the name), then
      // the global index, then the lowercase alias for case-only variants.
      var home = FIELD_HOME[field];
      var homeIdx = home && linkIndexByColl[home];
      var hit = (homeIdx && (homeIdx[token] || homeIdx[token.toLowerCase()])) ||
        linkIndex[token] || linkIndex[token.toLowerCase()];
      if (hit) return '<a href="#/' + hit.coll + "/" + hit.idx + '">' + esc(hit.display || token) + "</a>";
      return esc(token);
    }).join("; ");
  }
  /* Scripture references (KeyVerses etc.) link into the Bible reader.
     One entry's references become one link per passage, derived from the
     text already on the entry — nothing is hand-linked per person. A part
     without its own book name inherits the previous part's book, so
     "Numbers 1:5; 7:30-35" links both passages, and a range like
     "Numbers 22-24" links to its first chapter. Anything unparseable
     stays plain text, never a broken link. */
  var SCRIPTURE_FIELDS = ["KeyVerses", "KeyPassages", "KeyScriptures", "ScriptureReference",
    "ScriptureIlluminated", "BibleReferences", "Scripture", "BiblicalSupport", "PreservedPassages"];
  function bibleBookByNameStart(text) {
    var low = text.toLowerCase();
    var books = BIBLE_BOOKS.slice().sort(function (a, b) { return b.name.length - a.name.length; });
    for (var i = 0; i < books.length; i++) {
      if (low.indexOf(books[i].name.toLowerCase()) === 0) {
        var after = text.charAt(books[i].name.length);
        if (after && /[A-Za-z]/.test(after)) continue;
        return { book: books[i], rest: text.slice(books[i].name.length).trim(), prefix: books[i].name };
      }
    }
    if (low.indexOf("psalm ") === 0) return { book: bookByName("Psalms"), rest: text.slice(6).trim(), prefix: "Psalm" };
    if (low.indexOf("song of songs ") === 0) return { book: bookByName("Song of Solomon"), rest: text.slice(14).trim(), prefix: "Song of Songs" };
    if (low.indexOf("song ") === 0) return { book: bookByName("Song of Solomon"), rest: text.slice(5).trim(), prefix: "Song" };
    return null;
  }
  function bookByName(name) {
    for (var i = 0; i < BIBLE_BOOKS.length; i++) if (BIBLE_BOOKS[i].name === name) return BIBLE_BOOKS[i];
    return null;
  }
  function linkifyScriptureRefs(value) {
    var lastBook = null;
    return String(value).split(";").map(function (part) {
      var p = part.trim();
      if (!p) return "";
      var found = bibleBookByNameStart(p);
      var book = found ? found.book : lastBook;
      var rest = found ? found.rest : p;
      if (found) lastBook = book;
      if (!book || !rest) return esc(p);
      var first = true;
      var lastChapter = null, lastHadVerse = false;
      return rest.split(",").map(function (item) {
        var it = item.trim();
        var label = (first && found) ? found.prefix + " " + it : it;
        first = false;
        var m = it.match(/^(\d+)(?::(\d+))?/);
        if (!m) return esc(label);
        var ch = +m[1];
        var verse = m[2] ? +m[2] : null;
        if (!m[2] && lastChapter !== null && lastHadVerse) {
          /* A bare number after a chapter:verse item continues that
             chapter's verses ("Numbers 13:22, 28, 33" = 13:22, 13:28,
             13:33), it does not start a new chapter. */
          verse = ch; ch = lastChapter;
        } else if (book.chapters === 1 && !m[2] && ch !== 1) {
          /* A single-chapter book cited by verse alone ("Jude 22"
             means Jude 1:22); without this, those references stayed
             plain. */
          verse = ch; ch = 1;
        }
        if (ch < 1 || ch > book.chapters) return esc(label);
        if (m[2]) { lastChapter = ch; lastHadVerse = true; }
        else if (verse !== null && lastChapter !== null && lastHadVerse) { /* verse continuation: chapter unchanged */ }
        else { lastChapter = ch; lastHadVerse = false; }
        var href = "#/bible/" + book.slug + "/" + ch + (verse ? "?v=" + verse : "");
        return '<a href="' + href + '">' + esc(label) + '</a>';
      }).join(", ");
    }).join("; ");
  }
  function renderValue(field, value) {
    if (field === "Lessons") {
      return "<ul>" + splitList(value).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
    }
    if (field === "Steps") {
      return "<ol>" + splitList(value).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol>";
    }
    if (field === "Questions") {
      return "<ul>" + splitList(value).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
    }
    if (SCRIPTURE_FIELDS.indexOf(field) !== -1) {
      return '<span class="related">' + linkifyScriptureRefs(value) + "</span>";
    }
    if (REL_FIELDS.indexOf(field) !== -1) {
      return '<span class="related">' + linkifyField(field, value) + "</span>";
    }
    if (field === "Sources") {
      return splitList(value).map(function (u) {
        return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u) + "</a>";
      }).join("<br>");
    }
    if (field === "LeonLevyLink") {
      return '<a href="' + esc(value) + '" target="_blank" rel="noopener">View in the Leon Levy Dead Sea Scrolls Digital Library</a>';
    }
    if (field === "DetailedAnswer" || field === "Response") {
      return value.split(/\n\s*\n/).filter(function (p) { return p.trim() !== ""; }).map(function (para) {
        return "<p>" + esc(para).replace(/\n/g, "<br>") + "</p>";
      }).join("");
    }
    return esc(value);
  }

  /* ---------- generic list + detail ---------- */
  function viewCollection(id, idx, params) {
    var c = coll(id);
    if (!c) return viewHome();
    if (id === "timeline" && (idx === undefined || idx === null || idx === "")) return viewTimeline(params);
    if (id === "nature" && (idx === undefined || idx === null || idx === "")) return viewNature(params);
    if (c.special === "quizzes") return idx ? viewQuizPlay(idx, params) : viewQuizList(params);
    if (idx !== undefined && idx !== null && idx !== "") return viewDetail(c, parseInt(idx, 10));
    var rows = data[id] || [];
    var filterDefs = c.filters || [];
    var state = { q: (params.get("q") || ""), filters: {} };
    filterDefs.forEach(function (f) { state.filters[f.field] = params.get("f_" + f.field) || ""; });

    var values = {};
    filterDefs.forEach(function (f) {
      var set = {};
      rows.forEach(function (r) { var v = val(r, f.field); if (!isEmpty(v)) splitList(v).forEach(function (t) { set[t] = true; }); });
      values[f.field] = Object.keys(set).sort();
    });

    function currentParams() {
      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      filterDefs.forEach(function (f) { if (state.filters[f.field]) p.set("f_" + f.field, state.filters[f.field]); });
      return p;
    }
    function syncUrl() {
      var p = currentParams().toString();
      history.replaceState(null, "", "#/" + id + (p ? "?" + p : ""));
    }
    /* Search haystacks, built once per list view: rebuilding them from
       every field on every keystroke is what made huge lists (Word
       Studies, 14,197 entries) crawl while typing. */
    var haystacks = rows.map(function (r) {
      return Object.keys(r).map(function (k) { return val(r, k); }).join(" ").toLowerCase();
    });
    function filteredRows() {
      var q = state.q.toLowerCase();
      return rows.map(function (r, i) { return { row: r, idx: i }; }).filter(function (item) {
        var r = item.row;
        for (var j = 0; j < filterDefs.length; j++) {
          var f = filterDefs[j], want = state.filters[f.field];
          if (want && splitList(val(r, f.field)).indexOf(want) === -1) return false;
        }
        if (q && haystacks[item.idx].indexOf(q) === -1) return false;
        return true;
      });
    }
    /* Lists render in batches of 100 with a "Show more" button: dumping
       all 14,197 Word Studies cards into the page at once hung the tab
       for minutes (found by the live check of the Strong's publish). */
    var LIST_BATCH = 100;
    function renderGrid() {
      var wrap = document.getElementById("gridWrap");
      if (!wrap) return;
      var filtered = filteredRows();
      if (!filtered.length) {
        wrap.innerHTML = '<p class="empty">Nothing matches. Try clearing the search or filters.</p>';
        return;
      }
      var shown = Math.min(LIST_BATCH, filtered.length);
      var html = '<div class="card-grid" id="listGrid">' + filtered.slice(0, shown).map(function (item) {
        return cardFor(c, item.row, item.idx);
      }).join("") + "</div>";
      if (filtered.length > shown) {
        html += '<p><button class="btn" id="loadMoreBtn">Show more (' + shown + " of " + filtered.length + ")</button></p>";
      }
      wrap.innerHTML = html;
      var btn = document.getElementById("loadMoreBtn");
      if (btn) {
        btn.addEventListener("click", function () {
          var grid = document.getElementById("listGrid");
          if (!grid) return;
          var next = Math.min(shown + LIST_BATCH, filtered.length);
          grid.insertAdjacentHTML("beforeend", filtered.slice(shown, next).map(function (item) {
            return cardFor(c, item.row, item.idx);
          }).join(""));
          shown = next;
          if (shown >= filtered.length) {
            if (btn.parentNode) btn.parentNode.remove();
          } else {
            btn.textContent = "Show more (" + shown + " of " + filtered.length + ")";
          }
        });
      }
    }

    var html = "<h2>" + esc(c.label) + "</h2><p class='page-intro'>" + esc(c.blurb) +
      " &middot; " + rows.length + " entries</p>";
    if (id === "manuscripts") html += '<p><a class="btn" href="#/lookup">Find a manuscript by passage</a> Type a passage to see the earliest manuscripts that preserve it.</p>';
    html += '<div class="controls"><input type="search" id="listSearch" placeholder="Search ' +
      esc(c.label.toLowerCase()) + '…" value="' + esc(state.q) + '">';
    filterDefs.forEach(function (f) {
      html += '<div class="chips"><span class="chip-label">' + esc(f.label) + ":</span>";
      html += '<button class="chip' + (state.filters[f.field] === "" ? " active" : "") +
        '" data-filter="' + esc(f.field) + '" data-value="">All</button>';
      values[f.field].forEach(function (v) {
        var cls = f.field === "FulfillmentStatus" ? statusClass(v) : "chip";
        var active = state.filters[f.field] === v ? " active" : "";
        html += '<button class="' + cls + active + '" data-filter="' + esc(f.field) +
          '" data-value="' + esc(v) + '">' + esc(v) + "</button>";
      });
      html += "</div>";
    });
    html += '</div><div id="gridWrap"></div>';
    app.innerHTML = html;
    renderGrid();
    document.getElementById("listSearch").addEventListener("input", function (e) {
      state.q = e.target.value;
      syncUrl();
      renderGrid();
    });
    app.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter"), v = btn.getAttribute("data-value");
        state.filters[f] = v;
        btn.parentNode.querySelectorAll("[data-filter]").forEach(function (b) {
          b.classList.toggle("active", b.getAttribute("data-value") === v);
        });
        syncUrl();
        renderGrid();
      });
    });
    window.scrollTo(0, 0);
  }
  /* ---------- nature: clickable photo tiles ---------- */
  function viewNature(params) {
    var rows = data.nature || [];
    var cats = ["Bird", "Plant", "Animal"];
    var state = { q: (params.get("q") || ""), cat: (params.get("cat") || "") };
    function tileSrc(r) {
      var s = val(r, "Image");
      if (s && s.charAt(0) === "/") s = s.slice(1);
      return s || "assets/nature/placeholder.svg";
    }
    function renderTiles() {
      var wrap = document.getElementById("natureWrap");
      if (!wrap) return;
      var q = state.q.toLowerCase();
      var shown = rows.map(function (r, i) { return { row: r, idx: i }; }).filter(function (item) {
        var r = item.row;
        if (state.cat && val(r, "Category") !== state.cat) return false;
        if (q) {
          var hay = Object.keys(r).map(function (k) { return val(r, k); }).join(" ").toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
      if (!shown.length) {
        wrap.innerHTML = '<p class="empty">Nothing matches. Try clearing the search or filters.</p>';
      } else {
        wrap.innerHTML = '<div class="nature-grid">' + shown.map(function (item) {
          var r = item.row;
          return '<a class="nature-tile" href="#/nature/' + item.idx + '">' +
            '<img src="' + esc(tileSrc(r)) + '" alt="' + esc(val(r, "Name")) + '" loading="lazy">' +
            '<span class="nature-tile-name">' + esc(val(r, "Name")) + '</span>' +
            '<span class="nature-tile-cat">' + esc(val(r, "Category")) + '</span></a>';
        }).join("") + "</div>";
      }
    }
    function syncUrl() {
      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.cat) p.set("cat", state.cat);
      var s = p.toString();
      history.replaceState(null, "", "#/nature" + (s ? "?" + s : ""));
    }
    var html = "<h2>Nature &amp; Creation</h2><p class='page-intro'>Birds, plants, and animals that point to the Creator — " +
      rows.length + " entries. Tap a tile to open its page.</p>" +
      "<p class='page-intro'><em>Preview: the tile images are placeholders for now. Lorraine's own photos will replace them as she uploads them.</em></p>";
    html += '<div class="controls"><input type="search" id="natureSearch" placeholder="Search nature…" value="' + esc(state.q) + '">';
    html += '<div class="chips"><span class="chip-label">Category:</span>';
    html += '<button class="chip' + (state.cat === "" ? " active" : "") + '" data-cat="">All</button>';
    cats.forEach(function (cat) {
      html += '<button class="chip' + (state.cat === cat ? " active" : "") + '" data-cat="' + cat + '">' + cat + "s</button>";
    });
    html += '</div></div><div id="natureWrap"></div>';
    app.innerHTML = html;
    renderTiles();
    document.getElementById("natureSearch").addEventListener("input", function (e) {
      state.q = e.target.value;
      syncUrl();
      renderTiles();
    });
    app.querySelectorAll("[data-cat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.cat = btn.getAttribute("data-cat");
        btn.parentNode.querySelectorAll("[data-cat]").forEach(function (b) {
          b.classList.toggle("active", b.getAttribute("data-cat") === state.cat);
        });
        syncUrl();
        renderTiles();
      });
    });
    window.scrollTo(0, 0);
  }
  /* ---------- timeline: a real vertical timeline with connections ---------- */
  function viewTimeline(params) {
    var rows = data.timeline || [];
    var state = { q: (params.get("q") || ""), era: (params.get("f_Era") || "") };
    var eras = [];
    rows.forEach(function (r) { var e = val(r, "Era"); if (!isEmpty(e) && eras.indexOf(e) === -1) eras.push(e); });
    function nameMap(collId, primary) {
      var m = {};
      (data[collId] || []).forEach(function (r, i) { var p = val(r, primary); if (!isEmpty(p) && m[p] === undefined) m[p] = i; });
      return m;
    }
    var peopleMap = nameMap("people", "Name");
    var placesMap = nameMap("places", "Name");
    var booksMap = nameMap("books", "Book");
    var findsList = (data.finds || []).map(function (r, i) { return { name: val(r, "FindName"), idx: i }; }).filter(function (f) { return !isEmpty(f.name); });
    var eventsList = (data.stories || []).map(function (r, i) { return { name: val(r, "Story"), idx: i }; }).filter(function (e) { return !isEmpty(e.name); });
    function chips(value, map, collId) {
      return splitList(value).map(function (n) {
        var i = map[n];
        if (i !== undefined) return '<a class="conn-chip" href="#/' + collId + "/" + i + '">' + esc(n) + "</a>";
        return '<span class="conn-plain">' + esc(n) + "</span>";
      }).join("");
    }
    function findMatch(token) {
      var t = token.toLowerCase(), hit = null;
      findsList.forEach(function (f) {
        if (hit) return;
        var name = f.name.toLowerCase();
        if (t.indexOf(name) !== -1) { hit = f; return; }
        var core = name.split(" (")[0];
        if (core !== name && t.indexOf(core) !== -1) { hit = f; return; }
        var words = name.split(" ");
        while (words.length > 1) {
          words.pop();
          var prefix = words.join(" ");
          if (prefix.length >= 10 && t.indexOf(prefix) !== -1) { hit = f; return; }
        }
      });
      return hit;
    }
    function findChips(value) {
      return splitList(value).map(function (t) {
        var hit = findMatch(t);
        if (hit) return '<a class="conn-chip gold" href="#/finds/' + hit.idx + '">' + esc(t) + "</a>";
        return '<span class="conn-plain">' + esc(t) + "</span>";
      }).join("");
    }
    function eventChips(row) {
      var hay = (val(row, "Title") + " " + val(row, "Events")).toLowerCase();
      var seen = {}, out = [];
      eventsList.forEach(function (e) {
        if (e.name.length >= 4 && !seen[e.name] && hay.indexOf(e.name.toLowerCase()) !== -1) {
          seen[e.name] = true;
          out.push('<a class="conn-chip" href="#/stories/' + e.idx + '">' + esc(e.name) + "</a>");
        }
      });
      return out.join("");
    }
    function connGroup(labelText, inner) {
      if (!inner) return "";
      return '<p class="tl-conn"><span class="conn-label">' + labelText + ":</span> " + inner + "</p>";
    }
    function filtered() {
      var q = state.q.toLowerCase();
      return rows.map(function (r, i) { return { row: r, idx: i }; }).filter(function (item) {
        var r = item.row;
        if (state.era && val(r, "Era") !== state.era) return false;
        if (q) {
          var hay = Object.keys(r).map(function (k) { return val(r, k); }).join(" ").toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }
    function renderTl() {
      var wrap = document.getElementById("tlWrap");
      if (!wrap) return;
      var items = filtered();
      if (!items.length) { wrap.innerHTML = '<p class="empty">Nothing matches. Try clearing the search or filters.</p>'; return; }
      var html = '<div class="tl">', lastEra = null;
      items.forEach(function (item) {
        var r = item.row;
        var era = val(r, "Era");
        if (era !== lastEra) { html += '<div class="tl-era">' + esc(era) + "</div>"; lastEra = era; }
        html += '<article class="tl-node">' +
          '<p class="tl-date">' + esc(val(r, "DateApprox")) + "</p>" +
          '<h3><a href="#/timeline/' + item.idx + '">' + esc(val(r, "Title")) + "</a></h3>" +
          (isEmpty(val(r, "Events")) ? "" : '<p class="tl-desc">' + esc(val(r, "Events")) + "</p>") +
          (isEmpty(val(r, "ScriptureReference")) ? "" : '<p class="tl-meta">' + linkifyScriptureRefs(val(r, "ScriptureReference")) + "</p>") +
          connGroup("People", chips(val(r, "KeyPersons"), peopleMap, "people")) +
          connGroup("Places", chips(val(r, "Places"), placesMap, "places")) +
          connGroup("Books", chips(val(r, "BibleBooks"), booksMap, "books")) +
          connGroup("Events", eventChips(r)) +
          connGroup("Archaeology", isEmpty(val(r, "ArchaeologicalFinds")) ? "" : findChips(val(r, "ArchaeologicalFinds"))) +
          "</article>";
      });
      html += "</div>";
      wrap.innerHTML = html;
    }
    function syncUrl() {
      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.era) p.set("f_Era", state.era);
      var s = p.toString();
      history.replaceState(null, "", "#/timeline" + (s ? "?" + s : ""));
    }
    var html = "<h2>Biblical Timeline</h2><p class='page-intro'>The whole story, era by era, from Creation to the Early Church — " +
      "with the people, places, events, and discoveries connected at every step. &middot; " + rows.length + " entries</p>";
    html += '<div class="controls"><input type="search" id="tlSearch" placeholder="Search the timeline…" value="' + esc(state.q) + '">';
    html += '<div class="chips"><span class="chip-label">Era:</span>';
    html += '<button class="chip' + (state.era === "" ? " active" : "") + '" data-era="">All</button>';
    eras.forEach(function (e) {
      html += '<button class="chip' + (state.era === e ? " active" : "") + '" data-era="' + esc(e) + '">' + esc(e) + "</button>";
    });
    html += "</div></div><div id='tlWrap'></div>";
    app.innerHTML = html;
    renderTl();
    document.getElementById("tlSearch").addEventListener("input", function (e) { state.q = e.target.value; syncUrl(); renderTl(); });
    app.querySelectorAll("[data-era]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.era = btn.getAttribute("data-era");
        btn.parentNode.querySelectorAll("[data-era]").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-era") === state.era); });
        syncUrl(); renderTl();
      });
    });
    window.scrollTo(0, 0);
  }
  function navigate(hash, replace) {
    if (replace) history.replaceState(null, "", hash);
    else location.hash = hash;
    render();
  }
  function cardFor(c, row, idx) {
    var title = c.id === "wordstudies"
      ? '<span class="word-script">' + esc(val(row, "Word")) + "</span> &middot; " + esc(val(row, "Transliteration"))
      : esc(val(row, c.primary));
    var badges = "";
    if (c.id === "prophecies") badges = '<span class="' + statusClass(val(row, "FulfillmentStatus")) + '">' + esc(val(row, "FulfillmentStatus")) + "</span> ";
    else if (c.id === "courses") badges = '<span class="badge gold">' + esc(val(row, "Level")) + "</span> ";
    else if (c.id === "typology" || c.id === "fallacies") badges = '<span class="badge">' + esc(val(row, "Category")) + "</span> ";
    else if (c.id === "wordstudies") badges = '<span class="badge">' + esc(val(row, "Language")) + "</span> ";
    else if (c.id === "manuscripts") badges = '<span class="badge">' + esc(val(row, "Completeness")) + "</span> ";
    var meta = (c.meta || []).map(function (f) { return val(row, f); }).filter(function (v) { return !isEmpty(v); }).join(" · ");
    var snip = snippet(row);
    return '<a class="card" href="#/' + c.id + "/" + idx + '">' + badges + "<h3>" + title + "</h3>" +
      (meta ? '<p class="meta">' + esc(meta) + "</p>" : "") +
      (snip ? '<p class="snippet">' + esc(snip) + "</p>" : "") + "</a>";
  }
  function viewDetail(c, idx) {
    var rows = data[c.id] || [];
    var row = rows[idx];
    if (!row) return viewCollection(c.id, null, new URLSearchParams());
    var html = '<a class="back-link" href="#/' + c.id + '">&larr; All ' + esc(c.label) + "</a>";
    if (c.id === "wordstudies") {
      html += "<h2>" + esc(val(row, "Transliteration")) + ' <span class="word-script">' + esc(val(row, "Word")) + "</span></h2>";
    } else {
      html += "<h2>" + esc(val(row, c.primary)) + "</h2>";
    }
    var mapIds = splitList(val(row, "Maps"));
    if (mapIds.length) {
      html += '<div class="map-figures">' + mapIds.map(function (id) {
        var m = maps[id];
        if (!m) return "";
        return '<figure class="map-figure"><img src="' + esc(m.file) + '" alt="' + esc(m.title) + '">' +
          '<figcaption>' + esc(m.title) + " — " + esc(m.credit) +
          ' <a href="' + esc(m.source) + '" target="_blank" rel="noopener">Source</a></figcaption></figure>';
      }).join("") + "</div>";
    }
    var imgSrc = val(row, "Image");
    if (imgSrc) {
      if (imgSrc.charAt(0) === "/") imgSrc = imgSrc.slice(1);
      html += '<figure class="nature-figure"><img src="' + esc(imgSrc) + '" alt="' + esc(val(row, c.primary)) + '">';
      var cap = val(row, "ImageCredit");
      if (cap) {
        html += '<figcaption>' + esc(cap);
        if (val(row, "ImageSource")) html += ' <a href="' + esc(val(row, "ImageSource")) + '" target="_blank" rel="noopener">Source</a>';
        html += '</figcaption>';
      }
      html += '</figure>';
    }
    html += '<div class="detail"><dl>';
    Object.keys(row).forEach(function (field) {
      if (SKIP_FIELDS.indexOf(field) !== -1) return;
      if (VERIF_FIELDS.indexOf(field) !== -1) return;
      if (STUDY_FIELDS.indexOf(field) !== -1 || field === "StudyIntroduction") return;
      var v = val(row, field);
      if (isEmpty(v)) return;
      html += "<dt>" + esc(label(field)) + "</dt><dd>" + renderValue(field, v) + "</dd>";
    });
    html += "</dl>";
    html += verificationBox(row);
    if (STUDY_FIELDS.some(function (f) { return !isEmpty(val(row, f)); })) {
      html += '<div class="study">';
      var intro = val(row, "StudyIntroduction");
      if (intro) html += '<div class="study-intro">' + renderMarkdown(intro) + "</div>";
      html += '<p class="study-controls"><button type="button" class="btn study-expand">Expand all sections</button> ' +
        '<button type="button" class="btn study-collapse">Collapse all sections</button></p>';
      STUDY_FIELDS.forEach(function (f) {
        var v = val(row, f);
        if (isEmpty(v)) return;
        html += '<details class="study-section"><summary>' + esc(STUDY_LABELS[f] || label(f)) + "</summary><div class=\"study-body\">" + renderMarkdown(v) + "</div></details>";
      });
      html += "</div>";
    }
    if (c.id === "courses") {
      var linked = [];
      (data.quizzes || []).forEach(function (q) {
        if (val(q, "Course") === val(row, "Course") && linked.indexOf(val(q, "Quiz")) === -1) linked.push(val(q, "Quiz"));
      });
      if (linked.length) {
        html += "<h3>Quizzes for this course</h3><ul>" + linked.map(function (q) {
          return '<li><a href="#/quizzes/play/' + encodeURIComponent(q) + '">' + esc(q) + "</a></li>";
        }).join("") + "</ul>";
      }
    }
    html += "</div>";
    app.innerHTML = html;
    var study = app.querySelector(".study");
    if (study) {
      var expand = study.querySelector(".study-expand");
      var collapse = study.querySelector(".study-collapse");
      if (expand) expand.addEventListener("click", function () {
        study.querySelectorAll("details.study-section").forEach(function (d) { d.open = true; });
      });
      if (collapse) collapse.addEventListener("click", function () {
        study.querySelectorAll("details.study-section").forEach(function (d) { d.open = false; });
      });
    }
    window.scrollTo(0, 0);
  }

  /* ---------- quizzes ---------- */
  function quizGroups() {
    var groups = [], seen = {};
    (data.quizzes || []).forEach(function (q) {
      var name = val(q, "Quiz");
      if (!seen[name]) { seen[name] = { name: name, course: val(q, "Course"), qs: [] }; groups.push(seen[name]); }
      seen[name].qs.push(q);
    });
    return groups;
  }
  function quizInCategory(g, key) {
    if (!key) return true;
    if (key === "ot") return g.course === "Old Testament Survey";
    if (key === "nt") return g.course === "New Testament Survey";
    if (key === "stories") return / Story Quiz$/.test(g.name);
    if (key === "topics") return !/ Story Quiz$/.test(g.name);
    if (key === "people") return ["Old Testament People Quiz", "New Testament People Quiz", "Women of the Bible Quiz", "Men of the Bible Quiz"].indexOf(g.name) !== -1;
    if (key === "blog") return g.qs.some(function (q) { return (val(q, "ReadingLink") || "").indexOf("#/blog/") === 0; });
    return true;
  }
  function viewQuizList(params) {
    var cat = params.get("category") || "";
    if (cat === "topic") cat = "topics";
    if (["", "ot", "nt", "stories", "topics", "people", "blog"].indexOf(cat) === -1) cat = "";
    var groups = quizGroups();
    var cats = [
      { key: "", label: "All quizzes" },
      { key: "ot", label: "Old Testament" },
      { key: "nt", label: "New Testament" },
      { key: "stories", label: "Bible Stories" },
      { key: "topics", label: "Bible Topics" },
      { key: "people", label: "People of the Bible" },
      { key: "blog", label: "From the Blog" }
    ];
    cats.forEach(function (c) {
      c.count = groups.filter(function (g) { return quizInCategory(g, c.key); }).length;
    });
    var html = "<h2>Quizzes</h2><p class='page-intro'>Test what you've learned — every answer teaches. " +
      (data.quizzes || []).length + " questions across " + groups.length + " quizzes.</p>";
    html += '<div class="controls"><span class="chip-label">Categories:</span>' +
      '<select id="quizCategorySelect">' +
      cats.map(function (c) {
        return '<option value="' + c.key + '"' + (cat === c.key ? " selected" : "") + ">" +
          esc(c.label) + " (" + c.count + ")</option>";
      }).join("") + "</select></div>";
    var shown = groups.filter(function (g) {
      return quizInCategory(g, cat);
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    html += '<div class="card-grid">' + shown.map(function (g) {
      var counts = {};
      g.qs.forEach(function (q) { var d = val(q, "Difficulty"); counts[d] = (counts[d] || 0) + 1; });
      var breakdown = Object.keys(counts).map(function (d) { return d + " " + counts[d]; }).join(" · ");
      return '<a class="card" href="#/quizzes/play/' + encodeURIComponent(g.name) + '"><h3>' + esc(g.name) +
        "</h3><p class='meta'>" + esc(g.course) + "</p><p class='meta'>" + g.qs.length +
        " questions &middot; " + esc(breakdown) + "</p></a>";
    }).join("") + "</div>";
    if (!shown.length) html += '<p class="empty">No quizzes in this category.</p>';
    app.innerHTML = html;
    var sel = document.getElementById("quizCategorySelect");
    if (sel) sel.addEventListener("change", function () {
      navigate(sel.value ? "#/quizzes?category=" + sel.value : "#/quizzes", true);
    });
    window.scrollTo(0, 0);
  }
  function viewQuizPlay(name, params) {
    var group = quizGroups().filter(function (g) { return g.name === name; })[0];
    if (!group) return viewQuizList(params);
    var startDiff = params.get("difficulty") || "";
    if (["", "Easy", "Medium", "Hard"].indexOf(startDiff) === -1) startDiff = "";
    var st = { stage: "start", diff: startDiff, i: 0, correct: 0, wrong: 0 };
    function filteredQs() {
      return st.diff ? group.qs.filter(function (q) { return val(q, "Difficulty") === st.diff; }) : group.qs.slice();
    }
    function diffBreakdown(qs) {
      var counts = {};
      qs.forEach(function (q) { var d = val(q, "Difficulty"); counts[d] = (counts[d] || 0) + 1; });
      return Object.keys(counts).map(function (d) { return d + " " + counts[d]; }).join(" · ");
    }
    function diffChips() {
      return '<div class="chips"><span class="chip-label">Difficulty:</span>' +
        ["", "Easy", "Medium", "Hard"].map(function (d) {
          return '<button class="chip' + (st.diff === d ? " active" : "") + '" data-diff="' + d + '">' + (d || "All") + "</button>";
        }).join("") + "</div>";
    }
    function renderStart() {
      var qs = filteredQs();
      var html = '<a class="back-link" href="#/quizzes">&larr; All quizzes</a><h2>' + esc(group.name) + "</h2>" +
        '<p class="page-intro">Test your Bible knowledge &mdash; every answer teaches. Answer each question and you will see right away whether you got it right, with an explanation from Scripture.</p>' +
        (group.course ? '<p class="meta"><strong>Theme:</strong> ' + esc(group.course) + "</p>" : "") +
        '<p class="meta">' + group.qs.length + " questions &middot; " + esc(diffBreakdown(group.qs)) + "</p>" +
        verificationBox(group.qs[0]) +
        (function () {
          var reading = null;
          group.qs.forEach(function (q) { if (!reading && !isEmpty(val(q, "ReadingLink"))) reading = q; });
          if (!reading) return '<p class="meta">Trivia &mdash; answerable from reading Scripture, no extra reading needed.</p>';
          var rl = val(reading, "ReadingLink");
          var rt = val(reading, "ReadingTitle") || "Read this first";
          var ext = rl.charAt(0) !== "#";
          return '<div class="quiz-reading"><strong>Before you begin &mdash; this quiz draws on reading material.</strong><br>' +
            '<a href="' + esc(rl) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + '>' + esc(rt) + "</a> &mdash; read it first, then come back and begin.</div>";
        })() +
        diffChips();
      if (qs.length) {
        html += '<p class="meta">Playing' + (st.diff ? " " + esc(st.diff) + " questions" : "") + ": " + qs.length + " question" + (qs.length === 1 ? "" : "s") + ".</p>" +
          '<button class="quiz-btn" id="quizBegin">Begin quiz</button>';
      } else {
        html += '<p class="empty">No questions at this difficulty &mdash; choose another difficulty above.</p>';
      }
      app.innerHTML = html;
      app.querySelectorAll("[data-diff]").forEach(function (btn) {
        btn.addEventListener("click", function () { st.diff = btn.getAttribute("data-diff"); renderStart(); });
      });
      var begin = document.getElementById("quizBegin");
      if (begin) begin.addEventListener("click", function () { st.stage = "play"; st.i = 0; st.correct = 0; st.wrong = 0; renderQuestion(); });
      window.scrollTo(0, 0);
    }
    function renderQuestion() {
      var qs = filteredQs();
      var q = qs[st.i];
      var html = '<a class="back-link" href="#/quizzes">&larr; Quit quiz</a><h2>' + esc(group.name) + "</h2>" +
        '<p class="quiz-progress">Question ' + (st.i + 1) + " of " + qs.length + " &middot; Correct: " + st.correct + " &middot; Wrong: " + st.wrong + "</p>" +
        '<div class="question-card"><h3>' + esc(val(q, "Question")) + "</h3>" +
        '<div class="options">' + ["A", "B", "C", "D"].map(function (letter) {
          return '<button class="option-btn" data-letter="' + letter + '"><strong>' + letter + ".</strong> " +
            esc(val(q, "Option" + letter)) + "</button>";
        }).join("") + "</div>" +
        '<div class="explanation" hidden></div>' +
        '<button class="quiz-btn" id="quizNext" hidden>' + (st.i + 1 === qs.length ? "See my grade" : "Next question") + "</button></div>";
      app.innerHTML = html;
      var card = app.querySelector(".question-card");
      var right = val(q, "CorrectAnswer");
      card.querySelectorAll(".option-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var picked = btn.getAttribute("data-letter");
          card.querySelectorAll(".option-btn").forEach(function (b) {
            b.disabled = true;
            if (b.getAttribute("data-letter") === right) b.classList.add("correct");
          });
          var fb = card.querySelector(".explanation");
          var note = (val(q, "ScriptureReference") ? " <em>(" + linkifyScriptureRefs(val(q, "ScriptureReference")) + ")</em>" : "");
          if (picked === right) {
            st.correct++;
            fb.innerHTML = "<strong>Correct!</strong> &mdash; " + esc(val(q, "Explanation")) + note;
          } else {
            st.wrong++;
            btn.classList.add("wrong");
            fb.innerHTML = "<strong>Not quite &mdash; the correct answer is " + esc(right) + ".</strong> &mdash; " + esc(val(q, "Explanation")) + note;
          }
          fb.hidden = false;
          var next = document.getElementById("quizNext");
          next.hidden = false;
          next.addEventListener("click", function () {
            st.i++;
            if (st.i < qs.length) renderQuestion(); else renderGrade();
          });
          var prog = app.querySelector(".quiz-progress");
          if (prog) prog.textContent = "Question " + (st.i + 1) + " of " + qs.length + " · Correct: " + st.correct + " · Wrong: " + st.wrong;
        });
      });
      window.scrollTo(0, 0);
    }
    function renderGrade() {
      var qs = filteredQs();
      var total = qs.length;
      var pct = total ? Math.round(st.correct / total * 100) : 0;
      var msg = pct === 100 ? "Perfect score &mdash; excellent Bible knowledge!" :
        pct >= 70 ? "Well done &mdash; strong Bible knowledge!" :
        pct >= 40 ? "Good effort &mdash; read back over the explanations and try again!" :
        "Keep studying &mdash; every answer teaches. Try again!";
      app.innerHTML = '<a class="back-link" href="#/quizzes">&larr; All quizzes</a><h2>' + esc(group.name) + "</h2>" +
        '<div class="quiz-grade"><p class="grade-big">You got ' + st.correct + " right and " + st.wrong + " wrong out of " + total + ".</p>" +
        '<p class="grade-pct">' + pct + "% correct</p><p>" + msg + "</p></div>" +
        '<button class="quiz-btn" id="quizRetake">Retake quiz</button> ' +
        '<a class="quiz-btn quiz-btn-link" href="#/quizzes">Back to all quizzes</a>';
      document.getElementById("quizRetake").addEventListener("click", function () { st.stage = "start"; st.i = 0; st.correct = 0; st.wrong = 0; renderStart(); });
      window.scrollTo(0, 0);
    }
    renderStart();
  }

  /* ---------- home / explore / blog / about / search ---------- */
  /* Line art Lorraine creates herself, one per collection tile and one per
     blog post. Add the file under assets/lineart/ and list it here; the
     tile/post shows it automatically. Empty until her art arrives. */
  var TILE_ART = { timeline: "assets/lineart/timeline.png", people: "assets/lineart/people.png?v=2", books: "assets/lineart/books.png", finds: "assets/lineart/finds.jpg?v=3", places: "assets/lineart/places.jpg", topics: "assets/lineart/topics.jpg", hymns: "assets/lineart/hymns.jpg", wordstudies: "assets/lineart/wordstudies.jpg", jewishculture: "assets/lineart/jewishculture.jpg", socialmedia: "assets/lineart/socialmedia.jpg", nature: "assets/lineart/nature.jpg", civilizations: "assets/lineart/civilizations.jpg", manuscripts: "assets/lineart/manuscripts.jpg", stories: "assets/lineart/stories.jpg" };
  var POST_ART = { "do-animals-go-to-heaven": "assets/lineart/do-animals-go-to-heaven.jpg", "christianity-invites-testing-because-its-true": "assets/lineart/christianity-invites-testing-because-its-true.jpg", "how-to-study-the-bible": "assets/lineart/how-to-study-the-bible.jpg", "why-hope-anchored-in-christ": "assets/lineart/why-hope-anchored-in-christ.jpg" };
  /* Blog post teaser cards, in the style of the mockup's bottom row:
     image on the left when post art exists, label + title + excerpt +
     "Read the Post" arrow on the right. Excerpts fill in from each post's
     first paragraph once its file loads; cards read fine without them. */
  function postRowCard(p, label) {
    var art = POST_ART[p.slug] ? "<img class='post-row-art' src='" + esc(POST_ART[p.slug]) + "' alt=''>" : "";
    var cardLabel = label || (p.series ? "Series: " + p.series + (p.part ? " · Part " + p.part : "") : (p.category || "From the blog"));
    return '<a class="post-row-card" href="#/blog/' + esc(p.slug) + '">' + art + "<div class='post-row-body'>" +
      '<span class="post-row-label">' + esc(cardLabel) + "</span>" +
      "<h3>" + esc(p.title) + "</h3>" +
      '<p class="post-row-excerpt" data-excerpt-for="' + esc(p.slug) + '"></p>' +
      '<p class="post-row-meta">' + esc(shortDate(p.date)) + (p.scripture ? " &middot; " + esc(p.scripture) : "") + "</p>" +
      '<span class="post-row-more">Read the Post &rarr;</span></div></a>';
  }
  function loadExcerpts() {
    posts.forEach(function (p) {
      var el = document.querySelector('[data-excerpt-for="' + p.slug + '"]');
      if (!el) return;
      fetch(p.raw || (p.file + "?v=" + ASSET_V), { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(p.file); return r.text(); }).then(function (text) {
        var body = text.replace(/^---[\s\S]*?---\s*/, "");
        var para = body.split(/\n\s*\n/).filter(function (chunk) { return chunk.trim() && chunk.trim().charAt(0) !== "#"; })[0] || "";
        var clean = para.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_]+/g, "").replace(/\s+/g, " ").trim();
        if (clean.length > 180) clean = clean.slice(0, 180).replace(/\s+\S*$/, "") + "…";
        if (clean && document.body.contains(el)) el.textContent = clean;
      }).catch(function () { /* excerpt stays empty; the card still reads fine */ });
    });
  }
  function collectionCard(c) {
    var n = c.id === "quizzes" ? quizGroups().length : (data[c.id] || []).length;
    var blurb = c.blurb;
    (explorePage.blurbs || []).forEach(function (b) { if (b.collection === c.id && b.blurb) blurb = b.blurb; });
    var art = TILE_ART[c.id] ? "<img class='card-art' src='" + esc(TILE_ART[c.id]) + "' alt=''>" : "";
    return '<a class="card" href="#/' + c.id + '">' + art + "<h3>" + esc(c.label) + "</h3>" +
      '<p class="meta">' + n + " entries</p><p class='snippet'>" + esc(blurb) + "</p></a>";
  }
  function viewHome() {
    var total = COLLECTIONS.reduce(function (sum, c) { return sum + (data[c.id] || []).length; }, 0);
    var latest = posts[0];
    var html = "<h2>Welcome to Hope Anchored in Christ</h2>" +
      "<p class='page-intro'>The whole Bible is one anchored story. Walk the timeline, meet the people, " +
      "visit the places, touch the archaeology, and explore all 66 books — every post pointing back to " +
      "Jesus Christ, the same yesterday and today and forever (Hebrews 13:8).</p>" +
      '<div class="stats">' +
      '<div class="stat"><strong>' + COLLECTIONS.length + "</strong><span>collections</span></div>" +
      '<div class="stat"><strong>' + total + "</strong><span>entries</span></div>" +
      '<div class="stat"><strong>' + (data.books || []).length + "</strong><span>books of the Bible</span></div>" +
      '<div class="stat"><strong>' + quizGroups().length + "</strong><span>quizzes</span></div></div>" +
      '<div class="verse-band">&ldquo;We have this hope as an anchor for the soul, firm and secure. ' +
      "It enters the inner sanctuary behind the curtain, where our forerunner, Jesus, has entered on our behalf.&rdquo; " +
      "&mdash; Hebrews 6:19&ndash;20</div>";
    if (latest) {
      html += "<h3>Latest from the blog</h3>" + postRowCard(latest, "Latest blog post");
    }
    html += "<h3>Explore the collections</h3><div class='card-grid home-grid'>" +
      COLLECTIONS.map(collectionCard).join("") + "</div>";
    html += "<h3>More to explore</h3><p class='page-intro'>Pages beyond the collections — readers, tools, and ways to support the ministry.</p>" +
      "<p>" + [["#/bible", "Bible"], ["#/blog", "Blog"], ["#/art", "Art Gallery"],
      ["#/storybook", "Storybook Reader"], ["#/genealogy", "Biblical Genealogies"],
      ["#/lookup", "Manuscript Lookup"], ["#/store", "Store"], ["#/give", "Give"],
      ["#/connect", "Connect"]].map(function (l) { return "<a class='btn' href='" + l[0] + "'>" + l[1] + "</a>"; }).join(" ") + "</p>";
    app.innerHTML = html;
    /* Animated home: stat numbers count up on load (instant under
       reduced-motion, where the final values simply stay put). */
    (function () {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      app.querySelectorAll(".stat strong").forEach(function (el) {
        var target = parseInt(el.textContent.replace(/[^0-9]/g, ""), 10);
        if (isNaN(target)) return;
        var start = null, dur = 1200;
        el.textContent = "0";
        (function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    })();
    loadExcerpts();
    window.scrollTo(0, 0);
  }
  /* ---------- art gallery ---------- */
  /* Gallery items (content/gallery.json) share one shape: Title, Image,
     Kind ("Art", "Verse Card" or "Other"), Verse, VerseRef, Description,
     ForSale, Price, BuyLink. New art arrives through chat; a piece with a
     BuyLink sells from its own checkout, a piece marked ForSale without
     one points at the store until its product link exists. */
  function viewGallery() {
    var state = { kind: "" };
    function cardHTML(it) {
      var card = "<div class='card store-card'>";
      if (it.Image) card += "<img src='" + esc(it.Image) + "' alt='" + esc(it.Title || "") + "'>";
      card += "<h3>" + esc(it.Title || "Untitled") + "</h3>";
      if (it.Kind) card += "<p><span class='chip'>" + esc(it.Kind) + "</span></p>";
      if (it.Verse) card += "<blockquote>" + esc(it.Verse) + (it.VerseRef ? "<br><cite>" + esc(it.VerseRef) + "</cite>" : "") + "</blockquote>";
      if (it.Description) card += "<p class='snippet'>" + esc(it.Description) + "</p>";
      if (it.BuyLink) {
        card += "<p>" + (it.Price ? "<span class='price'>" + esc(it.Price) + "</span> " : "") + "<a class='buy-btn' href='" + esc(it.BuyLink) + "' target='_blank' rel='noopener'>Buy</a></p>";
      } else if (it.ForSale) {
        card += "<p><a class='btn' href='#/store'>View in Store</a></p>";
      }
      card += "</div>";
      return card;
    }
    function renderGrid() {
      var wrap = document.getElementById("galleryGrid");
      if (!wrap) return;
      if (!galleryItems.length) {
        wrap.innerHTML = "<p class='empty'>The art page is coming soon — new art, verse cards, and other pieces will appear here as they are added.</p>";
        return;
      }
      var items = galleryItems.filter(function (it) {
        return !state.kind || it.Kind === state.kind;
      });
      if (!items.length) {
        wrap.innerHTML = "<p class='empty'>No pieces in this category yet.</p>";
        return;
      }
      wrap.innerHTML = "<div class='card-grid'>" + items.map(cardHTML).join("") + "</div>";
    }
    var html = '<a class="back-link" href="#/explore">&larr; Explore</a><h2>Art</h2>' +
      "<p class='page-intro'>Art, verse cards, and other pieces — displayed here, and connected to the store where they can be bought.</p>" +
      '<div class="controls"><div class="chips"><span class="chip-label">Show:</span>' +
      '<button class="chip active" data-kind="">All</button>' +
      '<button class="chip" data-kind="Art">Art</button>' +
      '<button class="chip" data-kind="Verse Card">Verse Cards</button>' +
      '<button class="chip" data-kind="Other">Other</button></div></div>' +
      '<div id="galleryGrid"></div>';
    app.innerHTML = html;
    renderGrid();
    app.querySelectorAll("[data-kind]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.kind = btn.getAttribute("data-kind");
        btn.parentNode.querySelectorAll("[data-kind]").forEach(function (b) {
          b.classList.toggle("active", b.getAttribute("data-kind") === state.kind);
        });
        renderGrid();
      });
    });
    window.scrollTo(0, 0);
  }
  /* ---------- Biblical Genealogies ---------- */
  /* Biblical Genealogies (content/genealogy.json): typed parent/child/spouse
     edges taken from the Bible's own genealogy passages (Genesis 5,
     10, 11, 36; Exodus 6; Ruth 4; Matthew 1; Luke 3; 1 Chronicles 1-9).
     Nodes are keyed on (name, father), never on name alone, so
     same-name men stay separate; Matthew and Luke's lines after David
     are kept fully separate, never harmonized. Where a passage is
     ambiguous the node carries a note saying so — nothing is guessed.
     Like storybook/gallery this is app-only: no collection, no static
     pages, no sitemap change. */
  function viewGenealogy(nameParam, params) {
    var G = genealogyData || { nodes: [], edges: [] };
    var nodes = G.nodes || [], edges = G.edges || [];
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });
    var nameCounts = {};
    nodes.forEach(function (n) { nameCounts[n.name] = (nameCounts[n.name] || 0) + 1; });
    function genHref(n) {
      var base = "#/genealogy/" + encodeURIComponent(n.name);
      return nameCounts[n.name] > 1 ? base + "?id=" + encodeURIComponent(n.id) : base;
    }
    function nameHTML(n) {
      return esc(n.name) + (n.context ? ' <span class="gen-context">' + esc(n.context) + "</span>" : "");
    }
    /* A name in a relationship list: profiled names link to their
       profile; unprofiled names stay plain text with their scripture
       refs, as the tree brief requires. (No tree shortcut link: removed
       at Lorraine's request, Oct 2026 — the name link alone remains.) */
    function relNameHTML(n) {
      if (n.profileIndex !== null && n.profileIndex !== undefined) {
        return '<a href="#/people/' + n.profileIndex + '">' + esc(n.name) + "</a>";
      }
      return esc(n.name);
    }
    function refsHTML(refs) {
      if (!refs || !refs.length) return "";
      return ' <span class="gen-refs">' + linkifyScriptureRefs(refs.join("; ")) + "</span>";
    }
    function mergeRefs(list) {
      var out = [];
      list.forEach(function (r) { if (out.indexOf(r) === -1) out.push(r); });
      return out;
    }
    function relations(id) {
      var fathers = {}, mothers = {}, spouses = {}, children = {};
      edges.forEach(function (e) {
        if (e.child === id) {
          if (e.father) fathers[e.father] = mergeRefs((fathers[e.father] || []).concat(e.refs || []));
          if (e.mother) mothers[e.mother] = mergeRefs((mothers[e.mother] || []).concat(e.refs || []));
          (e.spouses || []).forEach(function (s) {
            spouses[s] = mergeRefs((spouses[s] || []).concat(e.refs || []));
          });
        }
        /* Spousehood is symmetric: an edge naming this person among a
           child's spouses makes the child this person's spouse. Without
           this, a spouse who is never anyone's child (Eve, Sarai, Milcah
           and the rest) showed no spouse while their husband did. */
        (e.spouses || []).forEach(function (s) {
          if (s === id) spouses[e.child] = mergeRefs((spouses[e.child] || []).concat(e.refs || []));
        });
        if (e.father === id || e.mother === id) {
          children[e.child] = mergeRefs((children[e.child] || []).concat(e.refs || []));
        }
      });
      return { fathers: fathers, mothers: mothers, spouses: spouses, children: children };
    }
    function relListHTML(map) {
      var ids = Object.keys(map);
      if (!ids.length) return "";
      return '<ul class="gen-rel-list">' + ids.map(function (pid) {
        var n = byId[pid];
        if (!n) return "";
        return "<li>" + relNameHTML(n) + refsHTML(map[pid]) + "</li>";
      }).join("") + "</ul>";
    }
    function chainHTML(node) {
      var chain = [node], cur = node, guard = 0, seen = {};
      seen[node.id] = true;
      while (guard++ < 12) {
        var rel = relations(cur.id);
        var parentId = Object.keys(rel.fathers)[0] || Object.keys(rel.mothers)[0];
        if (!parentId || !byId[parentId] || seen[parentId]) break;
        seen[parentId] = true;
        cur = byId[parentId];
        chain.unshift(cur);
      }
      if (chain.length < 2) return "<p>No ancestors are named for this person in the genealogy passages.</p>";
      return '<p class="gen-chain">' + chain.map(function (n) {
        return '<a href="' + genHref(n) + '">' + esc(n.name) + "</a>";
      }).join(" &rsaquo; ") + "</p>" +
        "<p class='gen-chain-note'>Oldest ancestor first, following fathers (or mothers where no father is stated) as far as the passages go — the chain stops honestly where parentage is unstated.</p>";
    }
    /* Extended family, computed from the edges at runtime: siblings share
       a parent; grandparents are parents of parents; aunts/uncles are
       siblings of parents; nieces/nephews are children of siblings;
       cousins are children of aunts/uncles; grandchildren are children
       of children. Closest relationship wins: the person, their parents,
       children, and siblings are never repeated in a further-out section.
       A section renders only where the connection genuinely exists. */
    function familyMaps(node) {
      var parentSet = {}, childSet = {};
      edges.forEach(function (e) {
        if (e.child === node.id) {
          if (e.father) parentSet[e.father] = true;
          if (e.mother) parentSet[e.mother] = true;
        }
        if (e.father === node.id || e.mother === node.id) childSet[e.child] = true;
      });
      function kidsOf(pid) {
        var m = {};
        edges.forEach(function (e) {
          if (e.father === pid || e.mother === pid) m[e.child] = mergeRefs((m[e.child] || []).concat(e.refs || []));
        });
        return m;
      }
      function parentsOf(id) {
        var m = {};
        edges.forEach(function (e) {
          if (e.child === id) {
            if (e.father) m[e.father] = mergeRefs((m[e.father] || []).concat(e.refs || []));
            if (e.mother) m[e.mother] = mergeRefs((m[e.mother] || []).concat(e.refs || []));
          }
        });
        return m;
      }
      function absorb(into, from) {
        Object.keys(from).forEach(function (k) {
          into[k] = mergeRefs((into[k] || []).concat(from[k]));
        });
      }
      var sibs = {}, grandkids = {}, grandps = {}, aunts = {}, nieces = {}, cousins = {};
      Object.keys(parentSet).forEach(function (pid) {
        absorb(sibs, kidsOf(pid));
        absorb(grandps, parentsOf(pid));
      });
      delete sibs[node.id];
      Object.keys(childSet).forEach(function (c) { absorb(grandkids, kidsOf(c)); });
      Object.keys(grandps).forEach(function (gid) {
        var gk = kidsOf(gid);
        Object.keys(gk).forEach(function (c) {
          if (!parentSet[c]) aunts[c] = mergeRefs((aunts[c] || []).concat(gk[c]));
        });
      });
      Object.keys(sibs).forEach(function (s) { absorb(nieces, kidsOf(s)); });
      Object.keys(aunts).forEach(function (a) { absorb(cousins, kidsOf(a)); });
      [grandkids, grandps, aunts, nieces, cousins].forEach(function (m) { delete m[node.id]; });
      Object.keys(parentSet).forEach(function (p) {
        delete grandkids[p]; delete aunts[p]; delete nieces[p]; delete cousins[p];
      });
      Object.keys(childSet).forEach(function (c) {
        delete nieces[c]; delete cousins[c]; delete aunts[c];
      });
      Object.keys(sibs).forEach(function (s) { delete cousins[s]; });
      return { siblings: sibs, grandchildren: grandkids, grandparents: grandps,
               aunts: aunts, nieces: nieces, cousins: cousins };
    }
    function panelHTML(node) {
      var rel = relations(node.id);
      var fam = familyMaps(node);
      var html = '<div class="gen-panel"><h2>' + esc(node.name) + "</h2>";
      if (node.context) html += "<p class='gen-context'>" + esc(node.context) + "</p>";
      if (node.alt && node.alt.length) html += "<p class='gen-context'>Also spelled: " + node.alt.map(esc).join(", ") + "</p>";
      if (node.profileIndex !== null && node.profileIndex !== undefined) {
        html += "<p><a class='btn' href='#/people/" + node.profileIndex + "'>View full profile &rarr;</a></p>";
      }
      if (node.note) html += "<p class='gen-note'>" + esc(node.note) + "</p>";
      html += "<h3>Parents</h3>";
      var parents = relListHTML(rel.fathers) + relListHTML(rel.mothers);
      html += parents || "<p>No human parents are named for this person in the genealogy passages.</p>";
      var sib = relListHTML(fam.siblings);
      if (sib) html += "<h3>Siblings</h3>" + sib;
      html += "<h3>Spouse(s)</h3>";
      html += relListHTML(rel.spouses) || "<p>No spouse is named for this person in the genealogy passages.</p>";
      html += "<h3>Children</h3>";
      html += relListHTML(rel.children) || "<p>No children are named for this person in the genealogy passages.</p>";
      var gk = relListHTML(fam.grandchildren);
      if (gk) html += "<h3>Grandchildren</h3>" + gk;
      var gp = relListHTML(fam.grandparents);
      if (gp) html += "<h3>Grandparents</h3>" + gp;
      var au = relListHTML(fam.aunts);
      if (au) html += "<h3>Aunts &amp; Uncles</h3>" + au;
      var nn = relListHTML(fam.nieces);
      if (nn) html += "<h3>Nieces &amp; Nephews</h3>" + nn;
      var co = relListHTML(fam.cousins);
      if (co) html += "<h3>Cousins</h3>" + co;
      html += "<h3>Ancestor chain</h3>" + chainHTML(node);
      html += "</div>";
      return html;
    }
    function searchHTML() {
      return '<div class="controls"><input type="search" id="genSearch" placeholder="Search Biblical Genealogies — try Adam, Abraham, David, or Jesus…" aria-label="Search Biblical Genealogies"></div>' +
        '<div id="genResults"></div>';
    }
    function startPointsHTML() {
      var wanted = ["Adam", "Abraham", "King David", "Jesus"];
      var people = data.people || [];
      var items = [];
      wanted.forEach(function (w) {
        var pi = -1;
        for (var i = 0; i < people.length; i++) if (people[i].Name === w) { pi = i; break; }
        if (pi === -1) return;
        var node = null;
        for (var j = 0; j < nodes.length; j++) if (nodes[j].profileIndex === pi) { node = nodes[j]; break; }
        if (node) items.push('<li><a href="' + genHref(node) + '">' + esc(w) + "</a></li>");
      });
      if (!items.length) return "";
      return "<h3>Start with</h3><ul class='gen-rel-list'>" + items.join("") + "</ul>";
    }
    /* Full index: the landing page lists EVERYONE in the genealogies,
       alphabetically, in batches of 100 — not just the four starting
       points — with an A–Z bar so a name can be jumped to instead of
       scrolled to. One delegated click handler covers the letter chips
       and the Show more button, so re-renders never lose the bindings. */
    var genAllSorted = [];
    var genAllLetter = "";
    var genAllShown = 100;
    function genAllFiltered() {
      if (!genAllLetter) return genAllSorted;
      return genAllSorted.filter(function (n) { return n.name.charAt(0).toUpperCase() === genAllLetter; });
    }
    function genAllItem(n) {
      return "<li><a href='" + genHref(n) + "'>" + nameHTML(n) + "</a></li>";
    }
    function genAllListHTML(list) {
      if (!list.length) return "<p class='empty'>No one in Biblical Genealogies starts with " + esc(genAllLetter) + ".</p>";
      return "<ul class='gen-rel-list' id='genAllList'>" + list.slice(0, genAllShown).map(genAllItem).join("") + "</ul>";
    }
    function genAllMoreHTML(total) {
      if (total <= genAllShown) return "";
      return '<p><button class="btn" id="genAllMore">Show more (' + genAllShown + " of " + total + ')</button></p>';
    }
    function markActiveLetter() {
      var bar = document.getElementById("genLetters");
      if (!bar || !bar.querySelectorAll) return;
      var chips = bar.querySelectorAll(".gen-letter");
      for (var i = 0; i < chips.length; i++) {
        var on = chips[i].getAttribute && chips[i].getAttribute("data-letter") === genAllLetter;
        if (chips[i].classList) { if (on) chips[i].classList.add("active"); else chips[i].classList.remove("active"); }
      }
    }
    function renderGenAllList() {
      var list = genAllFiltered();
      var wrap = document.getElementById("genAllWrap");
      if (!wrap) return;
      wrap.innerHTML = genAllListHTML(list) + genAllMoreHTML(list.length);
      markActiveLetter();
    }
    function allNamesHTML() {
      genAllSorted = nodes.slice().sort(function (a, b) {
        var an = a.name.toLowerCase(), bn = b.name.toLowerCase();
        return an < bn ? -1 : (an > bn ? 1 : 0);
      });
      genAllLetter = "";
      genAllShown = 100;
      var chips = '<button class="chip gen-letter active" data-letter="">All</button>' +
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(function (L) {
          return '<button class="chip gen-letter" data-letter="' + L + '">' + L + "</button>";
        }).join("");
      var list = genAllFiltered();
      return "<h3>Everyone in the genealogies (" + genAllSorted.length + " people)</h3>" +
        '<div id="genAllSection"><div class="chips" id="genLetters">' + chips + "</div>" +
        '<div id="genAllWrap">' + genAllListHTML(list) + genAllMoreHTML(list.length) + "</div></div>";
    }
    function bindAllNames() {
      var section = document.getElementById("genAllSection");
      if (!section) return;
      section.addEventListener("click", function (e) {
        var t = (e && e.target) || {};
        var letter = (t.getAttribute) ? t.getAttribute("data-letter") : null;
        if (letter !== null) {
          genAllLetter = letter;
          genAllShown = 100;
          renderGenAllList();
          return;
        }
        if (t.id === "genAllMore") {
          var list = genAllFiltered();
          var ul = document.getElementById("genAllList");
          if (!ul) return;
          var next = Math.min(genAllShown + 100, list.length);
          var frag = "";
          for (var i = genAllShown; i < next; i++) frag += genAllItem(list[i]);
          ul.insertAdjacentHTML("beforeend", frag);
          genAllShown = next;
          var btn = document.getElementById("genAllMore");
          if (!btn) return;
          if (genAllShown >= list.length) {
            if (btn.parentNode) btn.parentNode.remove();
          } else {
            btn.textContent = "Show more (" + genAllShown + " of " + list.length + ")";
          }
        }
      });
    }
    function bindSearch() {
      var input = document.getElementById("genSearch");
      var wrap = document.getElementById("genResults");
      if (!input || !wrap) return;
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        if (!q) { wrap.innerHTML = ""; return; }
        /* Finding a person must work by profile name too: tree nodes are
           often bare ("David") while profiles are titled ("King David").
           Exact matches rank first, then names starting with the query,
           then names merely containing it. */
        function profName(n) {
          if (n.profileIndex === null || n.profileIndex === undefined) return "";
          var p = (data.people || [])[n.profileIndex];
          return p ? (p.Name || "").toLowerCase() : "";
        }
        function rank(n) {
          var nm = n.name.toLowerCase(), pf = profName(n);
          if (nm === q || pf === q) return 0;
          if (nm.indexOf(q) === 0 || (pf && pf.indexOf(q) === 0)) return 1;
          return 2;
        }
        var hits = nodes.filter(function (n) {
          return n.name.toLowerCase().indexOf(q) !== -1 ||
            profName(n).indexOf(q) !== -1 ||
            (n.alt || []).some(function (a) { return a.toLowerCase().indexOf(q) !== -1; }) ||
            (n.context || "").toLowerCase().indexOf(q) !== -1;
        }).sort(function (a, b) { return rank(a) - rank(b); }).slice(0, 60);
        if (!hits.length) { wrap.innerHTML = "<p class='empty'>No one in Biblical Genealogies matches that name.</p>"; return; }
        wrap.innerHTML = "<ul class='gen-results'>" + hits.map(function (n) {
          var prof = (n.profileIndex !== null && n.profileIndex !== undefined)
            ? ' <a href="#/people/' + n.profileIndex + '">profile</a>' : "";
          return "<li><a href='" + genHref(n) + "'>" + nameHTML(n) + "</a>" + prof + "</li>";
        }).join("") + "</ul>";
      });
    }
    var html = '<a class="back-link" href="#/explore">&larr; Explore</a><h2>Biblical Genealogies</h2>' +
      "<p class='page-intro'>Every parent, child, and spouse named in the Bible's genealogy passages — Genesis 5, 10, 11, 36; Exodus 6; Ruth 4; Matthew 1; Luke 3; 1 Chronicles 1–9 — linked to their profiles and to the passages themselves. Where the text leaves a link unstated or debated, the genealogy says so instead of guessing.</p>";
    if (!nodes.length) {
      html += "<p class='empty'>The Biblical Genealogies data is not available right now.</p>";
      app.innerHTML = html;
      window.scrollTo(0, 0);
      return;
    }
    html += searchHTML();
    if (!nameParam) {
      html += startPointsHTML();
      html += genModeToggleSectionHTML();
      html += allNamesHTML();
      app.innerHTML = html;
      bindSearch();
      genBindInteractive(null);
      bindAllNames();
      window.scrollTo(0, 0);
      return;
    }
    var node = null;
    var idParam = params ? params.get("id") : null;
    if (idParam && byId[idParam]) {
      node = byId[idParam];
    } else {
      var matches = nodes.filter(function (n) {
        return n.name === nameParam || (n.alt || []).indexOf(nameParam) !== -1;
      });
      if (matches.length === 1) {
        node = matches[0];
      } else if (matches.length > 1) {
        html += "<h3>Which " + esc(nameParam) + "?</h3><p>Several people in the tree share this name — pick the one you mean:</p>" +
          "<ul class='gen-results'>" + matches.map(function (n) {
            var rel = relations(n.id);
            var fatherId = Object.keys(rel.fathers)[0];
            var fatherTxt = fatherId && byId[fatherId] ? " — child of " + esc(byId[fatherId].name) : "";
            return "<li><a href='" + genHref(n) + "'>" + nameHTML(n) + "</a>" + fatherTxt + "</li>";
          }).join("") + "</ul>";
        app.innerHTML = html;
        bindSearch();
        window.scrollTo(0, 0);
        return;
      }
    }
    if (!node) {
      html += "<p class='empty'>No one named “" + esc(nameParam) + "” is in Biblical Genealogies.</p>";
      app.innerHTML = html;
      bindSearch();
      window.scrollTo(0, 0);
      return;
    }
    html += panelHTML(node);
    html += genInteractiveHTML(node);
    app.innerHTML = html;
    bindSearch();
    genBindInteractive(node);
    window.scrollTo(0, 0);
  }
/* =====================================================================
   GENEALOGY INTERACTIVE PATCH — Tree diagram + Timeline view, toggle
   ---------------------------------------------------------------------
   PASTE INSIDE the app.js IIFE, immediately after viewGenealogy
   (anchor: the "storybook reader" section comment). See INTEGRATION.md.

   Self-contained: it rebuilds its own node/relation lookups from
   genealogyData and never depends on viewGenealogy's inner helpers.
   It DOES reuse these IIFE-scope globals (they already exist there):
     esc, linkifyScriptureRefs, genealogyData, data, app.
   No framework, no new dependencies, no data changes.

   HONESTY RULES baked in:
   - genealogy.json has NO years. The timeline counts GENERATIONS only.
   - Spouse boxes appear only where the person's own record names a
     spouse (only 6 edges in the whole file carry spouses at all).
   - Children are grouped by the co-parent named on each child's own
     record. A co-parent is NOT automatically called a spouse: the
     group header says "(named as spouse)" only when that co-parent
     is also in the person's own spouse list; otherwise the header
     says so plainly. Children with no co-parent named sit in an
     "Other parent not named" group — never assigned to a spouse.
   - Ancestor rows use the FIRST named father and FIRST named mother;
     any further parents named in parallel records are listed in a
     footnote with their refs, never silently dropped or merged.
   - Unmapped nodes (profileIndex null) never link to a profile: the
     name is plain text and the node's refs are shown on the box.
   ===================================================================== */

/* Toggle + depth + collapse state. Lives in IIFE scope, so it
   survives hash navigation (the script is not reloaded); the mode
   therefore persists when the user opens another person's panel,
   while the tree centre resets to the panel person on every full
   render (see genInteractiveHTML). */
var genTreeState = { mode: "tree", ancDepth: 2, descDepth: 2, collapsed: {} };

/* ---------- shared lookups (mirrors of viewGenealogy's helpers) --- */
function genTreeLookups() {
  var G = genealogyData || { nodes: [], edges: [] };
  var nodes = G.nodes || [], edges = G.edges || [];
  var byId = {};
  nodes.forEach(function (n) { byId[n.id] = n; });
  var nameCounts = {};
  nodes.forEach(function (n) { nameCounts[n.name] = (nameCounts[n.name] || 0) + 1; });
  function href(n) {
    var base = "#/genealogy/" + encodeURIComponent(n.name);
    return nameCounts[n.name] > 1 ? base + "?id=" + encodeURIComponent(n.id) : base;
  }
  function mergeRefs(list) {
    var out = [];
    list.forEach(function (r) { if (out.indexOf(r) === -1) out.push(r); });
    return out;
  }
  /* Relations for one node id, refs merged across parallel edges
     (30 children in the data carry more than one edge). */
  function relations(id) {
    var fathers = {}, mothers = {}, spouses = {}, children = {};
    edges.forEach(function (e) {
      if (e.child === id) {
        if (e.father) fathers[e.father] = mergeRefs((fathers[e.father] || []).concat(e.refs || []));
        if (e.mother) mothers[e.mother] = mergeRefs((mothers[e.mother] || []).concat(e.refs || []));
        (e.spouses || []).forEach(function (s) {
          spouses[s] = mergeRefs((spouses[s] || []).concat(e.refs || []));
        });
      }
      if (e.father === id || e.mother === id) children[e.child] = true;
    });
    return { fathers: fathers, mothers: mothers, spouses: spouses, children: children };
  }
  /* Children of one person, grouped by the co-parent named on each
     child's own record (null = no co-parent named). A child named on
     parallel edges appears once per distinct co-parent. */
  function childGroups(id) {
    var groups = {}, order = [];
    edges.forEach(function (e) {
      if (e.father !== id && e.mother !== id) return;
      var co = (e.father === id) ? (e.mother || null) : (e.father || null);
      var key = co === null ? "__none__" : co;
      if (!groups[key]) { groups[key] = { coParent: co, children: [] }; order.push(key); }
      if (groups[key].children.indexOf(e.child) === -1) groups[key].children.push(e.child);
    });
    return order.map(function (k) { return groups[k]; });
  }
  /* Refs for the edge(s) joining parent -> child, merged. */
  function edgeRefs(parentId, childId) {
    var out = [];
    edges.forEach(function (e) {
      if (e.child === childId && (e.father === parentId || e.mother === parentId)) {
        out = mergeRefs(out.concat(e.refs || []));
      }
    });
    return out;
  }
  return { nodes: nodes, edges: edges, byId: byId, href: href, relations: relations, childGroups: childGroups, edgeRefs: edgeRefs };
}

function genTrunc(s, n) {
  s = String(s == null ? "" : s);
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function genRefsHTML(refs) {
  if (!refs || !refs.length) return "";
  return ' <span class="gen-refs">' + linkifyScriptureRefs(refs.join("; ")) + "</span>";
}
/* Name inside the tree/timeline: profiled names link to their
   profile; unmapped names stay plain text (never a guessed link). */
function genTreeNameHTML(L, n) {
  if (n.profileIndex !== null && n.profileIndex !== undefined) {
    return '<a href="#/people/' + n.profileIndex + '">' + esc(n.name) + "</a>";
  }
  return esc(n.name);
}

/* ---------- tree layout (plain SVG, no libraries) ------------------ */
/* Box geometry. The tree is laid out in two halves sharing one centre
   box: ancestors above (person box at the bottom of its block),
   descendants below (person box at the top of its block). */
var GEN_TW = 152, GEN_TH = 66, GEN_HGAP = 16, GEN_VGAP = 28, GEN_HH = 30;

function genBox(key, nodeId, x, y, opts) {
  opts = opts || {};
  return { key: key, nodeId: nodeId, x: x, y: y, w: GEN_TW, h: GEN_TH,
           root: !!opts.root, loop: !!opts.loop, center: !!opts.center,
           collapsed: !!opts.collapsed, hasKids: !!opts.hasKids,
           note: !!opts.note, header: !!opts.header, headerLabel: opts.headerLabel || "",
           headerSpouse: !!opts.headerSpouse };
}
/* Ancestor block: person box at the BOTTOM centre. depth = generations
   above the person still to draw. First father + first mother only;
   further named parents are footnoted, never merged (see below). */
function genAncBlock(L, id, depth, path) {
  var n = L.byId[id];
  if (!n) return { w: GEN_TW, h: GEN_TH, boxes: [], lines: [] };
  if (path[id]) {
    return { w: GEN_TW, h: GEN_TH,
             boxes: [genBox(id + "@loop", id, 0, 0, { loop: true })], lines: [] };
  }
  var rel = L.relations(id);
  var fathers = Object.keys(rel.fathers), mothers = Object.keys(rel.mothers);
  var personY, totalH, totalW;
  if (depth <= 0 || (!fathers.length && !mothers.length)) {
    return { w: GEN_TW, h: GEN_TH,
             boxes: [genBox(id + "@anc", id, 0, 0, { root: true })], lines: [] };
  }
  var path2 = {}; for (var k in path) path2[k] = true; path2[id] = true;
  var fBlock = fathers.length ? genAncBlock(L, fathers[0], depth - 1, path2) : null;
  var mBlock = mothers.length ? genAncBlock(L, mothers[0], depth - 1, path2) : null;
  var parentsH = Math.max(fBlock ? fBlock.h : 0, mBlock ? mBlock.h : 0);
  totalH = parentsH + GEN_VGAP + GEN_TH;
  var blocks = [];
  if (fBlock) blocks.push(fBlock);
  if (mBlock) blocks.push(mBlock);
  totalW = blocks.reduce(function (s, b) { return s + b.w; }, 0) + GEN_HGAP * (blocks.length - 1);
  if (totalW < GEN_TW) totalW = GEN_TW;
  var boxes = [], lines = [], x = 0, parentCenters = [];
  blocks.forEach(function (b) {
    var dy = parentsH - b.h, dx = x;
    b.boxes.forEach(function (bx) {
      boxes.push({ key: bx.key, nodeId: bx.nodeId, x: bx.x + dx, y: bx.y + dy,
                   w: bx.w, h: bx.h, root: bx.root, loop: bx.loop, center: bx.center,
                   collapsed: bx.collapsed, hasKids: bx.hasKids, note: bx.note,
                   header: bx.header, headerLabel: bx.headerLabel });
    });
    b.lines.forEach(function (ln) {
      lines.push(ln.map(function (p) { return [p[0] + dx, p[1] + dy]; }));
    });
    /* The block's own person box sits at its bottom centre. */
    parentCenters.push(dx + b.w / 2);
    x += b.w + GEN_HGAP;
  });
  var px = (totalW - GEN_TW) / 2, py = parentsH + GEN_VGAP;
  boxes.push(genBox(id + "@anc", id, px, py, { root: true }));
  var midY = parentsH + GEN_VGAP / 2, cx = px + GEN_TW / 2;
  if (parentCenters.length === 2) {
    lines.push([[parentCenters[0], parentsH], [parentCenters[0], midY],
                [parentCenters[1], midY], [parentCenters[1], parentsH]]);
    lines.push([[cx, midY], [cx, py]]);
  } else {
    lines.push([[parentCenters[0], parentsH], [parentCenters[0], py]]);
  }
  return { w: totalW, h: totalH, boxes: boxes, lines: lines };
}
/* Descendant block: person box at the TOP, spouses with no children
   beside it, children grouped by co-parent below. depth = generations
   below the person still to draw. */
function genDescBlock(L, id, depth, path) {
  var n = L.byId[id];
  if (!n) return { w: GEN_TW, h: GEN_TH, boxes: [], lines: [] };
  if (path[id]) {
    return { w: GEN_TW, h: GEN_TH,
             boxes: [genBox(id + "@loop", id, 0, 0, { loop: true })], lines: [] };
  }
  var rel = L.relations(id);
  var groups = L.childGroups(id);
  var spouseIds = Object.keys(rel.spouses);
  var coParents = {};
  groups.forEach(function (g) { if (g.coParent) coParents[g.coParent] = true; });
  var rowSpouses = spouseIds.filter(function (s) { return !coParents[s]; });
  var rowW = GEN_TW * (1 + rowSpouses.length) + GEN_HGAP * rowSpouses.length;
  var collapsed = !!genTreeState.collapsed[id];
  if (depth <= 0 || collapsed || !groups.length) {
    var boxes0 = [genBox(id + "@desc", id, 0, 0,
      { root: true, collapsed: collapsed, hasKids: groups.length > 0, note: !!n.note })];
    rowSpouses.forEach(function (s, i) {
      boxes0.push(genBox(s + "@spouse-of-" + id, s, GEN_TW * (i + 1) + GEN_HGAP * (i + 1), 0, { note: !!(L.byId[s] && L.byId[s].note) }));
    });
    return { w: rowW, h: GEN_TH, boxes: boxes0, lines: [] };
  }
  var path2 = {}; for (var k in path) path2[k] = true; path2[id] = true;
  var clusters = groups.map(function (g) {
    var childBlocks = g.children.map(function (c) { return genDescBlock(L, c, depth - 1, path2); });
    var w = childBlocks.reduce(function (s, b) { return s + b.w; }, 0) + GEN_HGAP * (childBlocks.length - 1);
    return { group: g, blocks: childBlocks, w: w };
  });
  var kidsW = clusters.reduce(function (s, c) { return s + c.w; }, 0) + GEN_HGAP * (clusters.length - 1);
  var totalW = Math.max(rowW, kidsW);
  var headY = GEN_TH + GEN_VGAP, kidsY = headY + GEN_HH + GEN_VGAP;
  var maxChildH = 0;
  clusters.forEach(function (c) { c.blocks.forEach(function (b) { if (b.h > maxChildH) maxChildH = b.h; }); });
  var boxes = [], lines = [];
  var rowX = (totalW - rowW) / 2;
  boxes.push(genBox(id + "@desc", id, rowX, 0,
    { root: true, hasKids: true, note: !!n.note }));
  rowSpouses.forEach(function (s, i) {
    boxes.push(genBox(s + "@spouse-of-" + id, s, rowX + GEN_TW * (i + 1) + GEN_HGAP * (i + 1), 0, { note: !!(L.byId[s] && L.byId[s].note) }));
  });
  var px = rowX + GEN_TW / 2;
  var busY = GEN_TH + GEN_VGAP / 2;
  var headCenters = [], cx = 0;
  clusters.forEach(function (cl) {
    var cw = cl.w;
    var hx = cx + (cw - GEN_TW) / 2;
    var co = cl.group.coParent;
    boxes.push(genBox((co || "__none__") + "@head-for-" + id, co, hx, headY,
      { header: true, headerLabel: co ? "" : "Other parent not named",
        headerSpouse: co ? !!rel.spouses[co] : false }));
    headCenters.push(hx + GEN_TW / 2);
    var childBusY = kidsY - GEN_VGAP / 2, childCenters = [], bx = cx;
    cl.blocks.forEach(function (b) {
      var bdx = bx, bdy = kidsY;
      b.boxes.forEach(function (bb) {
        boxes.push({ key: bb.key, nodeId: bb.nodeId, x: bb.x + bdx, y: bb.y + bdy,
                     w: bb.w, h: bb.h, root: bb.root, loop: bb.loop, center: bb.center,
                     collapsed: bb.collapsed, hasKids: bb.hasKids, note: bb.note,
                     header: bb.header, headerLabel: bb.headerLabel, headerSpouse: bb.headerSpouse });
      });
      b.lines.forEach(function (ln) {
        lines.push(ln.map(function (p) { return [p[0] + bdx, p[1] + bdy]; }));
      });
      childCenters.push(bdx + b.w / 2);
      bx += b.w + GEN_HGAP;
    });
    var hc = hx + GEN_TW / 2;
    if (childCenters.length === 1) {
      lines.push([[hc, headY + GEN_HH], [hc, kidsY]]);
    } else {
      lines.push([[hc, headY + GEN_HH], [hc, childBusY]]);
      lines.push([[childCenters[0], childBusY], [childCenters[childCenters.length - 1], childBusY]]);
      childCenters.forEach(function (ccx) { lines.push([[ccx, childBusY], [ccx, kidsY]]); });
    }
    cx += cw + GEN_HGAP;
  });
  if (headCenters.length === 1) {
    lines.push([[px, GEN_TH], [px, headY]]);
  } else {
    lines.push([[px, GEN_TH], [px, busY]]);
    lines.push([[headCenters[0], busY], [headCenters[headCenters.length - 1], busY]]);
    headCenters.forEach(function (hcx) { lines.push([[hcx, busY], [hcx, headY]]); });
  }
  return { w: totalW, h: kidsY + maxChildH, boxes: boxes, lines: lines };
}

/* ---------- tree SVG rendering -------------------------------------- */
function genTreeNodeSVG(L, b, centerId) {
  var n = L.byId[b.nodeId];
  if (!n) return "";
  if (b.header) {
    if (!b.nodeId) {
      return '<g><rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + GEN_HH +
        '" rx="15" class="gtn-head-none"/><text x="' + (b.x + b.w / 2) + '" y="' + (b.y + 19) +
        '" text-anchor="middle" class="gtn-head-label">' + esc(b.headerLabel) + "</text></g>";
    }
    var name = genTrunc(n.name, b.headerSpouse ? 14 : 20) + (b.headerSpouse ? " · spouse" : "");
    var nm = (n.profileIndex !== null && n.profileIndex !== undefined)
      ? '<a href="#/people/' + n.profileIndex + '"><text x="' + (b.x + b.w / 2) + '" y="' + (b.y + 19) +
        '" text-anchor="middle" class="gtn-head-name">' + esc(name) + "</text></a>"
      : '<text x="' + (b.x + b.w / 2) + '" y="' + (b.y + 19) +
        '" text-anchor="middle" class="gtn-head-name">' + esc(name) + "</text>";
    return '<g><rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + GEN_HH +
      '" rx="15" class="gtn-head"/><title>' + esc(n.name) + "</title>" + nm + "</g>";
  }
  var cls = "gtn-box";
  if (b.nodeId === centerId) cls = "gtn-box-center";
  else if (b.loop) cls = "gtn-box-loop";
  var s = '<g><rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h +
    '" rx="12" class="' + cls + '"/><title>' + esc(n.name) +
    (n.context ? " — " + n.context : "") + "</title>";
  var cx = b.x + b.w / 2;
  var nameTxt = esc(genTrunc(n.name, 20));
  if (n.profileIndex !== null && n.profileIndex !== undefined) {
    s += '<a href="#/people/' + n.profileIndex + '"><text x="' + cx + '" y="' + (b.y + 24) +
      '" text-anchor="middle" class="gtn-name">' + nameTxt + "</text></a>";
  } else {
    s += '<text x="' + cx + '" y="' + (b.y + 24) + '" text-anchor="middle" class="gtn-name">' + nameTxt + "</text>";
  }
  if (n.context) {
    s += '<text x="' + cx + '" y="' + (b.y + 41) + '" text-anchor="middle" class="gtn-sub">' + esc(genTrunc(n.context, 22)) + "</text>";
  }
  if (b.loop) {
    s += '<text x="' + cx + '" y="' + (b.y + 57) + '" text-anchor="middle" class="gtn-sub">already shown above</text>';
  } else if (n.profileIndex === null || n.profileIndex === undefined) {
    var refs = [];
    L.edges.forEach(function (e) {
      if (e.child === b.nodeId) refs = refs.concat(e.refs || []);
    });
    var seen = {};
    refs = refs.filter(function (r) { return seen[r] ? false : (seen[r] = true); });
    if (refs.length) {
      s += '<text x="' + cx + '" y="' + (b.y + 57) + '" text-anchor="middle" class="gtn-sub">' + esc(genTrunc(refs.join("; "), 26)) + "</text>";
    }
  }
  if (!b.loop && !b.header && b.nodeId !== centerId) {
    s += '<g class="gtn-btn" data-gen-action="center" data-node="' + esc(b.nodeId) + '"><title>Centre the tree on ' + esc(n.name) +
      '</title><circle cx="' + (b.x + 13) + '" cy="' + (b.y + 13) + '" r="10" class="gtn-btn-bg"/><text x="' + (b.x + 13) +
      '" y="' + (b.y + 17) + '" text-anchor="middle" class="gtn-btn-txt">⌖</text></g>';
  }
  if (!b.loop && !b.header && b.hasKids) {
    s += '<g class="gtn-btn" data-gen-action="collapse" data-node="' + esc(b.nodeId) + '"><title>' + (b.collapsed ? "Expand" : "Collapse") +
      ' this branch</title><circle cx="' + (b.x + b.w - 13) + '" cy="' + (b.y + 13) + '" r="10" class="gtn-btn-bg"/><text x="' +
      (b.x + b.w - 13) + '" y="' + (b.y + 17) + '" text-anchor="middle" class="gtn-btn-txt">' + (b.collapsed ? "+" : "–") + "</text></g>";
  }
  if (!b.loop && !b.header && n.note) {
    s += '<g class="gtn-btn" data-gen-action="note" data-node="' + esc(b.nodeId) + '"><title>Show the note on ' + esc(n.name) +
      '</title><circle cx="' + (b.x + b.w - 13) + '" cy="' + (b.y + b.h - 13) + '" r="10" class="gtn-btn-bg"/><text x="' +
      (b.x + b.w - 13) + '" y="' + (b.y + b.h - 9) + '" text-anchor="middle" class="gtn-btn-txt">ⓘ</text></g>';
  }
  return s + "</g>";
}

function genTreeBodyHTML(L, centerId) {
  var center = L.byId[centerId];
  if (!center) return "<p class='empty'>That person is not in the family tree.</p>";
  var anc = genAncBlock(L, centerId, genTreeState.ancDepth, {});
  var desc = genDescBlock(L, centerId, genTreeState.descDepth, {});
  var totalW = Math.max(anc.w, desc.w);
  var totalH = anc.h + desc.h - GEN_TH;
  var boxes = [], lines = [];
  var ancDx = (totalW - anc.w) / 2;
  anc.boxes.forEach(function (b) {
    if (b.root && b.nodeId === centerId) return; /* shared centre box: desc's copy is kept */
    boxes.push({ key: b.key, nodeId: b.nodeId, x: b.x + ancDx, y: b.y, w: b.w, h: b.h,
                 root: b.root, loop: b.loop, center: b.center, collapsed: b.collapsed,
                 hasKids: b.hasKids, note: b.note, header: b.header, headerLabel: b.headerLabel,
                 headerSpouse: b.headerSpouse });
  });
  anc.lines.forEach(function (ln) {
    lines.push(ln.map(function (p) { return [p[0] + ancDx, p[1]]; }));
  });
  var descDx = (totalW - desc.w) / 2, descDy = anc.h - GEN_TH;
  desc.boxes.forEach(function (b) {
    boxes.push({ key: b.key, nodeId: b.nodeId, x: b.x + descDx, y: b.y + descDy, w: b.w, h: b.h,
                 root: b.root, loop: b.loop, center: b.center, collapsed: b.collapsed,
                 hasKids: b.hasKids, note: b.note, header: b.header, headerLabel: b.headerLabel,
                 headerSpouse: b.headerSpouse });
  });
  desc.lines.forEach(function (ln) {
    lines.push(ln.map(function (p) { return [p[0] + descDx, p[1] + descDy]; }));
  });
  var svg = '<svg class="gen-tree-svg" width="' + totalW + '" height="' + totalH +
    '" viewBox="0 0 ' + totalW + " " + totalH + '" role="img" aria-label="Family tree centred on ' + esc(center.name) + '">';
  lines.forEach(function (ln) {
    svg += '<path d="M ' + ln.map(function (p) { return p[0] + " " + p[1]; }).join(" L ") + '" class="gtn-line" fill="none"/>';
  });
  boxes.forEach(function (b) { svg += genTreeNodeSVG(L, b, centerId); });
  svg += "</svg>";
  /* Footnotes: extra parents from parallel records; child-grouping rule. */
  var rel = L.relations(centerId);
  var extra = [];
  Object.keys(rel.fathers).slice(1).forEach(function (pid) {
    var pn = L.byId[pid];
    if (pn) extra.push("father " + esc(pn.name) + genRefsHTML(rel.fathers[pid]));
  });
  Object.keys(rel.mothers).slice(1).forEach(function (pid) {
    var pn = L.byId[pid];
    if (pn) extra.push("mother " + esc(pn.name) + genRefsHTML(rel.mothers[pid]));
  });
  var foot = "";
  if (extra.length) {
    foot += "<p class='gen-tree-footnote'>Also named as a parent in parallel records (the tree shows the first-named parent above): " + extra.join("; ") + ".</p>";
  }
  if (desc.h > GEN_TH) {
    foot += "<p class='gen-tree-footnote'>Children are grouped by the other parent named on each child's own record. A group header marked “spouse” is also named as a spouse on that parent's own record; any other header names the child's other parent without claiming a marriage. “Other parent not named” means the passages name no second parent for those children — they are never assigned to a spouse by guesswork.</p>";
  }
  var ctrls = '<div class="gen-tree-ctrls">' +
    '<span>Ancestors: ' + genTreeState.ancDepth + " generations</span> " +
    '<button type="button" data-gen-action="anc-more">More</button> ' +
    '<button type="button" data-gen-action="anc-fewer">Fewer</button> ' +
    '<span>Descendants: ' + genTreeState.descDepth + " generations</span> " +
    '<button type="button" data-gen-action="desc-more">More</button> ' +
    '<button type="button" data-gen-action="desc-fewer">Fewer</button></div>';
  return "<p class='gen-tree-hint'>Tap ⌖ on any person to centre the tree on them. Tap a name to open their profile. On a phone, scroll sideways inside the tree.</p>" +
    ctrls + '<div class="gen-tree-scroll">' + svg + "</div>" + foot;
}

/* ---------- timeline view (generations, NEVER years) --------------- */
/* The data holds no dates, so the spine counts generations: the
   oldest named ancestor is Generation 1, the panel person is the
   last generation. Each step's connector carries the scripture refs
   of the edge joining that person to the one above. Where the panel
   person's profile carries a TimelineEra it is shown as an era label;
   where it does not, no era is shown. */
function genTimelineHTML(L, node) {
  var chain = [{ node: node, parentId: null, refs: [] }];
  var cur = node, seen = {}, guard = 0, capped = false;
  seen[node.id] = true;
  while (guard++ < 12) {
    var rel = L.relations(cur.id);
    var fatherIds = Object.keys(rel.fathers), motherIds = Object.keys(rel.mothers);
    var parentId = fatherIds[0] || motherIds[0] || null;
    if (!parentId || !L.byId[parentId] || seen[parentId]) break;
    if (guard === 12) { capped = true; }
    seen[parentId] = true;
    chain.unshift({ node: L.byId[parentId], parentId: null, refs: [] });
    cur = L.byId[parentId];
  }
  /* Connector refs: for each entry after the first, the edge(s) from
     the entry above to this entry. */
  for (var i = 1; i < chain.length; i++) {
    chain[i].refs = L.edgeRefs(chain[i - 1].node.id, chain[i].node.id);
  }
  var people = (typeof data !== "undefined" && data.people) || [];
  var html = "<p class='page-intro'>Generations, not years — the genealogy passages give order, not dates, so this spine counts generations from the oldest named ancestor down to " +
    esc(node.name) + ". Nothing here is dated; undated generations are not a gap in the record, they are what the passages give.</p>";
  if (chain.length < 2) {
    return html + "<p>Parentage is not stated in the genealogy passages for this person, so there is no chain to lay out.</p>";
  }
  html += '<div class="tl">';
  chain.forEach(function (step, idx) {
    var n = step.node;
    if (idx > 0) {
      html += '<p class="gen-tl-conn">&darr; ' +
        (step.refs.length ? genRefsHTML(step.refs).replace(/^ /, "") : "no passage cited for this link") + "</p>";
    }
    var isLast = idx === chain.length - 1;
    var era = "";
    if (n.profileIndex !== null && n.profileIndex !== undefined && people[n.profileIndex]) {
      var te = people[n.profileIndex].TimelineEra;
      if (te) era = "<p class='gen-tl-era'>Era: " + esc(te) + "</p>";
    }
    html += '<div class="tl-node' + (isLast ? " gen-tl-current" : "") + '">' +
      '<p class="tl-date">Generation ' + (idx + 1) + (isLast ? " &middot; selected person" : "") + "</p>" +
      "<h3>" + genTreeNameHTML(L, n) + "</h3>" +
      era +
      (n.context ? "<p class='gen-context'>" + esc(n.context) + "</p>" : "") +
      ((n.alt && n.alt.length) ? "<p class='gen-context'>Also spelled: " + n.alt.map(esc).join(", ") + "</p>" : "") +
      (n.note ? "<p class='gen-note'>" + esc(n.note) + "</p>" : "") +
      ((n.profileIndex !== null && n.profileIndex !== undefined)
        ? "<p><a class='btn' href='#/people/" + n.profileIndex + "'>View full profile &rarr;</a></p>" : "") +
      "</div>";
  });
  html += "</div>";
  var top = chain[0].node;
  if (capped) {
    html += "<p class='gen-chain-note'>The chain stops at 12 generations here — open " +
      '<a href="' + L.href(top) + '">' + esc(top.name) + "</a> to continue further back.</p>";
  } else {
    html += "<p class='gen-chain-note'>Parentage beyond " + esc(top.name) +
      " is not stated in the genealogy passages, so the spine honestly stops there.</p>";
  }
  return html;
}

/* ---------- toggle + section + binding ----------------------------- */
function genModeToggleHTML() {
  function btn(mode, label) {
    return '<button type="button" data-gen-view="' + mode + '" class="' +
      (genTreeState.mode === mode ? "active" : "") + '">' + label + "</button>";
  }
  return '<div class="gen-view-toggle" role="group" aria-label="Family tree view">' +
    btn("tree", "Tree") + btn("timeline", "Timeline") + "</div>";
}
/* Person panel: toggle + interactive body + note foot. The body is
   filled by genBindInteractive (it must be called after innerHTML). */
function genInteractiveHTML(node) {
  return '<div class="gen-interactive" id="genInteractive"><h3>Interactive view</h3>' +
    genModeToggleHTML() + '<div id="genInteractiveBody"></div>' +
    '<div id="genInteractiveFoot" class="gen-tree-foot"></div></div>';
}
/* Starting-points view: the toggle alone; the choice applies to the
   next person the visitor opens (mode lives in genTreeState). */
function genModeToggleSectionHTML() {
  return '<div class="gen-interactive" id="genInteractive"><h3>Interactive view</h3>' +
    genModeToggleHTML() +
    '<p class="gen-view-hint">Choose Tree or Timeline — your choice applies to the next person you open.</p></div>';
}
function genTreeFootHTML(L, centerId) {
  var n = L.byId[centerId];
  if (!n) return "";
  var refs = [];
  L.edges.forEach(function (e) {
    if (e.child === centerId) refs = refs.concat(e.refs || []);
  });
  var seen = {};
  refs = refs.filter(function (r) { return seen[r] ? false : (seen[r] = true); });
  var html = "";
  if (refs.length) html += "<p>Record for " + esc(n.name) + ": " + genRefsHTML(refs).replace(/^ /, "") + "</p>";
  if (n.note) html += "<p class='gen-note'>" + esc(n.note) + "</p>";
  return html;
}
function genRenderInteractiveBody(node) {
  var body = document.getElementById("genInteractiveBody");
  var foot = document.getElementById("genInteractiveFoot");
  if (!body) return;
  var L = genTreeLookups();
  if (genTreeState.mode === "timeline") {
    body.innerHTML = genTimelineHTML(L, node);
    if (foot) foot.innerHTML = "";
    return;
  }
  var centerId = genTreeState.centerId && L.byId[genTreeState.centerId]
    ? genTreeState.centerId : node.id;
  genTreeState.centerId = centerId;
  body.innerHTML = genTreeBodyHTML(L, centerId);
  if (foot) foot.innerHTML = genTreeFootHTML(L, centerId);
}
/* Call after app.innerHTML is set. node may be null (starting view:
   only the toggle is bound). One delegated listener serves the
   toggle, the tree buttons, and the depth controls. */
function genBindInteractive(node) {
  var section = document.getElementById("genInteractive");
  if (!section) return;
  if (node) {
    genTreeState.centerId = node.id;
    genTreeState.nodeId = node.id;
    genRenderInteractiveBody(node);
  }
  section.addEventListener("click", function (e) {
    var viewBtn = e.target.closest ? e.target.closest("[data-gen-view]") : null;
    if (viewBtn) {
      genTreeState.mode = viewBtn.getAttribute("data-gen-view");
      var btns = section.querySelectorAll("[data-gen-view]");
      for (var i = 0; i < btns.length; i++) {
        btns[i].className = btns[i].getAttribute("data-gen-view") === genTreeState.mode ? "active" : "";
      }
      if (node) genRenderInteractiveBody(node);
      return;
    }
    if (!node) return;
    var act = e.target.closest ? e.target.closest("[data-gen-action]") : null;
    if (!act) return;
    var action = act.getAttribute("data-gen-action");
    var nid = act.getAttribute("data-node");
    var L = genTreeLookups();
    if (action === "center" && nid && L.byId[nid]) {
      genTreeState.centerId = nid;
      genRenderInteractiveBody(node);
    } else if (action === "collapse" && nid) {
      if (genTreeState.collapsed[nid]) delete genTreeState.collapsed[nid];
      else genTreeState.collapsed[nid] = true;
      genRenderInteractiveBody(node);
    } else if (action === "note" && nid && L.byId[nid]) {
      var foot = document.getElementById("genInteractiveFoot");
      if (foot) foot.innerHTML = genTreeFootHTML(L, nid);
    } else if (action === "anc-more") {
      if (genTreeState.ancDepth < 6) genTreeState.ancDepth++;
      genRenderInteractiveBody(node);
    } else if (action === "anc-fewer") {
      if (genTreeState.ancDepth > 1) genTreeState.ancDepth--;
      genRenderInteractiveBody(node);
    } else if (action === "desc-more") {
      if (genTreeState.descDepth < 6) genTreeState.descDepth++;
      genRenderInteractiveBody(node);
    } else if (action === "desc-fewer") {
      if (genTreeState.descDepth > 1) genTreeState.descDepth--;
      genRenderInteractiveBody(node);
    }
  });
}
  /* ---------- storybook reader ---------- */
  /* Three shelves, one reader: Bible stories (the stories collection),
     plus pet stories and children's stories, which start empty and fill
     as Lorraine sends them. Shelf items share one shape: Story (title),
     Retelling (prose), Discussion (optional), Scripture (optional).
     Older stories carry Summary instead of Retelling — the reader falls
     back to it, so every story reads. */
  var STORYBOOK_SHELVES = [
    { key: "bible", label: "Bible Stories",
      blurb: "Beloved Bible stories retold — read them one page at a time.",
      items: function () { return data.stories || []; } },
    { key: "pets", label: "Pet Stories",
      blurb: "True tales and adventures of the animals we love.",
      items: function () { return petStories; } },
    { key: "children", label: "Children's Stories",
      blurb: "Gentle stories for young readers, big and small.",
      items: function () { return childStories; } }
  ];
  function storybookShelf(key) {
    for (var i = 0; i < STORYBOOK_SHELVES.length; i++) {
      if (STORYBOOK_SHELVES[i].key === key) return STORYBOOK_SHELVES[i];
    }
    return null;
  }
  /* Split prose into reading pages of about 100 words, breaking only at
     sentence ends so no page stops mid-thought. */
  function storybookPages(text) {
    var src = String(text || "");
    var sentences = src.match(/[^.!?]+[.!?]+["']?/g) || [];
    var joined = sentences.join("");
    var rest = src.slice(joined.length).trim();
    if (rest) sentences.push(rest);
    if (!sentences.length && src.trim()) sentences = [src];
    var pages = [], page = [], words = 0;
    sentences.forEach(function (s) {
      var n = s.trim().split(/\s+/).length;
      if (words > 0 && words + n > 100) { pages.push(page.join(" ")); page = []; words = 0; }
      page.push(s.trim()); words += n;
    });
    if (page.length) pages.push(page.join(" "));
    return pages.length ? pages : [""];
  }
  function storybookPara(text) {
    return String(text || "").split(/\n\s*\n/).map(function (p) {
      return "<p>" + esc(p.trim()) + "</p>";
    }).join("");
  }
  function viewStorybook(shelfKey, idx, params) {
    var shelf, items, i, html, item, pages, thinkPage, page, body, isThink;
    if (!shelfKey) {
      html = '<a class="back-link" href="#/explore">&larr; Explore</a><h2>Storybook Reader</h2>' +
        '<p class="page-intro">Pick a shelf, pick a story, and read it one page at a time — just like a book.</p><div class="card-grid">' +
        STORYBOOK_SHELVES.map(function (s) {
          var n = s.items().length;
          return '<a class="card" href="#/storybook/' + s.key + '"><h3>' + esc(s.label) + '</h3>' +
            '<p class="meta">' + (n ? n + (n === 1 ? " story" : " stories") : "Coming soon") + '</p>' +
            '<p class="snippet">' + esc(s.blurb) + '</p></a>';
        }).join("") + "</div>";
      app.innerHTML = html; window.scrollTo(0, 0); return;
    }
    shelf = storybookShelf(shelfKey);
    if (!shelf) return viewStorybook(null, null, params);
    items = shelf.items();
    if (idx === undefined || idx === null || idx === "") {
      html = '<a class="back-link" href="#/storybook">&larr; Storybook</a><h2>' + esc(shelf.label) + '</h2>';
      if (!items.length) {
        html += '<p class="empty">No ' + esc(shelf.label.toLowerCase()) + ' yet — new stories will appear here as they are added.</p>';
      } else {
        html += '<p class="page-intro">' + esc(shelf.blurb) + '</p><ul class="storybook-list">' +
          items.map(function (it, j) {
            return '<li><a href="#/storybook/' + shelf.key + '/' + j + '">' + esc(it.Story || ("Story " + (j + 1))) + "</a></li>";
          }).join("") + "</ul>";
      }
      app.innerHTML = html; window.scrollTo(0, 0); return;
    }
    i = parseInt(idx, 10);
    if (isNaN(i) || i < 0 || i >= items.length) return viewStorybook(shelfKey, null, params);
    item = items[i];
    if (!item.Retelling && !item.Discussion && !item.Summary) {
      app.innerHTML = '<a class="back-link" href="#/storybook/' + shelf.key + '">&larr; All ' + esc(shelf.label) + '</a>' +
        '<p class="empty">This story has no text yet.</p>';
      window.scrollTo(0, 0); return;
    }
    pages = storybookPages(item.Retelling || item.Summary || "");
    thinkPage = 0;
    if (item.Discussion) { pages.push(item.Discussion); thinkPage = pages.length; }
    page = parseInt(params.get("page") || "1", 10);
    if (isNaN(page) || page < 1) page = 1;
    if (page > pages.length) page = pages.length;
    body = pages[page - 1];
    isThink = (thinkPage > 0 && page === thinkPage);
    html = '<a class="back-link" href="#/storybook/' + shelf.key + '">&larr; All ' + esc(shelf.label) + '</a>' +
      '<article class="storybook-page"><h2>' + esc(item.Story || "") + '</h2>' +
      (item.Scripture ? '<p class="post-meta">' + esc(item.Scripture) + '</p>' : "") +
      (isThink ? "<h3>Think about it</h3>" + storybookPara(body) : storybookPara(body)) +
      '</article><div class="storybook-nav">' +
      (page > 1 ? '<a class="btn" href="#/storybook/' + shelf.key + '/' + i + '?page=' + (page - 1) + '">&larr; Previous page</a>' : '<span></span>') +
      '<span class="storybook-progress">Page ' + page + ' of ' + pages.length + '</span>' +
      (page < pages.length ? '<a class="btn" href="#/storybook/' + shelf.key + '/' + i + '?page=' + (page + 1) + '">Next page &rarr;</a>' : '<span></span>') +
      '</div>';
    if (page === pages.length && shelf.key === "bible") {
      html += '<p class="storybook-more"><a href="#/stories/' + i + '">Read the full story page &rarr;</a></p>';
    }
    html += '<p class="storybook-more"><a href="#/storybook">Back to the Storybook</a></p>';
    app.innerHTML = html; window.scrollTo(0, 0);
  }
  function viewExplore() {
    var html = "<h2>" + esc(explorePage.heading || "Explore") + "</h2><p class='page-intro'>" +
      esc(explorePage.intro || "Every collection on the site — pick one and start browsing.") + "</p>";
    var cats = COLLECTIONS.map(function (c) {
      var n = c.id === "quizzes" ? quizGroups().length : (data[c.id] || []).length;
      return { id: c.id, label: c.label, n: n };
    }).sort(function (a, b) { return a.label.localeCompare(b.label); });
    html += '<div class="controls"><span class="chip-label">Jump to a category:</span>' +
      '<select id="exploreJump"><option value="">Choose a category…</option>' +
      cats.map(function (c) {
        return '<option value="#/' + c.id + '">' + esc(c.label) + " (" + c.n + ")</option>";
      }).join("") + "</select></div>";
    html += "<div class='card storybook-card'><h3>Storybook Reader</h3>" +
      "<p class='snippet'>Read stories like a book — one page at a time.</p><p>" +
      STORYBOOK_SHELVES.map(function (s) {
        return '<a class="btn" href="#/storybook/' + s.key + '">' + esc(s.label) + '</a>';
      }).join(" ") + "</p></div>";
    html += "<div class='card atlas-card'><h3>Biblical Atlas</h3>" +
      "<p class='snippet'>Real places on a real map — every marker links to its place page.</p><p>" +
      "<a class='btn' href='#/atlas'>Open the Atlas</a></p></div>";
    var ordered = EXPLORE_ORDER.map(function (id) { return coll(id); }).filter(Boolean)
      .concat(COLLECTIONS.filter(function (c) { return EXPLORE_ORDER.indexOf(c.id) === -1; }));
    var gridHtml = "";
    var openGrid = false;
    ordered.forEach(function (c, i) {
      var heading = SECTION_HEADINGS[c.id];
      var listed = EXPLORE_ORDER.indexOf(c.id) !== -1;
      var prevListed = i > 0 && EXPLORE_ORDER.indexOf(ordered[i - 1].id) !== -1;
      if (heading || (listed !== prevListed && i > 0) || !openGrid) {
        if (openGrid) gridHtml += "</div>";
        if (heading) gridHtml += "<h3>" + esc(heading) + "</h3>";
        gridHtml += "<div class='card-grid'>";
        openGrid = true;
      }
      gridHtml += collectionCard(c);
      if (c.id === "people") {
        gridHtml += "<div class='card genealogy-card'><h3>Biblical Genealogies</h3>" +
          "<p class='snippet'>Every parent, child, and spouse named in the Bible's genealogy passages — linked to their profiles and to the passages.</p><p>" +
          "<a class='btn' href='#/genealogy'>Explore Biblical Genealogies</a></p></div>";
      }
    });
    if (openGrid) gridHtml += "</div>";
    html += gridHtml;
    app.innerHTML = html;
    var sel = document.getElementById("exploreJump");
    if (sel) sel.addEventListener("change", function () { if (sel.value) navigate(sel.value, true); });
    window.scrollTo(0, 0);
  }
  /* Blog series: posts sharing a frontmatter `series` name, ordered by
     numeric `part` (a post without a part sorts first). Series posts are
     called Parts, never Lessons — lessons belong to courses only. */
  function seriesParts(name) {
    return posts.filter(function (p) { return p.series === name; }).sort(function (a, b) {
      var pa = parseInt(a.part, 10) || 0, pb = parseInt(b.part, 10) || 0;
      if (pa !== pb) return pa - pb;
      return (a.date || "") < (b.date || "") ? -1 : ((a.date || "") > (b.date || "") ? 1 : 0);
    });
  }
  function seriesNav(post) {
    if (!post.series) return "";
    var parts = seriesParts(post.series);
    var idx = parts.indexOf(post);
    var bits = ["Series: " + esc(post.series) + (post.part ? " · Part " + esc(post.part) : "")];
    if (idx > 0) bits.push("&larr; Previous part: <a href='#/blog/" + esc(parts[idx - 1].slug) + "'>" + esc(parts[idx - 1].title) + "</a>");
    if (idx >= 0 && idx < parts.length - 1) bits.push("Next part: <a href='#/blog/" + esc(parts[idx + 1].slug) + "'>" + esc(parts[idx + 1].title) + "</a> &rarr;");
    return '<p class="post-meta">' + bits.join(" &nbsp;|&nbsp; ") + "</p>";
  }
  function viewBlog(slug, params) {
    if (slug) {
      var post = posts.filter(function (p) { return p.slug === slug; })[0];
      if (!post) return viewBlog(null);
      fetch(post.raw || (post.file + "?v=" + ASSET_V), { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(post.file); return r.text(); }).then(function (text) {
        var body = text.replace(/^---[\s\S]*?---\s*/, "");
        app.innerHTML = '<a class="back-link" href="#/blog">&larr; All posts</a><article class="post-body"><h2>' +
          esc(post.title) + '</h2><p class="post-meta">' + esc(shortDate(post.date)) +
          (post.category ? " &middot; " + esc(post.category) : "") +
          (post.scripture ? " &middot; " + linkifyScriptureRefs(post.scripture) : "") + "</p>" + seriesNav(post) +
          (POST_ART[post.slug] ? "<img class='post-art' src='" + esc(POST_ART[post.slug]) + "' alt=''>" : "") +
          renderMarkdown(body) + "</article>";
        window.scrollTo(0, 0);
      }).catch(function () {
        app.innerHTML = '<p class="empty">That post could not be loaded.</p>';
      });
      return;
    }
    var html = "<h2>Blog</h2><p class='page-intro'>Reflections and studies from the anchored story.</p>";
    if (!posts.length) html += '<p class="empty">No posts yet.</p>';
    var seriesNames = [];
    posts.forEach(function (p) { if (p.series && seriesNames.indexOf(p.series) === -1) seriesNames.push(p.series); });
    if (seriesNames.length) {
      html += "<div class='post-body'><h3>Series</h3>" + seriesNames.map(function (name) {
        var parts = seriesParts(name);
        return "<p><strong>" + esc(name) + "</strong><br>" + parts.map(function (p) {
          return "<a href='#/blog/" + esc(p.slug) + "'>" + (p.part ? "Part " + esc(p.part) + ": " : "") + esc(p.title) + "</a>";
        }).join("<br>") + "</p>";
      }).join("") + "</div>";
    }
    var blogCats = [];
    posts.forEach(function (p) {
      var c = (p.category || "From the blog").trim();
      if (blogCats.indexOf(c) === -1) blogCats.push(c);
    });
    var blogSel = params ? (params.get("category") || "") : "";
    if (blogSel && blogCats.indexOf(blogSel) === -1) blogSel = "";
    function blogCards(cat) {
      var list = cat ? posts.filter(function (p) { return (p.category || "From the blog").trim() === cat; }) : posts;
      if (!list.length) return '<p class="empty">No posts in this category yet.</p>';
      return list.map(function (p) { return postRowCard(p); }).join("");
    }
    function blogCount(cat) {
      return posts.filter(function (p) { return (p.category || "From the blog").trim() === cat; }).length;
    }
    html += "<div class='chips' id='blogCatChips'><span class='chip-label'>Category:</span>" +
      "<button class='chip" + (blogSel === "" ? " active" : "") + "' data-cat=''>All (" + posts.length + ")</button>" +
      blogCats.map(function (c) {
        return "<button class='chip" + (blogSel === c ? " active" : "") + "' data-cat='" + esc(c) + "'>" + esc(c) + " (" + blogCount(c) + ")</button>";
      }).join("") + "</div>";
    html += "<div class='post-row-list' id='blogPostList'>" + blogCards(blogSel) + "</div>";
    app.innerHTML = html;
    var blogBar = document.getElementById("blogCatChips");
    if (blogBar) blogBar.addEventListener("click", function (ev) {
      var btn = ev.target.closest ? ev.target.closest("button[data-cat]") : null;
      if (!btn) return;
      blogBar.querySelectorAll(".chip").forEach(function (b) { b.classList.toggle("active", b === btn); });
      document.getElementById("blogPostList").innerHTML = blogCards(btn.getAttribute("data-cat"));
      loadExcerpts();
    });
    loadExcerpts();
    window.scrollTo(0, 0);
  }
  /* ---------- store ---------- */
  /* Store products live in content/store.json (Decap-editable), so new items
     appear without a code change. Each product: name, kind ("Physical" for
     Printify goods, "Digital" for Ko-fi downloads), price, desc, image (a URL,
     may be empty), url (the checkout link). The file starts empty on purpose:
     real products are added once the shops are set up, so the live page never
     shows fake items. */
  /* Set to the Printify Pop-Up Store URL once Lorraine shares it. Empty means no shop button. */
  var STORE_URL = "";
  /* Set to the Ko-fi shop URL once Lorraine shares it. Empty means no digital-shop button. */
  var DIGITAL_SHOP_URL = "";
  /* Set to the giving link (Ko-fi/PayPal/Stripe) once Lorraine shares it. Empty means coming soon. */
  var GIVE_URL = "";
  function viewStore() {
    fetch("content/store.json?v=" + ASSET_V).then(function (r) {
      return r.ok ? r.json() : { products: [] };
    }).catch(function () { return { products: [] }; }).then(function (json) {
      var products = json.products || [];
      var state = { q: "", kind: "" };
      function renderGrid() {
        var q = state.q.trim().toLowerCase();
        var filtered = products.filter(function (p) {
          if (state.kind && p.kind !== state.kind) return false;
          if (!q) return true;
          return ((p.name || "") + " " + (p.desc || "")).toLowerCase().indexOf(q) !== -1;
        });
        var wrap = document.getElementById("storeGrid");
        if (!wrap) return;
        if (!products.length) {
          wrap.innerHTML = "<p class='empty'>Our shop is coming soon. Physical goods from our Printify store and printable downloads will be listed here as soon as they launch.</p>";
        } else if (!filtered.length) {
          wrap.innerHTML = "<p class='empty'>No products match your search.</p>";
        } else {
          wrap.innerHTML = "<div class='card-grid'>" + filtered.map(function (p) {
            var card = "<div class='card store-card'>";
            if (p.image) card += "<img src='" + esc(p.image) + "' alt='" + esc(p.name) + "'>";
            card += "<h3>" + esc(p.name) + "</h3>";
            card += "<p><span class='chip'>" + esc(p.kind || "Physical") + "</span></p>";
            if (p.price) card += "<p class='price'>" + esc(p.price) + "</p>";
            if (p.desc) card += "<p class='snippet'>" + esc(p.desc) + "</p>";
            card += "<p><a class='buy-btn' href='" + esc(p.url) + "' target='_blank' rel='noopener'>Buy</a></p></div>";
            return card;
          }).join("") + "</div>";
        }
      }
      var html = "<h2>Store</h2><div class='post-body'>" +
        "<p>Beautiful, faith-anchored goods, made to order and shipped to you. " +
        "Every physical item is printed on demand — nothing is mass-produced or warehoused — so your purchase supports this ministry " +
        "and arrives made just for you. Digital items download instantly for you to print at home.</p>";
      if (STORE_URL) html += "<p><a class='btn' href='" + esc(STORE_URL) + "' target='_blank' rel='noopener'>Visit our shop</a></p>";
      html += "<p><a class='btn' href='#/art'>Browse the art</a></p>";
      if (DIGITAL_SHOP_URL) html += "<p><a class='btn' href='" + esc(DIGITAL_SHOP_URL) + "' target='_blank' rel='noopener'>Browse digital downloads</a></p>";
      html += '<div class="controls"><input type="search" id="storeSearch" placeholder="Search the store…">' +
        '<div class="chips"><span class="chip-label">Type:</span>' +
        '<button class="chip active" data-kind="">All</button>' +
        '<button class="chip" data-kind="Physical">Physical</button>' +
        '<button class="chip" data-kind="Digital">Digital</button></div></div>' +
        '<div id="storeGrid"></div>';
      app.innerHTML = html + "</div>";
      renderGrid();
      document.getElementById("storeSearch").addEventListener("input", function (e) {
        state.q = e.target.value;
        renderGrid();
      });
      app.querySelectorAll("[data-kind]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.kind = btn.getAttribute("data-kind");
          btn.parentNode.querySelectorAll("[data-kind]").forEach(function (b) {
            b.classList.toggle("active", b.getAttribute("data-kind") === state.kind);
          });
          renderGrid();
        });
      });
      window.scrollTo(0, 0);
    });
  }
  function viewConnect() {
    app.innerHTML = "<h2>Connect</h2><div class='post-body'>" +
      "<p>Hope Anchored in Christ is growing beyond the blog. This is where you'll find us everywhere else — our social media and our podcast — as they launch.</p>" +
      "<h3>Social Media</h3>" +
      "<p class='empty'>We're not on social media yet. When our accounts launch, you'll find them right here.</p>" +
      "<h3>Podcast</h3>" +
      "<p class='empty'>The Hope Anchored in Christ podcast is coming — conversations about Scripture, hope, and everyday faith. Episodes will be listed here as they're released.</p>" +
      "<p>Until then, the blog and the study collections are the best place to stay connected.</p>" +
      "</div>";
    window.scrollTo(0, 0);
  }
  function viewGive() {
    app.innerHTML = "<h2>Give</h2><div class='post-body'>" +
      "<p>Donations support the ministry and keep it going.</p>" +
      "<p>Your gifts keep the blog free for everyone, cover the costs of running the site, " +
      "and fund future content including the podcast.</p>" +
      (GIVE_URL ? "<p><a class='btn' href='" + esc(GIVE_URL) + "' target='_blank' rel='noopener'>Give to support this ministry</a></p>" :
      "<p class='empty'>Giving options are coming soon. Check back shortly.</p>") +
      "</div>";
    window.scrollTo(0, 0);
  }
  /* ---------- Bible (KJV, public domain) ---------- */
  /* The full King James text lives in content/bible/<slug>.json, one file per
     book, generated from the public-domain 1769 text. Names in the text link
     to the site's people, place, and story articles through the same link
     index the collections use; other collections attach at the chapter level
     through the scripture references already on their entries. NIV and ESV
     are copyrighted, so they are reached through BibleGateway links, not
     copied here. */
  var BIBLE_BOOKS = [
    { slug: "genesis", name: "Genesis", chapters: 50, testament: "Old" },
    { slug: "exodus", name: "Exodus", chapters: 40, testament: "Old" },
    { slug: "leviticus", name: "Leviticus", chapters: 27, testament: "Old" },
    { slug: "numbers", name: "Numbers", chapters: 36, testament: "Old" },
    { slug: "deuteronomy", name: "Deuteronomy", chapters: 34, testament: "Old" },
    { slug: "joshua", name: "Joshua", chapters: 24, testament: "Old" },
    { slug: "judges", name: "Judges", chapters: 21, testament: "Old" },
    { slug: "ruth", name: "Ruth", chapters: 4, testament: "Old" },
    { slug: "1-samuel", name: "1 Samuel", chapters: 31, testament: "Old" },
    { slug: "2-samuel", name: "2 Samuel", chapters: 24, testament: "Old" },
    { slug: "1-kings", name: "1 Kings", chapters: 22, testament: "Old" },
    { slug: "2-kings", name: "2 Kings", chapters: 25, testament: "Old" },
    { slug: "1-chronicles", name: "1 Chronicles", chapters: 29, testament: "Old" },
    { slug: "2-chronicles", name: "2 Chronicles", chapters: 36, testament: "Old" },
    { slug: "ezra", name: "Ezra", chapters: 10, testament: "Old" },
    { slug: "nehemiah", name: "Nehemiah", chapters: 13, testament: "Old" },
    { slug: "esther", name: "Esther", chapters: 10, testament: "Old" },
    { slug: "job", name: "Job", chapters: 42, testament: "Old" },
    { slug: "psalms", name: "Psalms", chapters: 150, testament: "Old" },
    { slug: "proverbs", name: "Proverbs", chapters: 31, testament: "Old" },
    { slug: "ecclesiastes", name: "Ecclesiastes", chapters: 12, testament: "Old" },
    { slug: "song-of-solomon", name: "Song of Solomon", chapters: 8, testament: "Old" },
    { slug: "isaiah", name: "Isaiah", chapters: 66, testament: "Old" },
    { slug: "jeremiah", name: "Jeremiah", chapters: 52, testament: "Old" },
    { slug: "lamentations", name: "Lamentations", chapters: 5, testament: "Old" },
    { slug: "ezekiel", name: "Ezekiel", chapters: 48, testament: "Old" },
    { slug: "daniel", name: "Daniel", chapters: 12, testament: "Old" },
    { slug: "hosea", name: "Hosea", chapters: 14, testament: "Old" },
    { slug: "joel", name: "Joel", chapters: 3, testament: "Old" },
    { slug: "amos", name: "Amos", chapters: 9, testament: "Old" },
    { slug: "obadiah", name: "Obadiah", chapters: 1, testament: "Old" },
    { slug: "jonah", name: "Jonah", chapters: 4, testament: "Old" },
    { slug: "micah", name: "Micah", chapters: 7, testament: "Old" },
    { slug: "nahum", name: "Nahum", chapters: 3, testament: "Old" },
    { slug: "habakkuk", name: "Habakkuk", chapters: 3, testament: "Old" },
    { slug: "zephaniah", name: "Zephaniah", chapters: 3, testament: "Old" },
    { slug: "haggai", name: "Haggai", chapters: 2, testament: "Old" },
    { slug: "zechariah", name: "Zechariah", chapters: 14, testament: "Old" },
    { slug: "malachi", name: "Malachi", chapters: 4, testament: "Old" },
    { slug: "matthew", name: "Matthew", chapters: 28, testament: "New" },
    { slug: "mark", name: "Mark", chapters: 16, testament: "New" },
    { slug: "luke", name: "Luke", chapters: 24, testament: "New" },
    { slug: "john", name: "John", chapters: 21, testament: "New" },
    { slug: "acts", name: "Acts", chapters: 28, testament: "New" },
    { slug: "romans", name: "Romans", chapters: 16, testament: "New" },
    { slug: "1-corinthians", name: "1 Corinthians", chapters: 16, testament: "New" },
    { slug: "2-corinthians", name: "2 Corinthians", chapters: 13, testament: "New" },
    { slug: "galatians", name: "Galatians", chapters: 6, testament: "New" },
    { slug: "ephesians", name: "Ephesians", chapters: 6, testament: "New" },
    { slug: "philippians", name: "Philippians", chapters: 4, testament: "New" },
    { slug: "colossians", name: "Colossians", chapters: 4, testament: "New" },
    { slug: "1-thessalonians", name: "1 Thessalonians", chapters: 5, testament: "New" },
    { slug: "2-thessalonians", name: "2 Thessalonians", chapters: 3, testament: "New" },
    { slug: "1-timothy", name: "1 Timothy", chapters: 6, testament: "New" },
    { slug: "2-timothy", name: "2 Timothy", chapters: 4, testament: "New" },
    { slug: "titus", name: "Titus", chapters: 3, testament: "New" },
    { slug: "philemon", name: "Philemon", chapters: 1, testament: "New" },
    { slug: "hebrews", name: "Hebrews", chapters: 13, testament: "New" },
    { slug: "james", name: "James", chapters: 5, testament: "New" },
    { slug: "1-peter", name: "1 Peter", chapters: 5, testament: "New" },
    { slug: "2-peter", name: "2 Peter", chapters: 3, testament: "New" },
    { slug: "1-john", name: "1 John", chapters: 5, testament: "New" },
    { slug: "2-john", name: "2 John", chapters: 1, testament: "New" },
    { slug: "3-john", name: "3 John", chapters: 1, testament: "New" },
    { slug: "jude", name: "Jude", chapters: 1, testament: "New" },
    { slug: "revelation", name: "Revelation", chapters: 22, testament: "New" }
  ];
  function bibleBookBySlug(slug) {
    for (var i = 0; i < BIBLE_BOOKS.length; i++) if (BIBLE_BOOKS[i].slug === slug) return BIBLE_BOOKS[i];
    return null;
  }
  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var bibleLinkCache = null;
  /* Words that must never link on their own in verse text, even if some
     title proposes them: generic role nouns and function words. A primary
     article name is never stopped — only these bare words are. This is
     what kept "people" linking to "Esther Saves Her People" and
     "Canaanite" linking to "Shuah the Canaanite": both came from
     first/last-word fragments of titles, not from articles about them. */
  var BIBLE_STOP = { "no": true, "people": true, "woman": true, "women": true,
    "man": true, "men": true, "child": true, "children": true, "son": true,
    "daughter": true, "father": true, "mother": true, "brother": true,
    "sister": true, "servant": true, "king": true, "queen": true,
    "her": true, "his": true, "him": true, "he": true, "she": true,
    "it": true, "they": true, "them": true, "we": true, "us": true,
    "you": true, "the": true, "and": true, "for": true, "with": true,
    "from": true, "that": true, "this": true, "saves": true, "seed": true,
    "simeon": true, "hadar": true };
  /* Word-study transliterations that must never link from verse text,
     even though the KJV spells a word the same way. "a" is the English
     article, not Alpha; "day" is the translation of yom, not H1767;
     "bath", "bag", "mad", "bad" and the rest are English words or name
     fragments (Bar-jesus, Rab-shakeh, Beth-shemesh) that merely coincide
     with a Hebrew or Greek transliteration. The transliterated words the
     KJV genuinely leaves untranslated (selah, hesed, shalom, mishpat)
     are deliberately NOT in this list, so they keep linking. */
  var BIBLE_WORDSTUDY_STOP = { "a": true, "bad": true, "bag": true,
    "bar": true, "bath": true, "baz": true, "bether": true, "day": true,
    "en": true, "geber": true, "geder": true, "ho": true, "leshem": true,
    "mad": true, "mar": true, "metheg": true, "nether": true,
    "pannag": true, "path": true, "rab": true, "rachab": true,
    "shemer": true, "shemesh": true, "telem": true };
  /* Verse-text people overrides and safe aliases. WHY THIS EXISTS: the
     comma-alias rule lets a sole comma-profile capture a bare name that
     usually means someone else, because regnal profiles ("King X") have
     no comma and propose nothing — so bare "Saul" linked to Saul, King
     of Edom (416 anchors), "Ahab" to Ahab, Son of Kolaiah (90), and
     "Josiah" to Josiah, Son of Zephaniah (49). Every entry here was
     verified against the verse text: the override target is the
     referent of the bare form in the overwhelming majority of verses,
     and the chapter rules below cover the exceptions. An override
     beats the alias rule and beats a non-people exact key, but only
     for the listed forms — it never reorders the global passes, so
     place-wins ("Haran", "Midian", "Shechem") is untouched. */
  var BIBLE_PEOPLE_OVERRIDE = {
    "saul": "King Saul", "ahab": "King Ahab", "josiah": "King Josiah",
    "abram": "Abraham", "satan": "Satan",
    "david": "King David", "solomon": "King Solomon", "christ": "Jesus",
    "peter": "Simon Peter", "esther": "Queen Esther", "pilate": "Pontius Pilate",
    "nebuchadnezzar": "King Nebuchadnezzar", "nebuchadrezzar": "King Nebuchadnezzar",
    "cyrus": "Cyrus the Great", "sarai": "Sarah", "noe": "Noah",
    "nachor": "Nahor, Father of Terah", "saruch": "Serug", "thara": "Terah",
    "sem": "Shem", "core": "Korah, Son of Izhar", "apollyon": "Abaddon",
    /* Hyphenated text forms whose profile drops the hyphen or the title:
       "Pharaoh-hophra" (Jer 44:30) -> Hophra; "Pharaoh-necho" (Jer 46:2,
       no final h) -> Pharaoh-nechoh; "Regem-melech" (Zech 7:2) ->
       Regemmelech. Each form occurs in exactly one verse. */
    "pharaoh-hophra": "Hophra", "pharaoh-necho": "Pharaoh-nechoh",
    "regem-melech": "Regemmelech"
  };
  /* Chapter/verse-scoped rules, checked before the override table.
     target null means: link NOTHING here (plain verdict) — used where
     the bare form means a different man, a tribe, or a kingdom in that
     passage (Ezra 10's two list-Men named Manasseh are not Joseph's
     son and not the king, so they stay plain). chapters "all" means
     every chapter of the book; verses, when present, restricts the
     rule to those verses of the listed chapters. */
  var BIBLE_CONTEXT_RULES = [
    { form: "saul", target: "Saul, King of Edom", book: "Genesis", chapters: [36] },
    { form: "saul", target: "Paul", book: "Acts", chapters: "all" },
    { form: "ahab", target: "Ahab, Son of Kolaiah", book: "Jeremiah", chapters: [29] },
    { form: "manasseh", target: "Manasseh, King of Judah", book: "2 Kings", chapters: [20, 21, 23, 24] },
    { form: "manasseh", target: "Manasseh, King of Judah", book: "2 Chronicles", chapters: [32, 33] },
    { form: "manasseh", target: "Manasseh, King of Judah", book: "1 Chronicles", chapters: [3] },
    { form: "manasseh", target: null, book: "Ezra", chapters: [10] },
    { form: "gad", target: "Gad, David's Seer", book: "1 Samuel", chapters: [22] },
    /* 2 Samuel 24 is verse-restricted: 24:5 is "the river of Gad"
       (the tribe's territory), not the seer — a whole-chapter rule
       would link it to the wrong man. */
    { form: "gad", target: "Gad, David's Seer", book: "2 Samuel", chapters: [24], verses: [11, 13, 14, 18, 19] },
    { form: "gad", target: "Gad, David's Seer", book: "1 Chronicles", chapters: [21, 29] },
    { form: "gad", target: "Gad, David's Seer", book: "2 Chronicles", chapters: [29] },
    { form: "joseph", target: "Joseph, Son of Jacob", book: "Genesis", chapters: "all" },
    { form: "joseph", target: "Joseph, Son of Jacob", book: "Acts", chapters: [7] },
    { form: "joseph", target: "Joseph, Son of Jacob", book: "Hebrews", chapters: [11] },
    { form: "joseph", target: "Joseph, Son of Jacob", book: "John", chapters: [4], verses: [5] },
    { form: "joseph", target: "Joseph, Husband of Mary", book: "Matthew", chapters: [1, 2] },
    { form: "joseph", target: "Joseph, Husband of Mary", book: "Luke", chapters: [1, 2, 4] },
    { form: "joseph", target: "Joseph, Husband of Mary", book: "Luke", chapters: [3], verses: [23] },
    { form: "joseph", target: "Joseph, Husband of Mary", book: "John", chapters: [1, 6] },
    { form: "hezekiah", target: "King Hezekiah", book: "2 Kings", chapters: [16, 18, 19, 20, 21] },
    { form: "hezekiah", target: "King Hezekiah", book: "2 Chronicles", chapters: [28, 29, 30, 31, 32, 33] },
    { form: "hezekiah", target: "King Hezekiah", book: "Isaiah", chapters: [1, 36, 37, 38, 39] },
    { form: "hezekiah", target: "King Hezekiah", book: "1 Chronicles", chapters: [4] },
    { form: "hezekiah", target: "King Hezekiah", book: "Jeremiah", chapters: [26] },
    { form: "hezekiah", target: "King Hezekiah", book: "Hosea", chapters: [1] },
    { form: "hezekiah", target: "King Hezekiah", book: "Micah", chapters: [1] },
    { form: "hezekiah", target: "King Hezekiah", book: "Proverbs", chapters: [25] },
    { form: "mary", target: "Mary, Mother of Jesus", book: "Matthew", chapters: [1, 2, 13] },
    { form: "mary", target: "Mary, Mother of Jesus", book: "Luke", chapters: [1, 2] },
    { form: "mary", target: "Mary of Bethany", book: "John", chapters: [11, 12] },
    { form: "abimelech", target: "Abimelech, King of Gerar", book: "Genesis", chapters: "all" },
    { form: "abimelech", target: "Abimelech, Son of Gideon", book: "Judges", chapters: [8, 9, 10] },
    { form: "abimelech", target: "Abimelech, Son of Gideon", book: "2 Samuel", chapters: [11] },
    { form: "lamech", target: "Lamech, Son of Methusael", book: "Genesis", chapters: [4] },
    { form: "lamech", target: "Lamech, Father of Noah", book: "Genesis", chapters: [5] },
    { form: "lamech", target: "Lamech, Father of Noah", book: "1 Chronicles", chapters: [1] },
    { form: "lamech", target: "Lamech, Father of Noah", book: "Luke", chapters: [3] },
    { form: "korah", target: "Korah, Son of Esau", book: "Genesis", chapters: [36] },
    { form: "korah", target: "Korah, Son of Esau", book: "1 Chronicles", chapters: [1] },
    { form: "korah", target: "Korah, Son of Izhar", book: "Exodus", chapters: [6] },
    { form: "korah", target: "Korah, Son of Izhar", book: "Numbers", chapters: [16, 26, 27] },
    { form: "korah", target: "Korah, Son of Izhar", book: "1 Chronicles", chapters: [6, 9] },
    { form: "korah", target: "Korah, Son of Hebron", book: "1 Chronicles", chapters: [2] },
    { form: "jehoshaphat", target: "King Jehoshaphat", book: "1 Kings", chapters: [15, 22] },
    { form: "jehoshaphat", target: "King Jehoshaphat", book: "2 Kings", chapters: [1, 3, 8, 12] },
    { form: "jehoshaphat", target: "King Jehoshaphat", book: "1 Chronicles", chapters: [3] },
    { form: "jehoshaphat", target: "King Jehoshaphat", book: "2 Chronicles", chapters: [17, 18, 19, 20, 21, 22] }
  ];
  /* Link-only forms: these link ONLY inside their verified set and stay
     plain everywhere else, even though an exact key exists. "Judah"
     is the patriarch in Genesis and Ruth 4:12, but a tribe, land, or
     kingdom in nearly every other book — linking those would point
     700+ kingdom/tribe mentions at one man. "Michael" is the archangel
     in Daniel, Jude, and Revelation, but a dozen minor men in the
     genealogies — the exact key alone would capture all of them. */
  var BIBLE_LINK_ONLY = {
    "judah": { target: "Judah", books: { "Genesis": "all", "Ruth": [4] } },
    "michael": { target: "Michael", books: { "Daniel": [10, 12], "Jude": [1], "Revelation": [12] } }
  };
  /* Verse-only forms: these link ONLY in the exact verses listed and stay
     plain everywhere else, even though a map key exists. Without this,
     every preposition "on" in the whole Bible linked to the city On
     (1,968 false anchors) and every sentence-initial "So" linked to So,
     King of Egypt (622 false anchors). The genuine uses are exactly:
     On — Genesis 41:45, 41:50, 46:20 ("priest of On"); So — 2 Kings 17:4
     ("So king of Egypt"). In an allowed verse the normal map hit applies,
     so the collection and index come from the map itself. */
  var BIBLE_VERSE_ONLY = {
    "on": { "Genesis": { 41: [45, 50], 46: [20] } },
    "so": { "2 Kings": { 17: [4] } }
  };
  /* Multi-word phrases whose meaning changes with case stay
     case-sensitive even though the multi pass is now case-insensitive:
     Ezekiel's "son of man" (the prophet, 93 times) is not the "Son of
     Man" topic, and Adam in Luke 3:38 is "the son of God" without
     being the "Son of God" topic. */
  var BIBLE_CASE_SENSITIVE_MULTI = { "son of man": true, "son of god": true };
  var biblePeopleByName = null;
  function peopleIndexByName(name) {
    if (!biblePeopleByName) {
      biblePeopleByName = {};
      (data.people || []).forEach(function (row, idx) {
        var n = val(row, "Name");
        if (n && !(n in biblePeopleByName)) biblePeopleByName[n] = idx;
      });
    }
    return (name in biblePeopleByName) ? biblePeopleByName[name] : -1;
  }
  function overrideTarget(formLower) {
    var name = BIBLE_PEOPLE_OVERRIDE[formLower];
    if (!name) return null;
    var idx = peopleIndexByName(name);
    return idx === -1 ? null : { coll: "people", idx: idx };
  }
  /* Returns {coll, idx}, {plain: true}, or null (no rule for this form
     in this passage). A null target in a rule is a deliberate plain
     verdict, not a miss. */
  function contextVerdict(formLower, book, chapter, verse) {
    for (var i = 0; i < BIBLE_CONTEXT_RULES.length; i++) {
      var r = BIBLE_CONTEXT_RULES[i];
      if (r.form !== formLower || r.book !== book) continue;
      if (r.chapters !== "all" && r.chapters.indexOf(chapter) === -1) continue;
      if (r.verses && r.verses.indexOf(verse) === -1) continue;
      if (!r.target) return { plain: true };
      var idx = peopleIndexByName(r.target);
      return idx === -1 ? { plain: true } : { coll: "people", idx: idx };
    }
    return null;
  }
  function linkOnlyVerdict(formLower, book, chapter) {
    var s = BIBLE_LINK_ONLY[formLower];
    if (!s) return null;
    var chs = s.books[book];
    if (chs && (chs === "all" || chs.indexOf(chapter) !== -1)) {
      var idx = peopleIndexByName(s.target);
      return idx === -1 ? { plain: true } : { coll: "people", idx: idx };
    }
    return { plain: true };
  }
  function isOldTestament(bookName) {
    for (var i = 0; i < BIBLE_BOOKS.length; i++) {
      if (BIBLE_BOOKS[i].name === bookName) return BIBLE_BOOKS[i].testament === "Old";
    }
    return false;
  }
  function bibleLinkData() {
    if (bibleLinkCache) return bibleLinkCache;
    /* Only words with a corresponding article link: a person, story,
       theme, topic, event (timeline), place, or word study. The map is
       built from the loaded aggregates every page load, so a new entry
       links automatically the moment its collection data ships — nothing
       is hand-listed here. Keys are exact article names, plus the
       first part of a comma-qualified name ("Jabin, King of Hazor" ->
       "Jabin") when exactly one entry proposes it. Title fragments
       ("People" from "Esther Saves Her People") never become keys. */
    var allowed = { people: true, places: true, stories: true, themes: true,
      topics: true, timeline: true, wordstudies: true };
    var map = {};
    /* Three passes, in claim order: other collections first (places
       still beat people for shared names — "Haran", "Midian",
       "Shechem" are cities far more often than men), then people, then
       word studies last, so a name with a profile never loses its
       verse link to a dictionary entry for the same word. Word-study
       rows are also skipped when they are proper names (the profile
       owns the name) or when their transliteration is on the stop list
       above. Person links are otherwise unaffected: RelatedPeople
       tokens still resolve people-first in the separate link index,
       and a person's full name ("Shechem the son of Hamor") still
       resolves by the phrase pass below. */
    ["other", "people", "wordstudies"].forEach(function (pass) {
      COLLECTIONS.forEach(function (c) {
        if (!allowed[c.id]) return;
        var kind = c.id === "people" ? "people" : (c.id === "wordstudies" ? "wordstudies" : "other");
        if (kind !== pass) return;
        (data[c.id] || []).forEach(function (row, idx) {
          if (c.id === "wordstudies") {
            if (BIBLE_WORDSTUDY_STOP[val(row, "Transliteration").toLowerCase()]) return;
            if (val(row, "PartOfSpeech").indexOf("proper noun") === 0) return;
          }
          var p = val(row, c.primary);
          if (!isEmpty(p) && !map[p]) map[p] = { coll: c.id, idx: idx };
          if (c.id === "wordstudies") {
            var w = val(row, "Word");
            if (!isEmpty(w) && !map[w]) map[w] = { coll: c.id, idx: idx };
          }
        });
      });
    });
    /* Alternate names the KJV itself uses: Matthew's own KeyVerses cite
       Luke 5:27-28, where he is called Levi the son of Alphaeus, so
       that phrase resolves to Matthew's profile. (Bare "Levi" still
       means Jacob's son, as in most verses.) */
    (data.people || []).forEach(function (row, idx) {
      if (val(row, "Name") === "Matthew" && !map["Levi, Son of Alphaeus"]) {
        map["Levi, Son of Alphaeus"] = { coll: "people", idx: idx };
      }
      /* Jeremiah 15:4 names Manasseh as "the son of Hezekiah" — the
         king, not Joseph's son — so the phrase needs its own key, or
         the phrase pass falls back to the bare exact key and links
         the verse to Joseph's son. */
      if (val(row, "Name") === "Manasseh, King of Judah" && !map["Manasseh, Son of Hezekiah"]) {
        map["Manasseh, Son of Hezekiah"] = { coll: "people", idx: idx };
      }
    });
    var proposed = {};
    COLLECTIONS.forEach(function (c) {
      if (!allowed[c.id]) return;
      /* Timeline event TITLES must not propose aliases: a title like
         "Abram, Lot, and Melchizedek" captured the bare name "Abram"
         61 times and pointed it at an event instead of Abraham. Only
         article names propose aliases. */
      if (c.id === "timeline") return;
      (data[c.id] || []).forEach(function (row, idx) {
        var p = val(row, c.primary);
        if (isEmpty(p) || p.indexOf(",") === -1) return;
        var a = p.split(",")[0].trim();
        if (!a || a.length < 2) return;
        if (!proposed[a]) proposed[a] = {};
        proposed[a][p] = { coll: c.id, idx: idx };
      });
    });
    Object.keys(proposed).forEach(function (a) {
      var owners = Object.keys(proposed[a]);
      if (owners.length !== 1 || map[a]) return;
      if (BIBLE_STOP[a.toLowerCase()]) return;
      map[a] = proposed[a][owners[0]];
    });
    var keys = Object.keys(map).filter(function (k) { return !BIBLE_STOP[k.toLowerCase()]; });
    var terms = keys.sort(function (a, b) { return b.length - a.length; });
    /* Override, context-rule, and link-only forms must ALSO be regex
       terms: a form with no map key (David, Joseph, Hezekiah…) would
       otherwise never reach the callbacks that resolve it, so the
       override table alone cannot create a link — it can only
       redirect one that already matches. */
    var virtualTerms = {};
    Object.keys(BIBLE_PEOPLE_OVERRIDE).forEach(function (f) { virtualTerms[f] = true; });
    BIBLE_CONTEXT_RULES.forEach(function (r) { virtualTerms[r.form] = true; });
    Object.keys(BIBLE_LINK_ONLY).forEach(function (f) { virtualTerms[f] = true; });
    Object.keys(virtualTerms).forEach(function (f) {
      if (terms.indexOf(f) === -1 && !BIBLE_STOP[f]) terms.push(f);
    });
    terms.sort(function (a, b) { return b.length - a.length; });
    var multi = terms.filter(function (t) { return t.indexOf(" ") !== -1; });
    var single = terms.filter(function (t) { return t.indexOf(" ") === -1; });
    var lower = {};
    keys.forEach(function (key) {
      var lk = key.toLowerCase();
      if (!lower[lk]) lower[lk] = map[key];
    });
    bibleLinkCache = {
      map: map,
      lower: lower,
      reMulti: new RegExp("(<a\\b[^>]*>.*?</a>)|\\b(" + multi.map(escapeRegExp).join("|") + ")\\b", "gi"),
      reSingle: new RegExp("(<a\\b[^>]*>.*?</a>)|\\b(" + single.map(escapeRegExp).join("|") + ")\\b", "gi")
    };
    return bibleLinkCache;
  }
  /* book/chapter/verse thread the chapter rules (BIBLE_CONTEXT_RULES
     and BIBLE_LINK_ONLY) into the linker; callers that omit them get
     the old context-free behaviour. */
  function linkifyVerseText(text, book, chapter, verse) {
    var t = bibleLinkData();
    var safe = esc(text).replace(/\[([^\]]+)\]/g, "<em>$1</em>");
    /* Phrase-pass lookup: qualified keys first, then the bare name.
       A bare fallback consults the override table (so "Saul the son
       of Cis" in Acts 13:21 still resolves to King Saul — the phrase
       itself disambiguates, and the Acts chapter rule must NOT
       override it to Paul). Chapter rules are deliberately NOT
       consulted here: they govern bare occurrences, and a qualified
       phrase carries its own disambiguation. A bare fallback for a
       link-only form (Judah, Michael) resolves only inside its
       verified set and otherwise counts as no hit. */
    function phraseHit(keys) {
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(",") === -1) {
          /* Bare fallback: link-only verdict first (a Judah/Michael
             fallback outside its verified set is no hit at all),
             then the override table — which must beat the stale
             sole-owner alias key, or "X the son of Josiah" would
             link its father to Josiah, Son of Zephaniah instead of
             King Josiah — then the map. */
          var lo = linkOnlyVerdict(keys[i].toLowerCase(), book, chapter);
          if (lo) return lo.plain ? null : lo;
          var ov = overrideTarget(keys[i].toLowerCase());
          if (ov) return ov;
        }
        var hit = t.map[keys[i]] || t.lower[keys[i].toLowerCase()];
        if (hit && !BIBLE_STOP[keys[i].toLowerCase()]) return hit;
      }
      return null;
    }
    /* Phrase pass, first: "Jahaziel the son of Zechariah" links as a
       whole, with each person going to the context-correct profile —
       the son to "Jahaziel, Son of Zechariah" when it exists, the
       father to "Zechariah, Father of Jahaziel" when it exists — and
       the connector ("the son of") stays inside the first link, so no
       word of the name stands plain. The same pass handles "X the
       daughter of Y" and "X the mother of Y" ("Mary the mother of
       Jesus" -> Mary, Mother of Jesus, and Jesus), and now also
       husband, wife, brother, sister, and father ("Joseph the husband
       of Mary" -> Joseph, Husband of Mary, and Mary). A chain
       ("Achan the son of Carmi, the son of Zabdi") resolves the middle
       name against the name that follows it, so Carmi goes to Carmi,
       Son of Zabdi, not to Carmi son of Reuben. Falls back to the
       plain names when no qualified profile exists, and to one link
       over the first name plus its connector when only the first name
       resolves — except for the new kin terms, which never swallow:
       returning the phrase untouched lets the single pass resolve
       each side on its own (Matthew 1:16 links Joseph by the Matthew 1
       rule and Mary by the Matthew 1 rule, instead of swallowing Mary
       into Joseph's anchor). A name that resolves to nothing is left
       untouched, and a stopped bare name (an ambiguous one, like
       Simeon) never wins a fallback. */
    safe = safe.replace(/\b([A-Z][A-Za-z]+),? the (son|daughter|mother|husband|wife|brother|sister|father) of ([A-Z][A-Za-z]+)(, the (son|daughter) of ([A-Z][A-Za-z]+))?\b/g, function (m, x, rel, y, chain, rel2, z) {
      var xKeys, yKeys;
      if (rel === "son") xKeys = [x + ", Son of " + y, x];
      else if (rel === "daughter") xKeys = [x + ", Daughter of " + y, x];
      else if (rel === "mother") xKeys = [x + ", Mother of " + y, x];
      else if (rel === "husband") xKeys = [x + ", Husband of " + y, x];
      else if (rel === "wife") xKeys = [x + ", Wife of " + y, x];
      else if (rel === "brother") xKeys = [x + ", Brother of " + y, x];
      else if (rel === "sister") xKeys = [x + ", Sister of " + y, x];
      else xKeys = [x + ", Father of " + y, x];
      yKeys = [];
      if (chain && (rel2 === "son" || rel2 === "daughter")) yKeys.push(y + (rel2 === "son" ? ", Son of " : ", Daughter of ") + z);
      if (rel === "son") yKeys.push(y + ", Father of " + x, y);
      else if (rel === "daughter") yKeys.push(y + ", Father of " + x, y + ", Mother of " + x, y);
      else if (rel === "mother") yKeys.push(y + ", Son of " + x, y + ", Daughter of " + x, y);
      else if (rel === "husband") yKeys.push(y + ", Wife of " + x, y);
      else if (rel === "wife") yKeys.push(y + ", Husband of " + x, y);
      else if (rel === "brother") yKeys.push(y + ", Brother of " + x, y);
      else if (rel === "sister") yKeys.push(y + ", Sister of " + x, y);
      else yKeys.push(y + ", Son of " + x, y + ", Daughter of " + x, y);
      var xHit = phraseHit(xKeys), yHit = phraseHit(yKeys);
      if (!xHit) return m;
      var yPos = m.indexOf(y, x.length);
      var connector = m.slice(x.length, yPos);
      var tail = m.slice(yPos + y.length);
      if (!yHit) {
        if (rel === "husband" || rel === "wife" || rel === "brother" || rel === "sister" || rel === "father") return m;
        return '<a href="#/' + xHit.coll + '/' + xHit.idx + '">' + esc(x + connector + y) + '</a>' + esc(tail);
      }
      return '<a href="#/' + xHit.coll + '/' + xHit.idx + '">' + esc(x + connector) + '</a>' +
        '<a href="#/' + yHit.coll + '/' + yHit.idx + '">' + esc(y) + '</a>' + esc(tail);
    });
    safe = safe.replace(t.reMulti, function (m, anchor, term, offset, str) {
      if (anchor) return anchor;
      /* Hyphen guard (see single pass): never link half of a
         hyphenated name. */
      if ((offset > 0 && str[offset - 1] === "-") || str[offset + m.length] === "-") return term;
      /* "Angel of the LORD" is an Old Testament theophany figure; the
         New Testament's "angel of the Lord" is an ordinary angel, so
         it never links to that profile even though the multi pass is
         now case-insensitive. */
      if (term.toLowerCase() === "angel of the lord" && !isOldTestament(book)) return term;
      var hit = t.map[term];
      if (hit) return '<a href="#/' + hit.coll + '/' + hit.idx + '">' + esc(term) + '</a>';
      if (BIBLE_CASE_SENSITIVE_MULTI[term.toLowerCase()]) return term;
      hit = t.lower[term.toLowerCase()];
      if (!hit) return m;
      return '<a href="#/' + hit.coll + '/' + hit.idx + '">' + esc(term) + '</a>';
    });
    safe = safe.replace(t.reSingle, function (m, anchor, term, offset, str) {
      if (anchor) return anchor;
      /* Hyphen guard: \b treats "-" as a word boundary, so without
         this a hyphenated name fractures — Jeremiah 39:3 used to
         render plain "Samgar-" plus a wrong "nebo" link to the place
         Nebo. A single-word match immediately adjacent to "-" on
         either side is rejected unless the full hyphenated term is
         itself the key (in which case the longer term matched first
         and this branch never runs for its parts). */
      if ((offset > 0 && str[offset - 1] === "-") || str[offset + m.length] === "-") return term;
      var fl = term.toLowerCase();
      var vo = BIBLE_VERSE_ONLY[fl];
      if (vo) {
        var chs = vo[book];
        var vs = chs && chs[chapter];
        if (!vs || vs.indexOf(verse) === -1) return term;
      }
      var lo = linkOnlyVerdict(fl, book, chapter);
      if (lo) return lo.plain ? term : '<a href="#/people/' + lo.idx + '">' + esc(term) + '</a>';
      var cv = contextVerdict(fl, book, chapter, verse);
      if (cv) return cv.plain ? term : '<a href="#/people/' + cv.idx + '">' + esc(term) + '</a>';
      var ov = overrideTarget(fl);
      if (ov) return '<a href="#/people/' + ov.idx + '">' + esc(term) + '</a>';
      var hit = t.map[term] || t.lower[fl];
      if (!hit) return term;
      return '<a href="#/' + hit.coll + '/' + hit.idx + '">' + esc(term) + '</a>';
    });
    return safe;
  }
  /* Cross references for a chapter, drawn from the site's own articles:
     every passage that an article cites alongside this chapter. An
     article citing "Numbers 21" and "John 3" links those two chapters
     to each other, so the bronze serpent chapter points at John 3:14
     without anyone hand-writing a cross-reference list. Ranges expand
     up to ten chapters ("Numbers 22-24" counts for 22, 23, and 24). */
  function refsInValue(value) {
    var out = [];
    var lastBook = null;
    String(value).split(";").forEach(function (part) {
      var p = part.trim();
      if (!p) return;
      var found = bibleBookByNameStart(p);
      var book = found ? found.book : lastBook;
      var rest = found ? found.rest : p;
      if (found) lastBook = book;
      if (!book || !rest) return;
      var lastChapter = null, lastHadVerse = false;
      rest.split(",").forEach(function (item) {
        var it = item.trim();
        var m = it.match(/^(\d+)(?::(\d+))?/);
        if (!m) return;
        var ch = +m[1];
        var remapped = false;
        if (!m[2] && lastChapter !== null && lastHadVerse) {
          /* Verse continuation, same rule as linkifyScriptureRefs:
             "Numbers 13:22, 28, 33" cites chapter 13 three times, not
             chapters 28 and 33. */
          ch = lastChapter; remapped = true;
        } else if (book.chapters === 1 && !m[2] && ch !== 1) {
          /* Single-chapter book cited by verse alone ("Jude 22"). */
          ch = 1; remapped = true;
        }
        if (ch < 1 || ch > book.chapters) return;
        out.push({ slug: book.slug, name: book.name, chapter: ch });
        if (m[2]) { lastChapter = ch; lastHadVerse = true; }
        else if (remapped) { /* chapter unchanged */ }
        else { lastChapter = ch; lastHadVerse = false; }
        if (remapped) return;
        var rm = it.match(/^(\d+)\s*-\s*(\d+)/);
        if (rm) {
          var a = +rm[1], b = +rm[2];
          if (b > a && b - a <= 10) {
            for (var k = a + 1; k <= b && k <= book.chapters; k++) {
              out.push({ slug: book.slug, name: book.name, chapter: k });
            }
          }
        }
      });
    });
    return out;
  }
  function crossRefsForChapter(bookName, chapter) {
    var bookSlug = null;
    BIBLE_BOOKS.forEach(function (b) { if (b.name === bookName) bookSlug = b.slug; });
    var seen = {}, list = [];
    COLLECTIONS.forEach(function (c) {
      if (c.id === "quizzes") return;
      (data[c.id] || []).forEach(function (row) {
        var refs = [];
        SCRIPTURE_FIELDS.forEach(function (f) {
          var v = val(row, f);
          if (!isEmpty(v)) refs = refs.concat(refsInValue(v));
        });
        var citesHere = refs.some(function (r) { return r.slug === bookSlug && r.chapter === chapter; });
        if (!citesHere) return;
        var added = {};
        refs.forEach(function (r) {
          if (r.slug === bookSlug && r.chapter === chapter) return;
          var key = r.slug + "/" + r.chapter;
          if (added[key]) return;
          added[key] = true;
          if (!seen[key]) { seen[key] = { ref: r, count: 0 }; list.push(seen[key]); }
          seen[key].count++;
        });
      });
    });
    var order = {};
    BIBLE_BOOKS.forEach(function (b, i) { order[b.slug] = i; });
    list.sort(function (a, b) {
      return (b.count - a.count) ||
        (order[a.ref.slug] - order[b.ref.slug]) ||
        (a.ref.chapter - b.ref.chapter);
    });
    return list.slice(0, 24).map(function (x) { return x.ref; });
  }
  function parseBibleRef(q) {
    var low = q.toLowerCase();
    if (low.indexOf("psalm ") === 0) q = "Psalms " + q.slice(6);
    else if (low.indexOf("song of songs ") === 0) q = "Song of Solomon " + q.slice(14);
    else if (low.indexOf("song ") === 0) q = "Song of Solomon " + q.slice(5);
    var books = BIBLE_BOOKS.slice().sort(function (a, b) { return b.name.length - a.name.length; });
    for (var i = 0; i < books.length; i++) {
      var name = books[i].name;
      if (q.toLowerCase().indexOf(name.toLowerCase()) === 0) {
        var rest = q.slice(name.length).trim();
        var m = rest.match(/^(\d+)(?::(\d+))?/);
        if (m && +m[1] >= 1 && +m[1] <= books[i].chapters) {
          return { slug: books[i].slug, chapter: +m[1], verse: m[2] ? +m[2] : null };
        }
        return null;
      }
    }
    return null;
  }
  function viewBible() {
    function grid(list) {
      return "<div class='card-grid'>" + list.map(function (b) {
        return "<a class='card' href='#/bible/" + b.slug + "'><h3>" + esc(b.name) + "</h3><p class='meta'>" + b.chapters + " chapters</p></a>";
      }).join("") + "</div>";
    }
    var ot = BIBLE_BOOKS.filter(function (b) { return b.testament === "Old"; });
    var nt = BIBLE_BOOKS.filter(function (b) { return b.testament === "New"; });
    var html = "<h2>Bible</h2><div class='post-body'>" +
      "<p>Read the King James Version — public domain, free for everyone — with names linked to the site's articles. Tap a person, place, or event in the text to open its article.</p>" +
      "<p>Looking for another translation? The NIV and ESV are copyrighted, so this reader shows the KJV on-site; every chapter page also links to the same passage on BibleGateway in NIV and ESV.</p>" +
      '<div class="controls"><input type="search" id="bibleRef" placeholder="Go to a passage, e.g. John 3:16">' +
      '<button class="btn" id="bibleGo">Go</button></div>' +
      '<p><a class="btn" href="#/bible/topics">Bible Verses by Topic</a> Find passages by need — healing, strength, anxiety, fear, hope, and every other topic.</p>' +
      "<h3>Old Testament</h3>" + grid(ot) +
      "<h3>New Testament</h3>" + grid(nt) + "</div>";
    app.innerHTML = html;
    function go() {
      var q = document.getElementById("bibleRef").value.trim();
      var ref = parseBibleRef(q);
      if (ref) location.hash = "#/bible/" + ref.slug + "/" + ref.chapter + (ref.verse ? "?v=" + ref.verse : "");
      else document.getElementById("bibleRef").focus();
    }
    document.getElementById("bibleGo").addEventListener("click", go);
    document.getElementById("bibleRef").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); go(); } });
    window.scrollTo(0, 0);
  }
  /* Bible Verses by Topic: every Topics and Themes entry's KeyPassages,
     rendered as links straight into this reader. No new data, no new
     collection — the reader reuses the topics already on the site. */
  function viewBibleTopics() {
    var NEEDS = ["Healing", "Strength", "Anxiety", "Fear", "Hope", "Peace", "Love", "Forgiveness", "Comfort", "Courage", "Grief", "Joy", "Refuge"];
    var rows = (data.topics || []).map(function (t, i) { return { t: t, i: i }; })
      .filter(function (x) { return x.t.KeyPassages && x.t.KeyPassages.trim(); });
    function card(x) {
      var refs = x.t.KeyPassages.split(";").map(function (s) { return s.trim(); }).filter(Boolean);
      return "<div class='card bible-topic-card' data-name='" + esc(x.t.Topic.toLowerCase()) + "'>" +
        "<h3><a href='#/topics/" + x.i + "'>" + esc(x.t.Topic) + "</a></h3>" +
        "<p class='meta'>" + refs.length + (refs.length === 1 ? " passage" : " passages") + "</p>" +
        "<p>" + linkifyScriptureRefs(x.t.KeyPassages) + "</p></div>";
    }
    var html = "<h2>Bible Verses by Topic</h2><div class='post-body'>" +
      "<p>Find passages by what you need. Tap a passage to read it in the Bible reader; tap a topic name to open its full article.</p>" +
      '<div class="controls"><input type="search" id="bibleTopicSearch" placeholder="Search topics, e.g. healing"></div>' +
      "<p>" + NEEDS.map(function (n) {
        return '<button class="chip bible-topic-need" data-need="' + esc(n.toLowerCase()) + '">' + esc(n) + "</button>";
      }).join(" ") + "</p>" +
      "<p class='meta' id='bibleTopicCount'>" + rows.length + " topics</p>" +
      "<div class='card-grid' id='bibleTopicGrid'>" + rows.map(card).join("") + "</div>" +
      "<p id='bibleTopicEmpty' style='display:none'>No topics match that search.</p></div>";
    app.innerHTML = html;
    var input = document.getElementById("bibleTopicSearch");
    function filter() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      Array.prototype.forEach.call(document.querySelectorAll(".bible-topic-card"), function (el) {
        var ok = !q || el.getAttribute("data-name").indexOf(q) !== -1;
        el.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
      document.getElementById("bibleTopicEmpty").style.display = shown ? "none" : "";
      document.getElementById("bibleTopicCount").textContent = shown === rows.length ? rows.length + " topics" : shown + " of " + rows.length + " topics";
    }
    input.addEventListener("input", filter);
    Array.prototype.forEach.call(document.querySelectorAll(".bible-topic-need"), function (btn) {
      btn.addEventListener("click", function () { input.value = btn.getAttribute("data-need"); filter(); input.focus(); });
    });
    window.scrollTo(0, 0);
  }
  /* ---------- Dead Sea Scrolls passage lookup ---------- */
  /* Type a passage; list the manuscripts whose preserved passages cover
     it, earliest first. Verse-aware, where refsInValue records chapters
     only: it mirrors refsInValue's context rules (book names carry
     across ";" segments, chapter/verse context resets at each ";"
     segment, a bare number after a chapter:verse item is a verse of
     that chapter, a bare range with no verse context is a chapter
     range), plus verse ranges, cross-chapter ranges, single-chapter
     books cited by verse alone, and the one prose range in the data
     ("Chiefly Psalms 101-150"). Parenthetical notes are dropped
     unless they hold a passage of their own; a "[lacking ...]" note
     subtracts exactly those verses. A "?" reading matches like any
     other; the card always shows the manuscript's own preserved
     text, so readers see the uncertainty mark themselves. */
  function parsePreserved(value) {
    var out = [];
    function push(book, ch, vs, ve) {
      if (ch < 1 || ch > book.chapters) return;
      out.push({ slug: book.slug, chapter: ch, vs: vs, ve: ve });
    }
    /* Parenthetical passages become segments of their own; other
       parenthetical notes are dropped. */
    var text = String(value).replace(/[–—]/g, "-").replace(/\(([^)]*)\)/g, function (m, inner) {
      var t = inner.trim();
      return bibleBookByNameStart(t) ? "; " + t + " ;" : "";
    });
    var lastBook = null;
    text.split(";").forEach(function (part) {
      var p = part.trim();
      if (!p) return;
      var found = bibleBookByNameStart(p);
      var book = found ? found.book : lastBook;
      if (found) lastBook = book;
      if (!book) {
        /* Prose range with no book at the start, e.g. "Chiefly Psalms
           101-150": take every Psalm chapter or range named in it. */
        var ps = bookByName("Psalms");
        var m2, any = false, re = /psalms?\s+(\d+)(?:\s*-\s*(\d+))?/gi;
        while ((m2 = re.exec(p)) !== null) {
          any = true;
          var a = +m2[1], b = m2[2] ? +m2[2] : a;
          for (var k = a; k <= b; k++) push(ps, k, null, null);
        }
        return;
      }
      var rest = found ? found.rest : p;
      if (!rest) return;
      var lastChapter = null, lastHadVerse = false;
      rest.split(",").forEach(function (item) {
        var it = item.trim();
        if (!it) return;
        /* A "[lacking ...]" note subtracts exactly those verses. */
        var lacking = null, bm = it.match(/\[([^\]]*)\]/);
        if (bm) {
          var lm = bm[1].match(/lacking\s+(?:(\d+):)?(\d+)\s*-\s*(\d+)/i);
          if (lm) lacking = { ch: lm[1] ? +lm[1] : null, vs: +lm[2], ve: +lm[3] };
          it = it.replace(/\[[^\]]*\]/g, "").trim();
        }
        it = it.replace(/\?/g, "");
        if (!it) return;
        var m = it.match(/^(\d+)(?::(\d+))?(?:\s*-\s*(\d+)(?::(\d+))?)?$/);
        if (!m) return;
        var a = +m[1], b = m[2] ? +m[2] : null, c = m[3] ? +m[3] : null, d = m[4] ? +m[4] : null;
        var before = out.length;
        if (b !== null) {
          if (d !== null) {
            push(book, a, b, null);
            for (var k = a + 1; k < c; k++) push(book, k, null, null);
            push(book, c, 1, d);
            lastChapter = c; lastHadVerse = true;
          } else if (c !== null) {
            push(book, a, b, c);
            lastChapter = a; lastHadVerse = true;
          } else {
            push(book, a, b, b);
            lastChapter = a; lastHadVerse = true;
          }
        } else if (lastHadVerse) {
          if (d !== null) {
            /* "27-21:4" after chapter 20 verses: 20:27 to 21:4. */
            push(book, lastChapter, a, null);
            for (var j = lastChapter + 1; j < c; j++) push(book, j, null, null);
            push(book, c, 1, d);
            lastChapter = c; lastHadVerse = true;
          } else {
            push(book, lastChapter, a, c !== null ? c : a);
          }
        } else if (book.chapters === 1) {
          /* Single-chapter book cited by verse alone ("Obadiah 1-5"). */
          push(book, 1, a, c !== null ? c : a);
          lastChapter = 1; lastHadVerse = true;
        } else if (c !== null) {
          for (var n = a; n <= c; n++) push(book, n, null, null);
          lastChapter = null; lastHadVerse = false;
        } else {
          push(book, a, null, null);
          lastChapter = a; lastHadVerse = false;
        }
        if (lacking) {
          var lc = lacking.ch !== null ? lacking.ch : lastChapter;
          var kept = [];
          for (var s2 = before; s2 < out.length; s2++) {
            var seg = out[s2];
            if (seg.chapter !== lc || seg.vs === null) { kept.push(seg); continue; }
            var lo = seg.vs, hi = seg.ve === null ? 9999 : seg.ve;
            if (lacking.ve < lo || lacking.vs > hi) { kept.push(seg); continue; }
            if (lacking.vs > lo) kept.push({ slug: seg.slug, chapter: seg.chapter, vs: lo, ve: lacking.vs - 1 });
            if (lacking.ve < hi) kept.push({ slug: seg.slug, chapter: seg.chapter, vs: lacking.ve + 1, ve: seg.ve });
          }
          out.splice.apply(out, [before, out.length - before].concat(kept));
        }
      });
    });
    return out;
  }
  /* Biblical Atlas: 12 verified places on a Leaflet map + filterable list.
     Leaflet loads lazily on first #/atlas visit so every other page stays
     untouched; the text list below the map is the fallback if the map CDN
     is unreachable, and the only atlas-side action is "View place page". */
  var ATLAS_ERA_ORDER = ["Primeval / Patriarchs", "Exodus and Wilderness", "Conquest and Judges", "United Monarchy", "Divided Monarchy", "Exile", "Return and Second Temple", "Life of Christ", "Early Church"];
  var atlasTestament = "all", atlasEvidence = "all", atlasEra = "all", atlasQuery = "";
  var atlasMap = null, atlasMarkerLayer = null, atlasLeafletState = "idle";
  function atlasFiltered() {
    var q = atlasQuery.toLowerCase();
    return atlasItems.filter(function (it) {
      if (q) {
        var hay = (it.placeName + " " + it.modernName + " " + (it.altNames || []).join(" ")).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      if (atlasTestament === "old" && !(it.testament === "Old" || it.testament === "Both")) return false;
      if (atlasTestament === "new" && !(it.testament === "New" || it.testament === "Both")) return false;
      if (atlasTestament === "both" && it.testament !== "Both") return false;
      if (atlasEra !== "all" && (it.periods || []).indexOf(atlasEra) === -1) return false;
      if (atlasEvidence !== "all" && it.evidence !== atlasEvidence) return false;
      return true;
    });
  }
  function atlasRow(it) {
    return "<div class='atlas-row'><a href='#/places/" + it.placeIndex + "'><strong>" + esc(it.placeName) + "</strong></a>" +
      "<span class='atlas-badge'>" + esc(it.evidence) + "</span>" +
      "<p class='meta'>" + esc(it.modernName) + " · " + esc((it.periods || []).join(", ")) + "</p>" +
      "<p class='atlas-note'>" + esc(it.confidenceNote) + "</p>" +
      "<p><a href='#/places/" + it.placeIndex + "'>View place page →</a></p></div>";
  }
  function atlasRefreshMarkers(rows) {
    if (!atlasMap || !window.L) return;
    if (atlasMarkerLayer) atlasMap.removeLayer(atlasMarkerLayer);
    atlasMarkerLayer = window.L.layerGroup();
    var bounds = [];
    rows.forEach(function (it) {
      var icon = window.L.divIcon({ className: "atlas-pin-wrap", html: '<span class="atlas-pin' + (it.evidence === "Probable" ? " probable" : "") + '"></span>', iconSize: [22, 22], iconAnchor: [11, 11] });
      var popup = "<strong>" + esc(it.placeName) + "</strong><br>" + esc(it.modernName) +
        "<br><span class='atlas-badge'>" + esc(it.evidence) + "</span><br><span class='atlas-note'>" + esc(it.confidenceNote) + "</span>" +
        "<br><a href='#/places/" + it.placeIndex + "'>View place page →</a>";
      window.L.marker([it.lat, it.lon], { icon: icon }).bindPopup(popup).addTo(atlasMarkerLayer);
      bounds.push([it.lat, it.lon]);
    });
    atlasMarkerLayer.addTo(atlasMap);
    if (bounds.length > 1) atlasMap.fitBounds(bounds, { padding: [30, 30] });
    else if (bounds.length === 1) atlasMap.setView(bounds[0], 8);
  }
  function atlasRefresh() {
    var list = document.getElementById("atlasList");
    var count = document.getElementById("atlasCount");
    if (!list) return;
    var rows = atlasFiltered();
    if (count) count.textContent = "Showing " + rows.length + " of " + atlasItems.length + " places";
    list.innerHTML = rows.length ? rows.map(atlasRow).join("") : "<p class='empty'>No places match those filters.</p>";
    atlasRefreshMarkers(rows);
  }
  function atlasInitMap() {
    var el = document.getElementById("atlasMap");
    if (!el) return;
    if (atlasLeafletState === "failed") { el.innerHTML = "<p class='empty'>The map could not load — the list below still works.</p>"; return; }
    if (!window.L) {
      if (atlasLeafletState === "loading") return;
      atlasLeafletState = "loading";
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
      var script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = function () { atlasLeafletState = "ready"; atlasInitMap(); };
      script.onerror = function () { atlasLeafletState = "failed"; atlasInitMap(); };
      document.head.appendChild(script);
      return;
    }
    atlasLeafletState = "ready";
    if (atlasMap) { atlasMap.remove(); atlasMap = null; atlasMarkerLayer = null; }
    atlasMap = window.L.map(el).setView([35, 30], 4);
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(atlasMap);
    atlasRefreshMarkers(atlasFiltered());
  }
  function viewAtlas() {
    var eras = ATLAS_ERA_ORDER.filter(function (e) {
      return atlasItems.some(function (it) { return (it.periods || []).indexOf(e) !== -1; });
    });
    var html = "<h2>Biblical Atlas</h2><p class='page-intro'>Real places on a real map — every marker links to its place page. Locations come from OpenBible.info's Bible Geocoding data, with each identification labelled by how certain it is.</p>";
    if (!atlasItems.length) {
      html += "<p class='empty'>The atlas data is not available right now.</p>";
    } else {
      html += "<div class='atlas-map' id='atlasMap'></div>" +
        "<p class='meta'>Rose = Confirmed · Navy = Probable — Capernaum's marker shows its primary candidate, Tell Hum.</p>" +
        "<div class='controls'><input id='atlasSearch' type='search' placeholder='Search places…' value='" + esc(atlasQuery).replace(/'/g, "&#39;") + "'>" +
        "<span class='chip-label'>Testament:</span>" +
        [["all", "All"], ["old", "Old Testament"], ["new", "New Testament"], ["both", "Both Testaments"]].map(function (t) {
          return "<button class='chip atlas-test-chip" + (atlasTestament === t[0] ? " active" : "") + "' data-t='" + t[0] + "'>" + t[1] + "</button>";
        }).join("") +
        "<span class='chip-label'>Era:</span><select id='atlasEra'><option value='all'>All eras</option>" +
        eras.map(function (e) { return "<option value='" + esc(e) + "'" + (atlasEra === e ? " selected" : "") + ">" + esc(e) + "</option>"; }).join("") + "</select>" +
        "<span class='chip-label'>Evidence:</span>" +
        [["all", "All"], ["Confirmed", "Confirmed"], ["Probable", "Probable"], ["Disputed", "Disputed"], ["Unknown", "Unknown"]].map(function (t) {
          return "<button class='chip atlas-ev-chip" + (atlasEvidence === t[0] ? " active" : "") + "' data-v='" + t[0] + "'>" + t[1] + "</button>";
        }).join("") + "</div>" +
        "<p class='meta' id='atlasCount'></p><div id='atlasList'></div>";
    }
    html += "<p class='meta'>Place locations: <a href='https://www.openbible.info/geo/'>OpenBible.info Bible Geocoding</a> (CC BY 4.0). Cross-checks: <a href='https://pleiades.stoa.org/'>Pleiades</a> (CC BY 3.0). Base map © OpenStreetMap contributors (ODbL). Ancient geography is approximate; disputed locations are labelled, never hidden.</p>";
    app.innerHTML = html;
    if (atlasItems.length) {
      atlasRefresh();
      atlasInitMap();
      var search = document.getElementById("atlasSearch");
      if (search) search.addEventListener("input", function () { atlasQuery = search.value.trim(); atlasRefresh(); });
      var era = document.getElementById("atlasEra");
      if (era) era.addEventListener("change", function () { atlasEra = era.value; atlasRefresh(); });
      document.querySelectorAll(".atlas-test-chip").forEach(function (b) {
        b.addEventListener("click", function () {
          atlasTestament = b.getAttribute("data-t");
          document.querySelectorAll(".atlas-test-chip").forEach(function (x) { x.classList.toggle("active", x === b); });
          atlasRefresh();
        });
      });
      document.querySelectorAll(".atlas-ev-chip").forEach(function (b) {
        b.addEventListener("click", function () {
          atlasEvidence = b.getAttribute("data-v");
          document.querySelectorAll(".atlas-ev-chip").forEach(function (x) { x.classList.toggle("active", x === b); });
          atlasRefresh();
        });
      });
    }
    window.scrollTo(0, 0);
  }
  function viewLookup(params) {
    var rows = data.manuscripts || [];
    var dates = {};
    (lookupDates || []).forEach(function (d) { dates[d.manuscriptId] = d; });
    var BASIS_RANK = { "palaeography + radiocarbon": 0, "palaeography": 1, "unknown": 2, "period label": 3 };
    function yearText(y) { return y < 0 ? (-y) + " BC" : "AD " + y; }
    function rangeText(d) {
      if (d.dateMin === null || d.dateMin === undefined || d.dateMax === null || d.dateMax === undefined) return "";
      if (d.dateMin === d.dateMax) return yearText(d.dateMin);
      if (d.dateMin < 0 && d.dateMax < 0) return (-d.dateMin) + "–" + (-d.dateMax) + " BC";
      if (d.dateMin < 0) return (-d.dateMin) + " BC–" + yearText(d.dateMax);
      return "AD " + d.dateMin + "–" + d.dateMax;
    }
    function bookName(slug) {
      var n = "";
      BIBLE_BOOKS.forEach(function (b) { if (b.slug === slug) n = b.name; });
      return n;
    }
    function run(q) {
      var out = document.getElementById("lookupResults");
      var ref = parseBibleRef(q);
      if (!ref) {
        out.innerHTML = '<p class="empty">Enter a passage like Isaiah 53:5 or Psalm 22.</p>';
        return;
      }
      if (!lookupDates.length) {
        out.innerHTML = '<p class="empty">The manuscript date data is not available right now.</p>';
        return;
      }
      var dated = [], undated = [];
      rows.forEach(function (row, i) {
        var hit = parsePreserved(val(row, "PreservedPassages")).some(function (s) {
          if (s.slug !== ref.slug || s.chapter !== ref.chapter) return false;
          if (ref.verse === null) return true;
          if (s.vs === null) return true;
          if (s.ve === null) return ref.verse >= s.vs;
          return ref.verse >= s.vs && ref.verse <= s.ve;
        });
        if (!hit) return;
        var d = dates[val(row, "ManuscriptID")] || null;
        var item = { row: row, idx: i, d: d };
        if (d && d.dateMin !== null && d.dateMin !== undefined) dated.push(item);
        else undated.push(item);
      });
      dated.sort(function (x, y) {
        return (x.d.dateMin - y.d.dateMin) ||
          ((BASIS_RANK[x.d.datingBasis] === undefined ? 9 : BASIS_RANK[x.d.datingBasis]) - (BASIS_RANK[y.d.datingBasis] === undefined ? 9 : BASIS_RANK[y.d.datingBasis])) ||
          (val(x.row, "Manuscript") < val(y.row, "Manuscript") ? -1 : (val(x.row, "Manuscript") > val(y.row, "Manuscript") ? 1 : 0));
      });
      undated.sort(function (x, y) { return val(x.row, "Manuscript") < val(y.row, "Manuscript") ? -1 : 1; });
      var label = bookName(ref.slug) + " " + ref.chapter + (ref.verse ? ":" + ref.verse : "");
      var reader = "#/bible/" + ref.slug + "/" + ref.chapter + (ref.verse ? "?v=" + ref.verse : "");
      function card(item) {
        var row = item.row, d = item.d;
        var dateParts = [];
        var da = val(row, "DateApprox");
        if (da) dateParts.push(esc(da));
        if (d) {
          var r = rangeText(d);
          if (r) dateParts.push(esc(r));
          if (d.datingBasis === "period label") dateParts.push("period-derived date");
          if (d.confidence === "disputed") dateParts.push("<strong>Dating disputed</strong>");
        }
        var dateLine = dateParts.join(" · ");
        return "<div class='card'><h3><a href='#/manuscripts/" + item.idx + "'>" + esc(val(row, "Manuscript")) + "</a></h3>" +
          "<p class='meta'>" + esc(val(row, "ManuscriptID")) + " · " + esc(val(row, "Cave")) + " · " + esc(val(row, "Completeness")) + "</p>" +
          "<p class='meta'>" + dateLine + "</p>" +
          (d && d.confidence === "disputed" && d.note ? "<p>" + esc(d.note) + "</p>" : "") +
          "<p>Preserves: " + linkifyScriptureRefs(val(row, "PreservedPassages")) + "</p>" +
          "<p><a href='" + reader + "'>Read " + esc(label) + " in the Bible reader</a></p></div>";
      }
      var html = "";
      if (!dated.length && !undated.length) {
        html += "<p class='empty'>No manuscript in this database preserves " + esc(label) + ". That means no catalogued Qumran biblical manuscript here preserves it — it may survive in no Qumran copy, or in one not yet catalogued here.</p>";
      } else {
        if (dated.length) {
          html += "<p class='meta'>Earliest among manuscripts currently in this database — " + dated.length + " dated manuscript" + (dated.length === 1 ? "" : "s") + " preserve" + (dated.length === 1 ? "s" : "") + " " + esc(label) + ".</p>";
          html += "<div class='card-grid'>" + dated.map(card).join("") + "</div>";
        } else {
          html += "<p class='meta'>No dated manuscript preserves " + esc(label) + ", but undated ones do — listed below.</p>";
        }
        if (undated.length) {
          html += "<h3>Undated manuscripts that preserve " + esc(label) + "</h3><p class='meta'>These manuscripts have no date range in the data, so they are listed separately instead of being guessed into the order.</p><div class='card-grid'>" + undated.map(card).join("") + "</div>";
        }
      }
      out.innerHTML = html;
      window.scrollTo(0, 0);
    }
    var q0 = params.get("q") || "";
    var html = "<h2>Manuscript Passage Lookup</h2><div class='post-body'>" +
      "<p>Type a passage to find the earliest surviving manuscripts that contain it. Results are sorted earliest first, and labelled honestly: these are the earliest among the manuscripts currently in this database — not a claim about manuscripts not yet catalogued here.</p>" +
      '<div class="controls"><input type="search" id="lookupInput" placeholder="e.g. Isaiah 53:5" value="' + esc(q0) + '">' +
      '<button class="btn" id="lookupGo">Find manuscripts</button></div>' +
      "<p class='meta'>Try: <button class='chip lookup-example' data-q='Isaiah 53:5'>Isaiah 53:5</button> <button class='chip lookup-example' data-q='Psalm 22'>Psalm 22</button> <button class='chip lookup-example' data-q='Genesis 1:1'>Genesis 1:1</button></p>" +
      "<div id='lookupResults'></div></div>";
    app.innerHTML = html;
    function go() {
      var q = document.getElementById("lookupInput").value.trim();
      if (q) run(q); else document.getElementById("lookupInput").focus();
    }
    document.getElementById("lookupGo").addEventListener("click", go);
    document.getElementById("lookupInput").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); go(); } });
    Array.prototype.forEach.call(document.querySelectorAll(".lookup-example"), function (btn) {
      btn.addEventListener("click", function () { document.getElementById("lookupInput").value = btn.getAttribute("data-q"); go(); });
    });
    if (q0) run(q0);
    window.scrollTo(0, 0);
  }
  function viewBibleBook(slug) {
    var book = bibleBookBySlug(slug);
    if (!book) return viewBible();
    var html = "<h2>" + esc(book.name) + "</h2><div class='post-body'>" +
      "<p class='page-intro'>" + esc(book.testament === "Old" ? "Old Testament" : "New Testament") + " &middot; " + book.chapters + " chapters &middot; King James Version</p>";
    var artIdx = -1;
    (data.books || []).forEach(function (r, i) { if (val(r, "Book") === book.name) artIdx = i; });
    if (artIdx !== -1) html += "<p><a class='btn' href='#/books/" + artIdx + "'>About " + esc(book.name) + " &rarr;</a></p>";
    html += "<p>Also read " + esc(book.name) + " on BibleGateway: " +
      "<a href='https://www.biblegateway.com/passage/?search=" + encodeURIComponent(book.name) + "&version=NIV' target='_blank' rel='noopener'>NIV</a> &middot; " +
      "<a href='https://www.biblegateway.com/passage/?search=" + encodeURIComponent(book.name) + "&version=ESV' target='_blank' rel='noopener'>ESV</a></p>";
    html += '<div class="chips">';
    for (var c = 1; c <= book.chapters; c++) html += '<a class="chip" href="#/bible/' + slug + '/' + c + '">' + c + '</a>';
    html += "</div>";
    if (artIdx !== -1) {
      var row = data.books[artIdx];
      var tab = function (title, inner, open) {
        if (!inner) return "";
        return '<details class="study-section"' + (open ? " open" : "") + "><summary>" + title + "</summary><div class='study-body'>" + inner + "</div></details>";
      };
      var meta = "Author: " + esc(val(row, "TraditionalAuthor")) + " &middot; Written: " + esc(val(row, "DateApprox")) +
        " &middot; Category: " + esc(val(row, "Category")) + " &middot; Era: " + esc(val(row, "TimelineEra"));
      var overview = "<p>" + meta + "</p>" +
        "<p>" + esc(val(row, "Summary")) + "</p>" +
        "<p><strong>Purpose:</strong> " + esc(val(row, "Purpose")) + "</p>" +
        "<p><strong>Key theme:</strong> " + esc(val(row, "KeyTheme")) + "</p>";
      html += '<div class="study">' +
        tab("Book Overview", overview, true) +
        tab("Outline", "<p>" + esc(val(row, "Outline")) + "</p>") +
        tab("Key Verses", "<p>" + renderValue("KeyVerses", val(row, "KeyVerses")) + "</p>") +
        tab("Key People", "<p>" + renderValue("KeyPeople", val(row, "KeyPeople")) + "</p>") +
        tab("Themes", "<p>" + renderValue("Themes", val(row, "Themes")) + "</p>") +
        tab("Historical Context", "<p>" + esc(val(row, "HistoricalContext")) + "</p>") +
        (isEmpty(val(row, "CulturalBackground")) ? "" : tab("Cultural Backgrounds", "<p>" + esc(val(row, "CulturalBackground")) + "</p>")) +
        (isEmpty(val(row, "Places")) ? "" : tab("Places", "<p>" + renderValue("Places", val(row, "Places")) + "</p>")) +
        (isEmpty(val(row, "RelatedEvents")) ? "" : tab("Related Events", "<p>" + renderValue("RelatedEvents", val(row, "RelatedEvents")) + "</p>")) +
        (isEmpty(val(row, "LifeApplication")) ? "" : tab("Life Application", "<p>" + esc(val(row, "LifeApplication")) + "</p>")) +
        "</div>";
    }
    html += "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function articlesForChapter(bookName, chapter) {
    /* Scripture fields are parsed properly (book inheritance, verse
       continuations, ranges), so "1 John 1:9" counts for 1 John 1 and
       never for John 1, and "Numbers 1:5; 7:30-35" counts for Numbers
       7 as well as Numbers 1. Other fields (prose that mentions a
       passage) still match by text, except a numbered book's chapter
       is never claimed from its numbered sibling's reference. */
    var numbered = ["Samuel", "Kings", "Chronicles", "Corinthians",
      "Thessalonians", "Timothy", "Peter", "John"];
    var stripRe = numbered.indexOf(bookName) !== -1
      ? new RegExp("[123] " + escapeRegExp(bookName) + " " + chapter + "(?![0-9])", "gi") : null;
    var variants = [bookName];
    if (bookName === "Psalms") variants.push("Psalm");
    if (bookName === "Song of Solomon") variants.push("Song of Songs", "Song");
    var res = variants.map(function (v) {
      return new RegExp("(^|[^0-9A-Za-z])" + escapeRegExp(v) + " " + chapter + "(?![0-9])", "i");
    });
    var out = [];
    COLLECTIONS.forEach(function (c) {
      if (c.id === "quizzes") return;
      (data[c.id] || []).forEach(function (row, i) {
        var hit = SCRIPTURE_FIELDS.some(function (f) {
          var v = val(row, f);
          if (isEmpty(v)) return false;
          return refsInValue(v).some(function (r) { return r.name === bookName && r.chapter === chapter; });
        });
        if (!hit) {
          hit = Object.keys(row).some(function (k) {
            if (SCRIPTURE_FIELDS.indexOf(k) !== -1) return false;
            var text = " " + val(row, k);
            if (stripRe) text = text.replace(stripRe, " ");
            return res.some(function (re) { return re.test(text); });
          });
        }
        if (hit) out.push({ c: c, row: row, idx: i });
      });
    });
    return out;
  }
  function notesForChapter(bookName, chapter, collIds) {
    /* Study-Bible reverse links: entries in the given collections whose
       scripture fields cite this exact chapter. Parsed refs only, so a
       prose mention never creates a false note. */
    var out = [];
    collIds.forEach(function (id) {
      var c = coll(id);
      if (!c) return;
      (data[id] || []).forEach(function (row, i) {
        var hit = SCRIPTURE_FIELDS.some(function (f) {
          var v = val(row, f);
          if (isEmpty(v)) return false;
          return refsInValue(v).some(function (r) { return r.name === bookName && r.chapter === chapter; });
        });
        if (hit) out.push({ c: c, row: row, idx: i });
      });
    });
    return out;
  }
  function textMatchForChapter(row, bookName, chapter) {
    /* articlesForChapter's prose fallback, for collections whose refs live
       in prose rather than scripture fields (Heretical Teachings): a
       "Book chapter" mention counts, except a numbered book's chapter is
       never claimed from its numbered sibling's reference. */
    var numbered = ["Samuel", "Kings", "Chronicles", "Corinthians",
      "Thessalonians", "Timothy", "Peter", "John"];
    var stripRe = numbered.indexOf(bookName) !== -1
      ? new RegExp("[123] " + escapeRegExp(bookName) + " " + chapter + "(?![0-9])", "gi") : null;
    var variants = [bookName];
    if (bookName === "Psalms") variants.push("Psalm");
    if (bookName === "Song of Solomon") variants.push("Song of Songs", "Song");
    var res = variants.map(function (v) {
      return new RegExp("(^|[^0-9A-Za-z])" + escapeRegExp(v) + " " + chapter + "(?![0-9])", "i");
    });
    return Object.keys(row).some(function (k) {
      if (SCRIPTURE_FIELDS.indexOf(k) !== -1) return false;
      var text = " " + val(row, k);
      if (stripRe) text = text.replace(stripRe, " ");
      return res.some(function (re) { return re.test(text); });
    });
  }
  function notesForChapterText(bookName, chapter, collId) {
    var out = [];
    var c = coll(collId);
    if (!c) return out;
    (data[collId] || []).forEach(function (row, i) {
      if (textMatchForChapter(row, bookName, chapter)) out.push({ c: c, row: row, idx: i });
    });
    return out;
  }
  /* The six study-Bible layers on chapter pages. colls = parsed scripture
     refs (chapter + verse); textColls = prose mentions (chapter only). */
  var STUDY_LAYERS = [
    { title: "Apologetics study notes", empty: "No apologetics notes cite this chapter yet.", colls: ["apologetics", "objections"], textColls: [], panel: "Apologetics" },
    { title: "Cultural background notes", empty: "No cultural background notes cite this chapter yet.", colls: ["jewishculture"], textColls: [], panel: "Cultural backgrounds" },
    { title: "Life application notes", empty: "No life application notes cite this chapter yet.", colls: ["people", "studyguides"], textColls: [], panel: "Life application" },
    { title: "Archaeology notes", empty: "No archaeology notes cite this chapter yet.", colls: ["finds"], textColls: [], panel: "Archaeology" },
    { title: "Biblical theology notes", empty: "No biblical theology notes cite this chapter yet.", colls: ["topics", "doctrines"], textColls: [], panel: "Biblical theology" },
    { title: "Hermeneutics notes", empty: "No hermeneutics notes cite this chapter yet.", colls: ["hermeneutics", "perspectives"], textColls: ["heresies"], panel: "Hermeneutics" },
    { title: "Geographical notes", empty: "No geographical notes cite this chapter yet.", colls: ["places"], textColls: [], panel: "Geography", geo: true, intro: "Maps: American Bible Society, 1888 — public domain." },
    { title: "Expository notes", empty: "No expository notes cite this chapter yet.", colls: [], textColls: [], posts: true, panel: "Exposition" },
    { title: "Devotional notes", empty: "No devotional notes cite this chapter yet.", colls: ["hymns"], textColls: [], panel: "Devotion" }
  ];
  function postSlug(p) {
    if (p.slug) return p.slug;
    var m = String(p.file || "").match(/([^\/]+)\.md$/);
    return m ? m[1] : "";
  }
  function postTitle(p) { return val(p, "title") || val(p, "Title"); }
  function postScripture(p) { return val(p, "scripture") || val(p, "Scripture"); }
  function notesForChapterPosts(bookName, chapter) {
    /* Blog posts that expound a passage, from the boot-loaded posts list. */
    var out = [];
    (typeof posts !== "undefined" ? posts : []).forEach(function (p) {
      var s = postScripture(p);
      if (isEmpty(s)) return;
      if (refsInValue(s).some(function (r) { return r.name === bookName && r.chapter === chapter; })) {
        out.push({ c: { id: "blog", label: "Blog", primary: "title" }, row: p, idx: postSlug(p), href: "#/blog/" + postSlug(p) });
      }
    });
    return out;
  }
  function notesForVersePosts(bookName, chapter, verse) {
    var out = [];
    (typeof posts !== "undefined" ? posts : []).forEach(function (p) {
      var s = postScripture(p);
      if (isEmpty(s)) return;
      if (verseRefsInValue(s).some(function (r) { return r.name === bookName && r.chapter === chapter && r.verse === verse; })) {
        out.push({ c: { id: "blog", label: "Blog", primary: "title" }, row: p, idx: postSlug(p), href: "#/blog/" + postSlug(p) });
      }
    });
    return out;
  }
  function verseRefsInValue(value) {
    /* Like refsInValue, but returns explicit verses: {slug, name, chapter, verse}.
       Bare-chapter refs mark no verse (they stay chapter-level); verse ranges
       expand up to 50 verses; verse continuations ("13:22, 28, 33") count as
       verses of the same chapter, and a verse alone in a single-chapter book
       ("Jude 22") counts as chapter 1, verse 22. */
    var out = [];
    var lastBook = null;
    String(value).split(";").forEach(function (part) {
      var p = part.trim();
      if (!p) return;
      var found = bibleBookByNameStart(p);
      var book = found ? found.book : lastBook;
      var rest = found ? found.rest : p;
      if (found) lastBook = book;
      if (!book || !rest) return;
      var lastChapter = null, lastHadVerse = false;
      rest.split(",").forEach(function (item) {
        var it = item.trim();
        var m = it.match(/^(\d+)(?::(\d+))?/);
        if (!m) return;
        var ch = +m[1];
        var remapped = false;
        if (!m[2] && lastChapter !== null && lastHadVerse) { ch = lastChapter; remapped = true; }
        else if (book.chapters === 1 && !m[2] && ch !== 1) { ch = 1; remapped = true; }
        if (ch < 1 || ch > book.chapters) return;
        if (m[2]) {
          lastChapter = ch; lastHadVerse = true;
          var vm = it.match(/^\d+\s*:\s*(\d+)\s*-\s*(\d+)/);
          if (vm) {
            var a = +vm[1], b = +vm[2];
            if (b > a && b - a <= 50) { for (var v = a; v <= b; v++) out.push({ slug: book.slug, name: book.name, chapter: ch, verse: v }); }
            else out.push({ slug: book.slug, name: book.name, chapter: ch, verse: a });
          } else {
            out.push({ slug: book.slug, name: book.name, chapter: ch, verse: +m[2] });
          }
        } else if (remapped) {
          out.push({ slug: book.slug, name: book.name, chapter: ch, verse: +m[1] });
        } else {
          lastChapter = ch; lastHadVerse = false;
        }
      });
    });
    return out;
  }
  function notesForVerse(bookName, chapter, verse, collIds) {
    var out = [];
    collIds.forEach(function (id) {
      var c = coll(id);
      if (!c) return;
      (data[id] || []).forEach(function (row, i) {
        var hit = SCRIPTURE_FIELDS.some(function (f) {
          var v = val(row, f);
          if (isEmpty(v)) return false;
          return verseRefsInValue(v).some(function (r) { return r.name === bookName && r.chapter === chapter && r.verse === verse; });
        });
        if (hit) out.push({ c: c, row: row, idx: i });
      });
    });
    return out;
  }
  function viewBibleChapter(slug, chapter, params) {
    var book = bibleBookBySlug(slug);
    if (!book) return viewBible();
    fetch("content/bible/" + slug + ".json?v=" + ASSET_V).then(function (r) {
      if (!r.ok) throw new Error("book");
      return r.json();
    }).then(function (bj) {
      var chaps = bj.chapters;
      var verses = chaps[chapter];
      if (!verses) return viewBibleBook(slug);
      var nums = Object.keys(chaps).map(function (n) { return +n; }).sort(function (a, b) { return a - b; });
      var ci = nums.indexOf(+chapter);
      var prev = ci > 0 ? nums[ci - 1] : null;
      var next = ci < nums.length - 1 ? nums[ci + 1] : null;
      /* Verses with study notes (apologetics or cultural entries citing the
         exact verse) get a † marker; tapping it opens the notes panel. */
      var marked = {};
      ["apologetics", "objections", "jewishculture", "people", "studyguides", "finds", "topics", "doctrines", "hermeneutics", "perspectives", "places", "hymns"].forEach(function (id) {
        (data[id] || []).forEach(function (row) {
          SCRIPTURE_FIELDS.forEach(function (f) {
            var v = val(row, f);
            if (isEmpty(v)) return;
            verseRefsInValue(v).forEach(function (r) {
              if (r.name === book.name && r.chapter === +chapter) marked[r.verse] = true;
            });
          });
        });
      });
      (typeof posts !== "undefined" ? posts : []).forEach(function (p) {
        var s = postScripture(p);
        if (isEmpty(s)) return;
        verseRefsInValue(s).forEach(function (r) {
          if (r.name === book.name && r.chapter === +chapter) marked[r.verse] = true;
        });
      });
      var paras = [""];
      Object.keys(verses).sort(function (a, b) { return +a - +b; }).forEach(function (n) {
        var txt = verses[n];
        if (txt.indexOf("# ") === 0) { txt = txt.slice(2); paras.push(""); }
        var marker = marked[+n] ? '<button type="button" class="verse-note" data-v="' + n + '" aria-label="Study notes for verse ' + n + '">†</button>' : "";
        paras[paras.length - 1] += '<span class="verse" id="v' + n + '"><sup>' + n + '</sup>' + marker + ' ' + linkifyVerseText(txt, book.name, +chapter, +n) + '</span> ';
      });
      var html = "<h2>" + esc(book.name) + " " + esc(chapter) + "</h2><div class='post-body'>" +
        "<p class='page-intro'>King James Version &middot; " + esc(book.testament === "Old" ? "Old Testament" : "New Testament") + "</p>";
      html += "<p>";
      if (prev) html += "<a class='btn' href='#/bible/" + slug + "/" + prev + "'>&larr; Chapter " + prev + "</a> ";
      html += "<a class='btn' href='#/bible/" + slug + "'>All chapters</a>";
      if (next) html += " <a class='btn' href='#/bible/" + slug + "/" + next + "'>Chapter " + next + " &rarr;</a>";
      html += "</p>";
      html += "<p>Also read this passage on BibleGateway: " +
        "<a href='https://www.biblegateway.com/passage/?search=" + encodeURIComponent(book.name + " " + chapter) + "&version=NIV' target='_blank' rel='noopener'>NIV</a> &middot; " +
        "<a href='https://www.biblegateway.com/passage/?search=" + encodeURIComponent(book.name + " " + chapter) + "&version=ESV' target='_blank' rel='noopener'>ESV</a></p>";
      html += "<div class='bible-verses'>" + paras.map(function (p) { return "<p>" + p + "</p>"; }).join("") + "</div>";
      html += '<div id="verseStudy"></div>';
      var arts = articlesForChapter(book.name, +chapter);
      if (arts.length) {
        html += "<h3>Articles about this chapter</h3><div class='card-grid'>" + arts.map(function (a) {
          return "<a class='card' href='#/" + a.c.id + "/" + a.idx + "'><h3>" + esc(val(a.row, a.c.primary)) + "</h3><p class='meta'>" + esc(a.c.label) + "</p></a>";
        }).join("") + "</div>";
      }
      var xrefs = crossRefsForChapter(book.name, +chapter);
      if (xrefs.length) {
        html += "<h3>Cross references</h3><p class='page-intro'>Other passages the site's articles cite alongside this chapter.</p><p>" +
          xrefs.map(function (r) {
            return "<a href='#/bible/" + r.slug + "/" + r.chapter + "'>" + esc(r.name) + " " + r.chapter + "</a>";
          }).join(" &middot; ") + "</p>";
      }
      var noteCards = function (list, L) {
        return "<div class='card-grid'>" + list.map(function (a) {
          var href = a.href || ("#/" + a.c.id + "/" + a.idx);
          var thumb = "";
          if (L && L.geo) {
            var mapIds = splitList(val(a.row, "Maps"));
            for (var mi = 0; mi < mapIds.length; mi++) {
              var m = typeof maps !== "undefined" ? maps[mapIds[mi]] : null;
              if (m) { thumb = '<img class="geo-thumb" src="' + esc(m.file) + '" alt="' + esc(m.title) + '">'; break; }
            }
          }
          var title = a.c.id === "blog" ? postTitle(a.row) : val(a.row, a.c.primary);
          return "<a class='card' href='" + href + "'>" + thumb + "<h3>" + esc(title) + "</h3><p class='meta'>" + esc(a.c.label) + "</p></a>";
        }).join("") + "</div>";
      };
      STUDY_LAYERS.forEach(function (L) {
        var list = notesForChapter(book.name, +chapter, L.colls);
        L.textColls.forEach(function (id) { list = list.concat(notesForChapterText(book.name, +chapter, id)); });
        if (L.posts) list = list.concat(notesForChapterPosts(book.name, +chapter));
        html += '<details class="study-section"><summary>' + L.title + (list.length ? ' (' + list.length + ')' : '') + '</summary><div class="study-body">' +
          (list.length ? (L.intro ? '<p class="page-intro">' + L.intro + '</p>' : '') + noteCards(list, L) : '<p>' + L.empty + '</p>') + '</div></details>';
      });
      html += "</div>";
      app.innerHTML = html;
      app.querySelectorAll(".verse-note").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var vn = +btn.getAttribute("data-v");
          var panel = document.getElementById("verseStudy");
          if (!panel) return;
          var group = function (title, list) {
            if (!list.length) return "";
            return "<h4>" + title + "</h4><ul>" + list.map(function (x) {
              var href = x.href || ("#/" + x.c.id + "/" + x.idx);
              var t = x.c.id === "blog" ? postTitle(x.row) : val(x.row, x.c.primary);
              return "<li><a href='" + href + "'>" + esc(t) + "</a> <span class='meta'>" + esc(x.c.label) + "</span></li>";
            }).join("") + "</ul>";
          };
          var groups = "";
          STUDY_LAYERS.forEach(function (L) {
            var list = notesForVerse(book.name, +chapter, vn, L.colls);
            if (L.posts) list = list.concat(notesForVersePosts(book.name, +chapter, vn));
            groups += group(L.panel, list);
          });
          panel.innerHTML = '<details class="study-section" open><summary>Study notes for ' + esc(book.name) + ' ' + chapter + ':' + vn + '</summary><div class="study-body">' + groups + '</div></details>';
          panel.scrollIntoView();
        });
      });
      var v = params && params.get ? params.get("v") : null;
      if (v) { var el = document.getElementById("v" + v); if (el) el.scrollIntoView(); }
      else window.scrollTo(0, 0);
    }).catch(function () {
      app.innerHTML = "<h2>" + esc(book.name) + " " + esc(chapter) + "</h2><p class='empty'>This chapter could not be loaded. Please try again.</p>";
    });
  }
  /* ---------- terms, privacy, FAQ ---------- */
  /* These pages are written in code, like the About page — they are not
     Decap-editable. Wording changes go through chat. */

  var VERIF_MEANING = {
    "Verified": "Checked against the sources listed below. Its core claims — identification, dates, and cited passages — were matched to a scholarly or primary source.",
    "Awaiting Review": "Not yet checked against scholarly sources. Treat its claims as provisional until this entry is reviewed.",
    "Scholarly Debate": "Scholars disagree about a key claim in this entry. The entry text states the disagreement; read it as contested, not settled."
  };
  function verificationBox(row) {
    var status = val(row, "VerificationStatus") || "Awaiting Review";
    var cls = status === "Verified" ? "fulfilled" : (status === "Scholarly Debate" ? "debated" : "future");
    var html = '<div class="verif-box"><span class="badge ' + cls + '">' + esc(status) + '</span> ' +
      '<span class="verif-meaning">' + esc(VERIF_MEANING[status] || VERIF_MEANING["Awaiting Review"]) + '</span> ' +
      '<a href="#/verification">About verification</a>';
    var src = val(row, "Sources");
    if (src) html += '<div class="verif-sources"><strong>Sources:</strong> ' + renderValue("Sources", src) + '</div>';
    var rev = val(row, "LastReviewed");
    html += '<div class="verif-reviewed">Last reviewed: ' + (rev ? esc(rev) : 'not yet reviewed') + '</div>';
    return html + '</div>';
  }
  function viewVerification() {
    var html = "<h2>Source Verification</h2><div class='post-body'>" +
      "<p class='page-intro'>Every factual entry on this site carries a verification status. Nothing here is marked verified by default — a status is earned by checking the entry against a traceable source.</p>" +
      "<h3>The three statuses</h3>" +
      "<p><span class='badge fulfilled'>Verified</span> — the entry's core claims (identification, dates, cited passages) were checked against a scholarly or primary source, and that source is listed on the entry page.</p>" +
      "<p><span class='badge future'>Awaiting Review</span> — the entry has not yet been checked against scholarly sources. This is the default for all new and unreviewed entries. It does not mean the entry is wrong; it means its claims should still be treated as provisional.</p>" +
      "<p><span class='badge debated'>Scholarly Debate</span> — scholars disagree about a key claim in the entry. The entry itself states the disagreement, so readers can see what is contested rather than settled.</p>" +
      "<h3>What counts as a source</h3>" +
      "<p>Sources are ranked. First: primary sources and official records — the biblical text itself, the Discoveries in the Judaean Desert (DJD) volumes, museum and archive catalogues such as the Israel Antiquities Authority's Leon Levy Dead Sea Scrolls Digital Library, and excavation reports. Second: peer-reviewed scholarship and recognised academic institutions. Third: reference works, used only as cross-checks, never as the sole basis for a Verified status.</p>" +
      "<h3>What the statuses distinguish</h3>" +
      "<p>Established evidence (an inscription, a manuscript, a dated artefact) is not the same as a scholarly interpretation of it, and neither is the same as a theological conclusion drawn from Scripture. Entries keep those apart: evidence is stated as evidence, interpretations are attributed, disputed points are flagged Scholarly Debate, and theological reflections are presented as reflections, not as historical proof.</p>" +
      "<h3>Nothing invented, nothing auto-verified</h3>" +
      "<p>No discovery, date, biblical reference, manuscript identification, or citation is invented to fill a gap. Where adequate sources have not been found, the field stays blank and the entry stays Awaiting Review. Content drafted with AI assistance is never automatically marked verified — it earns Verified only after a source check, like any other entry.</p>" +
      "<h3>Coverage today</h3>" +
      "<p>Of 20,479 database entries, 24 are Verified, 6 are Scholarly Debate, and 20,449 are Awaiting Review. The Verified entries are the Dead Sea Scrolls manuscripts audited field by field against DJD, Tov, and Ulrich in October 2026. The debated entries are the three manuscripts whose identification, dating, or provenance scholars dispute, and the three archaeological finds classed as Disputed evidence. Review continues entry by entry, and a status changes whenever new evidence or a correction warrants it.</p>" +
      "<p>Browse the statuses: <a href='#/manuscripts?f_VerificationStatus=Verified'>Verified manuscripts</a> &middot; <a href='#/manuscripts?f_VerificationStatus=Scholarly Debate'>Debated manuscripts</a> &middot; <a href='#/finds?f_VerificationStatus=Scholarly Debate'>Debated finds</a></p>" +
      "<h3>Corrections</h3>" +
      "<p>Entries can be corrected and updated at any time. Corrections go through the site editor or through the site owner, and a corrected entry keeps its sources and review date visible so readers can see what changed and when it was last checked.</p>" +
      "<h3>What is not status-tagged</h3>" +
      "<p>The Bible reader text is the primary source itself, so it carries no status. Blog posts are study writing rather than database entries, and their Scripture references link into the reader for checking. Store products and gallery pieces are products and artwork, not factual claims.</p>" +
      "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function viewTerms() {
    var html = "<h2>Terms &amp; Conditions</h2><div class='post-body'>" +
      "<p class='page-intro'>Last updated: October 25, 2026.</p>" +
      "<h3>About this site</h3>" +
      "<p>Hope Anchored in Christ is an independent Bible study ministry website. By using this site, you agree to these terms. If you do not agree, please do not use the site.</p>" +
      "<h3>What this site is for</h3>" +
      "<p>Everything here is offered freely for Bible study, encouragement, and learning. The content is prepared carefully, but it is study material, not pastoral counseling, and not medical, legal, or financial advice.</p>" +
      "<h3>Using the content</h3>" +
      "<p>You are welcome to read everything on the site, share links to any page, and quote brief passages with credit to Hope Anchored in Christ. Please do not republish whole articles, copy the artwork, or present the site's content as your own. The King James Bible text in the Bible reader is in the public domain; other Bible translations are not reproduced here — the reader links to them on BibleGateway, where they are licensed.</p>" +
      "<h3>Store and giving</h3>" +
      "<p>When products or donations are offered, buying and giving happen on third-party providers' websites (for example, a print-on-demand store or a giving platform). Those purchases and donations are governed by the provider's own terms, and the provider handles payment, shipping, and support for its own service.</p>" +
      "<h3>Links to other sites</h3>" +
      "<p>This site links to outside websites, including BibleGateway and any future store or giving providers. We are not responsible for the content, policies, or practices of those sites.</p>" +
      "<h3>No warranties</h3>" +
      "<p>This site is provided as-is. We do not guarantee that it will always be available or free of errors, and we are not liable for any loss arising from your use of it.</p>" +
      "<h3>Changes to these terms</h3>" +
      "<p>These terms may be updated from time to time. Continued use of the site after an update means you accept the updated terms.</p>" +
      "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function viewPrivacy() {
    var html = "<h2>Privacy Policy</h2><div class='post-body'>" +
      "<p class='page-intro'>Last updated: October 25, 2026. The short version: this site does not run accounts, does not ask for your email, and does not set its own tracking cookies.</p>" +
      "<h3>What we do not collect</h3>" +
      "<p>There is no sign-up, no comment form, and no newsletter on this site, so we do not collect your name, email address, or any other information from you directly. The site sets no cookies of its own and stores nothing in your browser.</p>" +
      "<h3>What happens automatically</h3>" +
      "<p>This site is hosted on GitHub Pages. Like most web hosts, GitHub may collect standard server logs when you visit (such as your IP address, browser type, and the pages you view) under GitHub's own privacy statement. The blog list is loaded from GitHub's public system, which also involves a request to GitHub when you open the blog. The editor sign-in tool (Netlify Identity) loads on the site so the site's editor can sign in; it only handles sign-in details when someone actually signs in as an editor — ordinary readers are never signed in.</p>" +
      "<h3>No analytics or advertising</h3>" +
      "<p>We do not currently run analytics, advertising, or third-party trackers on this site.</p>" +
      "<h3>Links to other sites</h3>" +
      "<p>Clicking a link to another site — such as BibleGateway, a store, or a giving provider — takes you under that site's privacy policy, not this one.</p>" +
      "<h3>Children</h3>" +
      "<p>This site collects no information from anyone, including children.</p>" +
      "<h3>Changes to this policy</h3>" +
      "<p>This policy may be updated from time to time. The date at the top shows when it was last updated.</p>" +
      "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function viewFaq() {
    var faqs = [
      ["What is Hope Anchored in Christ?", "An independent Bible study blog built around Hebrews 6:19 — \u201CWe have this hope as an anchor for the soul, firm and secure.\u201D It offers Bible studies, articles, and reference collections to help readers know Scripture and hold fast to hope in Christ."],
      ["What Bible translation does the Bible reader use?", "The on-site reader uses the King James Version, which is in the public domain, so the full text can live here freely. The NIV and ESV are copyrighted, so every chapter page also links to the same passage on BibleGateway in NIV and ESV."],
      ["Is everything on the site free?", "Yes — everything you can read here is free. If paid courses or products appear later, they will be clearly marked and sold through their own checkout, separate from the free reading."],
      ["How do the links inside the Bible text work?", "Names in the Bible text link to the site's own articles: tap a person, place, or event and you land on that article. Below each chapter, \u201CArticles about this chapter\u201D lists questions, word studies, topics, and other entries that point at that chapter."],
      ["Can I share or reprint something from the site?", "Please do share links to any page. You may also quote brief passages with credit to Hope Anchored in Christ. Whole articles and the artwork should not be republished without permission."],
      ["How can I support the ministry?", "The Give page explains giving, and the Store page will list products when they launch. Both stay honestly marked as coming soon until their links are connected."],
      ["Do you have social media or a podcast?", "Not yet. The Connect page will list them as soon as they launch."],
      ["Can I suggest a topic or ask a question?", "Not yet — there is no contact form on the site right now. Contact options will come with the social pages on the Connect page."],
      ["Where do the maps and artwork come from?", "The Bible maps are public-domain maps from 1888. The artwork, including the banner and collection tiles, is made by Lorraine herself — no stock photos are used."],
      ["Is this site connected to a church or denomination?", "No. It is an independent, Bible-centered ministry, not affiliated with a particular church or denomination."],
      ["Is there an app?", "There is no app. The site works in any browser on a phone, tablet, or computer, and you can add it to your home screen for app-like access."]
    ];
    var html = "<h2>Frequently Asked Questions</h2><div class='post-body'>" +
      faqs.map(function (f) { return "<h3>" + esc(f[0]) + "</h3><p>" + esc(f[1]) + "</p>"; }).join("") +
      "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function viewAbout() {
    var total = COLLECTIONS.reduce(function (sum, c) { return sum + (data[c.id] || []).length; }, 0);
    app.innerHTML = "<h2>About</h2><div class='post-body about-page'>" +
      "<figure class='about-photo-frame'><img class='about-photo' src='assets/about-photo.jpg' alt='Lorraine and her husband outdoors'></figure>" +
      '<div class="verse-band">&ldquo;We have this hope as an anchor for the soul, firm and secure.&rdquo; &mdash; Hebrews 6:19</div>' +
      "<h3>Our Story</h3>" +
      "<p class='about-lead'>Our story begins with two very different but deeply meaningful paths that God wove together for a purpose bigger than ourselves. " +
      "I was raised by my grandmother, a strong, faithful woman who stepped in when both my parents — due to mental illness and " +
      "instability — were unable to care for me. Though she had already faced the pain of divorce and thought her season of raising " +
      "children had ended, she took on the enormous responsibility of raising her grandchild with unwavering love and dedication.</p>" +
      "<p>My upbringing was sheltered in many ways — we lived simply, my social world was small, and many of the opportunities other " +
      "kids had were not part of my childhood. But I look back not with bitterness or regret, but with a heart full of gratitude. " +
      "I see now that God was using those years to shape me. My grandmother gave me the gift of faith, a love for learning, and a hunger " +
      "for truth. I spent much of that quiet time diving into books, Scripture, art, science, history, and apologetics. I was given time, " +
      "and I used it to sharpen my mind and my heart. That time wasn't wasted — it was an investment I now pour into this blog, hoping " +
      "to encourage others, just as my grandmother encouraged me.</p>" +
      "<p>My husband's story is a beautiful complement to mine. He was raised in the church, surrounded by a family who loved the Lord, " +
      "and his love for Christ was planted early. Like me, he also grew up sheltered — protected from many of the world's influences, " +
      "raised with strong values, and taught to keep God at the center of life. This is one area where we deeply connected. We both " +
      "understood what it was like to grow up outside the mainstream, with fewer social experiences but a richer focus on faith, family, " +
      "and personal growth. While others may have seen our sheltered upbringings as limitations, we both came to see them as blessings — " +
      "foundations that protected and prepared us for a purpose greater than ourselves.</p>" +
      "<p>From a young age, music became one of his greatest passions — especially the guitar. While he didn't sing, he found joy and " +
      "worship through playing, using music as a quiet, personal way to connect with God and process life. His journey, like mine, hasn't " +
      "been without its struggles, but through each season, his faith has grown stronger. Together, we've come to see that our experiences — " +
      "though different in some ways — were both orchestrated by God to prepare us for this very purpose: to share His truth, love, and " +
      "beauty with others. Whether it's through writing, photography, art, or music, our desire is to point people back to the One who " +
      "anchors us through every storm: Christ. This blog, Hope Anchored in Christ, is a reflection of all we've learned, all we continue " +
      "to discover, and all the hope we hold onto as we live, create, and serve together.</p>" +
      "<h3>What you will find on this blog</h3>" +
      "<p>Hope Anchored in Christ is a place where faith meets thoughtful reflection, and where deep questions are met with biblical truth " +
      "and grace. This blog is built to encourage, challenge, and equip you in your walk with Christ by exploring the richness of Scripture " +
      "and the world around us. Whether you're seeking spiritual growth, biblical answers, or simply a deeper understanding of God's truth " +
      "in a complex world, there's something here for you.</p>" +
      "<p>Here you'll find a variety of content including blog posts, devotionals, Bible studies, and scripture reflections that draw you " +
      "into a deeper relationship with God. We offer apologetics resources to help defend the faith with gentleness and respect, and explore " +
      "theology in an approachable and meaningful way. You'll also find thoughtful questions and answers, free and paid courses, quizzes and " +
      "reflections on how Christian truth interacts with history, culture, science, philosophy, psychology, and art. Each topic is approached " +
      "with the goal of encouraging truth-seeking, grounded faith, and thoughtful living. Whether you're new in your walk or have been on the " +
      "journey for years, this space is for those hungry to grow in truth and hope — anchored firmly in Christ.</p>" +
      '<div class="stats">' +
      '<div class="stat"><strong>' + COLLECTIONS.length + "</strong><span>collections</span></div>" +
      '<div class="stat"><strong>' + total + "</strong><span>entries</span></div>" +
      '<div class="stat"><strong>' + (data.books || []).length + "</strong><span>books of the Bible</span></div>" +
      '<div class="stat"><strong>' + quizGroups().length + "</strong><span>quizzes</span></div></div>" +
      '<div class="about-actions"><a class="btn" href="#/explore">Explore the collections</a><a class="btn" href="#/bible">Read the Bible</a><a class="btn" href="#/blog">Visit the blog</a></div>' +
      "<h3>The meaning behind our name</h3>" +
      "<p>The name Hope Anchored in Christ comes from a deep place in both of our hearts and stories. Life has brought storms, heartache, " +
      "questions, and seasons of waiting — but through it all, one thing has remained constant: the hope we have in Jesus. It's not a shallow " +
      "hope or wishful thinking. It's a confident assurance grounded in who Christ is, what He has done, and what He promises still to do. " +
      "Just as an anchor holds a ship steady in the wind and waves, Christ holds our souls firm and secure, no matter what comes. " +
      "The inspiration comes directly from Hebrews 6:19, which says, &ldquo;We have this hope as an anchor for the soul, firm and secure.&rdquo; " +
      "That verse spoke to our hearts and became a foundation for everything we want to share through this blog.</p>" +
      "<p>We arrived at the name Hope Anchored in Christ because it captures both our personal testimony and our mission. From my sheltered " +
      "but spiritually rich upbringing with my grandmother to my husband's early life in the church and passion for music, we both experienced " +
      "seasons where we had to learn to trust God in the unknown. We realized that no matter our background, struggles, or questions, the only " +
      "unshakable anchor we have is Jesus. As we began creating this blog, we wanted a name that would reflect not just our content, but our " +
      "purpose: to encourage others to place their hope where it won't be moved — in Christ alone. Every part of this blog is shaped by that truth.</p>" +
      "<h3>Why We Started This Blog</h3>" +
      "<p>We started Hope Anchored in Christ because we've seen a growing need for deeper, more thoughtful conversations about faith — the kind " +
      "that aren't afraid to wrestle with hard questions or dive beneath the surface. So many people today, especially young adults and teens, " +
      "are walking away from Christianity. And not necessarily because they hate God or don't care, but because they had real, difficult questions — " +
      "and the answers they found outside the faith seemed more satisfying, more thoughtful, or simply more honest than what they heard in church. " +
      "That broke our hearts.</p>" +
      "<p>We believe the Christian faith is not only true but also intellectually and spiritually satisfying. God is not afraid of our questions — " +
      "and neither are we. This blog was born from our desire to help others dig deeper, to find solid, biblically sound answers, and to see that " +
      "hope in Christ is not blind — it's anchored. We want to create a space that brings together faith and reason, where people can explore " +
      "theology, Scripture, apologetics, philosophy, science, culture, history, and more — all through a lens grounded in God's Word. Our hope is " +
      "that this blog can be a light to those who are searching, doubting, or growing, and a reminder that the Christian faith is strong enough " +
      "to hold the weight of real life, real questions, and real hope.</p>" +
      "<p>If this ministry has blessed you and you'd like to help keep it going, visit our <a href=\"#/give\">Give page</a>.</p></div>";
    window.scrollTo(0, 0);
  }
  function viewSearch(params) {
    var q = (params.get("q") || "").trim().toLowerCase();
    var html = "<h2>Search results</h2>";
    if (!q) { html += '<p class="empty">Type something in the search box above.</p>'; app.innerHTML = html; return; }
    html += "<p class='page-intro'>Results for &ldquo;" + esc(params.get("q")) + "&rdquo;</p>";
    var any = false;
    COLLECTIONS.forEach(function (c) {
      var hits = (data[c.id] || []).map(function (r, i) { return { row: r, idx: i }; }).filter(function (item) {
        return Object.keys(item.row).some(function (k) { return val(item.row, k).toLowerCase().indexOf(q) !== -1; });
      });
      if (!hits.length) return;
      any = true;
      html += "<h3>" + esc(c.label) + " (" + hits.length + ")</h3><div class='card-grid'>" +
        hits.slice(0, 8).map(function (item) {
          if (c.id === "quizzes") {
            return '<a class="card" href="#/quizzes/play/' + encodeURIComponent(val(item.row, "Quiz")) + '"><h3>' +
              esc(val(item.row, "Quiz")) + "</h3><p class='snippet'>" + esc(val(item.row, "Question")) + "</p></a>";
          }
          return cardFor(c, item.row, item.idx);
        }).join("") + "</div>";
      if (hits.length > 8) html += "<p><a href='#/" + c.id + "?q=" + encodeURIComponent(params.get("q")) +
        "'>See all " + hits.length + " in " + esc(c.label) + " &rarr;</a></p>";
    });
    if (!any) html += '<p class="empty">No results found. Try another word.</p>';
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function renderMarkdown(src) {
    var lines = src.replace(/\r\n/g, "\n").split("\n");
    var out = [], i = 0;
    function inline(t) {
      var h = esc(t);
      h = h.replace(/\\\./g, ".");
      h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
      h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      h = h.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      return h;
    }
    function isTableStart(idx) {
      if (idx + 1 >= lines.length) return false;
      if (!/^\s*\|/.test(lines[idx])) return false;
      return /^\s*\|[\s:|\-]+\|\s*$/.test(lines[idx + 1]) && /-/.test(lines[idx + 1]);
    }
    function splitRow(row) {
      return row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (c) { return c.trim(); });
    }
    while (i < lines.length) {
      var line = lines[i];
      if (/^#{1,3}\s/.test(line)) {
        var level = line.match(/^#+/)[0].length;
        out.push("<h" + (level + 1) + ">" + inline(line.replace(/^#+\s*/, "")) + "</h" + (level + 1) + ">");
        i++;
      } else if (/^\s*---\s*$/.test(line)) {
        out.push("<hr>"); i++;
      } else if (/^\s*>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) { quote.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
        out.push("<blockquote><p>" + inline(quote.join(" ")) + "</p></blockquote>");
      } else if (/^\s*[-*]\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++; }
        out.push("<ul>" + items.map(function (t) { return "<li>" + inline(t) + "</li>"; }).join("") + "</ul>");
      } else if (line.trim() === "") {
        i++;
      } else if (isTableStart(i)) {
        var head = splitRow(lines[i]); i += 2;
        var body = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) { body.push(splitRow(lines[i])); i++; }
        var thead = "<thead><tr>" + head.map(function (c) { return "<th>" + inline(c) + "</th>"; }).join("") + "</tr></thead>";
        var tbody = "<tbody>" + body.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody>";
        out.push('<div class="study-table"><table>' + thead + tbody + "</table></div>");
      } else if (/^\s*\d+\\?\.\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^\s*\d+\\?\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\\?\.\s+/, "")); i++; }
        out.push("<ol>" + items.map(function (t) { return "<li>" + inline(t) + "</li>"; }).join("") + "</ol>");
      } else {
        var para = [];
        while (i < lines.length && lines[i].trim() !== "" && !/^#{1,3}\s/.test(lines[i]) &&
               !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*>\s?/.test(lines[i]) && !/^\s*---\s*$/.test(lines[i]) &&
               !isTableStart(i) && !/^\s*\d+\\?\.\s+/.test(lines[i])) {
          para.push(lines[i]); i++;
        }
        out.push("<p>" + inline(para.join(" ")) + "</p>");
      }
    }
    return out.join("\n");
  }

  /* ---------- router + boot ---------- */
  function render() {
    var raw = (location.hash || "#/").replace(/^#/, "");
    var parts = raw.split("?");
    var path = parts[0].split("/").filter(Boolean);
    var params = new URLSearchParams(parts[1] || "");
    document.body.classList.toggle("is-home", path.length === 0);
    if (path.length === 0) return viewHome();
    if (path[0] === "explore") return viewExplore();
    if (path[0] === "blog") return viewBlog(path[1] ? decodeURIComponent(path[1]) : null, params);
    if (path[0] === "about") return viewAbout();
    if (path[0] === "store") return viewStore();
    if (path[0] === "connect") return viewConnect();
    if (path[0] === "give") return viewGive();
    if (path[0] === "bible") {
      if (!path[1]) return viewBible();
      if (path[1] === "topics") return viewBibleTopics();
      if (!path[2]) return viewBibleBook(path[1]);
      return viewBibleChapter(path[1], path[2], params);
    }
    if (path[0] === "terms") return viewTerms();
    if (path[0] === "privacy") return viewPrivacy();
    if (path[0] === "faq") return viewFaq();
    if (path[0] === "verification") return viewVerification();
    if (path[0] === "search") return viewSearch(params);
    if (path[0] === "quizzes" && path[1] === "play") return viewQuizPlay(path[2] ? decodeURIComponent(path[2]) : "", params);
    if (path[0] === "storybook") return viewStorybook(path[1] ? decodeURIComponent(path[1]) : null, path[2] ? decodeURIComponent(path[2]) : null, params);
    if (path[0] === "gallery" || path[0] === "art") return viewGallery();
    if (path[0] === "lookup") return viewLookup(params);
    if (path[0] === "genealogy") return viewGenealogy(path[1] ? decodeURIComponent(path[1]) : null, params);
    if (path[0] === "atlas") return viewAtlas();
    var c = coll(path[0]);
    if (c) return viewCollection(c.id, path[1] ? decodeURIComponent(path[1]) : null, params);
    return viewHome();
  }
  document.getElementById("headerSearch").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = document.getElementById("headerSearchInput").value.trim();
    if (q) location.hash = "#/search?q=" + encodeURIComponent(q);
  });
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mainNav.addEventListener("click", function (e) {
      if (e.target && e.target.tagName === "A") {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
  document.getElementById("footerNav").innerHTML =
    COLLECTIONS.map(function (c) { return '<a href="#/' + c.id + '">' + esc(c.label) + "</a>"; }).join("") +
    '<a href="#/blog">Blog</a><a href="#/bible">Bible</a><a href="#/about">About</a><a href="#/store">Store</a><a href="#/connect">Connect</a><a href="#/give">Give</a><a href="#/storybook">Storybook</a><a href="#/art">Art</a><a href="#/genealogy">Biblical Genealogies</a><a href="#/lookup">Manuscript Lookup</a><a href="#/atlas">Atlas</a>';

  app.innerHTML = '<p class="loading">Loading the collections…</p>';
  var jobs = COLLECTIONS.map(function (c) {
    return fetch(c.file + "?v=" + ASSET_V).then(function (r) {
      if (!r.ok) throw new Error(c.file);
      return r.json();
    }).then(function (rows) { data[c.id] = rows; });
  });
  jobs.push(loadPostsFromGithub().catch(function () {
    return fetch("content/posts.json?v=" + ASSET_V).then(function (r) { return r.json(); });
  }).then(function (p) { posts = p; }));
  jobs.push(fetch("content/maps.json?v=" + ASSET_V).then(function (r) { return r.ok ? r.json() : {}; }).then(function (m) { maps = m; }).catch(function () { maps = {}; }));
  jobs.push(fetch("content/pages/explore.json?v=" + ASSET_V).then(function (r) { return r.ok ? r.json() : {}; }).then(function (p) { explorePage = p; }).catch(function () { explorePage = {}; }));
  jobs.push(fetch("content/petstories.json?v=" + ASSET_V).then(function (r) { return r.ok ? r.json() : []; }).then(function (p) { petStories = p; }).catch(function () { petStories = []; }));
  jobs.push(fetch("content/childrenstories.json?v=" + ASSET_V).then(function (r) { return r.ok ? r.json() : []; }).then(function (p) { childStories = p; }).catch(function () { childStories = []; }));
  jobs.push(fetch("content/gallery.json?v=" + ASSET_V).then(function (r) { return r.ok ? r.json() : []; }).then(function (g) { galleryItems = g; }).catch(function () { galleryItems = []; }));
  jobs.push(fetch("content/dss_lookup_dates.json?v=" + ASSET_V).then(function (r) { return r.ok ? r.json() : []; }).then(function (d) { lookupDates = d; }).catch(function () { lookupDates = []; }));
  jobs.push(fetch("content/genealogy.json?v=" + ASSET_V).then(function (r) { return r.ok ? r.json() : { nodes: [], edges: [] }; }).then(function (g) { genealogyData = g; }).catch(function () { genealogyData = { nodes: [], edges: [] }; }));
  jobs.push(fetch("content/atlas.json?v=" + ASSET_V).then(function (r) { return r.ok ? r.json() : []; }).then(function (a) { atlasItems = a; }).catch(function () { atlasItems = []; }));
  Promise.all(jobs).then(function () {
    buildLinkIndex();
    window.addEventListener("hashchange", render);
    render();
  }).catch(function (err) {
    app.innerHTML = '<p class="empty">Could not load site data (' + esc(err.message) + "). " +
      "This site must be served over http(s) — opening index.html directly from disk (file://) blocks the data files.</p>";
  });
})();

/* Hope Anchored in Christ — single-page app.
   Data is NOT inlined: every collection is fetched at runtime from content/*.json
   (same-origin, relative paths), so editing the JSON — via /admin or by hand —
   updates the site. */
(function () {
  "use strict";

  var COLLECTIONS = [
    { id: "timeline", label: "Timeline", file: "content/timeline.json", primary: "Title",
      blurb: "The whole story, era by era, from Creation to the Early Church.",
      filters: [{ label: "Era", field: "Era" }], meta: ["DateApprox", "Era"] },
    { id: "books", label: "Books", file: "content/books.json", primary: "Book",
      blurb: "All 66 books: author, date, theme, outline, and context.",
      filters: [{ label: "Testament", field: "Testament" }, { label: "Era", field: "TimelineEra" }],
      meta: ["Testament", "Category", "DateApprox"] },
    { id: "questions", label: "Questions", file: "content/questions.json", primary: "Question",
      blurb: "Searchable Bible Q&A — short answers and full studies.",
      filters: [{ label: "Category", field: "Category" }], meta: ["Category", "Subcategory"] },
    { id: "people", label: "People", file: "content/people.json", primary: "Name",
      blurb: "Every major person of Scripture, from Adam to the apostles.",
      filters: [{ label: "Testament", field: "Testament" }, { label: "Era", field: "TimelineEra" }],
      meta: ["Role", "Testament"] },
    { id: "finds", label: "Discoveries", file: "content/finds.json", primary: "FindName",
      blurb: "Archaeological finds that illuminate the Bible.",
      filters: [{ label: "Era", field: "TimelineEra" }], meta: ["DiscoveryLocation", "ArtifactDate"] },
    { id: "events", label: "Events", file: "content/events.json", primary: "EventName",
      blurb: "The great events of the biblical story.",
      filters: [{ label: "Era", field: "TimelineEra" }], meta: ["DateApprox", "Place"] },
    { id: "places", label: "Places", file: "content/places.json", primary: "Name",
      blurb: "Where the story happened, and where those places are today.",
      filters: [{ label: "Testament", field: "Testament" }, { label: "Era", field: "TimelineEra" }],
      meta: ["ModernLocation", "Testament"] },
    { id: "topics", label: "Topics", file: "content/topics.json", primary: "Topic",
      blurb: "Central topic pages linking passages, people, doctrines, and questions.",
      filters: [{ label: "Category", field: "Category" }], meta: ["Category"] },
    { id: "themes", label: "Themes", file: "content/themes.json", primary: "Theme",
      blurb: "The great themes woven through Scripture." },
    { id: "doctrines", label: "Doctrines", file: "content/doctrines.json", primary: "Doctrine",
      blurb: "What Christians believe, with biblical support and history." },
    { id: "heresies", label: "Heresies", file: "content/heresies.json", primary: "Heresy",
      blurb: "False teachings answered, with the Christian response.",
      meta: ["Founder"] },
    { id: "wordstudies", label: "Word Studies", file: "content/wordstudies.json", primary: "Transliteration",
      blurb: "Hebrew and Greek words, with Strong's numbers and meaning.",
      filters: [{ label: "Language", field: "Language" }], meta: ["Language", "StrongsNumber", "PartOfSpeech"] },
    { id: "prophecies", label: "Prophecies", file: "content/prophecies.json", primary: "Prophecy",
      blurb: "What was foretold, how it was fulfilled — marked honestly.",
      filters: [{ label: "Status", field: "FulfillmentStatus" }, { label: "Era", field: "TimelineEra" }],
      meta: ["Prophet", "DateApprox"] },
    { id: "typology", label: "Typology", file: "content/typology.json", primary: "Type",
      blurb: "Old Testament shadows fulfilled in Christ.",
      filters: [{ label: "Category", field: "Category" }] },
    { id: "fallacies", label: "Fallacies", file: "content/fallacies.json", primary: "Fallacy",
      blurb: "Spot bad reasoning in faith discussions — and answer graciously.",
      filters: [{ label: "Category", field: "Category" }] },
    { id: "courses", label: "Courses", file: "content/courses.json", primary: "Course",
      blurb: "Guided studies, from Foundations of Faith to Hebrew and Greek.",
      filters: [{ label: "Level", field: "Level" }], meta: ["Level", "Duration"] },
    { id: "quizzes", label: "Quizzes", file: "content/quizzes.json", primary: "Question",
    blurb: "Test what you've learned — every answer teaches.", special: "quizzes" },
  { id: "hymns", label: "Hymns", file: "content/hymns.json", primary: "Hymn",
    blurb: "Great hymns and the stories behind them — how each song was born.",
    meta: ["Author", "Year"] },
];

  var REL_FIELDS = ["RelatedBooks", "RelatedPeople", "RelatedEvents", "RelatedTopics",
    "RelatedDoctrines", "RelatedQuestions", "RelatedFinds", "RelatedBook",
    "KeyPersons", "KeyPeople", "BibleBooks", "Places", "Events",
    "KeyScriptures", "KeyPassages", "KeyVerses", "ScriptureReference",
    "ScriptureIlluminated", "BibleReferences", "Tags", "Place", "Prophet", "Course"];
  var SNIPPET_FIELDS = ["Summary", "Description", "Story", "Definition", "ShortAnswer",
    "ProphecySummary", "Explanation", "BiblicalUsage", "Beliefs"];
  var SKIP_FIELDS = ["Slug", "Maps"];

  var data = {};      // collection id -> array of rows
  var posts = [];     // blog manifest
  var maps = {};      // map id -> {title, file, credit, source}
  var ASSET_V = "7";  // bump when site code or content changes, so browsers fetch fresh copies
  var linkIndex = {}; // exact value -> {coll, idx}
  var app = document.getElementById("app");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function label(field) {
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
        if (!isEmpty(p) && !linkIndex[p]) linkIndex[p] = { coll: c.id, idx: idx };
        if (c.id === "wordstudies") {
          var w = val(row, "Word");
          if (!isEmpty(w) && !linkIndex[w]) linkIndex[w] = { coll: c.id, idx: idx };
        }
      });
    });
  }
  function linkifyField(field, value) {
    if (REL_FIELDS.indexOf(field) === -1) return esc(value);
    return splitList(value).map(function (token) {
      var hit = linkIndex[token];
      if (hit) return '<a href="#/' + hit.coll + "/" + hit.idx + '">' + esc(token) + "</a>";
      return esc(token);
    }).join("; ");
  }
  function renderValue(field, value) {
    if (field === "Lessons") {
      return "<ul>" + splitList(value).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
    }
    if (REL_FIELDS.indexOf(field) !== -1) {
      return '<span class="related">' + linkifyField(field, value) + "</span>";
    }
    return esc(value);
  }

  /* ---------- generic list + detail ---------- */
  function viewCollection(id, idx, params) {
    var c = coll(id);
    if (!c) return viewHome();
    if (id === "timeline" && (idx === undefined || idx === null || idx === "")) return viewTimeline(params);
    if (c.special === "quizzes") return idx ? viewQuizPlay(idx, params) : viewQuizList(params);
    if (idx !== undefined && idx !== null && idx !== "") return viewDetail(c, parseInt(idx, 10));
    var rows = data[id] || [];
    var filterDefs = c.filters || [];
    var state = { q: (params.get("q") || ""), filters: {} };
    filterDefs.forEach(function (f) { state.filters[f.field] = params.get("f_" + f.field) || ""; });

    var values = {};
    filterDefs.forEach(function (f) {
      var set = {};
      rows.forEach(function (r) { var v = val(r, f.field); if (!isEmpty(v)) set[v] = true; });
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
    function filteredRows() {
      var q = state.q.toLowerCase();
      return rows.map(function (r, i) { return { row: r, idx: i }; }).filter(function (item) {
        var r = item.row;
        for (var j = 0; j < filterDefs.length; j++) {
          var f = filterDefs[j], want = state.filters[f.field];
          if (want && val(r, f.field) !== want) return false;
        }
        if (q) {
          var hay = Object.keys(r).map(function (k) { return val(r, k); }).join(" ").toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }
    function renderGrid() {
      var wrap = document.getElementById("gridWrap");
      if (!wrap) return;
      var filtered = filteredRows();
      if (!filtered.length) {
        wrap.innerHTML = '<p class="empty">Nothing matches. Try clearing the search or filters.</p>';
      } else {
        wrap.innerHTML = '<div class="card-grid">' + filtered.map(function (item) {
          return cardFor(c, item.row, item.idx);
        }).join("") + "</div>";
      }
    }

    var html = "<h2>" + esc(c.label) + "</h2><p class='page-intro'>" + esc(c.blurb) +
      " &middot; " + rows.length + " entries</p>";
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
    var eventsList = (data.events || []).map(function (r, i) { return { name: val(r, "EventName"), idx: i }; }).filter(function (e) { return !isEmpty(e.name); });
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
          out.push('<a class="conn-chip" href="#/events/' + e.idx + '">' + esc(e.name) + "</a>");
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
          (isEmpty(val(r, "ScriptureReference")) ? "" : '<p class="tl-meta">' + esc(val(r, "ScriptureReference")) + "</p>") +
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
    var html = "<h2>Timeline</h2><p class='page-intro'>The whole story, era by era, from Creation to the Early Church — " +
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
    html += '<div class="detail"><dl>';
    Object.keys(row).forEach(function (field) {
      if (SKIP_FIELDS.indexOf(field) !== -1) return;
      var v = val(row, field);
      if (isEmpty(v)) return;
      html += "<dt>" + esc(label(field)) + "</dt><dd>" + renderValue(field, v) + "</dd>";
    });
    html += "</dl>";
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
  function viewQuizList(params) {
    var diff = params.get("difficulty") || "";
    var groups = quizGroups();
    var html = "<h2>Quizzes</h2><p class='page-intro'>Test what you've learned — every answer teaches. " +
      (data.quizzes || []).length + " questions across " + groups.length + " quizzes.</p>";
    html += '<div class="controls"><div class="chips"><span class="chip-label">Difficulty:</span>' +
      ["", "Easy", "Medium", "Hard"].map(function (d) {
        return '<button class="chip' + (diff === d ? " active" : "") + '" data-diff="' + d + '">' + (d || "All") + "</button>";
      }).join("") + "</div></div>";
    var shown = groups.filter(function (g) {
      return !diff || g.qs.some(function (q) { return val(q, "Difficulty") === diff; });
    });
    html += '<div class="card-grid">' + shown.map(function (g) {
      var counts = {};
      g.qs.forEach(function (q) { var d = val(q, "Difficulty"); counts[d] = (counts[d] || 0) + 1; });
      var breakdown = Object.keys(counts).map(function (d) { return d + " " + counts[d]; }).join(" · ");
      return '<a class="card" href="#/quizzes/play/' + encodeURIComponent(g.name) + '"><h3>' + esc(g.name) +
        "</h3><p class='meta'>" + esc(g.course) + "</p><p class='meta'>" + g.qs.length +
        " questions &middot; " + esc(breakdown) + "</p></a>";
    }).join("") + "</div>";
    if (!shown.length) html += '<p class="empty">No quizzes at that difficulty.</p>';
    app.innerHTML = html;
    app.querySelectorAll("[data-diff]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var d = btn.getAttribute("data-diff");
        navigate(d ? "#/quizzes?difficulty=" + d : "#/quizzes", true);
      });
    });
    window.scrollTo(0, 0);
  }
  function viewQuizPlay(name, params) {
    var diff = params.get("difficulty") || "";
    var group = quizGroups().filter(function (g) { return g.name === name; })[0];
    if (!group) return viewQuizList(params);
    var qs = diff ? group.qs.filter(function (q) { return val(q, "Difficulty") === diff; }) : group.qs;
    var html = '<a class="back-link" href="#/quizzes">&larr; All quizzes</a><h2>' + esc(name) + "</h2>" +
      '<p class="page-intro">' + esc(group.course) + " &middot; " + qs.length + " questions</p>" +
      '<div class="chips"><span class="chip-label">Difficulty:</span>' +
      ["", "Easy", "Medium", "Hard"].map(function (d) {
        return '<button class="chip' + (diff === d ? " active" : "") + '" data-diff="' + d + '">' + (d || "All") + "</button>";
      }).join("") + "</div>" +
      '<div class="quiz-score" id="quizScore">Score: 0 / 0 answered</div>';
    qs.forEach(function (q, i) {
      html += '<div class="question-card" data-q="' + i + '"><h3>' + (i + 1) + ". " + esc(val(q, "Question")) + "</h3>" +
        '<div class="options">' + ["A", "B", "C", "D"].map(function (letter) {
          return '<button class="option-btn" data-letter="' + letter + '"><strong>' + letter + ".</strong> " +
            esc(val(q, "Option" + letter)) + "</button>";
        }).join("") + "</div>" +
        '<div class="explanation" hidden><strong>Answer: ' + esc(val(q, "CorrectAnswer")) + "</strong> &mdash; " +
        esc(val(q, "Explanation")) +
        (val(q, "ScriptureReference") ? " <em>(" + esc(val(q, "ScriptureReference")) + ")</em>" : "") + "</div></div>";
    });
    app.innerHTML = html;
    var correct = 0, answered = 0;
    var scoreEl = document.getElementById("quizScore");
    app.querySelectorAll("[data-diff]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var d = btn.getAttribute("data-diff");
        navigate("#/quizzes/play/" + encodeURIComponent(name) + (d ? "?difficulty=" + d : ""), true);
      });
    });
    app.querySelectorAll(".question-card").forEach(function (card) {
      var q = qs[parseInt(card.getAttribute("data-q"), 10)];
      var right = val(q, "CorrectAnswer");
      card.querySelectorAll(".option-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var picked = btn.getAttribute("data-letter");
          card.querySelectorAll(".option-btn").forEach(function (b) {
            b.disabled = true;
            if (b.getAttribute("data-letter") === right) b.classList.add("correct");
          });
          if (picked !== right) btn.classList.add("wrong"); else correct++;
          answered++;
          card.querySelector(".explanation").hidden = false;
          scoreEl.textContent = "Score: " + correct + " / " + answered + " answered" +
            (answered === qs.length ? " — Quiz complete!" : "");
        });
      });
    });
    window.scrollTo(0, 0);
  }

  /* ---------- home / explore / blog / about / search ---------- */
  function collectionCard(c) {
    var n = (data[c.id] || []).length;
    return '<a class="card" href="#/' + c.id + '"><h3>' + esc(c.label) + "</h3>" +
      '<p class="meta">' + n + " entries</p><p class='snippet'>" + esc(c.blurb) + "</p></a>";
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
      html += "<h3>Latest from the blog</h3>" +
        '<a class="card" href="#/blog/' + esc(latest.slug) + '"><h3>' + esc(latest.title) + "</h3>" +
        '<p class="meta">' + esc(latest.date) + (latest.category ? " &middot; " + esc(latest.category) : "") + "</p></a>";
    }
    html += "<h3>Explore the collections</h3><div class='card-grid'>" +
      COLLECTIONS.map(collectionCard).join("") + "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function viewExplore() {
    var html = "<h2>Explore</h2><p class='page-intro'>Every collection on the site — pick one and start browsing.</p>" +
      "<div class='card-grid'>" + COLLECTIONS.map(collectionCard).join("") + "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function viewBlog(slug) {
    if (slug) {
      var post = posts.filter(function (p) { return p.slug === slug; })[0];
      if (!post) return viewBlog(null);
      fetch(post.file + "?v=" + ASSET_V).then(function (r) { return r.text(); }).then(function (text) {
        var body = text.replace(/^---[\s\S]*?---\s*/, "");
        app.innerHTML = '<a class="back-link" href="#/blog">&larr; All posts</a><article class="post-body"><h2>' +
          esc(post.title) + '</h2><p class="post-meta">' + esc(post.date) +
          (post.category ? " &middot; " + esc(post.category) : "") +
          (post.scripture ? " &middot; " + esc(post.scripture) : "") + "</p>" +
          renderMarkdown(body) + "</article>";
        window.scrollTo(0, 0);
      }).catch(function () {
        app.innerHTML = '<p class="empty">That post could not be loaded.</p>';
      });
      return;
    }
    var html = "<h2>Blog</h2><p class='page-intro'>Reflections and studies from the anchored story.</p>";
    if (!posts.length) html += '<p class="empty">No posts yet.</p>';
    html += "<div class='card-grid'>" + posts.map(function (p) {
      return '<a class="card" href="#/blog/' + esc(p.slug) + '"><h3>' + esc(p.title) + "</h3>" +
        '<p class="meta">' + esc(p.date) + (p.category ? " &middot; " + esc(p.category) : "") + "</p></a>";
    }).join("") + "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  /* ---------- store ---------- */
  /* Each product: name, price, image, url (the print-on-demand checkout page), desc.
     The list starts empty on purpose: real products are added here once the
     print-on-demand shop is set up, so the live page never shows fake items. */
  var STORE_PRODUCTS = [];
  function viewStore() {
    var html = "<h2>Store</h2><div class='post-body'>" +
      "<p>Beautiful, faith-anchored goods, made to order and shipped to you. " +
      "Every item is printed on demand — nothing is mass-produced or warehoused — so your purchase supports this ministry " +
      "and arrives made just for you.</p>";
    if (!STORE_PRODUCTS.length) {
      html += "<p class='empty'>Our shop is coming soon. Check back shortly for our first collection.</p>";
    } else {
      html += "<div class='card-grid'>" + STORE_PRODUCTS.map(function (p) {
        return "<div class='card store-card'>" +
          "<img src='" + esc(p.image) + "' alt='" + esc(p.name) + "'>" +
          "<h3>" + esc(p.name) + "</h3>" +
          "<p class='price'>" + esc(p.price) + "</p>" +
          "<p class='snippet'>" + esc(p.desc) + "</p>" +
          "<p><a class='buy-btn' href='" + esc(p.url) + "' target='_blank' rel='noopener'>Buy</a></p>" +
          "</div>";
      }).join("") + "</div>";
    }
    app.innerHTML = html + "</div>";
    window.scrollTo(0, 0);
  }
  function viewAbout() {
    app.innerHTML = "<h2>About</h2><div class='post-body'>" +
      "<img class='about-photo' src='assets/about-photo.jpg' alt='Lorraine and her husband outdoors'>" +
      "<h3>Our Story</h3>" +
      "<p>Our story begins with two very different but deeply meaningful paths that God wove together for a purpose bigger than ourselves. " +
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
      "to hold the weight of real life, real questions, and real hope.</p></div>";
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
      h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      h = h.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      return h;
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
      } else {
        var para = [];
        while (i < lines.length && lines[i].trim() !== "" && !/^#{1,3}\s/.test(lines[i]) &&
               !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*>\s?/.test(lines[i]) && !/^\s*---\s*$/.test(lines[i])) {
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
    if (path.length === 0) return viewHome();
    if (path[0] === "explore") return viewExplore();
    if (path[0] === "blog") return viewBlog(path[1] ? decodeURIComponent(path[1]) : null);
    if (path[0] === "about") return viewAbout();
    if (path[0] === "store") return viewStore();
    if (path[0] === "search") return viewSearch(params);
    var c = coll(path[0]);
    if (c) return viewCollection(c.id, path[1] ? decodeURIComponent(path[1]) : null, params);
    return viewHome();
  }
  document.getElementById("headerSearch").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = document.getElementById("headerSearchInput").value.trim();
    if (q) location.hash = "#/search?q=" + encodeURIComponent(q);
  });
  document.getElementById("footerNav").innerHTML =
    COLLECTIONS.map(function (c) { return '<a href="#/' + c.id + '">' + esc(c.label) + "</a>"; }).join("") +
    '<a href="#/blog">Blog</a><a href="#/about">About</a><a href="#/store">Store</a>';

  app.innerHTML = '<p class="loading">Loading the collections…</p>';
  var jobs = COLLECTIONS.map(function (c) {
    return fetch(c.file + "?v=" + ASSET_V).then(function (r) {
      if (!r.ok) throw new Error(c.file);
      return r.json();
    }).then(function (rows) { data[c.id] = rows; });
  });
  jobs.push(fetch("content/posts.json?v=" + ASSET_V).then(function (r) { return r.json(); }).then(function (p) { posts = p; }));
  jobs.push(fetch("content/maps.json?v=" + ASSET_V).then(function (r) { return r.ok ? r.json() : {}; }).then(function (m) { maps = m; }).catch(function () { maps = {}; }));
  Promise.all(jobs).then(function () {
    buildLinkIndex();
    window.addEventListener("hashchange", render);
    render();
  }).catch(function (err) {
    app.innerHTML = '<p class="empty">Could not load site data (' + esc(err.message) + "). " +
      "This site must be served over http(s) — opening index.html directly from disk (file://) blocks the data files.</p>";
  });
})();

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
    { id: "books", label: "Books of the Bible", file: "content/books.json", primary: "Book",
      blurb: "All 66 books: author, date, theme, outline, and context.",
      filters: [{ label: "Testament", field: "Testament" }, { label: "Era", field: "TimelineEra" }],
      meta: ["Testament", "Category", "DateApprox"] },
    { id: "questions", label: "Questions and Answers", file: "content/questions.json", primary: "Question",
      blurb: "Searchable Bible Q&A — short answers and full studies.",
      filters: [{ label: "Category", field: "Category" }], meta: ["Category", "Subcategory"] },
    { id: "people", label: "Biblical People", file: "content/people.json", primary: "Name",
      blurb: "Every major person of Scripture, from Adam to the apostles.",
      filters: [{ label: "Testament", field: "Testament" }, { label: "Era", field: "TimelineEra" }],
      meta: ["Role", "Testament"] },
    { id: "finds", label: "Ancient Discoveries", file: "content/finds.json", primary: "FindName",
      blurb: "Archaeological finds that illuminate the Bible.",
      filters: [{ label: "Era", field: "TimelineEra" }], meta: ["DiscoveryLocation", "ArtifactDate"] },
    { id: "places", label: "Biblical Places", file: "content/places.json", primary: "Name",
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
  { id: "nature", label: "Nature & Creation", file: "content/nature.json", primary: "Name",
    blurb: "Birds, plants, and animals that point to the Creator — with photos from Lorraine.",
    meta: ["Category"] },
  { id: "apologetics", label: "Apologetics", file: "content/apologetics.json", primary: "Argument",
    blurb: "Why Christianity best explains reality — the cumulative case from philosophy, science, history, and experience.",
    filters: [{ label: "Category", field: "Category" }], meta: ["Category"] },
  { id: "objections", label: "Objections & Answers", file: "content/objections.json", primary: "Objection",
    blurb: "Honest objections from atheists, Muslims, Jews, and others — stated fairly and answered with grace and truth.",
    filters: [{ label: "Worldview", field: "Worldview" }], meta: ["Worldview"] },
  { id: "perspectives", label: "Perspectives", file: "content/perspectives.json", primary: "Profession",
    blurb: "How journalists, detectives, doctors, and other professionals shed light on the truth of the Bible.",
    meta: ["Exemplar"] },
  { id: "heritage", label: "Christian Heritage", file: "content/heritage.json", primary: "Name",
    blurb: "Writings, commentaries, church history, and the men and women whose testimonies shaped Christianity.",
    filters: [{ label: "Type", field: "Type" }], meta: ["Type", "Era"] },
  { id: "politics", label: "Faith & Politics", file: "content/politics.json", primary: "Issue",
    blurb: "Political issues and current events — and how to respond to them biblically." },
  { id: "socialmedia", label: "Social Media Responses", file: "content/socialmedia.json", primary: "Post",
    blurb: "Viral posts, trends, and hot takes from TikTok, X, Facebook, Instagram, and beyond — addressed with grace and truth.",
    filters: [{ label: "Platform", field: "Platform" }], meta: ["Platform"] },
  { id: "stories", label: "Biblical Stories & Events", file: "content/stories.json", primary: "Story",
    blurb: "Beloved Bible stories and events retold in detail — with the people, the meaning, and what they mean for us today.",
    filters: [{ label: "Testament", field: "Testament" }], meta: ["Testament"] },
  { id: "hermeneutics", label: "Biblical Hermeneutics", file: "content/hermeneutics.json", primary: "Principle",
    blurb: "How to interpret Scripture rightly — context, literary genres, literary devices, and principles for handling God's Word with care.",
    filters: [{ label: "Category", field: "Category" }], meta: ["Category"] },
  { id: "jewishculture", label: "Jewish Culture & the Messiah", file: "content/jewishculture.json", primary: "Topic",
    blurb: "Jewish culture, feasts, and traditions \u2014 and how each one points to Jesus the Messiah.",
    filters: [{ label: "Category", field: "Category" }], meta: ["Category"] },
  { id: "comicstories", label: "Comic Stories", file: "content/comicstories.json", primary: "Story",
    blurb: "Bible stories told comic-style — scroll down and each page appears as you read." },
  { id: "studyguides", label: "Bible Study Guides", file: "content/studyguides.json", primary: "Guide",
    blurb: "Step-by-step guides for studying a book, a topic, a person, or a passage — with questions and application for every study.",
    filters: [{ label: "Category", field: "Category" }], meta: ["Category"] },
];

  var REL_FIELDS = ["RelatedBooks", "RelatedPeople", "RelatedEvents", "RelatedTopics",
    "RelatedDoctrines", "RelatedQuestions", "RelatedFinds", "RelatedBook",
    "KeyPersons", "KeyPeople", "BibleBooks", "Places", "Events",
    "KeyScriptures", "KeyPassages", "KeyVerses", "ScriptureReference",
    "ScriptureIlluminated", "BibleReferences", "Tags", "Themes", "Place", "Prophet", "Course"];
  var SNIPPET_FIELDS = ["Summary", "Description", "Story", "Definition", "ShortAnswer",
    "ProphecySummary", "Explanation", "BiblicalUsage", "Beliefs"];
  var SKIP_FIELDS = ["Slug", "Maps", "Image", "ImageCredit", "ImageSource", "PanelImage", "PanelImageCredit"];

  var data = {};      // collection id -> array of rows
  var posts = [];     // blog manifest
  var maps = {};      // map id -> {title, file, credit, source}
  var explorePage = {}; // editable Explore page text (content/pages/explore.json)
  var ASSET_V = "54";  // bump when site code or content changes, so browsers fetch fresh copies
  var linkIndex = {}; // exact value -> {coll, idx}
  var linkIndexByColl = {}; // coll id -> exact value -> {coll, idx}
  // A related field's home collection: a RelatedEvents token that matches a
  // story title must land on the story page, not on a timeline/topic page
  // that happens to share the name and comes first in COLLECTIONS order.
  var FIELD_HOME = { RelatedBooks: "books", RelatedBook: "books", BibleBooks: "books",
    RelatedPeople: "people", KeyPeople: "people", KeyPersons: "people", Prophet: "people",
    RelatedEvents: "stories", Events: "stories", RelatedTopics: "topics", Themes: "themes",
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
    if (m) m[1].split("\n").forEach(function (line) {
      var i = line.indexOf(":");
      if (i > 0) {
        var val = line.slice(i + 1).trim();
        if ((val.charAt(0) === '"' && val.slice(-1) === '"') || (val.charAt(0) === "'" && val.slice(-1) === "'")) val = val.slice(1, -1);
        meta[line.slice(0, i).trim()] = val;
      }
    });
    var slug = file.split("/").pop().replace(/\.md$/, "");
    return { slug: slug, title: meta.title || slug, date: meta.date || "", category: meta.category || "", scripture: meta.scripture || "", file: file };
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
          var note = (val(q, "ScriptureReference") ? " <em>(" + esc(val(q, "ScriptureReference")) + ")</em>" : "");
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
  var TILE_ART = { timeline: "assets/lineart/timeline.png", people: "assets/lineart/people.png?v=2", books: "assets/lineart/books.png", finds: "assets/lineart/finds.jpg?v=2" };
  var POST_ART = {};
  function collectionCard(c) {
    var n = (data[c.id] || []).length;
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
      html += "<h3>Latest from the blog</h3>" +
        '<a class="card" href="#/blog/' + esc(latest.slug) + '">' + (POST_ART[latest.slug] ? "<img class='card-art' src='" + esc(POST_ART[latest.slug]) + "' alt=''>" : "") + "<h3>" + esc(latest.title) + "</h3>" +
        '<p class="meta">' + esc(shortDate(latest.date)) + (latest.category ? " &middot; " + esc(latest.category) : "") + "</p></a>";
    }
    html += "<h3>Explore the collections</h3><div class='card-grid'>" +
      COLLECTIONS.map(collectionCard).join("") + "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function viewExplore() {
    var html = "<h2>" + esc(explorePage.heading || "Explore") + "</h2><p class='page-intro'>" +
      esc(explorePage.intro || "Every collection on the site — pick one and start browsing.") + "</p>" +
      "<div class='card-grid'>" + COLLECTIONS.map(collectionCard).join("") + "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function viewBlog(slug) {
    if (slug) {
      var post = posts.filter(function (p) { return p.slug === slug; })[0];
      if (!post) return viewBlog(null);
      fetch(post.raw || (post.file + "?v=" + ASSET_V), { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(post.file); return r.text(); }).then(function (text) {
        var body = text.replace(/^---[\s\S]*?---\s*/, "");
        app.innerHTML = '<a class="back-link" href="#/blog">&larr; All posts</a><article class="post-body"><h2>' +
          esc(post.title) + '</h2><p class="post-meta">' + esc(shortDate(post.date)) +
          (post.category ? " &middot; " + esc(post.category) : "") +
          (post.scripture ? " &middot; " + esc(post.scripture) : "") + "</p>" +
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
    html += "<div class='card-grid'>" + posts.map(function (p) {
      return '<a class="card" href="#/blog/' + esc(p.slug) + '">' + (POST_ART[p.slug] ? "<img class='card-art' src='" + esc(POST_ART[p.slug]) + "' alt=''>" : "") + "<h3>" + esc(p.title) + "</h3>" +
        '<p class="meta">' + esc(shortDate(p.date)) + (p.category ? " &middot; " + esc(p.category) : "") + "</p></a>";
    }).join("") + "</div>";
    app.innerHTML = html;
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
  function bibleLinkData() {
    if (bibleLinkCache) return bibleLinkCache;
    var map = {};
    Object.keys(linkIndex).forEach(function (key) {
      var hit = linkIndex[key];
      if (hit.coll !== "people" && hit.coll !== "places" && hit.coll !== "stories") return;
      if (!map[key]) map[key] = hit;
    });
    var terms = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    var multi = terms.filter(function (t) { return t.indexOf(" ") !== -1; });
    var single = terms.filter(function (t) { return t.indexOf(" ") === -1; });
    var lower = {};
    Object.keys(map).forEach(function (key) {
      var lk = key.toLowerCase();
      if (!lower[lk]) lower[lk] = map[key];
    });
    bibleLinkCache = {
      map: map,
      lower: lower,
      reMulti: new RegExp("\\b(" + multi.map(escapeRegExp).join("|") + ")\\b", "g"),
      reSingle: new RegExp("(<a\\b[^>]*>.*?</a>)|\\b(" + single.map(escapeRegExp).join("|") + ")\\b", "gi")
    };
    return bibleLinkCache;
  }
  function linkifyVerseText(text) {
    var t = bibleLinkData();
    var safe = esc(text).replace(/\[([^\]]+)\]/g, "<em>$1</em>");
    safe = safe.replace(t.reMulti, function (m) {
      var hit = t.map[m];
      if (!hit) return m;
      return '<a href="#/' + hit.coll + '/' + hit.idx + '">' + esc(m) + '</a>';
    });
    safe = safe.replace(t.reSingle, function (m, anchor, term) {
      if (anchor) return anchor;
      var hit = t.map[term] || t.lower[term.toLowerCase()];
      if (!hit) return term;
      return '<a href="#/' + hit.coll + '/' + hit.idx + '">' + esc(term) + '</a>';
    });
    return safe;
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
    html += "</div></div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function articlesForChapter(bookName, chapter) {
    var variants = [bookName];
    if (bookName === "Psalms") variants.push("Psalm");
    if (bookName === "Song of Solomon") variants.push("Song of Songs", "Song");
    var res = variants.map(function (v) {
      return new RegExp("(^|[^0-9A-Za-z])" + escapeRegExp(v) + " " + chapter + ":", "i");
    });
    var out = [];
    COLLECTIONS.forEach(function (c) {
      if (c.id === "quizzes" || c.id === "comicstories") return;
      (data[c.id] || []).forEach(function (row, i) {
        var hit = Object.keys(row).some(function (k) {
          return res.some(function (re) { return re.test(" " + val(row, k)); });
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
      var paras = [""];
      Object.keys(verses).sort(function (a, b) { return +a - +b; }).forEach(function (n) {
        var txt = verses[n];
        if (txt.indexOf("# ") === 0) { txt = txt.slice(2); paras.push(""); }
        paras[paras.length - 1] += '<span class="verse" id="v' + n + '"><sup>' + n + '</sup> ' + linkifyVerseText(txt) + '</span> ';
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
      var arts = articlesForChapter(book.name, chapter);
      if (arts.length) {
        html += "<h3>Articles about this chapter</h3><div class='card-grid'>" + arts.map(function (a) {
          return "<a class='card' href='#/" + a.c.id + "/" + a.idx + "'><h3>" + esc(val(a.row, a.c.primary)) + "</h3><p class='meta'>" + esc(a.c.label) + "</p></a>";
        }).join("") + "</div>";
      }
      html += "</div>";
      app.innerHTML = html;
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
  /* ---------- comic stories ---------- */
  /* Panels group into stories by Story name, exactly like quiz questions group by Quiz name. */
  function comicStoryKey(name) {
    return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function comicStories() {
    var groups = {};
    var order = [];
    (data.comicstories || []).forEach(function (p) {
      var key = comicStoryKey(p.Story);
      if (!groups[key]) { groups[key] = { title: p.Story, description: p.StoryDescription, panels: [] }; order.push(key); }
      groups[key].panels.push(p);
    });
    order.forEach(function (key) {
      groups[key].panels.sort(function (a, b) { return (parseInt(a.PanelNumber, 10) || 0) - (parseInt(b.PanelNumber, 10) || 0); });
    });
    return { groups: groups, order: order };
  }
  function viewComicList() {
    var s = comicStories();
    var html = "<h2>Comic Stories</h2><p class='page-intro'>Bible stories told comic-style — scroll down and each page appears as you read.</p>";
    if (!s.order.length) {
      html += '<p class="empty">No comic stories yet. Check back soon!</p>';
    } else {
      html += "<div class='card-grid'>" + s.order.map(function (key) {
        var g = s.groups[key];
        var cover = g.panels[0];
        return '<a class="card comic-card" href="#/comicstories/' + key + '">' +
          (cover && cover.PanelImage ? "<img src='" + esc(cover.PanelImage) + "' alt=''>" : "") +
          "<h3>" + esc(g.title) + "</h3>" +
          "<p class='meta'>" + g.panels.length + " panels</p>" +
          "<p class='snippet'>" + esc(g.description) + "</p></a>";
      }).join("") + "</div>";
    }
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function viewComicReader(key) {
    var s = comicStories();
    var g = s.groups[key];
    if (!g) return viewComicList();
    var panels = g.panels;
    var html = '<a class="back-link" href="#/comicstories">&larr; All comic stories</a>' +
      "<div class='comic-progress'><div class='comic-progress-bar' id='comicProgressBar'></div></div>" +
      "<h2>" + esc(g.title) + "</h2><p class='page-intro'>" + esc(g.description) + "</p>" +
      "<div class='comic-reader'>" + panels.map(function (p, i) {
        return "<article class='comic-panel'>" +
          "<div class='comic-scene'>" +
          (p.PanelBackground ? "<div class='comic-scene-bg' data-bg='" + esc(p.PanelBackground) + "'></div>" : "<div class='comic-scene-bg comic-scene-bg-default'></div>") +
          (p.PanelImage ? "<div class='comic-scene-art'><img src='" + esc(p.PanelImage) + "' alt='Comic panel " + (i + 1) + "'></div>" : "") +
          "</div>" +
          (p.PanelImageCredit ? "<p class='comic-credit'>" + esc(p.PanelImageCredit) + "</p>" : "") +
          "<div class='comic-panel-body'><p class='comic-text'>" + esc(p.PanelText) + "</p>" +
          "<p class='comic-meta'><span class='comic-char'>" + esc(p.Character) + "</span> &middot; Panel " + (i + 1) + " of " + panels.length + "</p></div>" +
          "</article>";
      }).join("") + "</div>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
    Array.prototype.slice.call(document.querySelectorAll(".comic-scene-bg[data-bg]")).forEach(function (bg) {
      bg.style.backgroundImage = "url('" + bg.getAttribute("data-bg") + "')";
    });
    var els = Array.prototype.slice.call(document.querySelectorAll(".comic-panel"));
    if (!("IntersectionObserver" in window) || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      els.forEach(function (el) { el.classList.add("comic-visible"); });
    } else {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("comic-visible"); obs.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
      els.forEach(function (el) { obs.observe(el); });
    }
    var comicScenes = Array.prototype.slice.call(document.querySelectorAll(".comic-scene"));
    var comicReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function updateComicParallax() {
      if (comicReduced) return;
      var vh = window.innerHeight;
      comicScenes.forEach(function (scene) {
        var r = scene.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var offset = (r.top + r.height / 2) - vh / 2;
        var bg = scene.querySelector(".comic-scene-bg");
        var art = scene.querySelector(".comic-scene-art");
        if (bg) bg.style.transform = "translateY(" + Math.max(-r.height * 0.05, Math.min(r.height * 0.05, offset * -0.10)) + "px)";
        if (art) art.style.transform = "translateY(" + Math.max(-r.height * 0.12, Math.min(r.height * 0.12, offset * -0.30)) + "px)";
      });
    }
    function onComicScroll() {
      var bar = document.getElementById("comicProgressBar");
      if (!bar) return;
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0) + "%";
      updateComicParallax();
    }
    window.addEventListener("scroll", onComicScroll, { passive: true });
    onComicScroll();
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
    if (path[0] === "connect") return viewConnect();
    if (path[0] === "give") return viewGive();
    if (path[0] === "bible") {
      if (!path[1]) return viewBible();
      if (!path[2]) return viewBibleBook(path[1]);
      return viewBibleChapter(path[1], path[2], params);
    }
    if (path[0] === "terms") return viewTerms();
    if (path[0] === "privacy") return viewPrivacy();
    if (path[0] === "faq") return viewFaq();
    if (path[0] === "search") return viewSearch(params);
    if (path[0] === "quizzes" && path[1] === "play") return viewQuizPlay(path[2] ? decodeURIComponent(path[2]) : "", params);
    if (path[0] === "comicstories") {
      if (!path[1]) return viewComicList();
      var ck = comicStoryKey(decodeURIComponent(path[1]));
      if (comicStories().groups[ck]) return viewComicReader(ck);
      /* Unknown segment: fall through to the generic collection behavior below. */
    }
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
    '<a href="#/blog">Blog</a><a href="#/bible">Bible</a><a href="#/about">About</a><a href="#/store">Store</a><a href="#/connect">Connect</a><a href="#/give">Give</a>';

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
  Promise.all(jobs).then(function () {
    buildLinkIndex();
    window.addEventListener("hashchange", render);
    render();
  }).catch(function (err) {
    app.innerHTML = '<p class="empty">Could not load site data (' + esc(err.message) + "). " +
      "This site must be served over http(s) — opening index.html directly from disk (file://) blocks the data files.</p>";
  });
})();

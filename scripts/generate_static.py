#!/usr/bin/env python3
"""Generate crawler/share-friendly static pages for the blog.

The site itself is a single-page app: every address is a hash route
(#/blog/<slug>), which search engines and link previews cannot treat as a
separate page. This script emits one real, readable HTML file per blog post
at blog/<slug>/, with a proper title, description, canonical URL and
Open Graph tags — so a post can be indexed, and so sharing its link shows
the post's own title and description instead of the generic site card.

Also emits blog/index.html (a post listing), sitemap.xml and robots.txt.

SITE_URL is the ONE place the public address lives. It currently points at
the GitHub Pages address. When the custom domain goes live, change it to
https://www.hopeanchoredinchrist.com, re-run this script, and push: the
sitemap, canonical URLs and share cards all follow from this constant.
Nothing else in the site needs to change for the switch, because the app
itself uses relative hash routes.

Usage: python3 scripts/generate_static.py
"""

import html
import json
import os
import re
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# CHANGE THIS when the custom domain goes live, then re-run + push.
SITE_URL = "https://flash1095.github.io/hope-anchored-in-christ"
BANNER_V = "19"  # bump when assets/banner.jpg is replaced


def parse_post(path):
    text = open(path, encoding="utf-8").read()
    fm = {}
    body = text
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            for line in text[3:end].strip().split("\n"):
                if ":" in line:
                    key, val = line.split(":", 1)
                    fm[key.strip()] = val.strip().strip('"').strip()
            body = text[end + 3:].strip()
    slug = os.path.basename(path).replace(".md", "")
    return slug, fm, body


def esc(t):
    return html.escape(t or "", quote=True)


def inline(t):
    h = esc(t)
    h = h.replace("\\.", ".")
    # Images first (before links, which would otherwise swallow them).
    # Static pages sit two levels deep, so site-relative assets/ paths
    # become ../../assets/ here; the live app uses assets/ unchanged.
    h = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)",
               lambda m: '<img src="%s" alt="%s" loading="lazy">' % (
                   "../../" + m.group(2) if m.group(2).startswith("assets/") else m.group(2),
                   m.group(1)),
               h)
    # SPA routes (#/...) become relative links from blog/<slug>/ back to the app.
    h = re.sub(r"\[([^\]]+)\]\(([^)]+)\)",
               lambda m: '<a href="%s">%s</a>' % (
                   "../../#/" + m.group(2)[2:] if m.group(2).startswith("#/") else m.group(2),
                   m.group(1)),
               h)
    h = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", h)
    h = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", h)
    return h


def render_markdown(src):
    """Port of the app's renderMarkdown (assets/app.js), so static pages
    render post bodies exactly the way the app does."""
    lines = src.replace("\r\n", "\n").split("\n")
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        if re.match(r"^#{1,3}\s", line):
            level = len(re.match(r"^#+", line).group(0))
            out.append("<h%d>%s</h%d>" % (level + 1, inline(re.sub(r"^#+\s*", "", line)), level + 1))
            i += 1
        elif re.match(r"^\s*---\s*$", line):
            out.append("<hr>")
            i += 1
        elif re.match(r"^\s*>\s?", line):
            quote = []
            while i < len(lines) and re.match(r"^\s*>\s?", lines[i]):
                quote.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            out.append("<blockquote><p>" + inline(" ".join(quote)) + "</p></blockquote>")
        elif re.match(r"^\s*[-*]\s+", line):
            items = []
            while i < len(lines) and re.match(r"^\s*[-*]\s+", lines[i]):
                items.append(re.sub(r"^\s*[-*]\s+", "", lines[i]))
                i += 1
            out.append("<ul>" + "".join("<li>" + inline(t) + "</li>" for t in items) + "</ul>")
        elif is_table_start(lines, i):
            head = split_row(lines[i])
            i += 2
            body = []
            while i < len(lines) and re.match(r"^\s*\|", lines[i]):
                body.append(split_row(lines[i]))
                i += 1
            thead = "<thead><tr>" + "".join("<th>" + inline(c) + "</th>" for c in head) + "</tr></thead>"
            tbody = "<tbody>" + "".join("<tr>" + "".join("<td>" + inline(c) + "</td>" for c in r) + "</tr>" for r in body) + "</tbody>"
            out.append('<div class="study-table"><table>' + thead + tbody + "</table></div>")
        elif re.match(r"^\s*\d+\\?\.\s+", line):
            items = []
            while i < len(lines) and re.match(r"^\s*\d+\\?\.\s+", lines[i]):
                items.append(re.sub(r"^\s*\d+\\?\.\s+", "", lines[i]))
                i += 1
            out.append("<ol>" + "".join("<li>" + inline(t) + "</li>" for t in items) + "</ol>")
        elif line.strip() == "":
            i += 1
        else:
            para = []
            while (i < len(lines) and lines[i].strip() != ""
                   and not re.match(r"^#{1,3}\s", lines[i])
                   and not re.match(r"^\s*[-*]\s+", lines[i])
                   and not re.match(r"^\s*>\s?", lines[i])
                   and not re.match(r"^\s*---\s*$", lines[i])
                   and not is_table_start(lines, i)
                   and not re.match(r"^\s*\d+\\?\.\s+", lines[i])):
                para.append(lines[i])
                i += 1
            out.append("<p>" + inline(" ".join(para)) + "</p>")
    return "\n".join(out)


def is_table_start(lines, idx):
    if idx + 1 >= len(lines):
        return False
    if not re.match(r"^\s*\|", lines[idx]):
        return False
    sep = lines[idx + 1]
    return bool(re.match(r"^\s*\|[\s:|\-]+\|\s*$", sep) and "-" in sep)


def split_row(row):
    cells = row.strip()
    if cells.startswith("|"):
        cells = cells[1:]
    if cells.endswith("|"):
        cells = cells[:-1]
    return [c.strip() for c in cells.split("|")]


def plain_text(md):
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md)
    t = re.sub(r"[*#>]", "", t)
    return " ".join(t.split())


def description_for(body):
    for para in body.split("\n\n"):
        p = plain_text(para).strip()
        if p:
            if len(p) > 160:
                p = p[:157].rsplit(" ", 1)[0] + "…"
            return p
    return "Hope Anchored in Christ — a Bible study site anchored on Hebrews 6:19."


HEADER = """<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="../../#/">&#9875; Hope Anchored in Christ</a>
    <nav class="main-nav" aria-label="Main">
      <a href="../../#/">Home</a>
      <a href="../../#/explore">Explore</a>
      <a href="../../#/blog">Blog</a>
      <a href="../../#/about">About</a>
      <a href="../../#/store">Store</a>
      <a href="../../#/connect">Connect</a>
      <a href="../../#/give">Give</a>
    </nav>
  </div>
</header>

<section class="banner">
  <img src="../../assets/banner.jpg?v={banner_v}" alt="Hope Anchored in Christ — wildflower meadow with a butterfly and a bee">
</section>
"""

FOOTER = """
<footer class="site-footer">
  <p class="footer-note">Hope Anchored in Christ — anchored on Hebrews 6:19.</p>
</footer>
"""


def post_page(slug, fm, body_html, desc):
    title = fm.get("title", slug)
    url = "%s/blog/%s/" % (SITE_URL, slug)
    meta_bits = [fm.get("date", "")]
    if fm.get("category"):
        meta_bits.append(fm["category"])
    if fm.get("scripture"):
        meta_bits.append(fm["scripture"])
    meta = " &middot; ".join(esc(b) for b in meta_bits if b)
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | Hope Anchored in Christ</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Hope Anchored in Christ">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}/assets/banner.jpg?v={banner_v}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{site}/assets/banner.jpg?v={banner_v}">
<link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
{header}
<main class="content">
<a class="back-link" href="../../#/blog">&larr; All posts</a>
<article class="post-body">
<h1>{title}</h1>
<p class="post-meta">{meta}</p>
{body}
<p><a class="btn" href="../../#/blog/{slug}">Read on the full site &rarr;</a></p>
</article>
</main>
{footer}
</body>
</html>
""".format(title=esc(title), desc=esc(desc), url=url, site=SITE_URL,
           banner_v=BANNER_V, header=HEADER.format(banner_v=BANNER_V),
           meta=meta, body=body_html, slug=slug, footer=FOOTER)


REL_FIELDS = ["RelatedBooks", "RelatedPeople", "RelatedEvents", "RelatedTopics",
    "RelatedDoctrines", "RelatedQuestions", "RelatedFinds", "RelatedBook",
    "KeyPersons", "KeyPeople", "BibleBooks", "Places", "Events",
    "KeyScriptures", "KeyPassages", "KeyVerses", "ScriptureReference",
    "ScriptureIlluminated", "BibleReferences", "Tags", "Themes", "Place", "Prophet", "Course"]
FIELD_HOME = {"RelatedBooks": "books", "RelatedBook": "books", "BibleBooks": "books",
    "RelatedPeople": "people", "KeyPeople": "people", "KeyPersons": "people", "Prophet": "people",
    "RelatedEvents": "stories", "Events": "stories", "RelatedTopics": "topics", "Themes": "themes",
    "RelatedDoctrines": "doctrines", "RelatedQuestions": "questions", "RelatedFinds": "finds",
    "Places": "places", "Place": "places", "Course": "courses"}
SKIP_FIELDS = ["Slug", "Maps", "Image", "ImageCredit", "ImageSource", "PanelImage", "PanelImageCredit"]
SNIPPET_FIELDS = ["Summary", "Description", "Story", "Definition", "ShortAnswer",
    "ProphecySummary", "Explanation", "BiblicalUsage", "Beliefs"]
# Collections with no generic detail page: quizzes is an interactive player,
# comicstories is a panel reader. Everything else gets a static page.
SKIP_COLLECTIONS = {"quizzes", "comicstories"}


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")


def label(field):
    if field == "Places":
        return "Related Places"
    if field == "Place":
        return "Related Place"
    study_labels = {
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
        "StudyTakeaways": "Key Takeaways & Book Summary",
    }
    if field in study_labels:
        return study_labels[field]
    s = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1 \2", field)
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", s)
    return s[:1].upper() + s[1:] if s else s


def load_collections():
    src = open(os.path.join(ROOT, "assets", "app.js"), encoding="utf-8").read()
    colls = []
    for m in re.finditer(
            r'\{\s*id:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*file:\s*"([^"]+)",\s*primary:\s*"([^"]+)"',
            src):
        colls.append({"id": m.group(1), "label": m.group(2),
                      "file": m.group(3), "primary": m.group(4)})
    return colls


def build_entry_index(colls):
    """Mirror of the app's link index, but resolving to static page URLs.

    Returns (entries, glob, home): entries in COLLECTIONS order, a global
    exact/alias index, and per-collection indexes (exact + lowercase keys).
    """
    entries = []
    by_coll = {}
    for c in colls:
        if c["id"] in SKIP_COLLECTIONS:
            continue
        rows = json.load(open(os.path.join(ROOT, c["file"]), encoding="utf-8"))
        used = set()
        coll_entries = []
        for idx, row in enumerate(rows):
            primary = (row.get(c["primary"]) or "")
            if isinstance(primary, list):
                primary = "; ".join(str(x) for x in primary)
            primary = primary.strip()
            if not primary:
                continue
            base = (row.get("Slug") or "").strip() or slugify(primary)
            slug, n = base, 2
            while slug in used:
                slug = "%s-%d" % (base, n)
                n += 1
            used.add(slug)
            e = {"coll": c["id"], "label": c["label"], "idx": idx, "row": row,
                 "slug": slug, "primary": primary, "display": primary}
            coll_entries.append(e)
            entries.append(e)
        by_coll[c["id"]] = coll_entries
    glob = {}

    def put_global(key, e):
        if key and key not in glob:
            glob[key] = e

    for e in entries:
        put_global(e["primary"], e)
        row = e["row"]
        if e["coll"] == "wordstudies":
            put_global((row.get("Word") or "").strip(), e)
        if e["coll"] == "questions":
            put_global((row.get("Slug") or "").strip(), e)
    proposed = {}
    for e in entries:
        p = e["primary"]
        cands = set()
        if "," in p:
            cands.add(p.split(",")[0].strip())
        if " of " in p:
            cands.add(p.split(" of ")[0].strip())
        words = p.replace(",", "").split()
        if len(words) > 1:
            cands.add(words[0])
            cands.add(words[-1])
        cands.add(p.lower())
        for a in cands:
            if a and a != p and len(a) > 1:
                proposed.setdefault(a, set()).add(p)
    prim_to_entry = {}
    for e in entries:
        prim_to_entry.setdefault(e["primary"], e)
    for a, owners in proposed.items():
        if len(owners) == 1 and a not in glob:
            glob[a] = prim_to_entry[next(iter(owners))]
    home = {}
    for coll_id, coll_entries in by_coll.items():
        d = {}
        for e in coll_entries:
            keys = [e["primary"]]
            if coll_id == "wordstudies":
                keys.append((e["row"].get("Word") or "").strip())
            if coll_id == "questions":
                keys.append((e["row"].get("Slug") or "").strip())
            for key in keys:
                if not key:
                    continue
                if key not in d:
                    d[key] = e
                if key.lower() not in d:
                    d[key.lower()] = e
        home[coll_id] = d
    return entries, glob, home


def static_linkify(field, value, cur_coll, glob, home):
    if field not in REL_FIELDS:
        return esc(value)
    out = []
    for tok in [t.strip() for t in value.split(";")]:
        if not tok:
            continue
        hit = None
        h = FIELD_HOME.get(field)
        if h and h in home:
            hit = home[h].get(tok) or home[h].get(tok.lower())
        if not hit:
            hit = glob.get(tok) or glob.get(tok.lower())
        if hit:
            if hit["coll"] == cur_coll:
                href = "../%s/" % hit["slug"]
            else:
                href = "../../%s/%s/" % (hit["coll"], hit["slug"])
            out.append('<a href="%s">%s</a>' % (href, esc(hit["display"] or tok)))
        else:
            out.append(esc(tok))
    return "; ".join(out)


def load_bible_books():
    """Parse the app's BIBLE_BOOKS list (slug, name, chapter count) from app.js,
    so static scripture links use the same book list as the live reader."""
    src = open(os.path.join(ROOT, "assets", "app.js"), encoding="utf-8").read()
    books = []
    for m in re.finditer(
            r'\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*chapters:\s*(\d+)',
            src):
        books.append({"slug": m.group(1), "name": m.group(2),
                      "chapters": int(m.group(3))})
    return books


BIBLE_BOOKS = []

SCRIPTURE_FIELDS = ["KeyVerses", "KeyPassages", "KeyScriptures", "ScriptureReference",
                    "ScriptureIlluminated", "BibleReferences"]
# Bible book study sections (Genesis page): full markdown sections,
# rendered as expandable <details> blocks below the overview (see
# entry_page). The titles come from STUDY_LABELS.
STUDY_FIELDS = ["StudyOverview", "StudyAuthorship", "StudyHistoricalBackground",
    "StudyCulturalContext", "StudyLiteraryStructure", "StudyChapterByChapter",
    "StudyMajorThemes", "StudyTheologyDoctrine", "StudyChristMessianic",
    "StudyProphecyFulfillment", "StudyPeopleGenealogies", "StudyGeographyMaps",
    "StudyArchaeology", "StudyLanguages", "StudyManuscriptsCanon", "StudyApologetics",
    "StudyCrossReferences", "StudyJewishBackground", "StudyEthicsApplication",
    "StudyResourcesActivities", "StudyQuizzesTrivia", "StudyImportantVerses",
    "StudyEventsChronology", "StudyCovenantsLaws", "StudyMiraclesParables",
    "StudySymbolism", "StudyInterpretations", "StudyMisconceptions",
    "StudyQuestionsAnswers", "StudyChurchHistory", "StudyTranslations",
    "StudyRelatedPosts", "StudySources", "StudyTakeaways"]

STUDY_LABELS = {
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
    "StudyTakeaways": "Key Takeaways & Book Summary",
}


def linkify_scripture_refs(value):
    """Mirror of the app's linkifyScriptureRefs, pointing at the live reader:
    SITE_URL + '/#/bible/<slug>/<chapter>?v=<verse>' (a fragment link on a
    static page would go nowhere, so the full reader address is used)."""
    by_name = {b["name"]: b for b in BIBLE_BOOKS}
    ordered = sorted(BIBLE_BOOKS, key=lambda b: -len(b["name"]))
    last_book = None
    out_parts = []
    for part in str(value).split(";"):
        p = part.strip()
        if not p:
            continue
        found = None
        low = p.lower()
        for b in ordered:
            if low.startswith(b["name"].lower()):
                after = p[len(b["name"]):len(b["name"]) + 1]
                if after and after.isalpha():
                    continue
                found = (b, p[len(b["name"]):].strip(), b["name"])
                break
        if found is None:
            if low.startswith("psalm "):
                found = (by_name["Psalms"], p[6:].strip(), "Psalm")
            elif low.startswith("song of songs "):
                found = (by_name["Song of Solomon"], p[14:].strip(), "Song of Songs")
            elif low.startswith("song "):
                found = (by_name["Song of Solomon"], p[5:].strip(), "Song")
        book = found[0] if found else last_book
        rest = found[1] if found else p
        if found:
            last_book = book
        if book is None or not rest:
            out_parts.append(esc(p))
            continue
        links = []
        first = True
        last_chapter = None
        last_had_verse = False
        for item in rest.split(","):
            it = item.strip()
            label = (found[2] + " " + it) if (first and found) else it
            first = False
            m = re.match(r"^(\d+)(?::(\d+))?", it)
            if not m:
                links.append(esc(label))
                continue
            ch = int(m.group(1))
            verse = int(m.group(2)) if m.group(2) else None
            if not m.group(2) and last_chapter is not None and last_had_verse:
                # Verse continuation: "Numbers 13:22, 28, 33" = 13:22,
                # 13:28, 13:33, not chapters 28 and 33.
                verse = ch
                ch = last_chapter
            elif book["chapters"] == 1 and not m.group(2) and ch != 1:
                # Single-chapter book cited by verse alone ("Jude 22").
                verse = ch
                ch = 1
            if ch < 1 or ch > book["chapters"]:
                links.append(esc(label))
                continue
            if m.group(2):
                last_chapter = ch
                last_had_verse = True
            elif verse is not None and last_chapter is not None and last_had_verse:
                pass  # verse continuation: chapter unchanged
            else:
                last_chapter = ch
                last_had_verse = False
            href = "%s/#/bible/%s/%d" % (SITE_URL, book["slug"], ch)
            if verse:
                href += "?v=" + str(verse)
            links.append('<a href="%s">%s</a>' % (href, esc(label)))
        out_parts.append(", ".join(links))
    return "; ".join(out_parts)


def render_entry_field(field, value, cur_coll, glob, home):
    toks = [t.strip() for t in value.split(";") if t.strip()]
    if field == "Steps":
        return "<ol>" + "".join("<li>%s</li>" % esc(t) for t in toks) + "</ol>"
    if field in ("Questions", "Lessons"):
        return "<ul>" + "".join("<li>%s</li>" % esc(t) for t in toks) + "</ul>"
    if field in SCRIPTURE_FIELDS:
        return '<span class="related">' + linkify_scripture_refs(value) + "</span>"
    if field in REL_FIELDS:
        return '<span class="related">' + static_linkify(field, value, cur_coll, glob, home) + "</span>"
    if field == "DetailedAnswer":
        paras = [p for p in re.split(r"\n\s*\n", value) if p.strip()]
        return "".join("<p>%s</p>" % esc(p).replace("\n", "<br>") for p in paras)
    return esc(value)


def entry_page(e, glob, home, quizzes_by_course):
    row = e["row"]
    coll = e["coll"]
    title = e["primary"]
    url = "%s/%s/%s/" % (SITE_URL, coll, e["slug"])
    desc = ""
    for f in SNIPPET_FIELDS:
        v = row.get(f) or ""
        if isinstance(v, list):
            v = "; ".join(str(x) for x in v)
        v = v.strip()
        if v:
            desc = plain_text(v)
            if len(desc) > 160:
                desc = desc[:157].rsplit(" ", 1)[0] + "…"
            break
    if not desc:
        desc = "Hope Anchored in Christ — a Bible study site anchored on Hebrews 6:19."
    parts = []
    img = (row.get("Image") or "").strip()
    if img:
        fig = '<figure class="nature-figure"><img src="../../%s" alt="%s">' % (
            esc(img.lstrip("/")), esc(title))
        cap = (row.get("ImageCredit") or "").strip()
        if cap:
            fig += "<figcaption>" + esc(cap)
            if (row.get("ImageSource") or "").strip():
                fig += ' <a href="%s" target="_blank" rel="noopener">Source</a>' % esc(row["ImageSource"])
            fig += "</figcaption>"
        fig += "</figure>"
        parts.append(fig)
    dl = []
    for field, v in row.items():
        if field in SKIP_FIELDS:
            continue
        if field in STUDY_FIELDS or field == "StudyIntroduction":
            continue
        if isinstance(v, list):
            v = "; ".join(str(x) for x in v)
        v = "" if v is None else str(v)
        if not v.strip():
            continue
        dl.append("<dt>%s</dt><dd>%s</dd>" % (
            esc(label(field)), render_entry_field(field, v, coll, glob, home)))
    body = "\n".join(parts) + '<div class="detail"><dl>' + "\n".join(dl) + "</dl>"
    if any((row.get(f) or "").strip() for f in STUDY_FIELDS):
        body += '<div class="study">'
        intro = (row.get("StudyIntroduction") or "").strip()
        if intro:
            body += '<div class="study-intro">' + render_markdown(intro) + "</div>"
        for f in STUDY_FIELDS:
            v = (row.get(f) or "").strip()
            if not v:
                continue
            body += '<details class="study-section"><summary>%s</summary><div class="study-body">%s</div></details>' % (
                esc(STUDY_LABELS[f]), render_markdown(v))
        body += "</div>"
    if coll == "courses":
        qs = quizzes_by_course.get(title, [])
        if qs:
            body += "<h3>Quizzes for this course</h3><ul>" + "".join(
                '<li><a href="../../#/quizzes/play/%s">%s</a></li>' % (quote(q), esc(q))
                for q in qs) + "</ul>"
    body += "</div>"
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | Hope Anchored in Christ</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Hope Anchored in Christ">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}/assets/banner.jpg?v={banner_v}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{site}/assets/banner.jpg?v={banner_v}">
<link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
{header}
<main class="content">
<a class="back-link" href="../../#/{coll}">&larr; All {label}</a>
<h1>{title}</h1>
{body}
<p><a class="btn" href="../../#/{coll}/{idx}">View on the full site &rarr;</a></p>
</main>
{footer}
</body>
</html>
""".format(title=esc(title), desc=esc(desc), url=url, site=SITE_URL,
           banner_v=BANNER_V, header=HEADER.format(banner_v=BANNER_V),
           coll=coll, label=esc(e["label"]), body=body, idx=e["idx"], footer=FOOTER)


def generate_entries():
    global BIBLE_BOOKS
    BIBLE_BOOKS = load_bible_books()
    colls = load_collections()
    entries, glob, home = build_entry_index(colls)
    quizzes = []
    try:
        quizzes = json.load(open(os.path.join(ROOT, "content", "quizzes.json"),
                                 encoding="utf-8"))
    except FileNotFoundError:
        pass
    qbc = {}
    for q in quizzes:
        c = (q.get("Course") or "").strip()
        quiz = (q.get("Quiz") or "").strip()
        if c and quiz and quiz not in qbc.setdefault(c, []):
            qbc[c].append(quiz)
    urls = []
    for e in entries:
        out_dir = os.path.join(ROOT, e["coll"], e["slug"])
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as fh:
            fh.write(entry_page(e, glob, home, qbc))
        urls.append("%s/%s/%s/" % (SITE_URL, e["coll"], e["slug"]))
    print("entries: %d static pages across %d collections" % (
        len(entries), len({e["coll"] for e in entries})))
    return urls


def main():
    posts_dir = os.path.join(ROOT, "content", "posts")
    posts = []
    for fname in sorted(os.listdir(posts_dir)):
        if not fname.endswith(".md"):
            continue
        slug, fm, body = parse_post(os.path.join(posts_dir, fname))
        desc = description_for(body)
        out_dir = os.path.join(ROOT, "blog", slug)
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as fh:
            fh.write(post_page(slug, fm, render_markdown(body), desc))
        posts.append((slug, fm, desc))
        print("post: blog/%s/ (%s)" % (slug, fm.get("title", slug)))
    # Listing page for crawlers (and anyone landing on /blog/ directly).
    items = "".join(
        '<p><a href="./%s/">%s</a><br><span class="meta">%s</span></p>\n' % (
            slug, esc(fm.get("title", slug)),
            esc(" · ".join(b for b in [fm.get("date", ""), fm.get("category", "")] if b)))
        for slug, fm, _ in posts)
    listing = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Blog | Hope Anchored in Christ</title>
<meta name="description" content="Reflections and studies from the anchored story.">
<link rel="canonical" href="{site}/blog/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Hope Anchored in Christ">
<meta property="og:title" content="Blog | Hope Anchored in Christ">
<meta property="og:description" content="Reflections and studies from the anchored story.">
<meta property="og:url" content="{site}/blog/">
<meta property="og:image" content="{site}/assets/banner.jpg?v={banner_v}">
<link rel="stylesheet" href="../assets/style.css">
</head>
<body>
{header}
<main class="content">
<h1>Blog</h1>
<p class="page-intro">Reflections and studies from the anchored story.</p>
{items}
<p><a class="btn" href="../#/">Visit the full site &rarr;</a></p>
</main>
{footer}
</body>
</html>
""".format(site=SITE_URL, banner_v=BANNER_V,
           header=HEADER.format(banner_v=BANNER_V).replace("../../", "../"),
           items=items, footer=FOOTER)
    blog_dir = os.path.join(ROOT, "blog")
    os.makedirs(blog_dir, exist_ok=True)
    with open(os.path.join(blog_dir, "index.html"), "w", encoding="utf-8") as fh:
        fh.write(listing)
    print("listing: blog/")
    entry_urls = generate_entries()
    # Sitemap: only addresses that exist as real files (the app shell root,
    # the blog listing, and the static post pages). Hash routes are not
    # separate pages and must not appear here.
    urls = [(SITE_URL + "/", None), (SITE_URL + "/blog/", None)]
    urls += [("%s/blog/%s/" % (SITE_URL, slug), fm.get("date"))
             for slug, fm, _ in posts]
    urls += [(u, None) for u in entry_urls]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, lastmod in urls:
        sm.append("  <url><loc>%s</loc>%s</url>" % (
            url, "<lastmod>%s</lastmod>" % lastmod if lastmod else ""))
    sm.append("</urlset>")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(sm) + "\n")
    with open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8") as fh:
        fh.write("User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % SITE_URL)
    print("sitemap: %d urls, robots.txt written" % len(urls))


if __name__ == "__main__":
    main()

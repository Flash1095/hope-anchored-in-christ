#!/usr/bin/env python3
"""Build the Hope Anchored in Christ site content.

Two modes:

  python3 scripts/build_content.py
      Initial build: reads the 17 CSV sources under workspace/your_files
      and writes:
        - content/<name>.json          (one array per collection, the app reads these)
        - content/<name>/<slug>.json   (one file per entry, what Decap CMS edits)
        - content/posts.json           (blog index, from content/posts/*.md)

  python3 scripts/build_content.py --from-entries
      Regeneration mode (used by the GitHub Action after /admin edits):
      rebuilds the aggregate content/<name>.json files and content/posts.json
      from the per-entry files in content/<name>/ and the markdown posts.
      Existing aggregate order is preserved; new entries append; deleted
      entries drop out.

Semicolon-separated CSV values stay as plain strings in the aggregates.
If a Decap edit turns such a field into a list, it is joined back to a
string here, so the app always sees one shape (it also accepts lists).
"""
import csv
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
YOUR_FILES = os.path.expanduser("~/workspace/your_files")

# (collection id, csv path relative to your_files, primary field)
SOURCES = [
    ("timeline", "hope-anchored-cms-import/Biblical Timeline CMS Import.csv", "Title"),
    ("books", "66-books-cms-import/66 Books CMS Import.csv", "Book"),
    ("questions", "biblical-qa-database/Biblical QA Database v2.csv", "Question"),
    ("people", "biblical-people-cms/Biblical People CMS - 127 Profiles (Merged).csv", "Name"),
    ("finds", "archaeological-finds-cms/Archaeological Finds CMS.csv", "FindName"),
    ("events", "biblical-events-cms/Biblical Events CMS.csv", "EventName"),
    ("places", "biblical-places-cms/Biblical Places CMS.csv", "Name"),
    ("topics", "topics-categories-cms/Topics and Categories CMS.csv", "Topic"),
    ("themes", "biblical-themes-cms/Biblical Themes CMS.csv", "Theme"),
    ("doctrines", "christian-doctrines-cms/Christian Doctrines CMS.csv", "Doctrine"),
    ("heresies", "heresies-cms/Heresies CMS.csv", "Heresy"),
    ("wordstudies", "word-studies-cms/Word Studies CMS.csv", "Transliteration"),
    ("prophecies", "bible-prophecies-cms/Bible Prophecies CMS.csv", "Prophecy"),
    ("typology", "typology-cms/Typology CMS.csv", "Type"),
    ("fallacies", "logical-fallacies-cms/Logical Fallacies CMS.csv", "Fallacy"),
    ("courses", "courses-cms/Courses CMS.csv", "Course"),
    ("quizzes", "quizzes-cms/Quizzes CMS.csv", "Slug"),
    ("hymns", "hymns-cms/Hymns CMS.csv", "Hymn"),
]


def slugify(text):
    text = (text or "").strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "entry"


def normalize_row(row):
    """Strings stay strings; lists (from Decap edits) join back to '; ' strings."""
    out = {}
    for key, value in row.items():
        if value is None:
            out[key] = ""
        elif isinstance(value, list):
            out[key] = "; ".join(str(v) for v in value)
        else:
            out[key] = str(value).strip()
    return out


def unique_slug(base, used):
    slug = base
    n = 2
    while slug in used:
        slug = f"{base}-{n}"
        n += 1
    used.add(slug)
    return slug


def build_from_csv():
    total = 0
    for coll_id, csv_rel, primary in SOURCES:
        path = os.path.join(YOUR_FILES, csv_rel)
        with open(path, encoding="utf-8-sig", newline="") as fh:
            rows = [normalize_row(r) for r in csv.DictReader(fh)]
        content_dir = os.path.join(ROOT, "content")
        entry_dir = os.path.join(content_dir, coll_id)
        os.makedirs(entry_dir, exist_ok=True)
        used = set()
        for row in rows:
            # Quizzes already carry a slug; otherwise slugify the primary field.
            base = row.get("Slug") if coll_id == "quizzes" else row.get(primary, "")
            slug = unique_slug(slugify(base), used)
            with open(os.path.join(entry_dir, slug + ".json"), "w", encoding="utf-8") as fh:
                json.dump(row, fh, ensure_ascii=False, indent=2)
                fh.write("\n")
        with open(os.path.join(content_dir, coll_id + ".json"), "w", encoding="utf-8") as fh:
            json.dump(rows, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        print(f"{coll_id}: {len(rows)} rows")
        total += len(rows)
    print(f"TOTAL collection entries: {total}")
    return total


def build_from_entries():
    total = 0
    for coll_id, _csv_rel, primary in SOURCES:
        content_dir = os.path.join(ROOT, "content")
        entry_dir = os.path.join(content_dir, coll_id)
        agg_path = os.path.join(content_dir, coll_id + ".json")
        old = []
        if os.path.exists(agg_path):
            with open(agg_path, encoding="utf-8") as fh:
                old = json.load(fh)
        old_by_key = {normalize_row(r).get(primary, ""): normalize_row(r) for r in old}
        new_rows = []
        seen_keys = set()
        for fname in sorted(os.listdir(entry_dir)):
            if not fname.endswith(".json"):
                continue
            with open(os.path.join(entry_dir, fname), encoding="utf-8") as fh:
                row = normalize_row(json.load(fh))
            new_rows.append(row)
            seen_keys.add(row.get(primary, ""))
        # Preserve the old order for surviving entries, append genuinely new ones.
        ordered = []
        for row in old:
            key = normalize_row(row).get(primary, "")
            match = next((r for r in new_rows if r.get(primary, "") == key), None)
            if match is not None:
                ordered.append(match)
        for row in new_rows:
            if row.get(primary, "") not in {normalize_row(r).get(primary, "") for r in old}:
                ordered.append(row)
        with open(agg_path, "w", encoding="utf-8") as fh:
            json.dump(ordered, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        print(f"{coll_id}: {len(ordered)} rows")
        total += len(ordered)
    print(f"TOTAL collection entries: {total}")
    return total


def parse_frontmatter(path):
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    meta = {}
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            for line in text[4:end].strip().splitlines():
                if ":" in line:
                    key, val = line.split(":", 1)
                    meta[key.strip()] = val.strip().strip('"').strip("'")
    return meta


def build_posts_manifest():
    posts_dir = os.path.join(ROOT, "content", "posts")
    posts = []
    for fname in sorted(os.listdir(posts_dir)):
        if not fname.endswith(".md"):
            continue
        meta = parse_frontmatter(os.path.join(posts_dir, fname))
        posts.append({
            "slug": fname[:-3],
            "title": meta.get("title", fname[:-3]),
            "date": meta.get("date", ""),
            "category": meta.get("category", ""),
            "scripture": meta.get("scripture", ""),
            "file": f"content/posts/{fname}",
        })
    posts.sort(key=lambda p: p["date"], reverse=True)
    with open(os.path.join(ROOT, "content", "posts.json"), "w", encoding="utf-8") as fh:
        json.dump(posts, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print(f"posts: {len(posts)}")
    return len(posts)


def main():
    if "--from-entries" in sys.argv:
        build_from_entries()
    else:
        build_from_csv()
    build_posts_manifest()


if __name__ == "__main__":
    main()

# Hope Anchored in Christ — website source

This is the complete source for the **Hope Anchored in Christ** Bible study
website, built as a plain static site (no Wix, no database server). It is
published with **GitHub Pages** and edited through **Decap CMS** at `/admin`.

## Publish it (once)

1. Create a GitHub repository named **`hope-anchored-in-christ`** under the
   account **Flash1095**, and push this folder to its `main` branch.
   (Nothing in this folder has been pushed anywhere yet — that step is yours.)
2. In the repository, go to **Settings → Pages → Build and deployment**,
   choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
3. The live site appears at
   **https://flash1095.github.io/hope-anchored-in-christ/** (allow a minute
   or two for the first build).

## Edit it yourself (no code)

1. Open the live site and go to **`/admin`** (for example,
   `https://flash1095.github.io/hope-anchored-in-christ/admin`).
2. Log in with GitHub. **First-time setup note:** Decap's GitHub login needs
   a GitHub OAuth app registered for this site (Decap docs: "GitHub backend"
   authentication). If login asks for an OAuth app you don't have yet, follow
   the Decap guide to create one (free) and add its details to
   `admin/config.yml`; alternatively, a Netlify Identity + git-gateway setup
   works with the same config file. This is a one-time setup step.
3. Pick a collection — Blog Posts, Timeline, Books, Questions, People,
   Discoveries, Events, Places, Topics, Themes, Doctrines, Heresies,
   Word Studies, Prophecies, Typology, Fallacies, Courses, Quizzes — then
   **add, edit, or delete** entries in a simple form and press **Publish**.
4. Publishing saves your change to the repository. A GitHub Action
   (`.github/workflows/update-content.yml`) then rebuilds the site's data
   files and the live site updates within a minute or two. You don't touch
   any code.

## How the content is stored

- `content/posts/*.md` — blog posts (title, date, category, scripture, body).
- `content/<collection>/*.json` — one file per entry. **This is what the
  admin edits.**
- `content/<collection>.json` — one combined file per collection. **This is
  what the website reads.** It is generated, not edited by hand: run
  `python3 scripts/build_content.py --from-entries` (or let the GitHub
  Action do it) after any change to the per-entry files.
- `content/posts.json` — the blog index, generated the same way from the
  post markdown files.
- `index.html` + `assets/app.js` + `assets/style.css` — the site itself.
  The app fetches the `content/*.json` files at runtime, so new and edited
  entries appear as soon as the generated files are rebuilt.

## Preview it on your own computer

The site must be served over http(s), **not** opened as `file://`, because
it fetches its JSON data files. From this folder, run:

```sh
python3 -m http.server 8000
```

then open <http://localhost:8000> in a browser.

## What's in the site

17 collections, 812 entries: Timeline (36), Books (66), Questions (80),
People (127), Discoveries (38), Events (68), Places (47), Topics (40),
Themes (34), Doctrines (30), Heresies (25), Word Studies (50),
Prophecies (42), Typology (31), Fallacies (30), Courses (14),
Quizzes (54 questions in 15 quizzes) — plus the first blog post,
*"Why 'Hope Anchored in Christ'? The Verse That Started This Blog"*
(Hebrews 6:19).

Branding: navy `#1B2A4E`, gold `#C5A880`, ivory, sage and blush accents,
floral feel, Playfair Display-style serif headings.

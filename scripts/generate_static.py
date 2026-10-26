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
import os
import re

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
        elif line.strip() == "":
            i += 1
        else:
            para = []
            while (i < len(lines) and lines[i].strip() != ""
                   and not re.match(r"^#{1,3}\s", lines[i])
                   and not re.match(r"^\s*[-*]\s+", lines[i])
                   and not re.match(r"^\s*>\s?", lines[i])
                   and not re.match(r"^\s*---\s*$", lines[i])):
                para.append(lines[i])
                i += 1
            out.append("<p>" + inline(" ".join(para)) + "</p>")
    return "\n".join(out)


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
    # Sitemap: only addresses that exist as real files (the app shell root,
    # the blog listing, and the static post pages). Hash routes are not
    # separate pages and must not appear here.
    urls = [(SITE_URL + "/", None), (SITE_URL + "/blog/", None)]
    urls += [("%s/blog/%s/" % (SITE_URL, slug), fm.get("date"))
             for slug, fm, _ in posts]
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

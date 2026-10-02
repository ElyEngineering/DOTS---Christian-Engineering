#!/usr/bin/env python3
"""Buildless integrity checks, using only the Python standard library."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.links=[]; self.assets=[]; self.images=[]; self.verses=[]
        self.tags=[]; self.text=[]; self.scripture=[]; self.h1=[]; self.stack=[]
        self.in_reading=0; self.in_h1=0; self.reading_depth=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); self.tags.append((tag,a)); self.stack.append(tag)
        if 'id' in a: self.ids.append(a['id'])
        if tag=='a': self.links.append(a.get('href',''))
        if tag in ('img','script') and 'src' in a: self.assets.append(a['src'])
        if tag=='link' and a.get('rel') in ('stylesheet','icon'): self.assets.append(a['href'])
        if tag=='img': self.images.append(a)
        if a.get('class')=='scripture-reading': self.in_reading=1
        if tag=='h1': self.in_h1=1
    def handle_endtag(self, tag):
        if tag=='article' and self.in_reading: self.in_reading=0
        if tag=='h1': self.in_h1=0
    def handle_data(self, d):
        self.text.append(d)
        if self.in_reading:self.scripture.append(d)
        if self.in_h1:self.h1.append(d)

html=(ROOT/'index.html').read_text(); css=(ROOT/'styles.css').read_text(); js=(ROOT/'script.js').read_text()
p=Page();p.feed(html)
assert len(p.ids)==len(set(p.ids)), 'Duplicate IDs'
assert len([t for t,a in p.tags if t=='h1'])==1, 'Expected one H1'
assert ' '.join(' '.join(p.h1).split())=='Men who build and love like Christ.', 'Exact tagline changed'
for href in p.links:
    assert href, 'Empty link'
    if href.startswith('#'): assert href[1:] in p.ids, f'Broken anchor {href}'
    elif not urlsplit(href).scheme: assert (ROOT/href).is_file(), f'Missing link resource {href}'
for src in p.assets:
    if not urlsplit(src).scheme: assert (ROOT/src).is_file(), f'Missing asset {src}'
for src in re.findall(r"url\(['\"]?([^)'\"]+)", css):
    assert (ROOT/src).is_file(), f'Missing CSS asset {src}'
for im in p.images:
    assert im.get('alt'), 'Image needs descriptive alt'
    assert im.get('width') and im.get('height'), 'Image dimensions missing'
verses=re.findall(r'<sup>(\d+)</sup>',html)
assert verses==list(map(str,range(21,34))), f'Verse sequence incorrect: {verses}'
assert not re.search(r'<(?:details|summary|iframe|form)\b',html), 'Unexpected hidden reading/form/embed'
assert '51 acres' in html and '38 acres' not in html, 'Incorrect property size'
assert 'hello@elychristianengineers.org' not in html, 'Placeholder email found'
assert 'tel:+12189969792' in p.links and 'sms:+12189969792' in p.links, 'Phone targets incorrect'
assert 'mailto:elyengineeringAI@gmail.com' in p.links, 'Email target incorrect'
assert 'https://bear.org/' in p.links and 'https://wolf.org/' in p.links, 'Attraction targets incorrect'
assert html.count('M18.5 3h7v11h11v7h-11v20h-7V21h-11v-7h11Z')==2, 'Simple Latin cross missing from header/footer'
assert 'M28 9h8v14h15v8H36v25h-8V31H13v-8h15Z' in (ROOT/'favicon.svg').read_text(), 'Cross favicon missing'
assert 'prefers-reduced-motion' in css and 'showModal' in js, 'Accessibility enhancement missing'
assert 'localStorage' not in js and 'fetch(' not in js, 'Unexpected storage/network integration'
assert not any(urlsplit(x).scheme for x in p.assets), 'Unexpected external runtime asset'
assert hashlib.sha256((ROOT/'README.md').read_bytes()).hexdigest()=='7a2f0e25ada116f98271be0bf6abb3062f2898c84e2b6e3cc2df03eb0c2450e4', 'Protected README changed'
words=lambda s:len(re.findall(r"\b[\w’'-]+\b",s))
scripture_words=words(' '.join(p.scripture))
all_words=words(' '.join(p.text))
# Include repeated 5:25 and short quotation in the commitments as a conservative margin.
quote_words=scripture_words+25
assert quote_words/all_words<.25, 'ESV quotation exceeds 25% of page text'
print(f'PASS: anchors, local assets, metadata, 13 visible verses, mission constraints, contacts, README')
print(f'PASS: conservative Scripture quotation fraction {quote_words}/{all_words} = {quote_words/all_words:.1%}')
print(f'INFO: {len(p.images)} images, {len(p.links)} links; total files {sum(x.is_file() for x in ROOT.rglob("*"))}')

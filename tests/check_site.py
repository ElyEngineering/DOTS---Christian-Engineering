"""Dependency-free smoke checks for the static site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
class Site(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.assets, self.images = [], [], [], []
        self.headings = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'h1': self.headings += 1
        if tag == 'a': self.links.append(a.get('href', ''))
        if tag in ('img', 'script'): self.assets.append(a.get('src', ''))
        if tag == 'link' and a.get('rel') == 'stylesheet': self.assets.append(a['href'])
        if tag == 'img': self.images.append(a)

page = Site()
page.feed((ROOT / 'index.html').read_text())
assert len(page.ids) == len(set(page.ids)), 'Duplicate element IDs'
assert page.headings == 1, 'Expected one primary heading'
for link in page.links:
    assert link, 'Empty link'
    if link.startswith('#'): assert link[1:] in page.ids, f'Broken anchor: {link}'
for asset in page.assets:
    if not urlparse(asset).scheme: assert (ROOT / unquote(asset)).is_file(), f'Missing asset: {asset}'
for image in page.images:
    assert 'alt' in image and int(image['width']) > 0 and int(image['height']) > 0
assert 'aria-controls="primary-navigation"' in (ROOT / 'index.html').read_text()
assert 'opacity: 0;' not in (ROOT / 'styles.css').read_text(), 'Content must not depend on JavaScript to be visible'
print(f'PASS: {len(page.assets)} assets, {len(page.links)} links, {len(page.images)} images; anchors, image metadata, and progressive enhancement checks')

html = (ROOT / 'index.html').read_text()
assert 'Call/text: 218-996-9792' in html
assert 'tel:+12189969792' in page.links and 'sms:+12189969792' in page.links
assert 'hello@elychristianengineers.org' not in html
assert '218-996-9792' in (ROOT / 'README.md').read_text()
print('PASS: approved phone contact, call/text links, and documentation')

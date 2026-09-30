/* Optional DOM-level checks: npm install --prefix /tmp/christian-qa jsdom
   NODE_PATH=/tmp/christian-qa/node_modules node tests/interactions.cjs
   These verify behavior, not browser layout or native keyboard defaults. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
function setup({ mobile = false, reduced = false, hash = '', javascript = true } = {}) {
  const dom = new JSDOM(html, { url: `https://example.test/${hash}`, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const listeners = [];
  const media = { matches: mobile, addEventListener: (_, callback) => listeners.push(callback) };
  w.matchMedia = query => query.includes('max-width') ? media : { matches: reduced, addEventListener() {} };
  w.requestAnimationFrame = callback => { callback(); return 1; };
  if (javascript) w.eval(script);
  return { dom, w, d: w.document, resize(value) { media.matches = value; listeners.forEach(callback => callback({ matches: value })); } };
}
function key(w, el, key, shiftKey = false) { el.dispatchEvent(new w.KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true })); }
for (const mobile of [false, true]) {
  const { dom, w, d, resize } = setup({ mobile });
  const menu = d.querySelector('.menu-toggle'), nav = d.querySelector('#primary-navigation');
  assert.equal(menu.hidden, false);
  menu.click(); assert.equal(menu.getAttribute('aria-expanded'), 'true');
  key(w, menu, 'Escape'); assert.equal(menu.getAttribute('aria-expanded'), 'false'); assert.equal(d.activeElement, menu);
  menu.click(); menu.click(); menu.click(); assert.equal(menu.getAttribute('aria-expanded'), 'true');
  if (mobile) {
    menu.focus(); key(w, menu, 'Tab', true); assert.equal(d.activeElement, nav.querySelector('a:last-child'));
    key(w, d.activeElement, 'Tab'); assert.equal(d.activeElement, menu);
  }
  d.querySelector('#about').click(); assert.equal(menu.getAttribute('aria-expanded'), 'false');
  menu.click(); resize(!mobile); assert.equal(menu.getAttribute('aria-expanded'), 'false'); resize(mobile);
  const tabs = [...d.querySelectorAll('.reader-tab')];
  const visible = () => [...d.querySelectorAll('.reader-panel')].filter(panel => !panel.hidden);
  assert.equal(visible().length, 1); assert.equal(visible()[0].id, 'panel-sacrifice');
  tabs[2].focus(); key(w, tabs[2], mobile ? 'ArrowRight' : 'ArrowDown'); assert.equal(d.activeElement, tabs[3]);
  assert.equal(tabs[2].getAttribute('aria-selected'), 'true', 'Arrow keys must not select manual tabs');
  key(w, tabs[3], 'End'); assert.equal(d.activeElement, tabs[4]);
  key(w, tabs[4], mobile ? 'ArrowRight' : 'ArrowDown'); assert.equal(d.activeElement, tabs[0]);
  key(w, tabs[0], mobile ? 'ArrowLeft' : 'ArrowUp'); assert.equal(d.activeElement, tabs[4]);
  key(w, tabs[4], 'Home'); assert.equal(d.activeElement, tabs[0]);
  for (const tab of [...tabs, ...tabs].reverse()) {
    tab.click(); assert.equal(tab.getAttribute('aria-selected'), 'true'); assert.equal(visible().length, 1);
    assert.equal(visible()[0].id, tab.getAttribute('aria-controls'));
    assert.equal(tabs.filter(item => item.tabIndex === 0).length, 1);
  }
  resize(!mobile); assert.equal(d.querySelector('[role="tablist"]').getAttribute('aria-orientation'), mobile ? 'vertical' : 'horizontal');
  d.querySelector('#open-passage').click(); assert.equal(d.querySelector('#full-passage').open, true);
  assert.equal(d.activeElement.id, 'full-passage');
  dom.window.close();
}
for (const hash of ['#verse-25', '#full-passage']) { const x = setup({ hash }); assert.equal(x.d.querySelector('#full-passage').open, true); x.w.close(); }
const malformed = setup({ hash: '#%' });
assert.equal(malformed.d.querySelectorAll('.reader-panel[hidden]').length, 4, 'Malformed URL hashes must not stop enhancements');
malformed.w.close();
const print = setup();
const passage = print.d.querySelector('#full-passage');
assert.equal(passage.open, false);
print.w.dispatchEvent(new print.w.Event('beforeprint')); assert.equal(passage.open, true);
print.w.dispatchEvent(new print.w.Event('afterprint')); assert.equal(passage.open, false);
passage.open = true;
print.w.dispatchEvent(new print.w.Event('beforeprint')); print.w.dispatchEvent(new print.w.Event('afterprint'));
assert.equal(passage.open, true, 'Print must restore the already-open passage'); print.w.close();
const reduced = setup({ reduced: true }); reduced.d.querySelectorAll('.reader-tab')[0].click(); assert.equal(reduced.d.querySelectorAll('.is-arriving').length, 0); reduced.w.close();
const plain = setup({ javascript: false }); assert([...plain.d.querySelectorAll('.reader-panel')].every(p => !p.hidden)); assert.equal(plain.d.querySelector('.menu-toggle').hidden, true); plain.w.close();
// Compare all thirteen source verses verbatim, normalizing only whitespace.
const sourcePath = path.resolve(root, '../source/index.html');
if (fs.existsSync(sourcePath)) {
  const source = new JSDOM(fs.readFileSync(sourcePath, 'utf8'));
  const target = setup({ javascript: false });
  const normalize = text => text.replace(/\s+/g, ' ').trim();
  const original = [...source.window.document.querySelectorAll('.scripture-block p')].map(p => normalize(p.textContent));
  const remake = [...target.d.querySelectorAll('.passage-text p')].map(p => normalize(p.textContent));
  assert.equal(original.length, 13); assert.deepEqual(remake, original); source.window.close(); target.w.close();
}
console.log('PASS: desktop/mobile DOM behavior, menu/Escape/focus loop/repeated clicks/resize, five manual tabs and arrows/Home/End, full passage/deep links, reduced motion, no-JS content, and source Scripture fidelity. Browser rendering/native Enter+Space/history not covered.');
// The approved contact destination is consistent and no old email placeholder remains.
const contact = setup({ javascript: false });
assert.equal(contact.d.querySelector('a[href="tel:+12189969792"]') !== null, true);
assert.equal(contact.d.querySelector('a[href="sms:+12189969792"]') !== null, true);
assert(contact.d.querySelector('#connect').textContent.includes('218-996-9792'));
assert(!html.includes('hello@elychristianengineers.org'));
assert.equal(contact.d.querySelector('#next-reflection'), null, 'Removed reflection tool must not return');
assert.equal(contact.d.querySelectorAll('.practice-details').length, 0, 'Removed daily practices must not return');
contact.w.close();
console.log('PASS: approved call/text destination and removal of email placeholder, reflection tool and daily practices.');

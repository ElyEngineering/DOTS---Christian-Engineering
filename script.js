/* Progressive enhancements. Content and native disclosure controls work without JS. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-navigation');
  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const closeMenu = (restoreFocus = false) => {
    menuToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    if (restoreFocus) menuToggle.focus();
  };
  menuToggle.hidden = false;
  menuToggle.addEventListener('click', () => {
    const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(opening));
    navigation.classList.toggle('is-open', opening);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
    if (event.key !== 'Tab' || menuToggle.getAttribute('aria-expanded') !== 'true' || !mobileQuery.matches) return;
    const links = [...navigation.querySelectorAll('a')];
    if (event.shiftKey && document.activeElement === menuToggle) {
      event.preventDefault(); links.at(-1).focus();
    } else if (!event.shiftKey && document.activeElement === links.at(-1)) {
      event.preventDefault(); menuToggle.focus();
    }
  });
  mobileQuery.addEventListener('change', () => closeMenu());
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (menuToggle.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) closeMenu();
  });

  // Anchor navigation keeps native history and gives keyboard users a useful focus target.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      if (target === document.getElementById('full-passage')) target.open = true;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
  const revealHash = () => {
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch { /* Keep malformed hashes harmless. */ }
    const target = document.getElementById(id);
    if (target && (target.id === 'full-passage' || target.closest('#full-passage'))) {
      document.getElementById('full-passage').open = true;
    }
  };
  revealHash();
  window.addEventListener('hashchange', revealHash);
  const fullPassage = document.getElementById('full-passage');
  let passageWasOpen = false;
  window.addEventListener('beforeprint', () => { passageWasOpen = fullPassage.open; fullPassage.open = true; });
  window.addEventListener('afterprint', () => { fullPassage.open = passageWasOpen; });

  // Accessible manual-activation tabs: arrow keys move focus; Enter/Space select.
  const tabs = [...document.querySelectorAll('.reader-tab')];
  const panels = [...document.querySelectorAll('.reader-panel')];
  const tablist = document.querySelector('[role="tablist"]');
  function activateTab(tab, moveFocus = false) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      const active = panel.id === tab.getAttribute('aria-controls');
      panel.hidden = !active;
      panel.dataset.active = String(active);
      panel.classList.remove('is-arriving');
      if (active && !reducedMotion.matches) {
        void panel.offsetWidth;
        panel.classList.add('is-arriving');
      }
    });
    if (moveFocus) tab.focus();
    if (mobileQuery.matches) {
      const tabStart = tab.offsetLeft - tablist.offsetLeft;
      const tabEnd = tabStart + tab.offsetWidth;
      if (tabStart < tablist.scrollLeft || tabEnd > tablist.scrollLeft + tablist.clientWidth) {
        tablist.scrollLeft = Math.max(0, tabStart - 20);
      }
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      const horizontal = mobileQuery.matches;
      if (event.key === (horizontal ? 'ArrowRight' : 'ArrowDown')) next = (index + 1) % tabs.length;
      if (event.key === (horizontal ? 'ArrowLeft' : 'ArrowUp')) next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        tabs.forEach(item => { item.tabIndex = item === tabs[next] ? 0 : -1; });
        tabs[next].focus();
      }
    });
  });
  const updateTabOrientation = () => tablist.setAttribute('aria-orientation', mobileQuery.matches ? 'horizontal' : 'vertical');
  updateTabOrientation();
  mobileQuery.addEventListener('change', updateTabOrientation);
  activateTab(tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
  // Bring the selected tab into view within its own horizontal scroll region.
  if (mobileQuery.matches) {
    const selected = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
    tablist.scrollLeft = selected.offsetLeft - tablist.offsetLeft - 24;
  }

  // Once-only entrance motion enhances visible content without blocking reading.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const entranceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        entranceObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach(element => entranceObserver.observe(element));
  }

  // Reading progress and location highlight are passive enhancements, never scroll-jacking.
  const progress = document.querySelector('.reading-progress span');
  const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
  const sectionIds = ['about', 'scripture', 'stands-for', 'research', 'for', 'connect'];
  const sections = sectionIds.map(id => document.getElementById(id));
  let scrollPending = false;
  function updateScrollState() {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${available > 0 ? Math.min(100, (window.scrollY / available) * 100) : 0}%`;
    let current = '';
    sections.forEach(section => { if (section.getBoundingClientRect().top < window.innerHeight * .35) current = section.id; });
    navLinks.forEach(link => {
      if (link.hash === `#${current}` || (current === 'for' && link.hash === '#connect')) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollPending = false;
  }
  const onScroll = () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScrollState); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScrollState();
})();

/* Progressive enhancement: the complete site, Scripture and contact links work without JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const header = document.getElementById('site-header');
  const progress = document.querySelector('.reading-progress');
  const menu = document.getElementById('mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const closeButton = document.querySelector('.menu-close');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scrollQueued = false;

  function updateScroll() {
    const scrollTop = window.scrollY;
    header.classList.toggle('is-scrolled', scrollTop > 35);
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, scrollTop / total)) : 0})`;
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  if (menu && toggle && typeof menu.showModal === 'function') {
    toggle.addEventListener('click', () => {
      if (!menu.open) {
        menu.showModal();
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
    closeButton.addEventListener('click', () => menu.close());
    menu.addEventListener('close', () => toggle.setAttribute('aria-expanded', 'false'));
    menu.addEventListener('click', (event) => {
      if (event.target === menu) {
        const box = menu.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) menu.close();
      }
    });
    menu.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        menu.close();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.setAttribute('tabindex', '-1');
          requestAnimationFrame(() => target.focus({ preventScroll: true }));
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
      });
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
      if (event.matches && menu.open) menu.close();
    });
  } else {
    // Old browsers get a genuine on-page route rather than an inoperative menu.
    toggle?.remove();
    document.querySelector('.desktop-nav')?.classList.add('nav-fallback');
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-approaching');
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal, .work-visual').forEach((element) => {
      if (!reducedMotion.matches && element.getBoundingClientRect().top > window.innerHeight) element.classList.add('is-approaching');
      revealObserver.observe(element);
    });
    const links = [...document.querySelectorAll('.desktop-nav a')];
    const sectionObserver = new IntersectionObserver((entries) => {
      const entered = entries.filter((entry) => entry.isIntersecting);
      if (!entered.length) return;
      const id = entered[entered.length - 1].target.id;
      links.forEach((link) => {
        if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
  }
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) document.querySelectorAll('.is-approaching').forEach((element) => element.classList.remove('is-approaching'));
  });
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const whatsapp = '51935230155';

  // Year
  $('#year').textContent = new Date().getFullYear();

  // Scroll UI
  const header = $('.site-header');
  const progress = $('#scrollProgress');
  const backTop = $('#backTop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 30);
    backTop.classList.toggle('is-visible', y > 650);
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    progress.style.width = `${max ? (y / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Mobile nav
  const navToggle = $('#navToggle');
  const mainNav = $('#mainNav');
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  // Reveal animation
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // Hero slider with autoplay and touch swipe
  const slides = $$('.hero-slide');
  const dotsWrap = $('#heroDots');
  let heroIndex = 0;
  let heroTimer;
  let touchStartX = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `hero-dot${i === 0 ? ' is-active' : ''}`;
    dot.setAttribute('aria-label', `Ir a diapositiva ${i + 1}`);
    dot.addEventListener('click', () => goHero(i, true));
    dotsWrap.appendChild(dot);
  });

  const dots = $$('.hero-dot', dotsWrap);
  function goHero(index, restart = false) {
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === heroIndex));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === heroIndex));
    if (restart) startHero();
  }
  function startHero() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => goHero(heroIndex + 1), 6500);
  }
  $('#heroPrev').addEventListener('click', () => goHero(heroIndex - 1, true));
  $('#heroNext').addEventListener('click', () => goHero(heroIndex + 1, true));
  $('#heroSlider').addEventListener('mouseenter', () => clearInterval(heroTimer));
  $('#heroSlider').addEventListener('mouseleave', startHero);
  $('#heroSlider').addEventListener('touchstart', e => touchStartX = e.changedTouches[0].clientX, { passive: true });
  $('#heroSlider').addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 55) goHero(heroIndex + (diff < 0 ? 1 : -1), true);
  }, { passive: true });
  startHero();

  // Gallery horizontal controls
  const galleryTrack = $('#galleryTrack');
  $('#galleryPrev').addEventListener('click', () => galleryTrack.scrollBy({ left: -430, behavior: 'smooth' }));
  $('#galleryNext').addEventListener('click', () => galleryTrack.scrollBy({ left: 430, behavior: 'smooth' }));

  // Lightbox
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightboxImage');
  const lightboxCaption = $('#lightboxCaption');
  $$('.gallery-card').forEach(card => card.addEventListener('click', () => {
    lightboxImage.src = card.dataset.lightbox;
    lightboxImage.alt = card.dataset.caption || 'Imagen SARCONST';
    lightboxCaption.textContent = card.dataset.caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }));
  $$('[data-close-lightbox]').forEach(el => el.addEventListener('click', closeLightbox));
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  // FAQ accordion
  $$('.faq-question').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const open = item.classList.contains('is-open');
    $$('.faq-item').forEach(i => i.classList.remove('is-open'));
    if (!open) item.classList.add('is-open');
  }));

  // Direct contact form -> WhatsApp
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const msg = [
      'Hola SARCONST Ingenieros, vi su página web y quisiera realizar una consulta.',
      '',
      `Nombre: ${fd.get('name')}`,
      `Ubicación: ${fd.get('location')}`,
      `Servicio: ${fd.get('service')}`,
      `Caso: ${fd.get('message')}`
    ].join('\n');
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  // Quote modal
  const modal = $('#quoteModal');
  const quoteForm = $('#quoteForm');
  const quoteNext = $('#quoteNext');
  const quoteBack = $('#quoteBack');
  const quoteSubmit = $('#quoteSubmit');
  const quoteProgress = $('#quoteProgress');
  const stepLabels = $$('.quote-steps-label span');
  let quoteStep = 1;

  function openQuote(service = '') {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    quoteStep = 1;
    if (service) {
      const radio = $$('input[name="qService"]', quoteForm).find(r => r.value === service);
      if (radio) radio.checked = true;
    }
    renderQuoteStep();
    setTimeout(() => $('input[name="qService"]:checked', quoteForm)?.focus(), 200);
  }
  function closeQuote() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
  $$('[data-open-quote]').forEach(btn => btn.addEventListener('click', () => openQuote(btn.dataset.service || '')));
  $$('[data-close-quote]').forEach(el => el.addEventListener('click', closeQuote));

  function validateStep(step) {
    const current = $(`.quote-step[data-step="${step}"]`, quoteForm);
    const fields = $$('input,select,textarea', current).filter(el => el.required);
    for (const field of fields) {
      if (field.type === 'radio') {
        const group = $(`input[name="${field.name}"]:checked`, current);
        if (!group) {
          field.closest('.choice-grid')?.animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 220 });
          return false;
        }
      } else if (!field.value.trim()) {
        field.focus();
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  function renderQuoteStep() {
    $$('.quote-step', quoteForm).forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === quoteStep));
    quoteProgress.style.width = `${(quoteStep / 3) * 100}%`;
    stepLabels.forEach((l, i) => l.classList.toggle('is-active', i + 1 <= quoteStep));
    quoteBack.disabled = quoteStep === 1;
    quoteNext.classList.toggle('is-hidden', quoteStep === 3);
    quoteSubmit.classList.toggle('is-hidden', quoteStep !== 3);
    if (quoteStep === 3) buildSummary();
  }

  quoteNext.addEventListener('click', () => {
    if (!validateStep(quoteStep)) return;
    quoteStep = Math.min(3, quoteStep + 1);
    renderQuoteStep();
  });
  quoteBack.addEventListener('click', () => {
    quoteStep = Math.max(1, quoteStep - 1);
    renderQuoteStep();
  });

  function buildSummary() {
    const fd = new FormData(quoteForm);
    $('#quoteSummary').innerHTML = `
      <div><span>Servicio</span><strong>${escapeHtml(fd.get('qService') || '')}</strong></div>
      <div><span>Inmueble</span><strong>${escapeHtml(fd.get('qProperty') || '')}</strong></div>
      <div><span>Ubicación</span><strong>${escapeHtml(fd.get('qLocation') || '')}</strong></div>`;
  }

  quoteForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep(3)) return;
    const fd = new FormData(quoteForm);
    const msg = [
      'Hola SARCONST Ingenieros. Quisiera solicitar una evaluación.',
      '',
      `Servicio: ${fd.get('qService')}`,
      `Tipo de inmueble: ${fd.get('qProperty')}`,
      `Ubicación: ${fd.get('qLocation')}`,
      `Caso: ${fd.get('qCase')}`,
      fd.get('qExtra') ? `Información adicional: ${fd.get('qExtra')}` : '',
      '',
      `Nombre: ${fd.get('qName')}`,
      `Teléfono: ${fd.get('qPhone')}`
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  }

  // Escape key closes overlays
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('is-open')) closeQuote();
      if (lightbox.classList.contains('is-open')) closeLightbox();
    }
  });
})();

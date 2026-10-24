/* GS Digital — interakcje strony (bez bibliotek) */

/*
 * ADRESY PROFILI SOCIAL MEDIA — uzupełnij, gdy będą gotowe.
 * Wpisz pełny adres zaczynający się od https://, np. 'https://www.facebook.com/nazwa-profilu'.
 * Dopóki pole jest puste, ikona jest wyświetlana jako nieaktywna i nigdzie nie prowadzi.
 */
var SOCIAL_LINKS = {
  facebook: '',
  instagram: '',
  tiktok: ''
};

(function () {
  'use strict';

  var root = document.querySelector('.pg');
  var header = document.querySelector('.hdr');
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mmenu');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Nagłówek: tło pojawia się po przewinięciu --- */
  function updateHeader() {
    if (!header) return;
    var scrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 8;
    header.classList.toggle('on', scrolled || (menu && !menu.hidden));
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* --- Menu mobilne --- */
  function setMenu(open) {
    if (!menu || !burger) return;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    burger.querySelector('.ic-open').hidden = open;
    burger.querySelector('.ic-close').hidden = !open;
    updateHeader();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900 && !menu.hidden) setMenu(false); });
  }

  /* --- Ikony social media: aktywne tylko z uzupełnionym adresem --- */
  document.querySelectorAll('a.soc[data-social]').forEach(function (link) {
    var url = (SOCIAL_LINKS[link.getAttribute('data-social')] || '').trim();
    if (!/^https:\/\/\S+$/.test(url)) return;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.removeAttribute('aria-disabled');
    link.removeAttribute('title');
    link.setAttribute('aria-label', link.getAttribute('aria-label') + ' (otwiera się w nowej karcie)');
  });

  /* --- Łagodne pojawianie się elementów przy przewijaniu --- */
  if (root && !reduceMotion && 'IntersectionObserver' in window) {
    root.classList.add('rvon');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  }

  /* --- Realizacje: dotkniecie podgladu przewija go w dol / z powrotem (telefon) --- */
  document.querySelectorAll('.work').forEach(function (w) {
    w.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var on = !w.classList.contains('tap');
      w.classList.toggle('tap', on);
      if (!on) w.blur();
    });
  });

  /* --- FAQ: akordeon --- */
  document.querySelectorAll('.acc-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc-i');
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      item.classList.toggle('open', open);
      if (panel) panel.hidden = !open;
    });
  });

  /* --- Formularz kontaktowy --- */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var fields = {
    name: document.getElementById('f-name'),
    email: document.getElementById('f-email'),
    consent: document.getElementById('f-consent')
  };
  var labels = { name: 'imię', email: 'e-mail', consent: 'zgoda na przetwarzanie danych' };
  var summary = document.getElementById('form-summary');
  var info = document.getElementById('form-info');
  var submitBtn = document.getElementById('form-submit');
  var done = document.getElementById('form-done');

  // Kafelki usług: stan zaznaczenia
  function syncChip(input) { input.closest('.chip').classList.toggle('on', input.checked); }
  form.querySelectorAll('.chip input').forEach(function (input) {
    input.addEventListener('change', function () { syncChip(input); });
  });

  // Linki „Zapytaj o…” zaznaczają usługę w formularzu
  document.querySelectorAll('[data-ask]').forEach(function (link) {
    link.addEventListener('click', function () {
      var input = form.querySelector('.chip input[value="' + link.getAttribute('data-ask') + '"]');
      if (input) { input.checked = true; syncChip(input); }
    });
  });

  function setError(key, message) {
    var wrap = form.querySelector('[data-field="' + key + '"]');
    var err = document.getElementById('e-' + key);
    var input = fields[key];
    wrap.classList.toggle('bad', !!message);
    err.hidden = !message;
    err.querySelector('span').textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) input.setAttribute('aria-describedby', 'e-' + key);
    else input.removeAttribute('aria-describedby');
  }

  function validate() {
    var errors = {};
    if (!fields.name.value.trim()) errors.name = 'Podaj swoje imię.';
    var email = fields.email.value.trim();
    if (!email) errors.email = 'Podaj adres e-mail, abyśmy mogli odpisać.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Ten adres e-mail wygląda na niepełny — sprawdź go.';
    if (!fields.consent.checked) errors.consent = 'Zaznacz zgodę, abyśmy mogli odpowiedzieć na wiadomość.';
    return errors;
  }

  // Po poprawieniu pola błąd znika od razu
  Object.keys(fields).forEach(function (key) {
    var ev = key === 'consent' ? 'change' : 'input';
    fields[key].addEventListener(ev, function () {
      info.hidden = true;
      if (form.querySelector('[data-field="' + key + '"]').classList.contains('bad')) {
        var errors = validate();
        setError(key, errors[key]);
        if (!Object.keys(errors).length) summary.hidden = true;
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var errors = validate();
    var keys = Object.keys(errors);
    Object.keys(fields).forEach(function (k) { setError(k, errors[k]); });
    info.hidden = true;

    if (keys.length) {
      summary.hidden = false;
      summary.querySelector('span').textContent = 'Uzupełnij lub popraw: ' + keys.map(function (k) { return labels[k]; }).join(', ') + '.';
      fields[keys[0]].focus();
      return;
    }
    summary.hidden = true;

    var data = new FormData(form);
    sendForm(data);
  });

  function setSending(on) {
    submitBtn.disabled = on;
    submitBtn.setAttribute('aria-busy', on ? 'true' : 'false');
    submitBtn.querySelector('.btn-t').textContent = on ? 'Wysyłanie…' : 'Wyślij zapytanie';
  }

  /*
   * INTEGRACJA — do zrobienia.
   * Formularz NIE wysyła jeszcze wiadomości. Po podłączeniu backendu / usługi formularzy
   * zastąp poniższą funkcję, np.:
   *
   *   setSending(true);
   *   fetch('https://[adres-endpointu]', { method: 'POST', body: data })
   *     .then(function (r) { if (!r.ok) throw new Error(); showSuccess(); })
   *     .catch(function () { setSending(false); showSendError(); });
   */
  function sendForm(data) {
    info.hidden = false; // uczciwy komunikat: brak wysyłki
  }

  function showSuccess() {
    setSending(false);
    document.getElementById('done-email').textContent = fields.email.value.trim();
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }
  window.gsShowSuccess = showSuccess; // pomocniczo, do testów po integracji

  document.getElementById('form-reset').addEventListener('click', function () {
    form.reset();
    form.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    done.hidden = true;
    form.hidden = false;
    fields.name.focus();
  });
})();

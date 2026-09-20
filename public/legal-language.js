(() => {
  const valid = language => ['hy', 'ru', 'en'].includes(language);
  const controls = [...document.querySelectorAll('[data-language]')];
  let language = 'hy';
  try { const saved = localStorage.getItem('aurevia.language'); if (valid(saved)) language = saved; } catch {}
  Promise.all(['/translations.json', '/clinic.json'].map(url => fetch(url).then(response => { if (!response.ok) throw new Error('Content unavailable'); return response.json(); }))).then(([messages, clinic]) => {
    const render = next => {
      language = next;
      document.documentElement.lang = language;
      document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = (messages[element.dataset.i18n]?.[language] ?? element.dataset.i18n).replace(/\{(clinic|phoneRaw)\}/g, (_, key) => key === "clinic" ? clinic.name : clinic.phoneRaw); });
      document.querySelector('.legal-languages').setAttribute('aria-label', messages.Language[language]);
      controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    };
    controls.forEach(button => button.addEventListener('click', () => { render(button.dataset.language); try { localStorage.setItem('aurevia.language', language); } catch {} }));
    window.addEventListener('storage', event => { if (event.key === 'aurevia.language' && valid(event.newValue)) render(event.newValue); });
    render(language);
  }).catch(() => { controls.forEach(button => { button.disabled = true; }); });
})();

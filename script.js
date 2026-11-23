// ===== Год в футере =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Бургер-меню =====
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Плавный скролл с учётом sticky-хедера =====
const header = document.querySelector('.site-header');

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const headerH = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ===== Telegram-отправка =====
const TELEGRAM_TOKEN = '9243452431:AAHmJUtSV6FxWSr80NBcYXSp1JIs2eFD_hk';
const TELEGRAM_CHAT_ID = '8539569254';
const WORKER_URL = 'https://black-meadow-372a.zalupa1133313.workers.dev';

async function sendToTelegram({ name, phone, comment }) {
  const message = `Новая заявка в Sydney Stroy!\nИмя: ${name}\nТелефон: ${phone}\nПожелания: ${comment || '—'}`;

  const url =
    `${WORKER_URL}/bot${TELEGRAM_TOKEN}/sendMessage` +
    `?chat_id=${encodeURIComponent(TELEGRAM_CHAT_ID)}` +
    `&parse_mode=HTML` +
    `&text=${encodeURIComponent(message)}`;

  const response = await fetch(url, { method: 'GET' });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Telegram API error ${response.status}: ${details}`);
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description || 'Telegram API вернул ok: false');
  }

  return data;
}

// ===== Форма =====
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

function setError(fieldName, message) {
  const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (errorEl) errorEl.textContent = message || '';
}

function validateForm() {
  let valid = true;

  const nameInput = form.querySelector('#name');
  const phoneInput = form.querySelector('#phone');

  const nameValue = nameInput.value.trim();
  const phoneValue = phoneInput.value.trim();

  setError('name', '');
  setError('phone', '');

  if (nameValue.length < 2) {
    setError('name', 'Введите имя (минимум 2 символа)');
    valid = false;
  }

  const phoneDigits = phoneValue.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    setError('phone', 'Введите корректный номер телефона');
    valid = false;
  }

  return valid;
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      statusEl.textContent = 'Пожалуйста, проверьте поля формы.';
      statusEl.style.color = '#ff8a8a';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    statusEl.textContent = '';
    statusEl.style.color = '';

    const payload = {
      name: form.querySelector('#name').value.trim(),
      phone: form.querySelector('#phone').value.trim(),
      comment: form.querySelector('#message').value.trim(),
    };

    try {
      await sendToTelegram(payload);
      statusEl.textContent = 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.';
      form.reset();
      setTimeout(() => { statusEl.textContent = ''; }, 5000);
    } catch (error) {
      console.error('Ошибка отправки в Telegram:', error);
      statusEl.textContent = 'Не удалось отправить заявку. Попробуйте позже или позвоните нам.';
      statusEl.style.color = '#ff8a8a';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.name) setError(input.name, '');
    });
  });
}
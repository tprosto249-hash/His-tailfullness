const feedbackForm = document.getElementById('feedbackForm');

if (!(feedbackForm instanceof HTMLFormElement)) {
  throw new Error('Форму #feedbackForm не знайдено.');
}

const username = document.getElementById('username');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const message = document.getElementById('message');
const agreement = document.getElementById('agreement');
const fields = [username, email, phone, message, agreement];

function getErrorElement(field) {
  const errorElement = document.getElementById(`${field.id}Error`);

  if (!errorElement) {
    throw new Error(`Не знайдено повідомлення про помилку для #${field.id}.`);
  }

  return errorElement;
}

function showError(field, text) {
  const errorElement = getErrorElement(field);
  errorElement.textContent = text;
  errorElement.classList.remove('hidden');
  field.setAttribute('aria-invalid', 'true');
  field.classList.remove('!border-green-500');
  field.classList.add('!border-red-500');
}

function showSuccess(field) {
  const errorElement = getErrorElement(field);
  errorElement.textContent = '';
  errorElement.classList.add('hidden');
  field.setAttribute('aria-invalid', 'false');
  field.classList.remove('!border-red-500');
  field.classList.add('!border-green-500');
}

function validateName() {
  if (username.value.trim().length < 2) {
    showError(username, 'Ім’я має містити щонайменше 2 символи.');
    return false;
  }

  showSuccess(username);
  return true;
}

function validateEmail() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.value.trim())) {
    showError(email, 'Введіть коректну адресу електронної пошти.');
    return false;
  }

  showSuccess(email);
  return true;
}

function validatePhone() {
  const phoneValue = phone.value.trim();

  if (phoneValue && !/^\+380\d{9}$/.test(phoneValue)) {
    showError(phone, 'Введіть номер у форматі +380XXXXXXXXX.');
    return false;
  }

  showSuccess(phone);
  return true;
}

function validateMessage() {
  if (message.value.trim().length < 10) {
    showError(message, 'Повідомлення має містити щонайменше 10 символів.');
    return false;
  }

  showSuccess(message);
  return true;
}

function validateAgreement() {
  if (!agreement.checked) {
    showError(agreement, 'Потрібно надати згоду на зворотний зв’язок.');
    return false;
  }

  showSuccess(agreement);
  return true;
}

const validators = new Map([
  [username, validateName],
  [email, validateEmail],
  [phone, validatePhone],
  [message, validateMessage],
  [agreement, validateAgreement]
]);

// Start live validation only after the user interacts with a field.
fields.forEach(field => {
  field.addEventListener(field === agreement ? 'change' : 'input', () => {
    validators.get(field)();
  });

  // Finalize validation when the user leaves a field, even if it was untouched.
  field.addEventListener('blur', () => {
    validators.get(field)();
  });
});

// Block invalid submissions, but let valid ones reach the mailto handler.
feedbackForm.addEventListener('submit', event => {
  const isValid = [
    validateName(),
    validateEmail(),
    validatePhone(),
    validateMessage(),
    validateAgreement()
  ].every(Boolean);

  if (!isValid) {
    event.preventDefault();
    event.stopImmediatePropagation();
    fields.find(field => field.getAttribute('aria-invalid') === 'true')?.focus();
  }
}, true);

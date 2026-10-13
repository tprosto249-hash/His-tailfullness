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
const successModal = document.getElementById('successModal');
const successDialog = document.getElementById('successDialog');
const closeSuccessModalButton = document.getElementById('closeSuccessModal');
const submitButton = feedbackForm.querySelector('button[type="submit"]');

if (
  !(successModal instanceof HTMLDivElement) ||
  !(successDialog instanceof HTMLDivElement) ||
  !(closeSuccessModalButton instanceof HTMLButtonElement) ||
  !(submitButton instanceof HTMLButtonElement)
) {
  throw new Error('Не знайдено всі елементи модального вікна або кнопки форми.');
}

let inertElements = [];

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

function clearError(field) {
  const errorElement = getErrorElement(field);
  errorElement.textContent = '';
  errorElement.classList.add('hidden');
  field.removeAttribute('aria-invalid');
  field.classList.remove('!border-red-500', '!border-green-500');
}

function openSuccessModal() {
  inertElements = Array.from(document.body.children)
    .filter(element => element !== successModal && element instanceof HTMLElement)
    .map(element => ({ element, wasInert: element.inert }));

  inertElements.forEach(({ element }) => {
    element.inert = true;
  });

  successModal.classList.remove('hidden');
  successModal.classList.add('flex');
  successModal.setAttribute('aria-hidden', 'false');
  closeSuccessModalButton.focus();
}

function closeSuccessModal() {
  successModal.classList.add('hidden');
  successModal.classList.remove('flex');
  successModal.setAttribute('aria-hidden', 'true');

  inertElements.forEach(({ element, wasInert }) => {
    element.inert = wasInert;
  });
  inertElements = [];

  submitButton.focus();
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

closeSuccessModalButton.addEventListener('click', closeSuccessModal);

successModal.addEventListener('click', event => {
  if (event.target === successModal) {
    closeSuccessModal();
  }
});

successDialog.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSuccessModal();
    return;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    closeSuccessModalButton.focus();
  }
});

// Capture invalid submissions before the existing mailto submit handler can run.
feedbackForm.addEventListener('submit', event => {
  const isValid = [
    validateName(),
    validateEmail(),
    validatePhone(),
    validateMessage(),
    validateAgreement()
  ].every(Boolean);

  event.preventDefault();
  event.stopImmediatePropagation();

  if (!isValid) {
    fields.find(field => field.getAttribute('aria-invalid') === 'true')?.focus();
    return;
  }

  feedbackForm.reset();
  fields.forEach(clearError);
  openSuccessModal();
}, true);

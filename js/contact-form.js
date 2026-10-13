const contactForm = document.getElementById('feedbackForm');
const contactStatus = document.getElementById('contact-status');
const contactAddress = 'histailfullnes@gmail.com';

contactForm.addEventListener('submit', event => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const subject = encodeURIComponent('Запит із сайту «Його Хвостатість»');
  const body = encodeURIComponent(
    `Ім’я: ${formData.get('username')}\nEmail для відповіді: ${formData.get('email')}\nТелефон: ${formData.get('phone') || 'не вказано'}\n\nПовідомлення:\n${formData.get('message')}`
  );

  contactStatus.textContent = `Якщо поштовий застосунок не відкрився, надішліть лист на ${contactAddress}.`;
  window.location.href = `mailto:${contactAddress}?subject=${subject}&body=${body}`;
});

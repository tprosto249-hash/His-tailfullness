const PRICING = {
  basePerNight: {
    cat: 500,
    dog: { small: 500, medium: 700, large: 900 }
  },
  roomPerNight: { standard: 600, balcony: 800, luxury: 1200 },
  servicesPerPet: { walking: 250, grooming: 600, photo: 100 },
  discounts: { additionalPet: 0.15, week: 0.05, fortnight: 0.10 },
  seasonalMultiplier: 1.2
};

const calculator = document.getElementById('price-calculator');
const result = document.getElementById('calc-result');
const dogSizeWrap = document.getElementById('dog-size-wrap');
const dogSize = document.getElementById('dog-size');
const arrival = document.getElementById('arrival-date');
const departure = document.getElementById('departure-date');
const emailRequestLink = document.getElementById('email-request');
const statusMessage = document.getElementById('calc-status');
const touched = new Set();
const currency = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 });

function localDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function displayDate(value) {
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

function shiftDate(value, days) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function nightCount(start, end) {
  return (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000;
}

function isSeasonalNight(value) {
  const [, month, day] = value.split('-').map(Number);
  const monthDay = month * 100 + day;
  return monthDay >= 1225 || monthDay <= 108 || (monthDay >= 501 && monthDay <= 505);
}

function showError(field, message) {
  const error = document.getElementById(`${field.id.replace('-date', '').replace('-', '-')}-error`);
  if (error) error.textContent = message;
  field.toggleAttribute('aria-invalid', Boolean(message));
}

function update() {
  const today = localDateString(new Date());
  const minDeparture = arrival.value && arrival.value >= today ? shiftDate(arrival.value, 1) : shiftDate(today, 1);
  arrival.min = today;
  departure.min = minDeparture;

  const arrivalError = arrival.value
    ? (arrival.value < today ? 'Дата заїзду не може бути раніше сьогодні.' : '')
    : (touched.has(arrival) ? 'Оберіть дату заїзду.' : '');
  const departureError = departure.value
    ? (arrival.value && departure.value <= arrival.value ? 'Дата виїзду має бути щонайменше на одну добу пізніше за заїзд.' : '')
    : (touched.has(departure) ? 'Оберіть дату виїзду.' : '');
  showError(arrival, arrivalError);
  showError(departure, departureError);

  const animal = calculator.querySelector('input[name="animal"]:checked').value;
  dogSizeWrap.classList.toggle('hidden', animal !== 'dog');
  dogSize.disabled = animal !== 'dog';
  if (arrivalError || departureError || !arrival.value || !departure.value) {
    result.querySelectorAll('[data-calc-value]').forEach(row => { row.textContent = '—'; });
    result.querySelector('[data-calc-value="total"]').textContent = 'Вкажіть коректні дати';
    statusMessage.textContent = arrivalError || departureError || 'Вкажіть дати заїзду та виїзду для розрахунку.';
    emailRequestLink.href = '#calculator';
    emailRequestLink.setAttribute('aria-disabled', 'true');
    return;
  }

  const nights = nightCount(arrival.value, departure.value);
  const pets = Number(calculator.elements.namedItem('petCount').value);
  const room = calculator.elements.namedItem('roomType').value;
  const baseRate = animal === 'cat' ? PRICING.basePerNight.cat : PRICING.basePerNight.dog[dogSize.value];
  const roomRate = PRICING.roomPerNight[room];
  let seasonalNights = 0;
  for (let index = 0; index < nights; index += 1) {
    if (isSeasonalNight(shiftDate(arrival.value, index))) seasonalNights += 1;
  }

  const base = baseRate * pets * nights;
  const roomCost = roomRate * pets * nights;
  const season = (baseRate + roomRate) * pets * seasonalNights * (PRICING.seasonalMultiplier - 1);
  const weightedNights = nights + seasonalNights * (PRICING.seasonalMultiplier - 1);
  const multiPetDiscount = (baseRate + roomRate) * Math.max(0, pets - 1) * weightedNights * PRICING.discounts.additionalPet;
  const lodgingAfterPetDiscount = base + roomCost + season - multiPetDiscount;
  const durationRate = nights >= 14 ? PRICING.discounts.fortnight : nights >= 7 ? PRICING.discounts.week : 0;
  const durationDiscount = lodgingAfterPetDiscount * durationRate;
  const serviceNames = { walking: 'вигул', grooming: 'грумінг', photo: 'фотозвіт' };
  const selectedServices = [...calculator.querySelectorAll('input[name="services"]:checked')];
  const serviceCost = selectedServices.reduce((sum, service) => sum + PRICING.servicesPerPet[service.value] * pets, 0);
  const discounts = multiPetDiscount + durationDiscount;
  const total = base + roomCost + season + serviceCost - discounts;
  const format = amount => currency.format(Math.round(amount));

  result.querySelector('[data-calc-value="base"]').textContent = format(base);
  result.querySelector('[data-calc-value="room"]').textContent = format(roomCost);
  result.querySelector('[data-calc-value="season"]').textContent = format(season);
  result.querySelector('[data-calc-value="services"]').textContent = format(serviceCost);
  result.querySelector('[data-calc-value="multi-discount"]').textContent = `− ${format(multiPetDiscount)}`;
  result.querySelector('[data-calc-value="duration-discount"]').textContent = `− ${format(durationDiscount)}`;
  result.querySelector('[data-calc-value="total"]').textContent = format(total);
  statusMessage.textContent = `${nights} ${nights === 1 ? 'ніч' : nights < 5 ? 'ночі' : 'ночей'}${seasonalNights ? `; ${seasonalNights} сезонних ночей` : ''}.`;

  const animalName = animal === 'cat' ? 'Кіт' : 'Собака';
  const sizeName = animal === 'dog' ? `, розмір: ${dogSize.options[dogSize.selectedIndex].text}` : '';
  const roomField = calculator.elements.namedItem('roomType');
  const roomName = roomField.options[roomField.selectedIndex].text;
  const serviceText = selectedServices.length ? selectedServices.map(service => serviceNames[service.value]).join(', ') : 'немає';
  const text = `Заявка в «Його Хвостатість»\nТварина: ${animalName}${sizeName}\nКількість: ${pets}\nНомер: ${roomName}\nДати: ${displayDate(arrival.value)} — ${displayDate(departure.value)}\nНочей: ${nights}\nПослуги: ${serviceText}\nСума: ${format(total)}`;
  const subject = encodeURIComponent('Заявка на бронювання в «Його Хвостатість»');
  emailRequestLink.href = `mailto:histailfullnes@gmail.com?subject=${subject}&body=${encodeURIComponent(text)}`;
  emailRequestLink.setAttribute('aria-disabled', 'false');
}

calculator.addEventListener('input', event => {
  if (event.target === arrival || event.target === departure) touched.add(event.target);
  update();
});
calculator.addEventListener('change', event => {
  if (event.target === arrival || event.target === departure) touched.add(event.target);
  update();
});
emailRequestLink.addEventListener('click', event => {
  if (emailRequestLink.getAttribute('aria-disabled') === 'true') event.preventDefault();
});

update();

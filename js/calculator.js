(() => {
  // Тарифи й коефіцієнти залишені без змін.
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
  const MAX_NIGHTS = 90; 
  const MIN_PETS = 1;
  const MAX_PETS = 3;
  const currency = new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0
  });

  const calculator = document.getElementById('price-calculator');
  const animalGroup = document.getElementById('animal-group');
  const animalError = document.getElementById('animal-error');
  const dogSizeWrap = document.getElementById('dog-size-wrap');
  const dogSize = document.getElementById('dog-size');
  const dogSizeError = document.getElementById('dog-size-error');
  const petCount = document.getElementById('pet-count');
  const petCountError = document.getElementById('pet-count-error');
  const roomType = document.getElementById('room-type');
  const roomTypeError = document.getElementById('room-type-error');
  const arrival = document.getElementById('arrival-date');
  const arrivalError = document.getElementById('arrival-error');
  const departure = document.getElementById('departure-date');
  const departureError = document.getElementById('departure-error');
  const servicesGroup = document.getElementById('services-group');
  const servicesError = document.getElementById('services-error');
  const result = document.getElementById('calc-result');
  const statusMessage = document.getElementById('calc-status');
  const emailRequestLink = document.getElementById('email-request');
  const requiredElements = [
    calculator,
    animalGroup,
    animalError,
    dogSizeWrap,
    dogSize,
    dogSizeError,
    petCount,
    petCountError,
    roomType,
    roomTypeError,
    arrival,
    arrivalError,
    departure,
    departureError,
    servicesGroup,
    servicesError,
    result,
    statusMessage,
    emailRequestLink
  ];
  const resultValues = new Map(
    ['base', 'room', 'season', 'services', 'multi-discount', 'duration-discount', 'total']
      .map(key => [key, result?.querySelector(`[data-calc-value="${key}"]`) ?? null])
  );
  let missingDomWarningShown = false;
  let dateValidationStarted = false;

  function warnMissingDom() {
    if (missingDomWarningShown) return;
    missingDomWarningShown = true;
    console.warn('Калькулятор: відсутні необхідні елементи сторінки; розрахунок вимкнено.');
  }

  function hasRequiredDom() {
    const elementsAreConnected = requiredElements.every(element => element?.isConnected);
    const resultValuesAreConnected = [...resultValues.values()].every(element => (
      element?.isConnected && result.contains(element)
    ));

    if (elementsAreConnected && resultValuesAreConnected) return true;
    warnMissingDom();
    return false;
  }

  if (!hasRequiredDom()) return;

  const outputs = Object.fromEntries(resultValues);
  const animalInputs = [...calculator.querySelectorAll('input[name="animal"]')];
  const touchedDates = new Set();
  const fieldErrors = [
    [animalGroup, animalError],
    [dogSize, dogSizeError],
    [petCount, petCountError],
    [roomType, roomTypeError],
    [arrival, arrivalError],
    [departure, departureError],
    [servicesGroup, servicesError]
  ];

  function localDateString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
    return date;
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

  function setFieldError(field, errorElement, message) {
    errorElement.textContent = message;
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('border-red-500', '!border-red-500');
      return;
    }

    field.removeAttribute('aria-invalid');
    field.classList.remove('border-red-500', '!border-red-500');
  }

  function clearFieldErrors() {
    fieldErrors.forEach(([field, errorElement]) => {
      setFieldError(field, errorElement, '');
    });
  }

  function updateDateBounds(today) {
    const arrivalDate = parseDate(arrival.value);
    const validFutureArrival = arrivalDate && arrival.value >= today;
    const earliestDeparture = validFutureArrival ? shiftDate(arrival.value, 1) : shiftDate(today, 1);

    arrival.min = today;
    departure.min = earliestDeparture;
    departure.max = validFutureArrival ? shiftDate(arrival.value, MAX_NIGHTS) : '';
  }

  function collectValidationErrors(today, selectedAnimal, selectedServices) {
    const errors = {};
    const checkedAnimal = animalInputs.find(input => input.checked);

    if (!checkedAnimal || !['cat', 'dog'].includes(selectedAnimal)) {
      errors.animal = 'Оберіть кота або собаку.';
    }

    const rawPetCount = petCount.value.trim();
    const pets = Number(rawPetCount);
    if (!rawPetCount) {
      errors.petCount = 'Вкажіть кількість тварин.';
    } else if (!Number.isInteger(pets) || pets < MIN_PETS || pets > MAX_PETS) {
      errors.petCount = 'Вкажіть ціле число тварин від 1 до 3.';
    }

    if (
      selectedAnimal === 'dog' &&
      !Object.prototype.hasOwnProperty.call(PRICING.basePerNight.dog, dogSize.value)
    ) {
      errors.dogSize = 'Оберіть один із доступних розмірів собаки.';
    }

    if (!Object.prototype.hasOwnProperty.call(PRICING.roomPerNight, roomType.value)) {
      errors.roomType = 'Оберіть один із доступних типів номера.';
    }

    const arrivalDate = parseDate(arrival.value);
    const departureDate = parseDate(departure.value);
    if (!arrival.value) {
      if (dateValidationStarted || touchedDates.has(arrival)) {
        errors.arrival = 'Оберіть дату заїзду.';
      }
    } else if (!arrivalDate) {
      errors.arrival = 'Введіть коректну дату заїзду.';
    } else if (arrival.value < today) {
      errors.arrival = 'Дата заїзду не може бути раніше сьогодні.';
    }

    if (!departure.value) {
      if (dateValidationStarted || touchedDates.has(departure)) {
        errors.departure = 'Оберіть дату виїзду.';
      }
    } else if (!departureDate) {
      errors.departure = 'Введіть коректну дату виїзду.';
    } else if (!arrivalDate) {
      errors.departure = 'Спочатку оберіть коректну дату заїзду.';
    } else if (departure.value <= arrival.value) {
      errors.departure = 'Дата виїзду має бути пізніше дати заїзду.';
    } else {
      const nights = nightCount(arrival.value, departure.value);
      if (!Number.isInteger(nights) || nights <= 0) {
        errors.departure = 'Перевірте дати заїзду та виїзду.';
      } else if (nights > MAX_NIGHTS) {
        errors.departure = `Проживання не може перевищувати ${MAX_NIGHTS} ночей.`;
      }
    }

    if (selectedServices.some(service => (
      !Object.prototype.hasOwnProperty.call(PRICING.servicesPerPet, service.value)
    ))) {
      errors.services = 'Одна з вибраних додаткових послуг недоступна.';
    }

    return errors;
  }

  function showValidationErrors(errors) {
    clearFieldErrors();
    setFieldError(animalGroup, animalError, errors.animal ?? '');
    setFieldError(dogSize, dogSizeError, errors.dogSize ?? '');
    setFieldError(petCount, petCountError, errors.petCount ?? '');
    setFieldError(roomType, roomTypeError, errors.roomType ?? '');
    setFieldError(arrival, arrivalError, errors.arrival ?? '');
    setFieldError(departure, departureError, errors.departure ?? '');
    setFieldError(servicesGroup, servicesError, errors.services ?? '');
  }

  function showUnavailableResult(message) {
    Object.values(outputs).forEach(output => {
      output.textContent = '—';
    });
    statusMessage.textContent = message;
    emailRequestLink.href = '#calculator';
    emailRequestLink.setAttribute('aria-disabled', 'true');
  }

  function formatCurrency(amount) {
    return currency.format(Math.round(amount));
  }

  function update() {
    if (!hasRequiredDom()) return;
    if (animalInputs.some(input => !input.isConnected || !calculator.contains(input))) {
      warnMissingDom();
      return;
    }

    const today = localDateString(new Date());
    updateDateBounds(today);
    const checkedAnimal = animalInputs.find(input => input.checked);
    const animal = checkedAnimal?.value ?? '';
    const selectedServices = [...calculator.querySelectorAll('input[name="services"]:checked')];

    dogSizeWrap.classList.toggle('hidden', animal !== 'dog');
    dogSize.disabled = animal !== 'dog';

    const errors = collectValidationErrors(today, animal, selectedServices);
    showValidationErrors(errors);
    const arrivalValid = Boolean(arrival.value && parseDate(arrival.value) && arrival.value >= today);
    const departureValid = Boolean(departure.value && parseDate(departure.value));

    if (
      Object.keys(errors).length > 0 ||
      !arrivalValid ||
      !departureValid
    ) {
      const firstError = Object.values(errors)[0];
      showUnavailableResult(firstError ?? 'Вкажіть дати заїзду та виїзду для розрахунку.');
      return;
    }

    const nights = nightCount(arrival.value, departure.value);
    const pets = Number(petCount.value);
    const room = roomType.value;
    // Для кота розмір собаки навмисно не читається й не впливає на тариф.
    const baseRate = animal === 'cat'
      ? PRICING.basePerNight.cat
      : PRICING.basePerNight.dog[dogSize.value];
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
    const serviceCost = selectedServices.reduce(
      (sum, service) => sum + PRICING.servicesPerPet[service.value] * pets,
      0
    );
    const discounts = multiPetDiscount + durationDiscount;
    const calculatedTotal = base + roomCost + season + serviceCost - discounts;
    const total = Math.max(0, calculatedTotal);
    const amounts = [
      base,
      roomCost,
      season,
      multiPetDiscount,
      lodgingAfterPetDiscount,
      durationDiscount,
      serviceCost,
      discounts,
      calculatedTotal,
      total
    ];

    if (!amounts.every(amount => Number.isFinite(amount))) {
      showUnavailableResult('Не вдалося розрахувати вартість. Перевірте введені дані та спробуйте ще раз.');
      return;
    }

    outputs.base.textContent = formatCurrency(base);
    outputs.room.textContent = formatCurrency(roomCost);
    outputs.season.textContent = formatCurrency(season);
    outputs.services.textContent = formatCurrency(serviceCost);
    outputs['multi-discount'].textContent = `− ${formatCurrency(multiPetDiscount)}`;
    outputs['duration-discount'].textContent = `− ${formatCurrency(durationDiscount)}`;
    outputs.total.textContent = formatCurrency(total);

    statusMessage.textContent = `${nights} ${nights === 1 ? 'ніч' : nights < 5 ? 'ночі' : 'ночей'}${seasonalNights ? `; ${seasonalNights} сезонних ночей` : ''}.`;

    const animalName = animal === 'cat' ? 'Кіт' : 'Собака';
    const sizeName = animal === 'dog' ? `, розмір: ${dogSize.options[dogSize.selectedIndex].text}` : '';
    const roomName = roomType.options[roomType.selectedIndex].text;
    const serviceNames = { walking: 'вигул', grooming: 'грумінг', photo: 'фотозвіт' };
    const serviceText = selectedServices.length
      ? selectedServices.map(service => serviceNames[service.value]).join(', ')
      : 'немає';
    const requestText = `Заявка в «Його Хвостатість»\nТварина: ${animalName}${sizeName}\nКількість: ${pets}\nНомер: ${roomName}\nДати: ${arrival.value.split('-').reverse().join('.')} — ${departure.value.split('-').reverse().join('.')}\nНочей: ${nights}\nПослуги: ${serviceText}\nСума: ${formatCurrency(total)}`;
    const subject = encodeURIComponent('Заявка на бронювання в «Його Хвостатість»');
    emailRequestLink.href = `mailto:histailfullnes@gmail.com?subject=${subject}&body=${encodeURIComponent(requestText)}`;
    emailRequestLink.setAttribute('aria-disabled', 'false');
  }

  function handleCalculatorEvent(event) {
    const target = event.target;
    const changeOnly = target.matches(
      'select, input[type="checkbox"], input[type="radio"]'
    );

    if (event.type === 'input' && changeOnly) return;
    if (event.type === 'change' && !changeOnly) return;

    if (target === arrival || target === departure) {
      touchedDates.add(target);
    }
    dateValidationStarted = true;
    update();
  }

  calculator.addEventListener('input', handleCalculatorEvent);
  calculator.addEventListener('change', handleCalculatorEvent);

  emailRequestLink.addEventListener('click', event => {
    if (emailRequestLink.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      dateValidationStarted = true;
      update();
    }
  });

  update();
})();

document.addEventListener('DOMContentLoaded', () => {
  const sliderEl = document.querySelector('.reviews-swiper');
  if (!sliderEl || typeof Swiper === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const reviewsSwiper = new Swiper(sliderEl, {
    loop: true,
    spaceBetween: 24,
    grabCursor: true,
    keyboard: { enabled: true },

    // Автопрокрутка вимкнена, якщо користувач просить менше анімацій
    autoplay: reducedMotion.matches
      ? false
      : {
          delay: 3500,
          pauseOnMouseEnter: true,
          disableOnInteraction: false
        },

    breakpoints: {
      320:  { slidesPerView: 1 },
      768:  { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    },

    pagination: {
      el: sliderEl.querySelector('.swiper-pagination'),
      clickable: true
    },

    navigation: {
      prevEl: sliderEl.querySelector('.swiper-button-prev'),
      nextEl: sliderEl.querySelector('.swiper-button-next')
    },

    a11y: {
      enabled: true,
      prevSlideMessage: 'Попередній відгук',
      nextSlideMessage: 'Наступний відгук',
      firstSlideMessage: 'Це перший відгук',
      lastSlideMessage: 'Це останній відгук',
      paginationBulletMessage: 'Перейти до відгуку {{index}}',
      slideLabelMessage: 'Відгук {{index}} з {{slidesLength}}'
    }
  });

  // Автопрокрутка не рухається, поки фокус усередині слайдера (клавіатурна навігація)
  if (reviewsSwiper.autoplay) {
    sliderEl.addEventListener('focusin', () => reviewsSwiper.autoplay.stop());
    sliderEl.addEventListener('focusout', () => reviewsSwiper.autoplay.start());
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const target = document.getElementById('hero-typed');
  if (!target || typeof Typed === 'undefined') return;

  // Користувач просить менше анімацій — лишаємо статичний перший рядок
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  new Typed('#hero-typed', {
    strings: [
      'Фотозвіти щодня.',
      'Ветеринар на території.',
      'Без клітин і без прихованих платежів.'
    ],
    typeSpeed: 45,
    backSpeed: 25,
    backDelay: 1500,
    loop: true
  });
});
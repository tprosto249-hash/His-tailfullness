document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slider = document.querySelector('.reviews-swiper');

  if (slider && typeof Swiper !== 'undefined') {
    const reviewsSwiper = new Swiper(slider, {
      loop: true,
      spaceBetween: 16,
      grabCursor: true,
      keyboard: { enabled: true },
      autoplay: reducedMotion.matches
        ? false
        : {
            delay: 3500,
            pauseOnMouseEnter: true,
            disableOnInteraction: false
          },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 24 }
      },
      pagination: {
        el: slider.querySelector('.swiper-pagination'),
        clickable: true
      },
      navigation: {
        prevEl: slider.querySelector('.swiper-button-prev'),
        nextEl: slider.querySelector('.swiper-button-next')
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

    if (!reducedMotion.matches && reviewsSwiper.autoplay) {
      slider.addEventListener('focusin', () => reviewsSwiper.autoplay.stop());
      slider.addEventListener('focusout', event => {
        if (!slider.contains(event.relatedTarget)) {
          reviewsSwiper.autoplay.start();
        }
      });
    }
  }

  if (typeof Fancybox !== 'undefined') {
    Fancybox.bind("[data-fancybox='hotel-gallery']", {
      Carousel: { transition: 'fade' },
      Images: {
        zoom: true,
        Panzoom: { maxScale: 3 }
      }
    });
  }

  if (!reducedMotion.matches && typeof Typed !== 'undefined' && document.getElementById('typed-text')) {
    new Typed('#typed-text', {
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
  }
});

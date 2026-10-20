document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function loadStylesheet(href) {
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.append(link);
    });
  }

  function loadScript(src) {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      return existingScript.dataset.loaded === 'true'
        ? Promise.resolve()
        : new Promise((resolve, reject) => {
            existingScript.addEventListener('load', resolve, { once: true });
            existingScript.addEventListener('error', reject, { once: true });
          });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.body.append(script);
    });
  }

  function loadWhenNear(element, callback) {
    if (!('IntersectionObserver' in window)) {
      callback();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      callback();
    }, { rootMargin: '400px' });

    observer.observe(element);
  }

  const slider = document.querySelector('.reviews-swiper');
  if (slider) {
    loadWhenNear(slider, async () => {
      try {
        await Promise.all([
          loadStylesheet('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'),
          loadScript('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js')
        ]);
        if (typeof window.Swiper === 'undefined') return;

        const reviewsSwiper = new window.Swiper(slider, {
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
      } catch {
        slider.classList.add('swiper-fallback');
      }
    });
  }

  const gallery = document.querySelector('.gallery-grid');
  if (gallery) {
    loadWhenNear(gallery, async () => {
      try {
        await Promise.all([
          loadStylesheet('https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css'),
          loadScript('https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js')
        ]);
        if (typeof window.Fancybox !== 'undefined') {
          window.Fancybox.bind("[data-fancybox='hotel-gallery']", {
            Carousel: { transition: 'fade' },
            Images: { zoom: true, Panzoom: { maxScale: 3 } }
          });
        }
      } catch {
        gallery.classList.add('fancybox-fallback');
      }
    });
  }

  const typedText = document.getElementById('typed-text');
  if (!reducedMotion.matches && typedText) {
    const startTyped = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/typed.js@2.0.12');
        if (typeof window.Typed !== 'undefined') {
          new window.Typed(typedText, {
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
      } catch {
        typedText.textContent = 'Фотозвіти щодня.';
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(startTyped, { timeout: 2000 });
    } else {
      window.setTimeout(startTyped, 0);
    }
  }
});

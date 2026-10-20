const weatherWidget = document.querySelector('.sin-informer');

if (weatherWidget) {
  const loadWeather = () => {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'https://sinoptik.ua/resources/informer/css/informer.css';
    document.head.append(stylesheet);

    const script = document.createElement('script');
    script.src = 'https://sinoptik.ua/api/informer/content?loc=bwCOPQ6RBMAlPUoebrAObrFr&cem=iKDRcObHcSjHBhD7cM=0cTYUcnHObMFrbSju2M2U2kj';
    script.async = true;
    document.body.append(script);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      loadWeather();
    }, { rootMargin: '300px' });

    observer.observe(weatherWidget);
  } else {
    loadWeather();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const track = document.getElementById('carousel-track');
  const slides = Array.from(track.children);
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  const carousel = document.getElementById('carousel');

  let currentIndex = 0;
  const slideCount = slides.length;
  let width = carousel.clientWidth;
  let autoplayInterval = 3500;
  let timer = null;

  // set widths for slides (one slide per view)
  function setSizes() {
    width = carousel.clientWidth;
    slides.forEach(slide => slide.style.minWidth = width + 'px');
    moveToIndex(currentIndex);
  }

  window.addEventListener('resize', () => {
    // recalc sizes after resize
    requestAnimationFrame(setSizes);
  });

  // Preload images and handle load/error to avoid layout issues
  const imgs = slides.map(s => s.querySelector('img'));
  function preloadImages() {
    const promises = imgs.map((img, idx) => new Promise(resolve => {
      if (!img) return resolve();
      // if already complete
      if (img.complete && img.naturalWidth !== 0) return resolve();
      // error handler: replace with inline SVG placeholder
      img.addEventListener('error', function onErr() {
        img.removeEventListener('error', onErr);
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#f2f2f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="20">Imagen no disponible</text></svg>');
        img.style.objectFit = 'contain';
        resolve();
      });
      img.addEventListener('load', function onLoad() { img.removeEventListener('load', onLoad); resolve(); });
      // in case image already errored or loaded
      setTimeout(() => resolve(), 3000);
    }));
    return Promise.all(promises);
  }

  // Wait images to settle, then set sizes and start carousel
  preloadImages().then(() => {
    setSizes();
    startTimer();
  });

  // create dots
  for (let i = 0; i < slideCount; i++) {
    const btn = document.createElement('button');
    btn.setAttribute('data-index', i);
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', () => {
      goTo(i);
      resetTimer();
    });
    dotsContainer.appendChild(btn);
  }

  function updateDots() {
    const dots = Array.from(dotsContainer.children);
    dots.forEach((d, idx) => d.classList.toggle('active', idx === currentIndex));
  }

  function moveToIndex(index) {
    const offset = -index * width;
    track.style.transform = `translateX(${offset}px)`;
  }

  function goTo(index) {
    currentIndex = (index + slideCount) % slideCount;
    moveToIndex(currentIndex);
    updateDots();
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  nextBtn.addEventListener('click', () => { next(); resetTimer(); });
  prevBtn.addEventListener('click', () => { prev(); resetTimer(); });

  // autoplay
  function startTimer() {
    if (timer) return;
    timer = setInterval(() => { next(); }, autoplayInterval);
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function resetTimer() { stopTimer(); startTimer(); }

  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);

  // keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); resetTimer(); }
    if (e.key === 'ArrowRight') { next(); resetTimer(); }
  });

  // start (will be started after images preload)
});

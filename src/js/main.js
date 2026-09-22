document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initReveal();
  initCarousel();
  initModals();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
  const sections = Array.from(document.querySelectorAll('[data-section]'));

  const COMPACT_THRESHOLD = 60;

  function updateNavbarSize() {
    if (window.scrollY > COMPACT_THRESHOLD) {
      navbar.classList.add('navbar--compact');
    } else {
      navbar.classList.remove('navbar--compact');
    }
  }

  function updateActiveSection() {
    const navbarHeight = navbar.offsetHeight;
    const scrollPos = window.scrollY + navbarHeight + 10;

    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    let currentId = sections[0].id;

    if (atBottom) {
      currentId = sections[sections.length - 1].id;
    } else {
      sections.forEach((section) => {
        if (section.offsetTop <= scrollPos) {
          currentId = section.id;
        }
      });
    }

    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('active', isActive);
    });
  }

  function onScroll() {
    window.requestAnimationFrame(() => {
      updateNavbarSize();
      updateActiveSection();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateActiveSection);

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      const top = target.offsetTop - navbar.offsetHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });

      navbar.classList.remove('navbar--open');
    });
  });

  navToggle.addEventListener('click', () => {
    navbar.classList.toggle('navbar--open');
  });

  updateNavbarSize();
  updateActiveSection();
}

function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  if (!track) return;

  const slides = Array.from(track.children);
  let activeIndex = 0;
  let scrollTimeout = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function setActiveDot(index) {
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    activeIndex = index;
  }

  function goToSlide(index) {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    track.scrollTo({ left: slides[clamped].offsetLeft, behavior: 'smooth' });
    setActiveDot(clamped);
  }

  prevBtn.addEventListener('click', () => goToSlide(activeIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(activeIndex + 1));

  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const closestIndex = slides.reduce((closest, slide, i) => {
          const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
          const closestDistance = Math.abs(slides[closest].offsetLeft - track.scrollLeft);
          return distance < closestDistance ? i : closest;
        }, 0);
        setActiveDot(closestIndex);
      }, 100);
    },
    { passive: true }
  );

  window.addEventListener('resize', () => goToSlide(activeIndex));
}

function initModals() {
  const openers = document.querySelectorAll('[data-modal-target]');
  const closers = document.querySelectorAll('[data-modal-close]');
  let activeModal = null;

  function openModal(modal) {
    modal.classList.add('is-open');
    document.body.classList.add('no-scroll');
    activeModal = modal;
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    activeModal = null;
  }

  openers.forEach((opener) => {
    opener.addEventListener('click', () => {
      const modal = document.getElementById(opener.dataset.modalTarget);
      if (modal) openModal(modal);
    });
  });

  closers.forEach((closer) => {
    closer.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

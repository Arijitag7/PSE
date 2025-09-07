/* script.js - Enhanced with dark mode, animations, and improved interactions */
/* Accessibility: keyboard controls, aria attributes, pause on hover/focus, respects prefers-reduced-motion */

document.addEventListener('DOMContentLoaded', function () {
  /* Utility: prefers reduced motion check */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Dark Mode Toggle */
  (function darkModeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    const toggleIcon = document.querySelector('.theme-toggle__icon');
    const html = document.documentElement;

    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme
    if (savedTheme) {
      html.setAttribute('data-theme', savedTheme);
      updateToggleIcon(savedTheme);
    } else if (systemPrefersDark) {
      html.setAttribute('data-theme', 'dark');
      updateToggleIcon('dark');
    } else {
      html.setAttribute('data-theme', 'light');
      updateToggleIcon('light');
    }

    // Toggle theme function
    function toggleTheme() {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateToggleIcon(newTheme);

      // Add a subtle animation to the toggle
      toggle.style.transform = 'scale(0.9)';
      setTimeout(() => {
        toggle.style.transform = '';
      }, 150);
    }

    // Update toggle icon based on theme
    function updateToggleIcon(theme) {
      toggleIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
      toggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }

    // Event listeners
    toggle.addEventListener('click', toggleTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        updateToggleIcon(newTheme);
      }
    });

    // Keyboard support
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  })();

  /* Scroll animations */
  (function scrollAnimations() {
    if (reduceMotion) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
      '.section__title, .school-card, .exhibit-card, .logos__item'
    );

    animateElements.forEach(el => {
      observer.observe(el);
    });
  })();

  /* Enhanced smooth scrolling for navigation links */
  (function smoothScrolling() {
    const navLinks = document.querySelectorAll('.site-nav__link[href^="#"]');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const headerHeight = document.querySelector('.site-header').offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  })();

  /* Vertical-Only Hero Slider */
  (function heroSlider() {
    const slidesEl = document.getElementById('heroSlides');
    const slides = Array.from(slidesEl.children);
    const viewport = document.getElementById('heroViewport');
    const indicators = document.querySelectorAll('.hero__indicator');
    let currentIndex = 0;
    let playing = true;
    const playBtn = document.querySelector('.hero__btn--play');
    const prevBtn = document.querySelector('.hero__btn--prev');
    const nextBtn = document.querySelector('.hero__btn--next');

    function updateSlide() {
      // Remove all classes from slides
      slides.forEach((slide, i) => {
        slide.classList.remove('active', 'prev', 'next');
        slide.setAttribute('aria-hidden', i !== currentIndex);

        if (i === currentIndex) {
          slide.classList.add('active');
        } else if (i === currentIndex - 1 || (currentIndex === 0 && i === slides.length - 1)) {
          slide.classList.add('prev');
        } else if (i === currentIndex + 1 || (currentIndex === slides.length - 1 && i === 0)) {
          slide.classList.add('next');
        }
      });

      // Update indicators
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === currentIndex);
      });

      // Announce slide change for screen readers
      const currentSlide = slides[currentIndex];
      const slideTitle = currentSlide.querySelector('h3').textContent;
      announceToScreenReader(`Now showing: ${slideTitle}`);
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlide();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlide();
    }

    function goToSlide(index) {
      currentIndex = index;
      updateSlide();
    }

    let timer = null;
    function startAuto() {
      if (!reduceMotion) {
        timer = setInterval(nextSlide, 5000);
      }
      playing = true;
      playBtn.setAttribute('aria-pressed', 'false');
      playBtn.querySelector('.play-icon').style.display = 'block';
      playBtn.querySelector('.pause-icon').style.display = 'none';
    }

    function stopAuto() {
      clearInterval(timer);
      timer = null;
      playing = false;
      playBtn.setAttribute('aria-pressed', 'true');
      playBtn.querySelector('.play-icon').style.display = 'none';
      playBtn.querySelector('.pause-icon').style.display = 'block';
    }

    // Initialize autoplay
    if (!reduceMotion) startAuto();

    // Event listeners
    playBtn.addEventListener('click', () => {
      if (playing) stopAuto();
      else startAuto();
    });

    prevBtn.addEventListener('click', () => {
      stopAuto();
      prevSlide();
      if (!reduceMotion) setTimeout(startAuto, 1000);
    });

    nextBtn.addEventListener('click', () => {
      stopAuto();
      nextSlide();
      if (!reduceMotion) setTimeout(startAuto, 1000);
    });

    // Indicator clicks
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        stopAuto();
        goToSlide(index);
        if (!reduceMotion) setTimeout(startAuto, 1000);
      });
    });

    // Pause on hover
    viewport.addEventListener('mouseenter', stopAuto);
    viewport.addEventListener('mouseleave', () => {
      if (!reduceMotion) startAuto();
    });

    // Keyboard navigation
    viewport.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          stopAuto();
          prevSlide();
          if (!reduceMotion) setTimeout(startAuto, 1000);
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          stopAuto();
          nextSlide();
          if (!reduceMotion) setTimeout(startAuto, 1000);
          break;
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          if (playing) stopAuto();
          else startAuto();
          break;
      }
    });

    // Touch/swipe support
    let startY = 0;
    let startX = 0;
    let isDragging = false;

    viewport.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      isDragging = true;
      stopAuto();
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;

      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const deltaY = startY - endY;
      const deltaX = startX - endX;

      // Determine if it's a vertical or horizontal swipe
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // Vertical swipe
        if (Math.abs(deltaY) > 50) {
          if (deltaY > 0) {
            nextSlide(); // Swipe up = next
          } else {
            prevSlide(); // Swipe down = previous
          }
        }
      } else {
        // Horizontal swipe
        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            nextSlide(); // Swipe left = next
          } else {
            prevSlide(); // Swipe right = previous
          }
        }
      }

      if (!reduceMotion) setTimeout(startAuto, 1000);
    }, { passive: true });

    // Initialize
    updateSlide();

    // Screen reader announcement function
    function announceToScreenReader(message) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'visually-hidden';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  })();


  /* Logos: pause on hover/focus and keyboard focusable */
  (function logos() {
    const tracks = document.querySelectorAll('.logos__track--left, .logos__track--right');
    tracks.forEach(track => {
      track.setAttribute('tabindex', '0');
      track.addEventListener('focus', () => track.style.animationPlayState = 'paused');
      track.addEventListener('blur', () => track.style.animationPlayState = 'running');
      track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
      track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
    });
  })();


  /* Schools mobile slider */
  (function mobileSchools() {
    const grid = document.getElementById('schoolsGrid');
    const mobileWrap = document.getElementById('schoolsMobile');
    const viewport = document.getElementById('schoolsViewport');
    const dotsWrap = document.getElementById('schoolsDots');
    const prevBtn = document.querySelector('.schools__nav--prev');
    const nextBtn = document.querySelector('.schools__nav--next');
    let initialized = false;
    let idx = 0;

    function init() {
      if (initialized) return;
      const cards = Array.from(grid.children);
      const track = document.createElement('div');
      track.className = 'slider__track';
      cards.forEach(c => {
        const item = document.createElement('div');
        item.className = 'slider__item';
        item.innerHTML = c.outerHTML;
        track.appendChild(item);
      });
      viewport.innerHTML = '';
      viewport.appendChild(track);

      // dots
      dotsWrap.innerHTML = '';
      cards.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'dot';
        d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        d.addEventListener('click', () => { idx = i; move(); });
        dotsWrap.appendChild(d);
      });

      prevBtn.addEventListener('click', () => { idx = (idx - 1 + cards.length) % cards.length; move(); });
      nextBtn.addEventListener('click', () => { idx = (idx + 1) % cards.length; move(); });

      // swipe
      let sx = 0;
      viewport.addEventListener('touchstart', e => sx = e.changedTouches[0].clientX);
      viewport.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - sx;
        if (dx < -30) idx = Math.min(cards.length - 1, idx + 1);
        if (dx > 30) idx = Math.max(0, idx - 1);
        move();
      });

      function move() {
        track.style.transform = `translateX(${-idx * 100}%)`;
        Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === idx));
      }
      move();
      initialized = true;
    }

    function check() {
      if (window.innerWidth <= 640) {
        grid.style.display = 'none';
        mobileWrap.setAttribute('aria-hidden', 'false');
        init();
      } else {
        grid.style.display = '';
        mobileWrap.setAttribute('aria-hidden', 'true');
      }
    }
    window.addEventListener('resize', check);
    check();
  })();


  /* Exhibition slider */
  (function exhibition() {
    const track = document.getElementById('exhibitTrack');
    const prev = document.querySelector('.exhibition__nav--prev');
    const next = document.querySelector('.exhibition__nav--next');
    let idx = 0;

    function update() {
      const cards = Array.from(track.children);
      if (!cards.length) return;
      const cardWidth = cards[0].getBoundingClientRect().width + 16;
      track.style.transform = `translateX(${-idx * (cardWidth)}px)`;
      cards.forEach((c, i) => c.setAttribute('aria-hidden', i < idx || i > idx + 2));
    }

    prev.addEventListener('click', () => { idx = Math.max(0, idx - 1); update(); });
    next.addEventListener('click', () => { const max = Math.max(0, track.children.length - 3); idx = Math.min(max, idx + 1); update(); });

    window.addEventListener('resize', update);
    update();
  })();


  /* Enhanced form handling with validation and animations */
  (function forms() {
    const enqForm = document.getElementById('enquiryForm');
    const enqStatus = document.getElementById('enquiryStatus');
    const regForm = document.getElementById('registerForm');
    const regStatus = document.getElementById('registerStatus');

    // Form validation
    function validateForm(form) {
      const inputs = form.querySelectorAll('input[required]');
      let isValid = true;

      inputs.forEach(input => {
        const value = input.value.trim();

        // Remove previous error styling
        input.classList.remove('error');

        if (!value) {
          input.classList.add('error');
          isValid = false;
        } else if (input.type === 'email' && !isValidEmail(value)) {
          input.classList.add('error');
          isValid = false;
        } else if (input.type === 'tel' && !isValidPhone(value)) {
          input.classList.add('error');
          isValid = false;
        }
      });

      return isValid;
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
      return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
    }

    function showStatus(statusElement, message, isSuccess = true) {
      statusElement.textContent = message;
      statusElement.style.opacity = '0';
      statusElement.style.transform = 'translateY(10px)';

      setTimeout(() => {
        statusElement.style.opacity = '1';
        statusElement.style.transform = 'translateY(0)';
        statusElement.style.transition = 'all 0.3s ease';
      }, 100);

      if (isSuccess) {
        statusElement.style.background = 'rgba(76, 175, 80, 0.1)';
        statusElement.style.borderColor = '#4CAF50';
        statusElement.style.color = '#4CAF50';
      } else {
        statusElement.style.background = 'rgba(244, 67, 54, 0.1)';
        statusElement.style.borderColor = '#F44336';
        statusElement.style.color = '#F44336';
      }
    }

    // Enhanced enquiry form
    enqForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (validateForm(enqForm)) {
        // Simulate loading
        const submitBtn = enqForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        setTimeout(() => {
          showStatus(enqStatus, '✅ Thank you! We will get back to you within 24 hours.');
          enqForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 1500);
      } else {
        showStatus(enqStatus, '❌ Please fill in all required fields correctly.', false);
      }
    });

    // Enhanced registration form
    regForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (validateForm(regForm)) {
        const submitBtn = regForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;

        setTimeout(() => {
          showStatus(regStatus, '🎉 Registration successful! Check your email for confirmation.');
          regForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 2000);
      } else {
        showStatus(regStatus, '❌ Please fill in all required fields correctly.', false);
      }
    });

    // Real-time validation feedback
    document.querySelectorAll('input[required]').forEach(input => {
      input.addEventListener('blur', () => {
        const value = input.value.trim();

        if (!value) {
          input.classList.add('error');
        } else if (input.type === 'email' && !isValidEmail(value)) {
          input.classList.add('error');
        } else if (input.type === 'tel' && !isValidPhone(value)) {
          input.classList.add('error');
        } else {
          input.classList.remove('error');
        }
      });

      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          input.classList.remove('error');
        }
      });
    });
  })();

  /* Enhanced focus visible helper for keyboard outlines */
  (function focusVisible() {
    let hadKeyboardEvent = false;

    function handleFirstTab(e) {
      if (e.key === 'Tab') {
        document.documentElement.classList.add('user-is-tabbing');
        hadKeyboardEvent = true;
      }
    }

    function handleMouseDown() {
      if (hadKeyboardEvent) {
        document.documentElement.classList.remove('user-is-tabbing');
        hadKeyboardEvent = false;
      }
    }

    window.addEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDown);
  })();

  /* Performance optimizations */
  (function performanceOptimizations() {
    // Lazy load images when they come into view
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Debounce resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Trigger any resize-dependent functions
        window.dispatchEvent(new Event('debouncedResize'));
      }, 250);
    });
  })();

  /* Accessibility enhancements */
  (function accessibilityEnhancements() {
    // Skip to main content functionality
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main');

    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Announce page changes to screen readers
    function announceToScreenReader(message) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'visually-hidden';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }

    // Announce theme changes
    document.querySelector('.theme-toggle').addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const message = `Switched to ${currentTheme} mode`;
      announceToScreenReader(message);
    });
  })();

  /* Loading animation */
  (function loadingAnimation() {
    // Add loading class to body initially
    document.body.classList.add('loading');

    // Remove loading class when everything is loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
      }, 500);
    });
  })();

  /* Easter egg - Konami code */
  (function konamiCode() {
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    let userSequence = [];

    document.addEventListener('keydown', (e) => {
      userSequence.push(e.code);

      if (userSequence.length > konamiSequence.length) {
        userSequence.shift();
      }

      if (userSequence.length === konamiSequence.length &&
          userSequence.every((key, index) => key === konamiSequence[index])) {

        // Easter egg: Add rainbow animation to the logo
        const logo = document.querySelector('.site-header__logo img');
        if (logo) {
          logo.style.animation = 'rainbow 2s infinite';
          logo.style.filter = 'hue-rotate(0deg)';

          const style = document.createElement('style');
          style.textContent = `
            @keyframes rainbow {
              0% { filter: hue-rotate(0deg); }
              25% { filter: hue-rotate(90deg); }
              50% { filter: hue-rotate(180deg); }
              75% { filter: hue-rotate(270deg); }
              100% { filter: hue-rotate(360deg); }
            }
          `;
          document.head.appendChild(style);

          setTimeout(() => {
            logo.style.animation = '';
            logo.style.filter = '';
            document.head.removeChild(style);
          }, 10000);
        }

        userSequence = [];
      }
    });
  })();
});

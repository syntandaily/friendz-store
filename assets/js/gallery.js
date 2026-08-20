/**
 * FRIENDZ Image Lightbox / Fullscreen Viewer
 * 
 * Supports:
 * - Next / Prev controls
 * - Image counter (01 / 04)
 * - Keyboard navigation (Esc to close, Left/Right arrow keys)
 * - Mobile swipe navigation
 * - Back-scroll prevention
 */

const Lightbox = (() => {
  let activeImages = [];
  let currentIndex = 0;
  let isOpen = false;

  // Touch swipe variables
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;

  // DOM Elements cache
  let lightboxEl, imgEl, closeEl, prevEl, nextEl, counterEl;

  // Initialize Lightbox DOM Structure dynamically if it doesn't exist
  function init() {
    if (document.getElementById('friendz-lightbox')) return;

    const html = `
      <div id="friendz-lightbox" class="lightbox" aria-hidden="true" role="dialog">
        <button class="lightbox-close" aria-label="Close image viewer">&times;</button>
        <div class="lightbox-container">
          <button class="lightbox-arrow prev" aria-label="Previous image">&#8592;</button>
          <div class="lightbox-image-wrapper">
            <!-- ADD IMG: LIGHTBOX PLACEHOLDER IMAGE -->
            <img class="lightbox-img" src="" alt="Fullscreen fashion display">
          </div>
          <button class="lightbox-arrow next" aria-label="Next image">&#8594;</button>
          <div class="lightbox-counter">01 / 01</div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    // Cache elements
    lightboxEl = document.getElementById('friendz-lightbox');
    imgEl = lightboxEl.querySelector('.lightbox-img');
    closeEl = lightboxEl.querySelector('.lightbox-close');
    prevEl = lightboxEl.querySelector('.lightbox-arrow.prev');
    nextEl = lightboxEl.querySelector('.lightbox-arrow.next');
    counterEl = lightboxEl.querySelector('.lightbox-counter');

    // Attach Event Listeners
    closeEl.addEventListener('click', close);
    prevEl.addEventListener('click', prev);
    nextEl.addEventListener('click', next);
    
    // Close on clicking overlay background
    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl || e.target.classList.contains('lightbox-container') || e.target.classList.contains('lightbox-image-wrapper')) {
        close();
      }
    });

    // Touch events for swiping on mobile
    lightboxEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
  }

  function handleKeyDown(e) {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowLeft') {
      prev();
    } else if (e.key === 'ArrowRight') {
      next();
    }
  }

  function handleSwipe() {
    const distance = touchEndX - touchStartX;
    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swiped right -> go to previous image
      prev();
    } else {
      // Swiped left -> go to next image
      next();
    }
  }

  function update() {
    if (activeImages.length === 0) return;
    
    // Fade out effect
    imgEl.style.opacity = '0.3';
    imgEl.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      imgEl.src = activeImages[currentIndex];
      imgEl.alt = `Friendz fashion collection product image ${currentIndex + 1}`;
      
      // Update Counter
      const currentLabel = String(currentIndex + 1).padStart(2, '0');
      const totalLabel = String(activeImages.length).padStart(2, '0');
      counterEl.textContent = `${currentLabel} / ${totalLabel}`;
      
      // Toggle arrows based on single image
      if (activeImages.length <= 1) {
        prevEl.style.display = 'none';
        nextEl.style.display = 'none';
      } else {
        prevEl.style.display = 'flex';
        nextEl.style.display = 'flex';
      }
      
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1)';
    }, 150);
  }

  // PUBLIC API
  
  /**
   * Open Lightbox with list of image paths and initial starting point
   * @param {Array<string>} images List of image URLs/paths
   * @param {number} startIndex Starting index (default 0)
   */
  function open(images, startIndex = 0) {
    if (!images || images.length === 0) return;
    
    init(); // Ensure initialized
    
    activeImages = images;
    currentIndex = startIndex;
    isOpen = true;

    // Show Lightbox
    lightboxEl.classList.add('open');
    lightboxEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    
    update();
  }

  function close() {
    if (!isOpen) return;

    lightboxEl.classList.remove('open');
    lightboxEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    isOpen = false;
  }

  function next() {
    if (activeImages.length <= 1) return;
    currentIndex = (currentIndex + 1) % activeImages.length;
    update();
  }

  function prev() {
    if (activeImages.length <= 1) return;
    currentIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
    update();
  }

  return {
    open,
    close,
    next,
    prev
  };
})();

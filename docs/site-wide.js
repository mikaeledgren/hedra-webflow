// Disable Webflow's built-in smooth scrolling
var Webflow = Webflow || [];
Webflow.push(function () {
  $(function () {
    $(document).off('click.wf-scroll');
  });
});

// Run custom JS when the page is ready
domReady([styleCurrentNavs, hijackAnchorScrolls, formatDates, calculateReadTime]);

/**
 * DOM ready helper function
 *
 * @param callbacks
 */
function domReady(callbacks) {
  callbacks.forEach((callback) => {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback, {
        passive: true,
      });
    }
  });
}

function getHeaderHeight() {
  const headerHeightString = getComputedStyle(document.documentElement).getPropertyValue('--_layout---header-height');
  console.log('headerHeightString', headerHeightString);
  return headerHeightString ? parseInt(headerHeightString) : 0;
}

/**
 * Scroll to element with offset
 *
 * @param target
 */
function scrollWithOffset(target) {
  console.log('scrolling to', target);
  const offset = getHeaderHeight();
  console.log('offset', offset);
  const elementPosition =
    target.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
  console.log('scroll position', offsetPosition);
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}

/**
 * Hijack anchor scrolls, so that we can scroll with offset
 */
function hijackAnchorScrolls() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      console.log('clicked!');
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        scrollWithOffset(target);
      }
    });
  });
  window.addEventListener('hashchange', function () {
    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) {
        scrollWithOffset(target);
      }
    }
  });
}

/**
 * Apply current nav styles
 */
function styleCurrentNavs() {
  // Find all with custom attribute
  var navPathEls = document.querySelectorAll('[nav-path]');
  if (navPathEls) {
    for (let i = 0; i < navPathEls.length; i++) {
      var el = navPathEls[i];
      var navPath = el.getAttribute('nav-path');
      if (navPath && window.location.pathname.includes(navPath)) {
        el.classList.add('w--current');
      }
    }

  }
  // Find all nav a and check their href
  var navs = document.querySelectorAll('nav');
  if (navs) {
    for (let i = 0; i < navs.length; i++) {
      var nav = navs[i];
      var anchors = nav.querySelectorAll('a');
      if (anchors) {
        for (let j = 0; j < anchors.length; j++) {
          var anchor = anchors[j];
          if (window.location.href.includes(anchor.href)) {
            anchor.classList.add('w--current');
            var children = anchor.children;
            if (children) {
              for (let x = 0; x < children.length; x++) {
                const child = children[x];
                child.classList.add('text-black');
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Calculates the read time
 */
function calculateReadTime(){
  const viewEls = document.querySelectorAll('[data-read-time-display]');
  if (viewEls) {
    const articleEls = document.querySelectorAll('[data-read-time-source]');
    if (!articleEls) {
      viewEls.forEach(el => el.style.display = 'none');
      return;
    }
    for (let i = 0; i < viewEls.length; i++) {
      const viewEl = viewEls[i];
      const textEl = viewEl.querySelector('[data-read-time-text]');
      if (!textEl) {
        console.error('Unable to display read time: no text element (<span>) found');
        return
      }
      let articleEl = articleEls[0];
      if (viewEl.dataset.slug) {
        for(let x = 0; x < articleEls.length; x++){
          if(articleEls[x].dataset.slug === viewEl.dataset.slug){
            articleEl = articleEls[x];
            break;
          }
        }
      }
      const content = articleEl.textContent || '';
      const wordCount = content.trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(wordCount / 200));
      textEl.innerText = `${minutes} ${minutes === 1 ? 'minuts' : 'minuters'} läsning`;
      textEl.style.display = 'block';
    }
  }
}
/**
 * Finds all elements with data-custom-format="date" and formats the date
 */
function formatDates() {
  const elements = document.querySelectorAll('[data-custom-format="date"]');
  if (elements) {
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      let dateString = el.getAttribute('data-date');
      if(!dateString){
        dateString = el.textContent;
      }
      if (dateString) {
        el.innerHTML = formatDateString(dateString);
      }
    }
  }
}

/**
 * Formats a date string
 *
 * @param dateString
 * @returns {*|string}
 */
function formatDateString(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
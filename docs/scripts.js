// Run custom JS when the page is ready
domReady([
  disableWebflowSmoothScrolling,
  styleCurrentAnchors,
  hijackAnchorScrolls,
  formatDates,
  calculateReadTime,
  handleSubMenuDropdowns,
  halfASecondLater([styleCurrentAnchors]),
]);

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

/**
 * Calls provided functions with a 500 ms  delay
 *
 * @param callbacks
 * @returns {(function(): void)|*}
 */
function halfASecondLater(callbacks) {
  return function () {
    callbacks.forEach((callback) =>
      setTimeout(function () {
        callback();
      }, 1000),
    );
  };
}

// Disable Webflow's built-in smooth scrolling
function disableWebflowSmoothScrolling() {
  const wf = Webflow || [];
  wf.push(function () {
    $(function () {
      $(document).off('click.wf-scroll');
    });
  });
}

function getHeaderHeight() {
  const headerHeightString = getComputedStyle(
    document.documentElement,
  ).getPropertyValue('--_layout---header-height');
  console.log('headerHeightString', headerHeightString);
  return headerHeightString ? parseInt(headerHeightString) : 0;
}

/**
 * Scroll to element with offset
 *
 * @param target
 */
function scrollWithOffset(target) {
  const offset = getHeaderHeight();
  const elementPosition =
    target.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
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
function styleCurrentAnchors() {
  // Find all anchors with custom attribute
  const els = document.querySelectorAll('a');
  const pathname = window.location.pathname;

  console.log('pathname', pathname);

  // Skip home path
  if (pathname === '/') return;

  if (els) {
    const subMenuEls = [];

    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const isSubMenu = el.closest('.subnav');

      // Sub menu anchors have special treatment
      if (isSubMenu) {
        subMenuEls.push(el);
        continue;
      }

      const href = el.getAttribute('href');

      // Home href requires exact match, will match all otherwise
      if (pathname === '/') {
        if (href === '/') {
          setAnchorAsCurrent(el);
          continue;
        }
      }

      console.log('href', href, pathname.includes(href));
      if (href && pathname.includes(href)) {
        setAnchorAsCurrent(el);
      }
    }

    console.log(
      'subMenuEls',
      subMenuEls.map((el) => el.getAttribute('href')),
    );
    if (subMenuEls.length > 0) {
      // Only one can be the current within a submenu – pick the one with most matches
      const pathnameParts = pathname.split('/');
      let mostMatches = 0;
      let mostMatchedEl;

      for (let i = 0; i < subMenuEls.length; i++) {
        const subMenuEl = subMenuEls[i];
        const subMenuPathname = subMenuEl.getAttribute('href');
        const subMenuPathnameParts = subMenuPathname.split('/');
        let matches = 0;
        for (let x = 0; x < pathnameParts.length; x++) {
          if (pathnameParts[x] === subMenuPathnameParts[x]) {
            matches++;
          }
        }
        if (matches > mostMatches) {
          mostMatches = matches;
          mostMatchedEl = subMenuEl;
        }
      }

      console.log('mostMatchedEl', mostMatchedEl?.getAttribute('href'));
      if (mostMatchedEl) setAnchorAsCurrent(mostMatchedEl);
    }
  }
}

/**
 * Adds classes for current styling
 *
 * @param el
 */
function setAnchorAsCurrent(el) {
  el.classList.add('w--current');

  const children = el.children;
  if (children) {
    for (let x = 0; x < children.length; x++) {
      const child = children[x];
      child.classList.add('text-black');
    }
  }

  // Also handle dropdown buttons (they're not anchors so need special treatment)
  const parentNavLinkEl = el.closest('.nav_link');
  console.log('parentNavLink?', el.getAttribute('href'), !!parentNavLinkEl);
  if (parentNavLinkEl) {
    console.log('Adding w--current to parent', parentNavLinkEl);
    parentNavLinkEl.classList.add('w--current');
  }
}

/**
 * Calculates the read time
 */
function calculateReadTime() {
  const viewEls = document.querySelectorAll('[data-read-time-display]');
  if (viewEls) {
    const articleEls = document.querySelectorAll('[data-read-time-source]');
    if (!articleEls) {
      viewEls.forEach((el) => (el.style.display = 'none'));
      return;
    }
    for (let i = 0; i < viewEls.length; i++) {
      const viewEl = viewEls[i];
      const textEl = viewEl.querySelector('[data-read-time-text]');
      if (!textEl) {
        console.error(
          'Unable to display read time: no text element (<span>) found',
        );
        return;
      }
      let articleEl = articleEls[0];
      if (viewEl.dataset.slug) {
        for (let x = 0; x < articleEls.length; x++) {
          if (articleEls[x].dataset.slug === viewEl.dataset.slug) {
            articleEl = articleEls[x];
            break;
          }
        }
      }
      const content = articleEl.textContent || '';
      const wordCount = content.trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(wordCount / 200));
      textEl.innerText = `${minutes} min läsning`;
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
      if (!dateString) {
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

/**
 * Handle sub menu dropdowns
 * Opens on hover and stays open if any of its or its parent's page is the current
 */
function handleSubMenuDropdowns() {
  const dropdowns = document.querySelectorAll('.nav-submenu-dropdown');

  dropdowns.forEach((dropdown) => {
    // Find the menu
    const menu = dropdown.querySelector('.nav-submenu-dropdown_menu');
    if (!menu) {
      console.warn('No menu found for submenu dropdown', dropdown);
      return;
    }

    // Check if the dropdown is or has the current page
    const isCurrent =
      dropdown.classList.contains('w--current') ||
      !!dropdown.querySelector('.w--current');
    if (isCurrent) {
      // Add the open class and let it stay open
      menu.classList.add('open');
      return;
    }

    // Show on hover
    dropdown.addEventListener('mouseover', () => {
      menu.classList.add('open');
    });

    // Hide on blur
    dropdown.addEventListener('mouseout', () => {
      menu.classList.remove('open');
    });
  });
}

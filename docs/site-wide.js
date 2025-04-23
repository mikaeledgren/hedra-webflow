// Disable Webflow's built-in smooth scrolling
var Webflow = Webflow || [];
Webflow.push(function () {
  $(function () {
    $(document).off('click.wf-scroll');
  });
});

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

function scrollWithOffset(target) {
  console.log('scrolling to', target);
  const offset = 120; // header height in px
  const elementPosition =
    target.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
  console.log('scroll position', offsetPosition);
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}

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

domReady([styleCurrentNavs, hijackAnchorScrolls]);

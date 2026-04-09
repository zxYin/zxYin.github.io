(function () {
  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealItems = document.querySelectorAll("[data-reveal]");
  var showAll = function () {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  };

  if (reducedMotion || !("IntersectionObserver" in window)) {
    showAll();
    return;
  }

  try {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealItems.forEach(function (item, index) {
      item.style.setProperty("--delay", Math.min(index * 90, 450) + "ms");
      observer.observe(item);
    });

    var revealInView = function () {
      revealItems.forEach(function (item) {
        if (item.classList.contains("is-visible")) {
          return;
        }
        var rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08) {
          item.classList.add("is-visible");
          observer.unobserve(item);
        }
      });
    };

    root.classList.add("reveal-ready");
    window.addEventListener("load", revealInView, { once: true });
    window.addEventListener("resize", revealInView);
    window.requestAnimationFrame(revealInView);
    window.setTimeout(revealInView, 240);
  } catch (error) {
    root.classList.remove("reveal-ready");
    showAll();
  }
})();

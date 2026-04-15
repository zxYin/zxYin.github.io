(function () {
  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealItems = document.querySelectorAll("[data-reveal]");

  var settleRevealItem = function (item) {
    if (item.classList.contains("is-settled")) {
      return;
    }

    var delay = parseFloat(window.getComputedStyle(item).getPropertyValue("--delay")) || 0;

    window.setTimeout(function () {
      item.classList.add("is-settled");
      item.style.setProperty("--delay", "0ms");
    }, delay + 720);
  };

  var showAll = function () {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
      item.classList.add("is-settled");
      item.style.setProperty("--delay", "0ms");
    });
  };

  var initAmbientParticles = function () {
    var canvas = document.querySelector(".ambient-particles");

    if (!canvas || reducedMotion || !canvas.getContext) {
      return;
    }

    var context = canvas.getContext("2d");
    var particles = [];
    var width = 0;
    var height = 0;
    var dpr = 1;
    var animationFrame = 0;

    var randomBetween = function (min, max) {
      return min + Math.random() * (max - min);
    };

    var createParticle = function () {
      var heroBand = Math.max(height * 0.46, 320);

      return {
        x: randomBetween(0, width),
        y: randomBetween(0, heroBand),
        vx: randomBetween(-0.075, 0.075),
        vy: randomBetween(-0.03, 0.06),
        size: randomBetween(0.8, 2),
        alpha: randomBetween(0.1, 0.26),
        tint: Math.random() > 0.66 ? "warm" : "cool"
      };
    };

    var seedParticles = function () {
      var count = Math.max(14, Math.min(28, Math.round(width / 72)));
      particles = [];

      for (var index = 0; index < count; index += 1) {
        particles.push(createParticle());
      }
    };

    var resizeCanvas = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    };

    var wrapParticle = function (particle) {
      var heroBand = Math.max(height * 0.52, 360);

      if (particle.x < -40) {
        particle.x = width + 40;
      } else if (particle.x > width + 40) {
        particle.x = -40;
      }

      if (particle.y < -40) {
        particle.y = heroBand + 30;
      } else if (particle.y > heroBand + 40) {
        particle.y = -30;
      }
    };

    var drawParticle = function (particle) {
      var gradient = context.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 10
      );
      var glowColor = particle.tint === "warm" ? "228, 193, 140" : "140, 167, 216";

      gradient.addColorStop(0, "rgba(" + glowColor + ", " + particle.alpha + ")");
      gradient.addColorStop(1, "rgba(" + glowColor + ", 0)");

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size * 5.6, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "rgba(255, 255, 255, " + Math.min(particle.alpha + 0.08, 0.38) + ")";
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    };

    var drawConnections = function () {
      for (var i = 0; i < particles.length; i += 1) {
        for (var j = i + 1; j < particles.length; j += 1) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 180) {
            continue;
          }

          var strength = (1 - distance / 180) * 0.075;
          context.strokeStyle = "rgba(255, 255, 255, " + strength.toFixed(3) + ")";
          context.lineWidth = 0.9;
          context.beginPath();
          context.moveTo(particles[i].x, particles[i].y);
          context.lineTo(particles[j].x, particles[j].y);
          context.stroke();
        }
      }
    };

    var tick = function () {
      context.clearRect(0, 0, width, height);

      for (var index = 0; index < particles.length; index += 1) {
        var particle = particles[index];

        particle.x += particle.vx;
        particle.y += particle.vy;

        wrapParticle(particle);
      }

      drawConnections();
      particles.forEach(drawParticle);
      animationFrame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animationFrame = window.requestAnimationFrame(tick);

    window.addEventListener("beforeunload", function () {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    });
  };

  initAmbientParticles();

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
            settleRevealItem(entry.target);
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
          settleRevealItem(item);
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

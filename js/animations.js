(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const hero = document.getElementById("hero");
  const roleEl = document.querySelector(".hero__role");

  function initHero() {
    if (!hero) return;

    if (prefersReducedMotion) {
      hero.classList.add("is-loaded");
      if (roleEl) roleEl.classList.add("is-typing-done");
      return;
    }

    requestAnimationFrame(function () {
      hero.classList.add("is-loaded");
    });

    if (roleEl && roleEl.dataset.roleText) {
      typeRoleText(roleEl, roleEl.dataset.roleText);
    }
  }

  function typeRoleText(el, fullText) {
    el.textContent = "";
    let i = 0;
    const speed = 22;

    function step() {
      if (i <= fullText.length) {
        el.textContent = fullText.slice(0, i);
        i += 1;
        setTimeout(step, speed);
      } else {
        el.classList.add("is-typing-done");
      }
    }

    setTimeout(step, 700);
  }

  initHero();

  if (prefersReducedMotion) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
    document.querySelectorAll(".section__header.reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  const reveals = document.querySelectorAll(".reveal");

  if (!reveals.length || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.12,
    }
  );

  reveals.forEach(function (el) {
    observer.observe(el);
  });

  const skillsSection = document.getElementById("skills");
  if (skillsSection && "IntersectionObserver" in window) {
    const chipObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll(".chip").forEach(function (chip, idx) {
            setTimeout(function () {
              chip.classList.add("is-pulsed");
            }, idx * 60);
          });
          chipObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.25 }
    );
    chipObserver.observe(skillsSection);
  }
})();

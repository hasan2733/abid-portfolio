(function () {
  "use strict";

  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.querySelector(".nav__menu");
  const navLinks = document.querySelectorAll(".nav__link[href^='#']");
  const sections = document.querySelectorAll("section[id]");

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Mobile menu
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("is-open");
      navToggle.setAttribute(
        "aria-label",
        expanded ? "Open menu" : "Close menu"
      );
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });

    document.addEventListener("click", function (e) {
      if (
        navMenu.classList.contains("is-open") &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  // Active nav link on scroll
  function setActiveNav() {
    const scrollY = window.scrollY + 120;
    let current = "";

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = section.getAttribute("id") || "";
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === "#" + current) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }

  const siteHeader = document.querySelector(".site-header");

  function onScroll() {
    setActiveNav();
    if (siteHeader) {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Smooth scroll for anchor links (enhancement)
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });
})();

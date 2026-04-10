document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  setupSmoothAnchorOffset();
  setupActiveNavState();
  setupFaq();
  setupInlineChipToggle();
  setupRequestTypeCards();
  setupDismissibleAlerts();
});

function setCurrentYear() {
  const yearTarget = document.getElementById("currentYear");
  if (!yearTarget) return;

  yearTarget.textContent = String(new Date().getFullYear());
}


function setupSmoothAnchorOffset() {
  const internalAnchors = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  internalAnchors.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId) return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      event.preventDefault();

      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.offsetHeight : 0;
      const extraOffset = 16;

      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight -
        extraOffset;

      window.scrollTo({
        top: Math.max(targetPosition, 0),
        behavior: "smooth",
      });

      history.replaceState(null, "", targetId);
    });
  });
}


function setupActiveNavState() {
  const navLinks = document.querySelectorAll(".site-nav .nav-link");
  if (!navLinks.length) return;

  const currentPath = normalizePath(window.location.pathname);
  const currentHash = window.location.hash;

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    link.classList.remove("is-active");
    link.removeAttribute("aria-current");

    if (href.startsWith("#")) {
      if (currentPath.endsWith("index.html") || currentPath === "/") {
        if (currentHash && href === currentHash) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "page");
        }
      }
    } else {
      const linkPath = normalizePath(href);
      if (currentPath.endsWith(linkPath) || currentPath === `/${linkPath}`) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    }
  });

  if (!currentHash && (currentPath.endsWith("index.html") || currentPath === "/")) {
    const homeLink = document.querySelector('.site-nav .nav-link[href="#inicio"]');
    if (homeLink) {
      homeLink.classList.add("is-active");
      homeLink.setAttribute("aria-current", "page");
    }
  }

  window.addEventListener("hashchange", () => {
    navLinks.forEach((link) => {
      if (!link.getAttribute("href")?.startsWith("#")) return;

      link.classList.remove("is-active");
      link.removeAttribute("aria-current");

      if (link.getAttribute("href") === window.location.hash) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  });
}


function setupFaq() {
  const faqButtons = document.querySelectorAll(".faq-item__button");
  if (!faqButtons.length) return;

  faqButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const controlsId = button.getAttribute("aria-controls");
      if (!controlsId) return;

      const content = document.getElementById(controlsId);
      if (!content) return;

      const isExpanded = button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!isExpanded));
      content.hidden = isExpanded;
    });
  });
}


function setupInlineChipToggle() {
  const chipGroups = document.querySelectorAll("[data-chip-group]");
  if (!chipGroups.length) return;

  chipGroups.forEach((group) => {
    const chips = group.querySelectorAll(".chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const isSingleSelect = group.getAttribute("data-chip-group") !== "multi";

        if (isSingleSelect) {
          chips.forEach((item) => {
            item.classList.remove("is-active");
            item.setAttribute("aria-pressed", "false");
          });
        }

        const wasPressed = chip.getAttribute("aria-pressed") === "true";
        const nextPressed = isSingleSelect ? true : !wasPressed;

        chip.classList.toggle("is-active", nextPressed);
        chip.setAttribute("aria-pressed", String(nextPressed));
      });
    });
  });
}

function setupRequestTypeCards() {
  const requestCards = document.querySelectorAll(".request-type-card");
  if (!requestCards.length) return;

  requestCards.forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");

    const activateCard = () => {
      requestCards.forEach((item) => item.classList.remove("is-active"));
      card.classList.add("is-active");

      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };

    card.addEventListener("click", activateCard);

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateCard();
      }
    });
  });
}


function setupDismissibleAlerts() {
  const dismissButtons = document.querySelectorAll("[data-dismiss-target]");
  if (!dismissButtons.length) return;

  dismissButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selector = button.getAttribute("data-dismiss-target");
      if (!selector) return;

      const target = document.querySelector(selector);
      if (!target) return;

      target.classList.add("is-hidden");
    });
  });
}

/**
 * @param {string} path
 * @returns {string}
 */
function normalizePath(path) {
  if (!path) return "/";
  const cleaned = path.split("?")[0].split("#")[0];

  if (cleaned.endsWith("/")) return cleaned;
  return cleaned.split("/").pop() || "/";
}
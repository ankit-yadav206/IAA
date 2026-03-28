const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const reveals = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const leadForm = document.querySelector("#leadForm");
const formMessage = document.querySelector("#formMessage");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.18 }
);

reveals.forEach((element) => {
  revealObserver.observe(element);
});

const animateCounter = (element) => {
  const target = Number(element.dataset.counter || 0);
  const duration = 1500;
  const startTime = performance.now();

  const step = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.7 }
);

counters.forEach((counter) => {
  counterObserver.observe(counter);
});

const getStoredLeads = () => {
  try {
    return JSON.parse(localStorage.getItem("iaa_leads") || "[]");
  } catch (error) {
    return [];
  }
};

const storeLead = (lead) => {
  const leads = getStoredLeads();
  leads.push(lead);
  localStorage.setItem("iaa_leads", JSON.stringify(leads));
};

if (leadForm && formMessage) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const data = Object.fromEntries(formData.entries());
    const updatesEnabled = formData.get("updates") === "on";

    const phoneDigits = String(data.phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      formMessage.textContent = "Please enter a valid phone number with at least 10 digits.";
      formMessage.className = "form-note error";
      return;
    }

    const leadRecord = {
      ...data,
      updates: updatesEnabled,
      createdAt: new Date().toISOString(),
    };

    storeLead(leadRecord);

    formMessage.textContent =
      "Inquiry saved successfully. This demo stores the lead in your browser and is ready to connect with your CRM or backend.";
    formMessage.className = "form-note success";
    leadForm.reset();
  });
}

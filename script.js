"use strict";
// Core content, contact links and native FAQ remain usable without JavaScript.
document.documentElement.classList.add("has-js");
const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("mobile-menu");
const stickyContact = document.querySelector(".mobile-contact");
const hero = document.querySelector(".hero");
const contact = document.getElementById("contact");
const mobile = window.matchMedia("(max-width: 699px)");
const compactNav = window.matchMedia("(max-width: 999px)");
let heroVisible = true;
let contactVisible = false;
let menuOpen = false;

function updateContact() {
  stickyContact.hidden = !mobile.matches || heroVisible || contactVisible || menuOpen;
}
function setMenu(open, restoreFocus = false) {
  menuOpen = open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".menu-label").textContent = open ? "Закрыть" : "Меню";
  menu.hidden = !open;
  updateContact();
  if (restoreFocus) toggle.focus();
}
toggle.hidden = false;
toggle.addEventListener("click", () => setMenu(!menuOpen));
menu.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  setMenu(false);
  const target = document.querySelector(link.getAttribute("href"));
  if (target) {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuOpen) setMenu(false, true);
});
document.addEventListener("click", (event) => {
  if (menuOpen && !event.target.closest(".site-header")) setMenu(false);
});
compactNav.addEventListener("change", () => {
  if (!compactNav.matches) setMenu(false);
});
mobile.addEventListener("change", updateContact);
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === contact) contactVisible = entry.isIntersecting;
      }
      updateContact();
    },
    { threshold: 0 },
  );
  observer.observe(hero);
  observer.observe(contact);
}
document.getElementById("year").textContent = new Date().getFullYear();

// Copy only on an explicit click; keep the phone selectable if clipboard access fails.
const copyButton = document.querySelector(".copy-number");
const phoneInput = document.getElementById("contact-phone");
const copyStatus = document.getElementById("copy-status");
copyButton.hidden = false;
copyButton.addEventListener("click", async () => {
  copyButton.disabled = true;
  copyStatus.textContent = "";
  let copied = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText("+79289087078");
      copied = true;
    }
  } catch {
    // Some browsers deny Clipboard API access. Try copying the visible number.
  }
  if (!copied) {
    phoneInput.focus({ preventScroll: true });
    phoneInput.select();
    phoneInput.setSelectionRange(0, phoneInput.value.length);
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
  }
  copyButton.disabled = false;
  if (copied) {
    copyStatus.textContent = "Номер скопирован. Вставьте его в поиск мессенджера.";
    copyButton.focus({ preventScroll: true });
  } else {
    copyStatus.textContent = "Номер выделен. Нажмите и удерживайте его, чтобы скопировать вручную.";
  }
});

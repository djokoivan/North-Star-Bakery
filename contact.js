"use strict";

/* ==========================================================
   contact.js - form validation and pre-fill (contact.html)
   1. Validates each field on submit and shows a message next to it;
      fields with an error are re-checked live while the user fixes them.
   2. Pre-fills "Item details" from the pre-order list that
      the visitor saved on products.html (localStorage).
   Requires shared.js.
   ========================================================== */

const form = document.getElementById("preorder-form");
const statusEl = document.getElementById("form-status");
const prefillNote = document.getElementById("prefill-note");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{3}-\d{3}-\d{4}$/;

/* One validator per field (an object of functions).
   Each returns an error message, or "" when the value is fine. */
const validators = {
  name: function (value) {
    if (value.trim() === "") { return "Please enter your name."; }
    if (value.trim().length < 2) { return "Your name must be at least 2 characters."; }
    return "";
  },
  email: function (value) {
    if (value.trim() === "") { return "Please enter your email address."; }
    if (!EMAIL_PATTERN.test(value.trim())) { return "Enter a valid email address, like name@example.com."; }
    return "";
  },
  phone: function (value) {
    if (value.trim() !== "" && !PHONE_PATTERN.test(value.trim())) {
      return "Use the format 541-555-0100, or leave this blank.";
    }
    return "";
  },
  "pickup-date": function (value) {
    if (value === "") { return "Please choose a pickup date."; }
    if (value < todayISO()) { return "Pickup date cannot be in the past."; }
    return "";
  },
  "request-type": function (value) {
    return value === "" ? "Please choose a request type." : "";
  },
  "item-details": function (value) {
    const length = value.trim().length;
    if (length === 0) { return "Please tell us what you would like."; }
    if (length < 10) { return "Please add a little more detail (at least 10 characters). You have " + length + "."; }
    if (length > 500) { return "Please keep item details under 500 characters. You have " + length + "."; }
    return "";
  },
  allergies: function (value) {
    return value.length > 300 ? "Allergy notes must be 300 characters or fewer." : "";
  }
};

/* ---------- Helpers ---------- */

/** Today's date as YYYY-MM-DD in the visitor's local time zone. */
function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function getErrorEl(field) {
  return document.getElementById(field.id + "-error");
}

/** Show or clear the message next to a field. */
function showError(field, message) {
  const errorEl = getErrorEl(field);
  errorEl.textContent = message ? "Error: " + message : "";
  if (message) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }
}

/** Validate one field. Returns true when it is valid. */
function validateField(field) {
  const message = validators[field.id](field.value);
  showError(field, message);
  return message === "";
}

/** Validate every field; return the list of invalid fields. */
function findInvalidFields() {
  return Array.from(form.elements).filter(function (field) {
    return validators[field.id] && !validateField(field);
  });
}

/* ---------- Pre-fill from the saved pre-order list ---------- */

function prefillFromSavedList() {
  const list = loadList();
  const details = document.getElementById("item-details");
  if (list.length === 0 || details.value.trim() !== "") { return; }

  details.value = listToText(list);
  const typeSelect = document.getElementById("request-type");
  if (typeSelect.value === "") { typeSelect.value = "pre-order"; }

  const total = estimateTotal(list);
  prefillNote.textContent = "We filled in " + countItems(list) + " item(s) from your saved pre-order list (estimated " +
    formatPrice(total.low) + " to " + formatPrice(total.high) + "). Edit anything you like.";
  prefillNote.hidden = false;
}

/* ---------- Events ---------- */

form.addEventListener("submit", function (event) {
  event.preventDefault();               // never let invalid data go through
  statusEl.textContent = "";
  const invalid = findInvalidFields();

  if (invalid.length > 0) {
    statusEl.textContent = "Please fix " + invalid.length + (invalid.length === 1 ? " field" : " fields") + " below, then send again. Your other answers are kept.";
    invalid[0].focus();
    return;
  }

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  statusEl.textContent = "Thank you, " + name + "! We received your request and will reply to " + email + " within one business day.";
  saveList([]);                         // the list has been sent, so clear it
  form.reset();
  prefillNote.hidden = true;
  statusEl.focus();
});

// Errors are shown when the form is submitted (not when a field loses focus:
// a message appearing on blur pushes the Send button down and the click misses it).
// After a field shows an error, re-check it as the user types or changes it,
// so the message disappears as soon as the problem is fixed.
form.addEventListener("input", function (event) {
  if (validators[event.target.id] && event.target.hasAttribute("aria-invalid")) {
    validateField(event.target);
  }
});

/* ---------- Start ---------- */
document.getElementById("pickup-date").min = todayISO();
prefillFromSavedList();

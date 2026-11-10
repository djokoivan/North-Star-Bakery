"use strict";

/* ==========================================================
   shared.js - data and storage helpers used by products.js
   and contact.js (load this file first on both pages)
   ========================================================== */

// Key used to save the visitor's pre-order list in localStorage
const STORAGE_KEY = "northStarPreOrderList";
const MAX_QUANTITY = 24;

// Product catalog (array of objects). Prices match products.html.
const PRODUCTS = [
  { id: "signature-loaf",    name: "Signature Loaf",                category: "Breads",    low: 8,    high: 10,  unit: "each" },
  { id: "sourdough-country", name: "Sourdough and Country Loaves",  category: "Breads",    low: 7,    high: 10,  unit: "each" },
  { id: "seeded-whole-grain", name: "Seeded and Whole-Grain Breads", category: "Breads",   low: 8,    high: 11,  unit: "each" },
  { id: "dinner-rolls",      name: "Dinner Rolls",                  category: "Breads",    low: 6,    high: 12,  unit: "per order" },
  { id: "morning-pastries",  name: "Morning Pastries",              category: "Pastries",  low: 3.5,  high: 5.5, unit: "each" },
  { id: "cookies",           name: "Cookies",                       category: "Pastries",  low: 2.5,  high: 3.5, unit: "each" },
  { id: "celebration-cakes", name: "Celebration Cakes",             category: "Cakes",     low: 35,   high: 85,  unit: "per cake" },
  { id: "event-platters",    name: "Event Platters",                category: "Cakes",     low: 40,   high: 150, unit: "per platter" }
];

/** Return the product object for an id, or undefined. */
function findProduct(id) {
  return PRODUCTS.find(function (product) {
    return product.id === id;
  });
}

/** Check that a saved entry looks like { id, quantity } for a real product. */
function isValidEntry(entry) {
  return Boolean(entry) &&
    Boolean(findProduct(entry.id)) &&
    Number.isInteger(entry.quantity) &&
    entry.quantity >= 1 &&
    entry.quantity <= MAX_QUANTITY;
}

/** Load the saved list from localStorage (an array of { id, quantity }). */
function loadList() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.filter(isValidEntry) : [];
  } catch (error) {
    return []; // storage blocked or data corrupted: start with an empty list
  }
}

/** Save the list to localStorage. */
function saveList(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    // Storage unavailable (private mode, etc.): the page still works without saving.
  }
}

/** Format a number as dollars, e.g. 8 -> "$8.00". */
function formatPrice(amount) {
  return "$" + amount.toFixed(2);
}

/** Add up the low and high estimates for every item in the list. */
function estimateTotal(list) {
  return list.reduce(function (total, entry) {
    const product = findProduct(entry.id);
    total.low += product.low * entry.quantity;
    total.high += product.high * entry.quantity;
    return total;
  }, { low: 0, high: 0 });
}

/** Turn the list into text lines such as "2 x Signature Loaf". */
function listToText(list) {
  return list.map(function (entry) {
    return entry.quantity + " x " + findProduct(entry.id).name;
  }).join("\n");
}

/** Count all items (adds up quantities). */
function countItems(list) {
  return list.reduce(function (sum, entry) {
    return sum + entry.quantity;
  }, 0);
}

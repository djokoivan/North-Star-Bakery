"use strict";

/* ==========================================================
   products.js - "My Pre-Order List" feature (products.html)
   Visitors add products, change quantities, and see an
   estimated price range. The list is saved in localStorage
   so it is still there after a refresh and on contact.html.
   Requires shared.js.
   ========================================================== */

let preOrderList = loadList();   // array of { id, quantity }

const listItemsEl = document.getElementById("list-items");
const listStatusEl = document.getElementById("list-status");
const listTotalEl = document.getElementById("list-total");
const clearButton = document.getElementById("clear-list");
const sendLink = document.getElementById("send-list");

/* ---------- Data changes (each updates the array, saves, redraws) ---------- */

function isInList(id) {
  return preOrderList.some(function (entry) {
    return entry.id === id;
  });
}

function addItem(id) {
  if (!isInList(id)) {
    preOrderList.push({ id: id, quantity: 1 });
  }
  update("Added " + findProduct(id).name + " to your list.");
}

function removeItem(id) {
  preOrderList = preOrderList.filter(function (entry) {
    return entry.id !== id;
  });
  update("Removed " + findProduct(id).name + " from your list.");
}

function setQuantity(id, value) {
  const quantity = Math.min(MAX_QUANTITY, Math.max(1, parseInt(value, 10) || 1));
  preOrderList.forEach(function (entry) {
    if (entry.id === id) {
      entry.quantity = quantity;
    }
  });
  update("");
}

function clearList() {
  preOrderList = [];
  update("Your pre-order list is now empty.");
}

/** Save, then redraw everything that depends on the list. */
function update(message) {
  saveList(preOrderList);
  renderList();
  renderButtons();
  listStatusEl.textContent = message || summaryText();
}

/* ---------- Drawing the page ---------- */

function summaryText() {
  if (preOrderList.length === 0) {
    return "Your list is empty. Choose \"Add to my pre-order list\" under any product below.";
  }
  const count = countItems(preOrderList);
  return "You have " + count + (count === 1 ? " item" : " items") + " in your list. It is saved on this device.";
}

/** Create the Add / Remove button under each product. */
function renderButtons() {
  document.querySelectorAll(".product-action").forEach(function (box) {
    const id = box.dataset.productId;
    let button = box.querySelector("button");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.productId = id;
      box.appendChild(button);
    }
    const added = isInList(id);
    button.textContent = added ? "Remove from my list" : "Add to my pre-order list";
    button.setAttribute("aria-pressed", String(added));
    button.setAttribute("aria-label", (added ? "Remove " : "Add ") + findProduct(id).name + (added ? " from" : " to") + " my pre-order list");
  });
}

/** Build one <li> for a list entry. */
function buildListItem(entry) {
  const product = findProduct(entry.id);
  const item = document.createElement("li");

  const name = document.createElement("strong");
  name.textContent = product.name;

  const price = document.createElement("span");
  price.textContent = formatPrice(product.low) + "–" + formatPrice(product.high) + " " + product.unit;

  const label = document.createElement("label");
  label.htmlFor = "qty-" + product.id;
  label.textContent = "Quantity";

  const input = document.createElement("input");
  input.type = "number";
  input.id = "qty-" + product.id;
  input.min = "1";
  input.max = String(MAX_QUANTITY);
  input.value = String(entry.quantity);
  input.dataset.productId = product.id;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.dataset.removeId = product.id;
  remove.textContent = "Remove";
  remove.setAttribute("aria-label", "Remove " + product.name + " from my list");

  item.append(name, price, label, input, remove);
  return item;
}

function renderList() {
  listItemsEl.replaceChildren(...preOrderList.map(buildListItem));

  const hasItems = preOrderList.length > 0;
  clearButton.hidden = !hasItems;
  sendLink.hidden = !hasItems;
  listTotalEl.hidden = !hasItems;

  if (hasItems) {
    const total = estimateTotal(preOrderList);
    listTotalEl.textContent = "Estimated total: " + formatPrice(total.low) + " to " + formatPrice(total.high) +
      " (final price confirmed by the bakery).";
  }
}

/* ---------- Events (one listener per type, using delegation) ---------- */

document.addEventListener("click", function (event) {
  const target = event.target;
  if (target.matches(".product-action button")) {
    const id = target.dataset.productId;
    if (isInList(id)) {
      removeItem(id);
    } else {
      addItem(id);
    }
    // keep keyboard focus on the same product's button after the redraw
    const again = document.querySelector('.product-action button[data-product-id="' + id + '"]');
    if (again) { again.focus(); }
  } else if (target.dataset.removeId) {
    removeItem(target.dataset.removeId);
    listStatusEl.focus(); // the removed row is gone, so move focus to the status message
  }
});

listItemsEl.addEventListener("change", function (event) {
  if (event.target.matches('input[type="number"]')) {
    setQuantity(event.target.dataset.productId, event.target.value);
  }
});

clearButton.addEventListener("click", clearList);

/* ---------- Start: load saved list and draw ---------- */
update("");

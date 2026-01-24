'use strict';

// Small shared state bucket for command & sim modules.
// Avoids circular-dependency issues.

let intervalDays = 1;

let pendingScriptText = null;

function setIntervalDays(n) {
  intervalDays = Math.max(1, n | 0);
}
function getIntervalDays() {
  return intervalDays;
}

function setPendingScriptText(text) {
  pendingScriptText = text != null ? String(text) : null;
}
function consumePendingScriptText() {
  const t = pendingScriptText;
  pendingScriptText = null;
  return t;
}

module.exports = {
  setIntervalDays,
  getIntervalDays,
  consumePendingScriptText,
  setPendingScriptText,
};

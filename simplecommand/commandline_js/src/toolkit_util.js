'use strict';

// Shared helpers for the JS port.

function draw_error(error_text, location, line_number) {
  const loc = location || 'unknown';
  const line = Number.isFinite(line_number) ? line_number : 0;
  process.stderr.write(`ERROR: ${String(error_text)} @ ${loc} ${line}\n`);
  return -1;
}

// C macro SHOW_ERROR(val) -> draw_error(val, __FILE__, __LINE__).
// In JS, we don't have those macros, so we use a stable location.
function SHOW_ERROR(val) {
  return draw_error(val, 'js', 0);
}

module.exports = {
  draw_error,
  SHOW_ERROR,
};

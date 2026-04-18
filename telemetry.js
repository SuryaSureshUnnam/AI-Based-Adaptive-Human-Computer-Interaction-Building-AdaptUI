/**
 * telemetry.js
 * Behavioral telemetry engine for AdaptUI.
 * Tracks user interaction signals and computes an engagement score
 * used by the profile classifier.
 *
 * MSAI-631 – AI for Human-Computer Interaction
 * University of the Cumberlands, Spring 2026
 */

'use strict';

const Telemetry = (() => {
  // ── Internal state ──────────────────────────────────────────────────────
  const state = {
    clicks: 0,
    messages: 0,
    tabSwitches: 0,
    scrollDepth: 0,       // 0–100 (percent of page height)
    sessionStart: Date.now(),
  };

  // Weighted engagement score formula:
  //   Messages carry the most weight (high-intent action)
  //   Tab switches reflect deliberate navigation
  //   Clicks are noisiest, so lowest weight
  const WEIGHTS = { click: 1, message: 3, tabSwitch: 2 };

  // Listeners registered externally so we can remove them if needed
  const _handlers = {};

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Start capturing DOM events.
   * @param {Function} onChange  Called with the full state object after every update.
   */
  function init(onChange) {
    _handlers.click = () => {
      state.clicks++;
      onChange({ ...state, score: score() });
    };

    _handlers.scroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const depth = Math.round((window.scrollY / maxScroll) * 100);
        state.scrollDepth = Math.max(state.scrollDepth, depth);
        onChange({ ...state, score: score() });
      }
    };

    document.addEventListener('click',  _handlers.click);
    document.addEventListener('scroll', _handlers.scroll, { passive: true });
  }

  /** Tear down event listeners (useful for SPA route changes). */
  function destroy() {
    document.removeEventListener('click',  _handlers.click);
    document.removeEventListener('scroll', _handlers.scroll);
  }

  /** Increment message count (called by chat module on each send). */
  function recordMessage() {
    state.messages++;
  }

  /** Increment tab-switch count (called by navigation module). */
  function recordTabSwitch() {
    state.tabSwitches++;
  }

  /** Compute the current weighted engagement score. */
  function score() {
    return (
      state.clicks     * WEIGHTS.click     +
      state.messages   * WEIGHTS.message   +
      state.tabSwitches * WEIGHTS.tabSwitch
    );
  }

  /** Return a snapshot of the current state (immutable copy). */
  function snapshot() {
    return { ...state, score: score() };
  }

  /** Return elapsed session time in seconds. */
  function sessionSeconds() {
    return Math.floor((Date.now() - state.sessionStart) / 1000);
  }

  return { init, destroy, recordMessage, recordTabSwitch, score, snapshot, sessionSeconds };
})();

// Export for use in Node/bundler environments; no-op in plain browser context
if (typeof module !== 'undefined') module.exports = Telemetry;

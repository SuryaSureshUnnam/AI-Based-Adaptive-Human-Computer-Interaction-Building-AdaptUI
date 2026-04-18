/**
 * adaptations.js
 * Adaptation engine for AdaptUI.
 * Applies UI changes in response to profile transitions detected by
 * classifier.js.  All adaptations are idempotent and will not re-apply
 * if they have already fired.
 *
 * Design principle: automatic adaptations must never override a deliberate
 * user preference (e.g. an accessibility toggle the user has set manually).
 *
 * MSAI-631 – AI for Human-Computer Interaction
 * University of the Cumberlands, Spring 2026
 */

'use strict';

const AdaptationEngine = (() => {
  // Track which adaptations have already been applied so they don't fire twice
  const _applied = new Set();

  // Counter exposed to the dashboard
  let _count = 0;

  // Optional callback called after each successful adaptation
  let _onAdapt = null;

  // ── Helpers ─────────────────────────────────────────────────────────────

  /** Set a CSS custom property on :root */
  function setCSSVar(name, value) {
    document.documentElement.style.setProperty(name, value);
  }

  /**
   * Enable dark mode, but only if the user has not already overridden it.
   * Reads the state of the manual dark-mode toggle before acting.
   */
  function enableDarkMode() {
    const tog = document.getElementById('tog-dark');
    if (tog && tog.checked) return;   // user already set it manually — respect that
    document.body.classList.add('dark');
    if (tog) tog.checked = true;
  }

  /** Show a temporary notification banner */
  function notify(msg) {
    const el = document.getElementById('notif');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4500);
  }

  // ── Adaptation library ───────────────────────────────────────────────────
  // Each entry: key (profile id), value (function that applies the adaptation)
  const ADAPTATIONS = {

    explorer: () => {
      // Surface the hint elements that are hidden by default for novice users
      document.querySelectorAll('[data-hint]').forEach(el => {
        el.style.display = 'block';
      });
      notify('🔍 Explorer detected – tips and hints enabled!');
    },

    poweruser: () => {
      // Enable dark mode (respects manual override check inside enableDarkMode)
      enableDarkMode();
      // Tighten spacing and reduce font size slightly for a denser layout
      setCSSVar('--spacing',   '0.7rem');
      setCSSVar('--font-size', '14px');
      notify('⚡ Power User detected – dark mode and compact layout applied!');
    },

    expert: () => {
      // Shift accent colour to violet as a visual reward for high engagement
      setCSSVar('--primary',   '#7c3aed');
      setCSSVar('--primary-d', '#6d28d9');
      notify('🏆 Expert unlocked – all advanced features active!');
    },
  };

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Register a callback that fires after each successful adaptation.
   * @param {Function} cb  (adaptationKey, count) => void
   */
  function onAdapt(cb) {
    _onAdapt = cb;
  }

  /**
   * Apply the adaptation for the given profile id if not already applied.
   * @param {string} profileId  e.g. 'poweruser'
   */
  function apply(profileId) {
    if (_applied.has(profileId)) return;
    const fn = ADAPTATIONS[profileId];
    if (!fn) return;                  // 'novice' has no special adaptation

    _applied.add(profileId);
    fn();
    _count++;
    if (_onAdapt) _onAdapt(profileId, _count);
  }

  /** Return the total number of adaptations applied this session. */
  function count() {
    return _count;
  }

  /** Return a copy of the set of applied adaptation keys. */
  function applied() {
    return new Set(_applied);
  }

  return { onAdapt, apply, count, applied };
})();

if (typeof module !== 'undefined') module.exports = AdaptationEngine;

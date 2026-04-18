/**
 * classifier.js
 * User profile classifier for AdaptUI.
 * Maps a numeric engagement score (from telemetry.js) to one of four
 * behavioral archetypes and fires callbacks on profile transitions.
 *
 * MSAI-631 – AI for Human-Computer Interaction
 * University of the Cumberlands, Spring 2026
 */

'use strict';

const Classifier = (() => {
  // ── Profile definitions ─────────────────────────────────────────────────
  // Each profile has a minimum score threshold, display metadata,
  // and an adaptation descriptor used by the adaptation engine.
  const PROFILES = {
    novice: {
      id: 'novice',
      threshold: 0,
      emoji: '🌱',
      label: 'Novice',
      badgeText: 'Novice User',
      description: 'Getting started – simplified layout active',
      systemPromptHint:
        'The user is a novice. Use simple language, avoid jargon, be encouraging.',
    },
    explorer: {
      id: 'explorer',
      threshold: 10,
      emoji: '🔍',
      label: 'Explorer',
      badgeText: 'Explorer',
      description: 'Curious learner – extra tips surfaced',
      systemPromptHint:
        'The user is an explorer. Use a friendly tone, introduce new concepts gently.',
    },
    poweruser: {
      id: 'poweruser',
      threshold: 25,
      emoji: '⚡',
      label: 'Power User',
      badgeText: 'Power User',
      description: 'Frequent user – compact layout applied',
      systemPromptHint:
        'The user is a power user. Be concise; assume basic familiarity with the subject.',
    },
    expert: {
      id: 'expert',
      threshold: 50,
      emoji: '🏆',
      label: 'Expert',
      badgeText: 'Expert',
      description: 'High engagement – advanced features unlocked',
      systemPromptHint:
        'The user is an expert. Be terse and technical; peer-level tone.',
    },
  };

  // Ordered list of profiles from highest threshold to lowest,
  // used for efficient score-to-profile lookup.
  const PROFILE_ORDER = ['expert', 'poweruser', 'explorer', 'novice'];

  // ── Internal state ──────────────────────────────────────────────────────
  let _currentProfileId = 'novice';
  let _onTransition = null;   // callback: (prevProfile, nextProfile) => void

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Register a callback that fires whenever the profile changes.
   * @param {Function} cb  (prevProfile, nextProfile) => void
   */
  function onTransition(cb) {
    _onTransition = cb;
  }

  /**
   * Evaluate the current score and update the profile if needed.
   * Should be called after every telemetry update.
   * @param {number} score  Current engagement score from Telemetry.score()
   */
  function evaluate(score) {
    const nextId = classify(score);
    if (nextId !== _currentProfileId) {
      const prev = PROFILES[_currentProfileId];
      const next = PROFILES[nextId];
      _currentProfileId = nextId;
      if (_onTransition) _onTransition(prev, next);
    }
  }

  /**
   * Map a score to a profile id without triggering a transition callback.
   * @param {number} score
   * @returns {string}  Profile id
   */
  function classify(score) {
    for (const id of PROFILE_ORDER) {
      if (score >= PROFILES[id].threshold) return id;
    }
    return 'novice';
  }

  /** Return the current profile object (immutable reference). */
  function currentProfile() {
    return PROFILES[_currentProfileId];
  }

  /** Return a profile object by id. */
  function getProfile(id) {
    return PROFILES[id] || PROFILES.novice;
  }

  /** Return all profile objects (for UI rendering). */
  function allProfiles() {
    return { ...PROFILES };
  }

  return { onTransition, evaluate, classify, currentProfile, getProfile, allProfiles };
})();

if (typeof module !== 'undefined') module.exports = Classifier;

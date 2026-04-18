/**
 * suggestions.js
 * Profile-aware suggestion bank for AdaptUI.
 * Returns a list of contextual tips matched to the current user profile.
 * Each suggestion can also be applied as an action when the user clicks it.
 *
 * MSAI-631 – AI for Human-Computer Interaction
 * University of the Cumberlands, Spring 2026
 */

'use strict';

const Suggestions = (() => {
  // ── Suggestion bank ───────────────────────────────────────────────────────
  // Keyed by profile id.  Each suggestion has:
  //   icon  – emoji for visual scan-ability
  //   title – short action-oriented label
  //   desc  – one-sentence explanation
  //   action (optional) – function to run when the user taps the suggestion
  const BANK = {
    novice: [
      {
        icon: '💬',
        title: 'Try the AI Chat',
        desc: 'Type a question in the Chat tab — the assistant will walk you through anything.',
      },
      {
        icon: '🎨',
        title: 'Explore the theme toggles',
        desc: 'Use the sidebar to switch between light, dark, and high-contrast modes.',
      },
      {
        icon: '📊',
        title: 'Open the Dashboard',
        desc: 'The Dashboard tab shows your live engagement metrics as you interact.',
      },
    ],
    explorer: [
      {
        icon: '⌨️',
        title: 'Use the Enter key',
        desc: 'Press Enter in the chat input to send messages without reaching for the mouse.',
      },
      {
        icon: '🔄',
        title: 'Switch between tabs',
        desc: 'Navigating tabs increases your engagement score and unlocks new profile levels.',
      },
      {
        icon: '🌙',
        title: 'Try dark mode',
        desc: 'Dark mode reduces eye strain for longer work sessions — flip the sidebar toggle.',
      },
    ],
    poweruser: [
      {
        icon: '📌',
        title: 'Bookmark this app',
        desc: 'Add AdaptUI to your bookmarks bar for fast daily access.',
      },
      {
        icon: '🧩',
        title: 'Combine accessibility modes',
        desc: 'Large text plus dark mode is great for sustained coding or reading sessions.',
      },
      {
        icon: '📈',
        title: 'Watch your adaptation count',
        desc: 'The Dashboard logs every time the UI adapts to your behaviour — see how many fire.',
      },
    ],
    expert: [
      {
        icon: '🔧',
        title: 'Fork the source code',
        desc: 'Clone the GitHub repo and extend the adaptation engine with your own rules.',
      },
      {
        icon: '🤖',
        title: 'Swap the model',
        desc: 'Replace the model string in chat.js to benchmark different LLMs side by side.',
      },
      {
        icon: '📡',
        title: 'Add MCP tool servers',
        desc: 'Pass mcp_servers into the API payload to give the assistant real-world tools.',
      },
    ],
  };

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Return the list of suggestions for a given profile id.
   * Falls back to 'novice' if the id is unrecognised.
   * @param {string} profileId
   * @returns {Array<{icon, title, desc, action?}>}
   */
  function forProfile(profileId) {
    return BANK[profileId] ?? BANK.novice;
  }

  /** Return all suggestions (useful for testing or admin views). */
  function all() {
    return { ...BANK };
  }

  return { forProfile, all };
})();

if (typeof module !== 'undefined') module.exports = Suggestions;

/**
 * chat.js
 * AI chat module for AdaptUI.
 * Manages conversation history and calls the Anthropic Claude API,
 * injecting a profile-conditioned system prompt so the model's
 * communication style adapts to the current user archetype.
 *
 * MSAI-631 – AI for Human-Computer Interaction
 * University of the Cumberlands, Spring 2026
 */

'use strict';

const Chat = (() => {
  // ── Configuration ────────────────────────────────────────────────────────
  const API_URL    = 'https://api.anthropic.com/v1/messages';
  const MODEL      = 'claude-sonnet-4-20250514';
  const MAX_TOKENS = 1000;
  const MAX_HISTORY = 10;   // rolling window: keep last N turns to avoid
                             // overflowing the context window

  // ── Internal state ────────────────────────────────────────────────────────
  let _history = [];            // [{ role, content }, ...]
  let _getProfile = null;       // injected dependency: () => profileObject
  let _onMessage = null;        // callback: (role, text) => void
  let _onTyping  = null;        // callback: (isTyping: bool) => void

  // ── System prompt factory ─────────────────────────────────────────────────
  /**
   * Build a profile-conditioned system prompt.
   * The prompt encodes the current user archetype so Claude calibrates
   * its response complexity and tone appropriately.
   */
  function buildSystemPrompt(profile) {
    const base = `You are an embedded AI assistant inside AdaptUI, an AI-powered Adaptive User Interface research prototype built for MSAI-631 at the University of the Cumberlands.

The current user profile is: ${profile.label}.

Adjust your response style according to the profile:
- Novice:     Simple language, encouraging, no jargon, explain everything.
- Explorer:   Friendly and curious tone, introduce new concepts gently.
- Power User: Concise, assume basic familiarity, skip introductions.
- Expert:     Terse, technical, peer-level — no hand-holding.

${profile.systemPromptHint}

Keep responses under 150 words. Be helpful and direct.`;
    return base;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Initialise the chat module.
   * @param {Object} opts
   * @param {Function} opts.getProfile   () => current profile object
   * @param {Function} opts.onMessage    (role: 'user'|'ai', text: string) => void
   * @param {Function} opts.onTyping     (isTyping: boolean) => void
   */
  function init({ getProfile, onMessage, onTyping }) {
    _getProfile = getProfile;
    _onMessage  = onMessage;
    _onTyping   = onTyping;
  }

  /**
   * Send a user message to the API and stream the response back via callbacks.
   * @param {string} userText  Raw text from the input field.
   * @returns {Promise<void>}
   */
  async function send(userText) {
    if (!userText || !userText.trim()) return;
    const text = userText.trim();

    // Notify UI
    if (_onMessage) _onMessage('user', text);

    // Add to history
    _history.push({ role: 'user', content: text });
    if (_history.length > MAX_HISTORY) {
      _history = _history.slice(-MAX_HISTORY);
    }

    // Show typing indicator
    if (_onTyping) _onTyping(true);

    const profile = _getProfile ? _getProfile() : { label: 'Novice', systemPromptHint: '' };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      MODEL,
          max_tokens: MAX_TOKENS,
          system:     buildSystemPrompt(profile),
          messages:   _history,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text ?? 'Sorry, I could not generate a response.';

      // Add assistant reply to history
      _history.push({ role: 'assistant', content: reply });
      if (_history.length > MAX_HISTORY) {
        _history = _history.slice(-MAX_HISTORY);
      }

      if (_onTyping)  _onTyping(false);
      if (_onMessage) _onMessage('ai', reply);

    } catch (err) {
      if (_onTyping)  _onTyping(false);
      if (_onMessage) _onMessage('ai', `⚠️ Could not reach the AI API. ${err.message}`);
    }
  }

  /** Clear conversation history (e.g. on profile reset). */
  function clearHistory() {
    _history = [];
  }

  /** Return a copy of the current history (for debugging/export). */
  function getHistory() {
    return [..._history];
  }

  return { init, send, clearHistory, getHistory };
})();

if (typeof module !== 'undefined') module.exports = Chat;

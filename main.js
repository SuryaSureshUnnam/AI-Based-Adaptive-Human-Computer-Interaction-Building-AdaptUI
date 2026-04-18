/**
 * main.js
 * Application entry point for AdaptUI.
 * Wires together the telemetry, classifier, adaptation, chat, and suggestion
 * modules and manages all DOM interactions.
 *
 * In the standalone index.html build all modules are inlined; this file
 * exists as a readable, commented reference for the modular architecture.
 *
 * MSAI-631 – AI for Human-Computer Interaction
 * University of the Cumberlands, Spring 2026
 */

'use strict';

// ── Bootstrap ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Telemetry ──────────────────────────────────────────────────────────
  Telemetry.init((snapshot) => {
    updateMetricsUI(snapshot);
    Classifier.evaluate(snapshot.score);
  });

  // Session timer – updates the header every second
  setInterval(() => {
    const secs = Telemetry.sessionSeconds();
    const label = secs < 60
      ? `Session: ${secs}s`
      : `Session: ${Math.floor(secs / 60)}m ${secs % 60}s`;
    const el = document.getElementById('session-time');
    if (el) el.textContent = label;
  }, 1000);

  // ── 2. Classifier ─────────────────────────────────────────────────────────
  Classifier.onTransition((prevProfile, nextProfile) => {
    console.info(`[Classifier] ${prevProfile.id} → ${nextProfile.id}`);
    updateProfileUI(nextProfile);
    AdaptationEngine.apply(nextProfile.id);
    refreshSuggestions(nextProfile.id);
  });

  // ── 3. Adaptation engine callbacks ────────────────────────────────────────
  AdaptationEngine.onAdapt((key, total) => {
    const el = document.getElementById('kpi-adaptations');
    if (el) el.textContent = total;
  });

  // ── 4. Chat module ────────────────────────────────────────────────────────
  Chat.init({
    getProfile: () => Classifier.currentProfile(),
    onMessage:  (role, text) => appendChatMessage(role, text),
    onTyping:   (isTyping)   => toggleTypingIndicator(isTyping),
  });

  // Wire up send button and Enter key
  const sendBtn   = document.getElementById('send-btn');
  const chatInput = document.getElementById('chat-input');

  if (sendBtn)   sendBtn.addEventListener('click',   handleSend);
  if (chatInput) chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSend();
  });

  async function handleSend() {
    const input = document.getElementById('chat-input');
    const text  = input?.value?.trim();
    if (!text) return;
    input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    Telemetry.recordMessage();
    await Chat.send(text);

    if (sendBtn) sendBtn.disabled = false;
    input.focus();
  }

  // ── 5. Tab navigation ─────────────────────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      if (!target) return;
      switchTab(target, btn);
    });
  });

  function switchTab(name, activeBtn) {
    Telemetry.recordTabSwitch();
    Classifier.evaluate(Telemetry.score());

    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const panel = document.getElementById('tab-' + name);
    if (panel) panel.classList.add('active');
    if (activeBtn) activeBtn.classList.add('active');

    updateMetricsUI(Telemetry.snapshot());
  }

  // ── 6. Accessibility toggles ──────────────────────────────────────────────
  document.getElementById('tog-dark')?.addEventListener('change', function () {
    document.body.classList.toggle('dark', this.checked);
    if (this.checked) {
      document.getElementById('tog-hc').checked = false;
      document.body.classList.remove('high-contrast');
    }
  });

  document.getElementById('tog-hc')?.addEventListener('change', function () {
    document.body.classList.toggle('high-contrast', this.checked);
    if (this.checked) {
      document.getElementById('tog-dark').checked = false;
      document.body.classList.remove('dark');
    }
  });

  document.getElementById('tog-lt')?.addEventListener('change', function () {
    document.body.classList.toggle('large-text', this.checked);
  });

  // ── 7. Initial render ─────────────────────────────────────────────────────
  updateProfileUI(Classifier.currentProfile());
  refreshSuggestions('novice');
  appendChatMessage('ai', "👋 Hello! I'm your adaptive AI assistant. Ask me anything — my responses adjust as your profile evolves. Check the Dashboard tab to see your live metrics!");

  // ── DOM helpers ───────────────────────────────────────────────────────────

  function updateMetricsUI(snapshot) {
    setText('kpi-clicks',   snapshot.clicks);
    setText('kpi-messages', snapshot.messages);
    setText('kpi-tabs',     snapshot.tabSwitches);

    const total = snapshot.score || 1;
    setBar('click',  Math.min(100, Math.round((snapshot.clicks           / total) * 100)));
    setBar('chat',   Math.min(100, Math.round((snapshot.messages * 3     / total) * 100)));
    setBar('tab',    Math.min(100, Math.round((snapshot.tabSwitches * 2  / total) * 100)));
    setBar('scroll', Math.min(100, snapshot.scrollDepth));
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function setBar(id, pct) {
    const pctEl  = document.getElementById(id + '-pct');
    const fillEl = document.getElementById(id + '-bar');
    if (pctEl)  pctEl.textContent       = pct + '%';
    if (fillEl) fillEl.style.width      = pct + '%';
  }

  function updateProfileUI(profile) {
    setText('profile-emoji', profile.emoji);
    setText('profile-name',  profile.label);
    setText('profile-desc',  profile.description);
    setText('profile-badge', profile.badgeText);
  }

  function refreshSuggestions(profileId) {
    const list  = document.getElementById('suggestions-list');
    if (!list) return;
    const items = Suggestions.forProfile(profileId);
    list.innerHTML = items.map(s => `
      <div class="suggestion" role="button" tabindex="0"
           onclick="document.getElementById('notif').textContent='Applying: ${escapeAttr(s.title)}'; document.getElementById('notif').style.display='block'; setTimeout(()=>document.getElementById('notif').style.display='none',3500);">
        <span class="suggestion-icon" aria-hidden="true">${s.icon}</span>
        <div>
          <div class="suggestion-title">${escapeHtml(s.title)}</div>
          <div class="suggestion-desc">${escapeHtml(s.desc)}</div>
        </div>
      </div>
    `).join('');
  }

  let _typingBubble = null;

  function appendChatMessage(role, text) {
    // Remove typing bubble if it's still showing
    if (_typingBubble) { _typingBubble.remove(); _typingBubble = null; }

    const box = document.getElementById('chat-box');
    if (!box) return;

    const div = document.createElement('div');
    div.className = 'msg ' + (role === 'user' ? 'user' : 'ai');
    div.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function toggleTypingIndicator(show) {
    const box = document.getElementById('chat-box');
    if (!box) return;
    if (show) {
      _typingBubble = document.createElement('div');
      _typingBubble.className = 'msg ai';
      _typingBubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
      box.appendChild(_typingBubble);
      box.scrollTop = box.scrollHeight;
    } else if (_typingBubble) {
      _typingBubble.remove();
      _typingBubble = null;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return String(s).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
  }

}); // end DOMContentLoaded

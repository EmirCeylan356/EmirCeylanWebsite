// Decap CMS OAuth popup handshake (served as a file so the strict CSP allows it).
// The callback function (api/oauth/callback.js) renders a <script src> tag with
// data-message / data-ok / data-token attributes; this script does the rest.
(function () {
  var el = document.currentScript;
  var message = el.dataset.message || '';
  var ok = el.dataset.ok === '1';
  var token = el.dataset.token || '';
  var hint = document.getElementById('hint');

  // Fallback session store (same key/shape as Decap's LocalStorageAuthStore),
  // so "Continue to editor" works even if the popup cannot reach the editor.
  if (ok && token) {
    try { localStorage.setItem('decap-cms-user', JSON.stringify({ token: token, backendName: 'github' })); } catch (e) {}
  }

  if (window.opener && !window.opener.closed) {
    function receiveMessage(e) {
      window.opener.postMessage(message, e.origin);
      window.removeEventListener('message', receiveMessage, false);
      if (hint) hint.textContent = ok ? 'Done. This window will close.' : '';
      setTimeout(function () { window.close(); }, 400);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
    setTimeout(function () { if (hint && ok) hint.textContent = 'If the editor did not update, click Continue.'; }, 2500);
  } else if (hint && ok) {
    hint.textContent = 'This window has no link to the editor tab. Click Continue — you are signed in.';
  }
})();

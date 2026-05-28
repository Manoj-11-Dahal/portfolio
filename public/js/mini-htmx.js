/* Tiny HTMX-compatible subset for this project: hx-get, hx-post, hx-target, hx-swap. */
(function () {
  function serialize(form) {
    return new URLSearchParams(new FormData(form)).toString();
  }

  async function request(trigger, event) {
    const getUrl = trigger.getAttribute('hx-get');
    const postUrl = trigger.getAttribute('hx-post');
    if (!getUrl && !postUrl) return;
    if (event) event.preventDefault();

    const targetSelector = trigger.getAttribute('hx-target') || trigger.getAttribute('data-hx-target') || 'body';
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const method = postUrl ? 'POST' : 'GET';
    let url = getUrl || postUrl;
    const options = { method, headers: { 'HX-Request': 'true' } };

    if (method === 'GET' && trigger.tagName === 'FORM') {
      const query = serialize(trigger);
      if (query) url += (url.includes('?') ? '&' : '?') + query;
    }
    if (method === 'POST') {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.body = trigger.tagName === 'FORM' ? serialize(trigger) : '';
    }

    target.classList.add('htmx-request');
    try {
      const response = await fetch(url, options);
      const html = await response.text();
      const swap = trigger.getAttribute('hx-swap') || 'innerHTML';
      if (swap === 'outerHTML') target.outerHTML = html;
      else target.innerHTML = html;
      document.dispatchEvent(new CustomEvent('htmx:afterSwap', { detail: { target } }));
    } catch (error) {
      target.insertAdjacentHTML('afterbegin', '<div class="alert error">Request failed. Is the server running?</div>');
      console.error(error);
    } finally {
      target.classList.remove('htmx-request');
    }
  }

  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('[hx-get]:not(form), [hx-post]:not(form)');
    if (trigger) request(trigger, event);
  });

  document.addEventListener('submit', function (event) {
    const trigger = event.target.closest('form[hx-get], form[hx-post]');
    if (trigger) request(trigger, event);
  });
})();

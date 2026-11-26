document.querySelectorAll('[data-enquiry-form]').forEach((form) => {
  const status = document.createElement('p');
  status.tabIndex = -1;
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const designed = form.hasAttribute('data-designed-status');
  const success = form.parentElement.querySelector('[data-enquiry-success]');
  const done = form.parentElement.querySelector('[data-enquiry-done]');
  if (designed) {
    status.hidden = true;
    form.prepend(status);
  } else {
    form.append(status);
  }
  const announce = (message, tone = '') => {
    status.textContent = message;
    status.className = designed ? tone : '';
    status.hidden = false;
  };
  const endpoint = form.dataset.endpoint;
  const contact = form.dataset.contact;
  const fields = [...form.querySelectorAll('input, select')];
  const errors = fields.map((field, index) => {
    const error = document.createElement('span');
    error.id = `enquiry-error-${index}`;
    if (designed) error.className = 'errt';
    error.hidden = true;
    field.setAttribute('aria-describedby', error.id);
    field.after(error);
    return error;
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    if (button.disabled) return;
    let invalid = false;
    fields.forEach((field, index) => {
      const valid = field.checkValidity() && (!field.required || field.value.trim() !== '');
      errors[index].textContent = valid ? '' : field.dataset.error ?? (field.type === 'email' ? 'Enter a valid email address.' : 'Please complete this field.');
      errors[index].hidden = valid;
      field.setAttribute('aria-invalid', String(!valid));
      invalid ||= !valid;
    });
    if (invalid) {
      announce('Please correct the highlighted fields.', 'alert');
      status.focus();
      return;
    }
    button.disabled = true;
    const original = button.innerHTML;
    button.textContent = 'Sending…';
    button.setAttribute('aria-busy', 'true');
    announce('Sending your enquiry…');
    const payload = Object.fromEntries(new FormData(form));
    payload._subject = form.dataset.subject
      ? form.dataset.subject.replace(/\{(\w+)\}/g, (_, key) => payload[key] ?? '')
      : `Website enquiry: ${location.pathname === '/' ? 'Home' : 'Get Involved'} form — ${payload.interest}`;
    payload._template = 'table';
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'}, body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      // The endpoint can refuse a submission (validation, or the mail service failing).
      // Keep its reason for the site owner in the console.
      if (!response.ok || (result.success !== true && result.success !== 'true')) throw new Error(result.message || `HTTP ${response.status}`);
      const message = form.dataset.success ?? 'Thank you! Your enquiry has been sent. We look forward to being in touch.';
      if (success) {
        const confirmation = success.querySelector('[data-status-message]');
        confirmation.textContent = message;
        success.hidden = false;
        done.hidden = false;
        form.remove();
        success.tabIndex = -1;
        success.setAttribute('role', 'status');
        success.focus();
      } else {
        announce(message, designed ? 'okp' : '');
        form.replaceWith(status);
        status.focus();
      }
    } catch (error) {
      console.error('Enquiry not sent:', error);
      // Never lose what the visitor typed: offer the same enquiry as a ready-made email.
      const body = Object.entries(payload)
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      const email = document.createElement('a');
      email.href = `mailto:${contact}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(body)}`;
      email.textContent = `email it to ${contact}`;
      announce('', 'alert');
      const sentence = document.createElement('span');
      sentence.append('Your enquiry could not be sent from this page. Please try again, or ', email, ' instead (your details are filled in for you).');
      status.append(sentence);
      button.removeAttribute('aria-busy');
      button.disabled = false;
      button.innerHTML = original;
      status.focus();
    }
  });
});

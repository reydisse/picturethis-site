document.querySelectorAll('[data-enquiry-form]').forEach((form) => {
  const status = document.createElement('p');
  status.tabIndex = -1;
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.append(status);
  const fields = [...form.querySelectorAll('input, select')];
  const errors = fields.map((field, index) => {
    const error = document.createElement('span');
    error.id = `enquiry-error-${index}`;
    error.style.display = 'block';
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
      const valid = field.checkValidity() && field.value.trim() !== '';
      errors[index].textContent = valid ? '' : field.type === 'email' ? 'Enter a valid email address.' : 'Please complete this field.';
      field.setAttribute('aria-invalid', String(!valid));
      invalid ||= !valid;
    });
    if (invalid) {
      status.textContent = 'Please correct the highlighted fields.';
      status.focus();
      return;
    }
    button.disabled = true;
    const original = button.innerHTML;
    button.textContent = 'Sending…';
    status.textContent = 'Sending your enquiry…';
    const payload = Object.fromEntries(new FormData(form));
    payload._subject = `Website enquiry: ${location.pathname === '/' ? 'Home' : 'Get Involved'} form — ${payload.interest}`;
    payload._template = 'table';
    try {
      const response = await fetch('https://formsubmit.co/ajax/hello@picturethis-production.com', {
        method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'}, body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || (result.success !== true && result.success !== 'true')) throw new Error('Submission failed');
      status.textContent = 'Thank you! Your enquiry has been sent. We look forward to being in touch.';
      form.replaceWith(status);
      status.focus();
    } catch {
      status.textContent = 'Your enquiry could not be sent. Please try again or contact hello@picturethis-production.com directly.';
      button.disabled = false;
      button.innerHTML = original;
      status.focus();
    }
  });
});

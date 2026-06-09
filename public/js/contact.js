const contactForm = document.querySelector('[data-contact-form]');
const contactFeedback = document.querySelector('[data-contact-feedback]');

const renderContactFeedback = (message, type) => {
  contactFeedback.textContent = message;
  contactFeedback.className = `feedback ${type}`;
  contactFeedback.classList.remove('hidden');
};

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = Object.fromEntries(new FormData(contactForm).entries());
    const button = contactForm.querySelector('button[type="submit"]');

    try {
      button.disabled = true;
      button.textContent = 'Sending...';
      const data = await BristoAPI.request(BristoAPI.API.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      renderContactFeedback(data.message, 'success');
      contactForm.reset();
    } catch (error) {
      renderContactFeedback(error.message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Send Message';
    }
  });
}

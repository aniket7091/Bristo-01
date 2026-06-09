const form = document.querySelector('[data-auth-form]');
const feedback = document.querySelector('[data-feedback]');
const submitButton = form?.querySelector('button[type="submit"]');
const mode = form?.dataset.mode;

const showFeedback = (message, type = 'success') => {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
  feedback.classList.remove('hidden');
};

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const endpoint = mode === 'signup' ? `${BristoAPI.API.auth}/signup` : `${BristoAPI.API.auth}/login`;

    try {
      submitButton.disabled = true;
      submitButton.textContent = mode === 'signup' ? 'Creating account...' : 'Signing in...';
      const data = await BristoAPI.request(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      BristoAPI.setOwnerSession(data);
      showFeedback(data.message, 'success');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 800);
    } catch (error) {
      showFeedback(error.message, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = mode === 'signup' ? 'Create Owner Account' : 'Sign In';
    }
  });
}

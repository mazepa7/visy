const loginTab = document.querySelector('#loginTab');
const registerTab = document.querySelector('#registerTab');
const loginForm = document.querySelector('#loginForm');
const registerForm = document.querySelector('#registerForm');
const formTitle = document.querySelector('#formTitle');
const formSubtitle = document.querySelector('#formSubtitle');
const formEyebrow = document.querySelector('#formEyebrow');
const formMessage = document.querySelector('#formMessage');
const authCard = document.querySelector('#authCard');
const userCard = document.querySelector('#userCard');

function showMessage(message = '', type = '') {
  formMessage.textContent = message;
  formMessage.className = `form-message${type ? ` ${type}` : ''}`;
}

function switchForm(mode) {
  const registering = mode === 'register';
  loginForm.hidden = registering;
  registerForm.hidden = !registering;
  loginTab.classList.toggle('active', !registering);
  registerTab.classList.toggle('active', registering);
  loginTab.setAttribute('aria-selected', String(!registering));
  registerTab.setAttribute('aria-selected', String(registering));
  formEyebrow.textContent = registering ? 'SUA MÚSICA, SUA CONTA' : 'BOM TER VOCÊ AQUI';
  formTitle.textContent = registering ? 'Crie sua conta' : 'Entre na Visy';
  formSubtitle.textContent = registering ? 'Comece a descobrir novas experiências musicais.' : 'Acesse sua conta e continue descobrindo.';
  showMessage();
}

function showUser(user) {
  authCard.hidden = true;
  userCard.hidden = false;
  document.querySelector('#welcomeName').textContent = user.displayName;
  document.querySelector('#welcomeUsername').textContent = `@${user.username}`;
  document.querySelector('#userAvatar').textContent = (user.displayName.trim()[0] || 'V').toUpperCase();
}

async function request(path, body) {
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return {};
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir. Tente novamente.');
  return data;
}

function setBusy(form, busy, label) {
  const button = form.querySelector('.submit-button');
  button.disabled = busy;
  button.querySelector('span:first-child').textContent = busy ? label : button.dataset.label;
}

for (const button of document.querySelectorAll('.submit-button')) {
  button.dataset.label = button.querySelector('span:first-child').textContent;
}

loginTab.addEventListener('click', () => switchForm('login'));
registerTab.addEventListener('click', () => switchForm('register'));

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage();
  const form = new FormData(loginForm);
  setBusy(loginForm, true, 'Entrando…');
  try {
    const result = await request('/api/auth/login', {
      identifier: form.get('identifier'),
      password: form.get('password'),
    });
    showUser(result.user);
  } catch (error) {
    showMessage(error.message, 'error');
  } finally {
    setBusy(loginForm, false);
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage();
  const form = new FormData(registerForm);
  const password = form.get('password');
  if (password !== form.get('confirmPassword')) {
    showMessage('As senhas não coincidem.', 'error');
    return;
  }
  setBusy(registerForm, true, 'Criando conta…');
  try {
    const result = await request('/api/auth/register', {
      displayName: form.get('displayName'),
      username: form.get('username'),
      email: form.get('email'),
      password,
    });
    showUser(result.user);
  } catch (error) {
    showMessage(error.message, 'error');
  } finally {
    setBusy(registerForm, false);
  }
});

document.querySelector('#logoutButton').addEventListener('click', async () => {
  try {
    await request('/api/auth/logout', {});
  } catch (error) {
    showMessage(error.message, 'error');
    return;
  }
  userCard.hidden = true;
  authCard.hidden = false;
  loginForm.reset();
  switchForm('login');
});

request('/api/auth/me')
  .then(({ user }) => { if (user) showUser(user); })
  .catch(() => showMessage('Não consegui conectar ao servidor. Inicie o projeto seguindo o LEIA-ME.', 'error'));

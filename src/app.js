const { signup, login } = require('./logic/auth');
const { calculate } = require('./logic/calculator');
const storage = require('./logic/storage');
const ui = require('./ui/ui');

// DOM references
const messageBox = document.getElementById('message');
const loginStatus = document.getElementById('loginStatus');

// Signup
document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  const users = storage.getUsers();
  const result = signup(users, name, email, password);

  if (!result.success) {
    ui.showMessage(messageBox, result.message, 'error');
    return;
  }

  storage.saveUsers(result.users);
  ui.showMessage(messageBox, 'Sign up successful');
});

// Login
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const result = login(storage.getUsers(), email, password);

  if (!result.success) {
    ui.showMessage(messageBox, result.message, 'error');
    return;
  }

  storage.setCurrentUser(result.user);
  ui.updateAuthUI(loginStatus, result.user);
});

// Calculator
document.getElementById('calculateBtn').addEventListener('click', () => {
  const result = calculate(
    document.getElementById('num1').value,
    document.getElementById('num2').value,
    document.getElementById('operation').value
  );

  if (result.error) {
    ui.showMessage(messageBox, result.error, 'error');
    return;
  }

  document.getElementById('result').textContent = result.result;
});
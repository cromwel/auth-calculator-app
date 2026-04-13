const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const messageBox = document.getElementById('message');

const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

const loginStatus = document.getElementById('loginStatus');
const logoutBtn = document.getElementById('logoutBtn');

const calculateBtn = document.getElementById('calculateBtn');
const num1 = document.getElementById('num1');
const num2 = document.getElementById('num2');
const operation = document.getElementById('operation');
const result = document.getElementById('result');

function showMessage(text, type = 'success') {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function clearMessage() {
  messageBox.textContent = '';
  messageBox.className = 'message hidden';
}

function openTab(targetId) {
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.target === targetId));
  panels.forEach(panel => panel.classList.toggle('active', panel.id === targetId));
  clearMessage();
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => openTab(tab.dataset.target));
});

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

function refreshAuthUI() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    loginStatus.textContent = `Logged in as ${currentUser.name} (${currentUser.email})`;
  } else {
    loginStatus.textContent = 'Not logged in';
  }
}

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters long.', 'error');
    return;
  }

  const users = getUsers();
  const exists = users.some(user => user.email === email);

  if (exists) {
    showMessage('An account with that email already exists.', 'error');
    return;
  }

  users.push({ name, email, password });
  saveUsers(users);

  showMessage('Sign up successful. You can now log in.', 'success');
  signupForm.reset();
  openTab('login');
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  const users = getUsers();
  const foundUser = users.find(user => user.email === email && user.password === password);

  if (!foundUser) {
    showMessage('Invalid email or password.', 'error');
    return;
  }

  setCurrentUser({ name: foundUser.name, email: foundUser.email });
  refreshAuthUI();
  showMessage('Login successful. Calculator unlocked.', 'success');
  loginForm.reset();
  openTab('calculator');
});

logoutBtn.addEventListener('click', () => {
  clearCurrentUser();
  refreshAuthUI();
  showMessage('Logged out successfully.', 'success');
});

calculateBtn.addEventListener('click', () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showMessage('Please log in before using the calculator.', 'error');
    openTab('login');
    return;
  }

  const first = Number(num1.value);
  const second = Number(num2.value);

  if (num1.value === '' || num2.value === '') {
    showMessage('Enter both numbers first.', 'error');
    return;
  }

  let answer;

  switch (operation.value) {
    case 'add':
      answer = first + second;
      break;
    case 'subtract':
      answer = first - second;
      break;
    case 'multiply':
      answer = first * second;
      break;
    case 'divide':
      if (second === 0) {
        showMessage('Cannot divide by zero.', 'error');
        return;
      }
      answer = first / second;
      break;
    default:
      showMessage('Invalid operation selected.', 'error');
      return;
  }

  result.textContent = answer;
  showMessage('Calculation completed.', 'success');
});

refreshAuthUI();

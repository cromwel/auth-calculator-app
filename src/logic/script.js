// ================= UI ELEMENT SELECTION UNITS =================
const tabs = document.querySelectorAll('.tab'); // Unit: Tab elements selection
const panels = document.querySelectorAll('.panel'); // Unit: Panel elements selection
const messageBox = document.getElementById('message'); // Unit: Message display container

const signupForm = document.getElementById('signupForm'); // Unit: Signup form reference
const loginForm = document.getElementById('loginForm'); // Unit: Login form reference

const loginStatus = document.getElementById('loginStatus'); // Unit: Auth status display
const logoutBtn = document.getElementById('logoutBtn'); // Unit: Logout button reference

const calculateBtn = document.getElementById('calculateBtn'); // Unit: Calculate trigger
const num1 = document.getElementById('num1'); // Unit: First number input
const num2 = document.getElementById('num2'); // Unit: Second number input
const operation = document.getElementById('operation'); // Unit: Operation selector
const result = document.getElementById('result'); // Unit: Result display

// ================= UI MESSAGE HANDLING UNITS =================
function showMessage(text, type = 'success') {
  // Unit: Display feedback message to user
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function clearMessage() {
  // Unit: Clear feedback message
  messageBox.textContent = '';
  messageBox.className = 'message hidden';
}

// ================= UI NAVIGATION UNIT =================
function openTab(targetId) {
  // Unit: Tab switching logic
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.target === targetId));
  panels.forEach(panel => panel.classList.toggle('active', panel.id === targetId));
  clearMessage(); // Unit: Clear message on navigation
}

// ================= EVENT BINDING UNIT =================
tabs.forEach(tab => {
  // Unit: Tab click event handler
  tab.addEventListener('click', () => openTab(tab.dataset.target));
});

// ================= STORAGE (LOCALSTORAGE) UNITS =================
function getUsers() {
  // Unit: Retrieve users from storage
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
  // Unit: Persist users to storage
  localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
  // Unit: Retrieve current logged-in user
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function setCurrentUser(user) {
  // Unit: Store current logged-in user
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
  // Unit: Remove current user session
  localStorage.removeItem('currentUser');
}

// ================= AUTH UI STATE UNIT =================
function refreshAuthUI() {
  // Unit: Update UI based on authentication state
  const currentUser = getCurrentUser();
  if (currentUser) {
    loginStatus.textContent = `Logged in as ${currentUser.name} (${currentUser.email})`;
  } else {
    loginStatus.textContent = 'Not logged in';
  }
}

// ================= SIGNUP FLOW UNITS =================
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Unit: Input extraction & normalization
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;

  // Unit: Password validation
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters long.', 'error');
    return;
  }

  const users = getUsers();

  // Unit: Duplicate email check
  const exists = users.some(user => user.email === email);

  if (exists) {
    showMessage('An account with that email already exists.', 'error');
    return;
  }

  // Unit: User creation
  users.push({ name, email, password });

  // Unit: Save new user
  saveUsers(users);

  // Unit: Success feedback
  showMessage('Sign up successful. You can now log in.', 'success');

  // Unit: Reset form
  signupForm.reset();

  // Unit: Navigate to login
  openTab('login');
});

// ================= LOGIN FLOW UNITS =================
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Unit: Input extraction & normalization
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  const users = getUsers();

  // Unit: Credential validation
  const foundUser = users.find(user => user.email === email && user.password === password);

  // Unit: Invalid login handling
  if (!foundUser) {
    showMessage('Invalid email or password.', 'error');
    return;
  }

  // Unit: Session creation
  setCurrentUser({ name: foundUser.name, email: foundUser.email });

  // Unit: UI update after login
  refreshAuthUI();

  // Unit: Success feedback
  showMessage('Login successful. Calculator unlocked.', 'success');

  // Unit: Reset form
  loginForm.reset();

  // Unit: Navigate to calculator
  openTab('calculator');
});

// ================= LOGOUT UNIT =================
logoutBtn.addEventListener('click', () => {
  // Unit: Clear session
  clearCurrentUser();

  // Unit: Update UI
  refreshAuthUI();

  // Unit: Feedback
  showMessage('Logged out successfully.', 'success');
});

// ================= CALCULATOR FLOW UNITS =================
calculateBtn.addEventListener('click', () => {

  // Unit: Auth guard (must be logged in)
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showMessage('Please log in before using the calculator.', 'error');
    openTab('login');
    return;
  }

  // Unit: Input parsing
  const first = Number(num1.value);
  const second = Number(num2.value);

  // Unit: Empty input validation
  if (num1.value === '' || num2.value === '') {
    showMessage('Enter both numbers first.', 'error');
    return;
  }

  let answer;

  // ================= CALCULATION UNITS =================
  switch (operation.value) {

    case 'add':
      // Unit: Addition logic
      answer = first + second;
      break;

    case 'subtract':
      // Unit: Subtraction logic
      answer = first - second;
      break;

    case 'multiply':
      // Unit: Multiplication logic
      answer = first * second;
      break;

    case 'divide':
      // Unit: Division edge case (zero check)
      if (second === 0) {
        showMessage('Cannot divide by zero.', 'error');
        return;
      }

      // Unit: Division logic
      answer = first / second;
      break;

    default:
      // Unit: Invalid operation handling
      showMessage('Invalid operation selected.', 'error');
      return;
  }

  // Unit: Display result
  result.textContent = answer;

  // Unit: Success feedback
  showMessage('Calculation completed.', 'success');
});

// ================= INITIALIZATION UNIT =================
refreshAuthUI(); // Unit: Initialize UI state on page load

if (typeof module !== 'undefined') {
  module.exports = {
    showMessage,
    clearMessage,
    openTab,
    getUsers,
    saveUsers,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    refreshAuthUI
  };
}
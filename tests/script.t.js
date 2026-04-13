/**
 * @jest-environment jsdom
 */

describe('Auth + Calculator App', () => {
  let app;

  function setupDOM() {
    document.body.innerHTML = `
      <nav class="tabs">
        <button class="tab active" data-target="signup">Sign Up</button>
        <button class="tab" data-target="login">Log In</button>
        <button class="tab" data-target="calculator">Calculator</button>
      </nav>

      <section id="message" class="message hidden"></section>

      <section id="signup" class="panel active">
        <form id="signupForm">
          <input type="text" id="signupName" />
          <input type="email" id="signupEmail" />
          <input type="password" id="signupPassword" />
          <button type="submit">Create Account</button>
        </form>
      </section>

      <section id="login" class="panel">
        <form id="loginForm">
          <input type="email" id="loginEmail" />
          <input type="password" id="loginPassword" />
          <button type="submit">Log In</button>
        </form>
      </section>

      <section id="calculator" class="panel">
        <span id="loginStatus"></span>
        <button id="logoutBtn">Log Out</button>

        <input type="number" id="num1" />
        <input type="number" id="num2" />

        <select id="operation">
          <option value="add">Add</option>
          <option value="subtract">Subtract</option>
          <option value="multiply">Multiply</option>
          <option value="divide">Divide</option>
        </select>

        <button id="calculateBtn">Calculate</button>
        <span id="result"></span>
      </section>
    `;
  }

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    setupDOM();
    app = require('./script');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('showMessage', () => {
    test('should display a success message by default', () => {
      app.showMessage('Hello world');

      const messageBox = document.getElementById('message');
      expect(messageBox.textContent).toBe('Hello world');
      expect(messageBox.className).toBe('message success');
    });

    test('should display an error message when type is error', () => {
      app.showMessage('Something failed', 'error');

      const messageBox = document.getElementById('message');
      expect(messageBox.textContent).toBe('Something failed');
      expect(messageBox.className).toBe('message error');
    });
  });

  describe('clearMessage', () => {
    test('should clear text and hide the message box', () => {
      app.showMessage('Temporary message', 'error');
      app.clearMessage();

      const messageBox = document.getElementById('message');
      expect(messageBox.textContent).toBe('');
      expect(messageBox.className).toBe('message hidden');
    });
  });

  describe('openTab', () => {
    test('should activate the selected tab and panel only', () => {
      app.openTab('login');

      const loginTab = [...document.querySelectorAll('.tab')]
        .find(tab => tab.dataset.target === 'login');
      const signupTab = [...document.querySelectorAll('.tab')]
        .find(tab => tab.dataset.target === 'signup');

      const loginPanel = document.getElementById('login');
      const signupPanel = document.getElementById('signup');
      const calculatorPanel = document.getElementById('calculator');

      expect(loginTab.classList.contains('active')).toBe(true);
      expect(signupTab.classList.contains('active')).toBe(false);

      expect(loginPanel.classList.contains('active')).toBe(true);
      expect(signupPanel.classList.contains('active')).toBe(false);
      expect(calculatorPanel.classList.contains('active')).toBe(false);
    });

    test('should clear any existing message when switching tabs', () => {
      app.showMessage('Error before switching', 'error');
      app.openTab('calculator');

      const messageBox = document.getElementById('message');
      expect(messageBox.textContent).toBe('');
      expect(messageBox.className).toBe('message hidden');
    });
  });

  describe('storage helpers', () => {
    test('getUsers should return empty array when no users exist', () => {
      expect(app.getUsers()).toEqual([]);
    });

    test('saveUsers should persist users to localStorage', () => {
      const users = [{ name: 'Jane', email: 'jane@example.com', password: '123456' }];
      app.saveUsers(users);

      expect(JSON.parse(localStorage.getItem('users'))).toEqual(users);
    });

    test('getUsers should retrieve saved users', () => {
      const users = [{ name: 'John', email: 'john@example.com', password: 'abcdef' }];
      localStorage.setItem('users', JSON.stringify(users));

      expect(app.getUsers()).toEqual(users);
    });

    test('getCurrentUser should return null when no current user exists', () => {
      expect(app.getCurrentUser()).toBeNull();
    });

    test('setCurrentUser should persist current user', () => {
      const user = { name: 'Jane', email: 'jane@example.com' };
      app.setCurrentUser(user);

      expect(JSON.parse(localStorage.getItem('currentUser'))).toEqual(user);
    });

    test('clearCurrentUser should remove the current user from storage', () => {
      localStorage.setItem('currentUser', JSON.stringify({ name: 'Jane', email: 'jane@example.com' }));
      app.clearCurrentUser();

      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });

  describe('refreshAuthUI', () => {
    test('should show "Not logged in" when no current user exists', () => {
      app.refreshAuthUI();

      expect(document.getElementById('loginStatus').textContent).toBe('Not logged in');
    });

    test('should show logged in user details when current user exists', () => {
      localStorage.setItem(
        'currentUser',
        JSON.stringify({ name: 'Jane', email: 'jane@example.com' })
      );

      app.refreshAuthUI();

      expect(document.getElementById('loginStatus').textContent)
        .toBe('Logged in as Jane (jane@example.com)');
    });
  });

  describe('signup flow', () => {
    function submitSignupForm({ name, email, password }) {
      document.getElementById('signupName').value = name;
      document.getElementById('signupEmail').value = email;
      document.getElementById('signupPassword').value = password;

      document.getElementById('signupForm').dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    }

    test('should reject signup when password is less than 6 characters', () => {
      submitSignupForm({
        name: 'Jane',
        email: 'jane@example.com',
        password: '123'
      });

      const messageBox = document.getElementById('message');
      expect(messageBox.textContent).toBe('Password must be at least 6 characters long.');
      expect(messageBox.className).toBe('message error');
      expect(app.getUsers()).toEqual([]);
    });

    test('should reject signup when email already exists', () => {
      localStorage.setItem(
        'users',
        JSON.stringify([{ name: 'Jane', email: 'jane@example.com', password: '123456' }])
      );

      submitSignupForm({
        name: 'Another Jane',
        email: 'jane@example.com',
        password: 'abcdef'
      });

      const messageBox = document.getElementById('message');
      expect(messageBox.textContent).toBe('An account with that email already exists.');
      expect(messageBox.className).toBe('message error');

      const users = app.getUsers();
      expect(users).toHaveLength(1);
    });

    test('should normalize email to lowercase and trim spaces on signup', () => {
      submitSignupForm({
        name: 'Jane',
        email: '  Jane@Example.COM  ',
        password: '123456'
      });

      const users = app.getUsers();
      expect(users[0]).toEqual({
        name: 'Jane',
        email: 'jane@example.com',
        password: '123456'
      });
    });

    test('should trim the name before saving', () => {
      submitSignupForm({
        name: '  Jane Doe  ',
        email: 'jane@example.com',
        password: '123456'
      });

      const users = app.getUsers();
      expect(users[0].name).toBe('Jane Doe');
    });

    test('should save a new user on successful signup', () => {
      submitSignupForm({
        name: 'Jane',
        email: 'jane@example.com',
        password: '123456'
      });

      const users = app.getUsers();
      expect(users).toEqual([
        {
          name: 'Jane',
          email: 'jane@example.com',
          password: '123456'
        }
      ]);
    });

    test('should reset the signup form after successful signup', () => {
      const resetSpy = jest.spyOn(document.getElementById('signupForm'), 'reset');

      submitSignupForm({
        name: 'Jane',
        email: 'jane@example.com',
        password: '123456'
      });

      expect(resetSpy).toHaveBeenCalled();
    });

    test('should navigate to login tab after successful signup', () => {
      submitSignupForm({
        name: 'Jane',
        email: 'jane@example.com',
        password: '123456'
      });

      expect(document.getElementById('login').classList.contains('active')).toBe(true);
      expect(document.getElementById('signup').classList.contains('active')).toBe(false);
    });
  });

  describe('login flow', () => {
    function submitLoginForm({ email, password }) {
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginPassword').value = password;

      document.getElementById('loginForm').dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    }

    beforeEach(() => {
      localStorage.setItem(
        'users',
        JSON.stringify([
          { name: 'Jane', email: 'jane@example.com', password: '123456' }
        ])
      );
    });

    test('should reject login for invalid credentials', () => {
      submitLoginForm({
        email: 'jane@example.com',
        password: 'wrongpass'
      });

      const messageBox = document.getElementById('message');
      expect(messageBox.textContent).toBe('Invalid email or password.');
      expect(messageBox.className).toBe('message error');
      expect(app.getCurrentUser()).toBeNull();
    });

    test('should login successfully with valid credentials', () => {
      submitLoginForm({
        email: 'jane@example.com',
        password: '123456'
      });

      expect(app.getCurrentUser()).toEqual({
        name: 'Jane',
        email: 'jane@example.com'
      });
    });

    test('should normalize email on login', () => {
      submitLoginForm({
        email: '  JANE@EXAMPLE.COM ',
        password: '123456'
      });

      expect(app.getCurrentUser()).toEqual({
        name: 'Jane',
        email: 'jane@example.com'
      });
    });

    test('should update auth UI after successful login', () => {
      submitLoginForm({
        email: 'jane@example.com',
        password: '123456'
      });

      expect(document.getElementById('loginStatus').textContent)
        .toBe('Logged in as Jane (jane@example.com)');
    });

    test('should reset login form after successful login', () => {
      const resetSpy = jest.spyOn(document.getElementById('loginForm'), 'reset');

      submitLoginForm({
        email: 'jane@example.com',
        password: '123456'
      });

      expect(resetSpy).toHaveBeenCalled();
    });

    test('should navigate to calculator after successful login', () => {
      submitLoginForm({
        email: 'jane@example.com',
        password: '123456'
      });

      expect(document.getElementById('calculator').classList.contains('active')).toBe(true);
      expect(document.getElementById('login').classList.contains('active')).toBe(false);
    });
  });

  describe('logout flow', () => {
    test('should clear current user, update UI, and show success message', () => {
      localStorage.setItem(
        'currentUser',
        JSON.stringify({ name: 'Jane', email: 'jane@example.com' })
      );

      app.refreshAuthUI();
      document.getElementById('logoutBtn').click();

      expect(app.getCurrentUser()).toBeNull();
      expect(document.getElementById('loginStatus').textContent).toBe('Not logged in');
      expect(document.getElementById('message').textContent).toBe('Logged out successfully.');
      expect(document.getElementById('message').className).toBe('message success');
    });
  });

  describe('calculator flow', () => {
    function clickCalculate() {
      document.getElementById('calculateBtn').click();
    }

    beforeEach(() => {
      localStorage.setItem(
        'currentUser',
        JSON.stringify({ name: 'Jane', email: 'jane@example.com' })
      );
    });

    test('should block calculator usage when user is not logged in', () => {
      localStorage.removeItem('currentUser');

      clickCalculate();

      expect(document.getElementById('message').textContent)
        .toBe('Please log in before using the calculator.');
      expect(document.getElementById('message').className).toBe('message hidden');
      expect(document.getElementById('login').classList.contains('active')).toBe(true);
    });

    test('should reject calculation when inputs are empty', () => {
      document.getElementById('num1').value = '';
      document.getElementById('num2').value = '';

      clickCalculate();

      expect(document.getElementById('message').textContent).toBe('Enter both numbers first.');
      expect(document.getElementById('message').className).toBe('message error');
    });

    test('should add two numbers correctly', () => {
      document.getElementById('num1').value = '10';
      document.getElementById('num2').value = '5';
      document.getElementById('operation').value = 'add';

      clickCalculate();

      expect(document.getElementById('result').textContent).toBe('15');
      expect(document.getElementById('message').textContent).toBe('Calculation completed.');
    });

    test('should subtract two numbers correctly', () => {
      document.getElementById('num1').value = '10';
      document.getElementById('num2').value = '5';
      document.getElementById('operation').value = 'subtract';

      clickCalculate();

      expect(document.getElementById('result').textContent).toBe('5');
    });

    test('should multiply two numbers correctly', () => {
      document.getElementById('num1').value = '10';
      document.getElementById('num2').value = '5';
      document.getElementById('operation').value = 'multiply';

      clickCalculate();

      expect(document.getElementById('result').textContent).toBe('50');
    });

    test('should divide two numbers correctly', () => {
      document.getElementById('num1').value = '10';
      document.getElementById('num2').value = '5';
      document.getElementById('operation').value = 'divide';

      clickCalculate();

      expect(document.getElementById('result').textContent).toBe('2');
    });

    test('should reject division by zero', () => {
      document.getElementById('num1').value = '10';
      document.getElementById('num2').value = '0';
      document.getElementById('operation').value = 'divide';

      clickCalculate();

      expect(document.getElementById('message').textContent).toBe('Cannot divide by zero.');
      expect(document.getElementById('message').className).toBe('message error');
    });

    test('should reject invalid operation', () => {
      document.getElementById('num1').value = '10';
      document.getElementById('num2').value = '5';

      const operation = document.getElementById('operation');
      operation.innerHTML = `<option value="weird">Weird</option>`;
      operation.value = 'weird';

      clickCalculate();

      expect(document.getElementById('message').textContent).toBe('Invalid operation selected.');
      expect(document.getElementById('message').className).toBe('message error');
    });

    test('should handle decimal calculations correctly', () => {
      document.getElementById('num1').value = '2.5';
      document.getElementById('num2').value = '1.5';
      document.getElementById('operation').value = 'add';

      clickCalculate();

      expect(document.getElementById('result').textContent).toBe('4');
    });

    test('should handle negative number multiplication correctly', () => {
      document.getElementById('num1').value = '-3';
      document.getElementById('num2').value = '4';
      document.getElementById('operation').value = 'multiply';

      clickCalculate();

      expect(document.getElementById('result').textContent).toBe('-12');
    });
  });

  describe('initialization', () => {
    test('should initialize UI state on page load', () => {
      jest.resetModules();
      localStorage.clear();
      setupDOM();

      require('./script');

      expect(document.getElementById('loginStatus').textContent).toBe('Not logged in');
    });
  });
});
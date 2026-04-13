function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isPasswordValid(password) {
  return password.length >= 6;
}

function isDuplicateEmail(users, email) {
  return users.some(user => user.email === email);
}

function createUser(name, email, password) {
  return {
    name: name.trim(),
    email: normalizeEmail(email),
    password
  };
}

function signup(users, name, email, password) {
  const normalizedEmail = normalizeEmail(email);

  if (!isPasswordValid(password)) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  if (isDuplicateEmail(users, normalizedEmail)) {
    return { success: false, message: 'An account with that email already exists.' };
  }

  const user = createUser(name, normalizedEmail, password);

  return {
    success: true,
    user,
    users: [...users, user]
  };
}

function login(users, email, password) {
  const normalizedEmail = normalizeEmail(email);

  const user = users.find(
    u => u.email === normalizedEmail && u.password === password
  );

  if (!user) {
    return { success: false, message: 'Invalid email or password.' };
  }

  return {
    success: true,
    user: { name: user.name, email: user.email }
  };
}

module.exports = { signup, login };
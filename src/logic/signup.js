function isPasswordValid(password) {
  return password.length >= 6;
}

function isDuplicateEmail(users, email) {
  return users.some(user => user.email === email);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function createUser(name, email, password) {
  return {
    name: name.trim(),
    email: normalizeEmail(email),
    password
  };
}

function signupUser(users, name, email, password) {
  const normalizedEmail = normalizeEmail(email);

  if (!isPasswordValid(password)) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long.'
    };
  }

  if (isDuplicateEmail(users, normalizedEmail)) {
    return {
      success: false,
      message: 'An account with that email already exists.'
    };
  }

  const newUser = createUser(name, normalizedEmail, password);

  return {
    success: true,
    message: 'Sign up successful. You can now log in.',
    user: newUser,
    updatedUsers: [...users, newUser]
  };
}

module.exports = {
  isPasswordValid,
  isDuplicateEmail,
  normalizeEmail,
  createUser,
  signupUser
};
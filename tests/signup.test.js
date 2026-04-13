const {
  isPasswordValid,
  isDuplicateEmail,
  normalizeEmail,
  createUser,
  signupUser
} = require('../src/logic/signup');

describe('Sign up logic unit tests', () => {
  describe('isPasswordValid', () => {
    test('should return true when password length is 6 characters', () => {
      expect(isPasswordValid('123456')).toBe(true);
    });

    test('should return true when password length is more than 6 characters', () => {
      expect(isPasswordValid('mypassword')).toBe(true);
    });

    test('should return false when password length is less than 6 characters', () => {
      expect(isPasswordValid('123')).toBe(false);
    });

    test('should return false for an empty password', () => {
      expect(isPasswordValid('')).toBe(false);
    });
  });

  describe('normalizeEmail', () => {
    test('should trim spaces and convert email to lowercase', () => {
      expect(normalizeEmail('  Jane@Example.COM  ')).toBe('jane@example.com');
    });

    test('should keep an already normalized email unchanged', () => {
      expect(normalizeEmail('test@example.com')).toBe('test@example.com');
    });
  });

  describe('isDuplicateEmail', () => {
    const users = [
      { name: 'Jane', email: 'jane@example.com', password: '123456' },
      { name: 'Mark', email: 'mark@example.com', password: 'abcdef' }
    ];

    test('should return true when email already exists', () => {
      expect(isDuplicateEmail(users, 'jane@example.com')).toBe(true);
    });

    test('should return false when email does not exist', () => {
      expect(isDuplicateEmail(users, 'new@example.com')).toBe(false);
    });
  });

  describe('createUser', () => {
    test('should create a user object with trimmed name and normalized email', () => {
      expect(createUser('  Jane Doe  ', '  Jane@Example.com ', '123456')).toEqual({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: '123456'
      });
    });
  });

  describe('signupUser', () => {
    test('should fail if password is less than 6 characters', () => {
      const users = [];

      expect(signupUser(users, 'Jane', 'jane@example.com', '123')).toEqual({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    });

    test('should fail if email already exists', () => {
      const users = [
        { name: 'Jane', email: 'jane@example.com', password: '123456' }
      ];

      expect(signupUser(users, 'Jane', 'jane@example.com', 'abcdef')).toEqual({
        success: false,
        message: 'An account with that email already exists.'
      });
    });

    test('should fail if email already exists even with uppercase input', () => {
      const users = [
        { name: 'Jane', email: 'jane@example.com', password: '123456' }
      ];

      expect(signupUser(users, 'Jane', 'JANE@EXAMPLE.COM', 'abcdef')).toEqual({
        success: false,
        message: 'An account with that email already exists.'
      });
    });

    test('should create a new user when inputs are valid', () => {
      const users = [];

      const result = signupUser(users, 'Jane', 'jane@example.com', '123456');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Sign up successful. You can now log in.');
      expect(result.user).toEqual({
        name: 'Jane',
        email: 'jane@example.com',
        password: '123456'
      });
      expect(result.updatedUsers).toHaveLength(1);
    });

    test('should add the new user to the existing users list', () => {
      const users = [
        { name: 'Mark', email: 'mark@example.com', password: 'abcdef' }
      ];

      const result = signupUser(users, 'Jane', 'jane@example.com', '123456');

      expect(result.updatedUsers).toEqual([
        { name: 'Mark', email: 'mark@example.com', password: 'abcdef' },
        { name: 'Jane', email: 'jane@example.com', password: '123456' }
      ]);
    });

    test('should normalize email before saving the user', () => {
      const users = [];

      const result = signupUser(users, 'Jane', '  Jane@Example.COM ', '123456');

      expect(result.user.email).toBe('jane@example.com');
    });

    test('should trim the name before saving the user', () => {
      const users = [];

      const result = signupUser(users, '  Jane Doe  ', 'jane@example.com', '123456');

      expect(result.user.name).toBe('Jane Doe');
    });
  });
});
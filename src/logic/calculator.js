function calculate(first, second, operation) {
  if (first === '' || second === '') {
    return { error: 'Enter both numbers first.' };
  }

  const a = Number(first);
  const b = Number(second);

  switch (operation) {
    case 'add':
      return { result: a + b };

    case 'subtract':
      return { result: a - b };

    case 'multiply':
      return { result: a * b };

    case 'divide':
      if (b === 0) return { error: 'Cannot divide by zero.' };
      return { result: a / b };

    default:
      return { error: 'Invalid operation selected.' };
  }
}

module.exports = { calculate };
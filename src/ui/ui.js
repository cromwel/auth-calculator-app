function showMessage(messageBox, text, type = 'success') {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function clearMessage(messageBox) {
  messageBox.textContent = '';
  messageBox.className = 'message hidden';
}

function updateAuthUI(loginStatus, user) {
  loginStatus.textContent = user
    ? `Logged in as ${user.name} (${user.email})`
    : 'Not logged in';
}

module.exports = {
  showMessage,
  clearMessage,
  updateAuthUI
};
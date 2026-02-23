// Toast Notification System
function showToast(type, title, message) {
  // Create container if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Set icon based on type
  let icon = '';
  if (type === 'success') icon = '✓';
  else if (type === 'error') icon = '✕';
  else if (type === 'info') icon = 'i';
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="closeToast(this)">×</button>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    closeToast(toast.querySelector('.toast-close'));
  }, 4000);
}

function closeToast(button) {
  const toast = button.closest('.toast');
  toast.classList.add('hiding');
  setTimeout(() => {
    toast.remove();
    
    // Remove container if empty
    const container = document.querySelector('.toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}

// Check for flash messages and show as toasts
document.addEventListener('DOMContentLoaded', function() {
  const flashMessages = document.querySelectorAll('.flash-message');
  flashMessages.forEach(msg => {
    const type = msg.dataset.type;
    const message = msg.dataset.message;
    
    let title = 'Notification';
    if (type === 'success') title = 'Success!';
    else if (type === 'error') title = 'Error!';
    else if (type === 'info') title = 'Info';
    
    showToast(type, title, message);
  });
});

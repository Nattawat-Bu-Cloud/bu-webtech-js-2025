function checkNumber() {
  const input = document.getElementById('numberInput');
  const value = input.value.trim();
  
  if (value === '') {
    showPopup('⚠️', 'Oops!', 'Please enter a number first!');
    return;
  }
  
  const num = parseInt(value);
  
  if (isNaN(num) || value !== num.toString()) {
    showPopup('❌', 'Invalid Input', 'Please enter a valid integer number!');
    return;
  }
  
  let result;
  let icon;
  
  if (num === 0) {
    result = 'zero integer number';
    icon = '⭕';
  } else if (num % 2 === 0) {
    result = 'even integer number';
    icon = '✅';
  } else {
    result = 'odd integer number';
    icon = '🔷';
  }
  
  showPopup(icon, 'Result', `Your number ${num} is ${result}`);
}

function showPopup(icon, title, message) {
  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';
  
  const popup = document.createElement('div');
  popup.className = 'popup';
  
  popup.innerHTML = `
    <div class="popup-icon">${icon}</div>
    <h2>${title}</h2>
    <p>${message}</p>
    <button class="popup-btn" onclick="closePopup(this)">Got it! ✨</button>
  `;
  
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closePopup(overlay);
    }
  });
  
  setTimeout(() => {
    if (document.contains(overlay)) {
      closePopup(overlay);
    }
  }, 8000);
}

function closePopup(element) {
  const overlay = element.closest ? element.closest('.popup-overlay') : element;
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => overlay.remove(), 300);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('numberInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        checkNumber();
      }
    });
  }
});
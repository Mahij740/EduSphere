/**
 * EduSphere - Shared Application JavaScript
 * Global Auth, Fetch Wrapper, Toast Notifications & Layout Management 
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initLogout();
  highlightActiveNav();
});

/**
 * Fetch wrapper that automatically includes session credentials and
 * redirects to /login on 401 Unauthorized responses.
 */
async function fetchWithAuth(url, options = {}) {
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, config);

    // If unauthorized, redirect to login page immediately
    if (response.status === 401) {
      console.warn('Session expired or unauthorized. Redirecting to login...');
      window.location.href = '/login';
      return null;
    }

    // 204 No Content has no body to parse
    if (response.status === 204) {
      return { ok: true, status: 204 };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = (data && (data.message || data.error)) || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.status !== 401) {
      console.error('API Error:', error);
    }
    throw error;
  }
}

/**
 * Floating Toast Notification System
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 * @param {number} duration 
 */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove after timeout
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    });
  }, duration);
}

/**
 * Mobile drawer & sidebar toggle behavior
 */
function initSidebar() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!hamburgerBtn || !sidebar || !overlay) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);

  // Close sidebar on navigation click on mobile
  const navLinks = sidebar.querySelectorAll('.nav-item');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        closeSidebar();
      }
    });
  });
}

/**
 * Active navigation link highlighting based on current path
 */
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (
      href === currentPath ||
      (currentPath === '/' && href === '/') ||
      (currentPath === '/index.html' && href === '/') ||
      (currentPath.startsWith('/students') && href === '/students' && currentPath !== '/students/add') ||
      (currentPath === '/students/add' && href === '/students/add')
    ) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * Logout handler redirecting to /logout
 */
function initLogout() {
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/logout';
    });
  });
}

/**
 * Utility: HTML escape string to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

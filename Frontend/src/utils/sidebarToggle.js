// src/utils/sidebarToggle.js
export const toggleSidebar = () => {
  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('show');
    
    // Toggle body overflow when sidebar is open
    if (sidebar.classList.contains('show')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
};

export const closeSidebar = () => {
  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebar) {
    sidebar.classList.remove('show');
    document.body.style.overflow = '';
  }
};

export const isSidebarOpen = () => {
  const sidebar = document.querySelector('.admin-sidebar');
  return sidebar ? sidebar.classList.contains('show') : false;
};
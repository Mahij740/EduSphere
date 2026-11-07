/**
 * EduSphere - Students Directory JavaScript
 * Filtering, Search, Sorting, Pagination, Edit/Delete Modals
 */

let allStudents = [];
let filteredStudents = [];
let currentPage = 1;
let pageSize = 10;
let sortField = 'id';
let sortDirection = 'asc';
let studentToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  initTableEvents();
  initModals();
  loadStudents();
});

function initTableEvents() {
  // Search input (debounced)
  const searchInput = document.getElementById('searchInput');
  let debounceTimeout = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      applyFilters();
    }, 250);
  });

  // Course filter
  const courseFilter = document.getElementById('courseFilter');
  courseFilter.addEventListener('change', () => {
    applyFilters();
  });

  // Page size select
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  pageSizeSelect.addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value, 10);
    currentPage = 1;
    renderTable();
  });

  // Sortable headers
  const headers = document.querySelectorAll('th.sortable');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const field = header.getAttribute('data-sort');
      if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = field;
        sortDirection = 'asc';
      }
      updateSortIndicators();
      sortAndRender();
    });
  });
}

function updateSortIndicators() {
  ['id', 'name', 'course', 'age'].forEach(field => {
    const icon = document.getElementById(`sort-${field}`);
    if (icon) {
      if (sortField === field) {
        icon.textContent = sortDirection === 'asc' ? '▲' : '▼';
        icon.style.color = 'var(--primary-light)';
      } else {
        icon.textContent = '↕';
        icon.style.color = 'var(--text-muted)';
      }
    }
  });
}

/**
 * Fetch students from backend REST API
 */
async function loadStudents() {
  renderLoadingSkeletons();
  try {
    const data = await fetchWithAuth('/api/students');
    if (data && Array.isArray(data)) {
      allStudents = data;
      populateCourseFilter();
      applyFilters();
    }
  } catch (err) {
    showToast('Failed to load students: ' + (err.message || 'Unknown error'), 'error');
    document.getElementById('studentsTableBody').innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--danger); padding: 30px;">
          Failed to load students from server. Please refresh or check connection.
        </td>
      </tr>
    `;
  }
}

function populateCourseFilter() {
  const courseFilter = document.getElementById('courseFilter');
  const distinctCourses = [...new Set(allStudents.map(s => s.course))].sort();

  const currentVal = courseFilter.value;
  courseFilter.innerHTML = '<option value="">All Courses</option>';
  distinctCourses.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    if (c === currentVal) opt.selected = true;
    courseFilter.appendChild(opt);
  });
}

function applyFilters() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const selectedCourse = document.getElementById('courseFilter').value;

  filteredStudents = allStudents.filter(student => {
    const matchesSearch = !query ||
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query);

    const matchesCourse = !selectedCourse || student.course === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  currentPage = 1;
  sortAndRender();
}

function sortAndRender() {
  filteredStudents.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('studentsTableBody');
  const emptyState = document.getElementById('emptyState');
  const paginationBar = document.getElementById('paginationBar');

  if (filteredStudents.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    paginationBar.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  paginationBar.style.display = 'flex';

  const total = filteredStudents.length;
  const totalPages = Math.ceil(total / pageSize);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pagedStudents = filteredStudents.slice(startIdx, endIdx);

  tbody.innerHTML = pagedStudents.map(student => {
    const initials = getInitials(student.name);
    const badgeClass = getCourseBadgeClass(student.course);

    return `
      <tr id="student-row-${student.id}">
        <td style="font-weight: 600; color: var(--text-secondary);">#${student.id}</td>
        <td>
          <div class="student-name-cell">
            <span class="student-avatar">${initials}</span>
            <span>${escapeHtml(student.name)}</span>
          </div>
        </td>
        <td style="color: var(--text-secondary);">${escapeHtml(student.email)}</td>
        <td>
          <span class="badge ${badgeClass}">${escapeHtml(student.course)}</span>
        </td>
        <td>${student.age}</td>
        <td style="text-align: right;">
          <div class="action-buttons" style="justify-content: flex-end;">
            <button class="btn-icon edit-icon" title="Edit Student" onclick="openEditModal(${student.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-icon delete-icon" title="Delete Student" onclick="openDeleteModal(${student.id}, '${escapeHtml(student.name.replace(/'/g, "\\'"))}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderPaginationControls(startIdx + 1, endIdx, total, totalPages);
}

function renderPaginationControls(start, end, total, totalPages) {
  const info = document.getElementById('paginationInfo');
  info.textContent = `Showing ${start} to ${end} of ${total} students`;

  const controls = document.getElementById('paginationControls');
  let html = '';

  html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">&laquo; Prev</button>`;

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
      html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="changePage(${p})">${p}</button>`;
    } else if (p === currentPage - 2 || p === currentPage + 2) {
      html += `<span style="padding: 0 4px; color: var(--text-muted);">&bull;</span>`;
    }
  }

  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next &raquo;</button>`;

  controls.innerHTML = html;
}

window.changePage = function(p) {
  currentPage = p;
  renderTable();
};

function renderLoadingSkeletons() {
  const tbody = document.getElementById('studentsTableBody');
  tbody.innerHTML = Array(5).fill(0).map(() => `
    <tr class="skeleton-row">
      <td><div class="skeleton-bar" style="width: 30px;"></div></td>
      <td><div class="skeleton-bar" style="width: 140px;"></div></td>
      <td><div class="skeleton-bar" style="width: 180px;"></div></td>
      <td><div class="skeleton-bar" style="width: 110px;"></div></td>
      <td><div class="skeleton-bar" style="width: 40px;"></div></td>
      <td><div class="skeleton-bar" style="width: 70px; margin-left: auto;"></div></td>
    </tr>
  `).join('');
}

function getInitials(name) {
  if (!name) return 'S';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getCourseBadgeClass(course) {
  if (!course) return '';
  const c = course.toLowerCase();
  if (c.includes('computer')) return 'badge-cs';
  if (c.includes('information')) return 'badge-it';
  if (c.includes('mechanical')) return 'badge-mech';
  if (c.includes('civil')) return 'badge-civil';
  if (c.includes('electrical')) return 'badge-elec';
  if (c.includes('business')) return 'badge-biz';
  if (c.includes('commerce')) return 'badge-comm';
  if (c.includes('math')) return 'badge-math';
  return '';
}

/* Modals Management */
function initModals() {
  // Edit modal
  const editModal = document.getElementById('editModal');
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const editStudentForm = document.getElementById('editStudentForm');

  const closeEdit = () => editModal.classList.remove('active');
  closeEditModalBtn.addEventListener('click', closeEdit);
  cancelEditBtn.addEventListener('click', closeEdit);
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEdit();
  });

  editStudentForm.addEventListener('submit', handleEditSubmit);

  // Delete modal
  const deleteModal = document.getElementById('deleteModal');
  const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  const closeDelete = () => deleteModal.classList.remove('active');
  closeDeleteModalBtn.addEventListener('click', closeDelete);
  cancelDeleteBtn.addEventListener('click', closeDelete);
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDelete();
  });

  confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
}

window.openEditModal = function(id) {
  const student = allStudents.find(s => s.id === id);
  if (!student) return;

  clearEditErrors();
  document.getElementById('editStudentId').value = student.id;
  document.getElementById('editName').value = student.name;
  document.getElementById('editEmail').value = student.email;
  document.getElementById('editCourse').value = student.course;
  document.getElementById('editAge').value = student.age;

  document.getElementById('editModal').classList.add('active');
};

async function handleEditSubmit(e) {
  e.preventDefault();
  clearEditErrors();

  const id = document.getElementById('editStudentId').value;
  const name = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const course = document.getElementById('editCourse').value.trim();
  const age = parseInt(document.getElementById('editAge').value, 10);

  const saveBtn = document.getElementById('saveEditBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const updated = await fetchWithAuth(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, email, course, age })
    });

    if (updated) {
      showToast('Student profile updated successfully', 'success');
      document.getElementById('editModal').classList.remove('active');

      // Update in local data
      const idx = allStudents.findIndex(s => s.id === parseInt(id, 10));
      if (idx !== -1) {
        allStudents[idx] = updated;
      }
      populateCourseFilter();
      applyFilters();
    }
  } catch (err) {
    if (err.data && err.data.errors) {
      // Field level validation errors from backend
      for (const [field, msg] of Object.entries(err.data.errors)) {
        const errEl = document.getElementById(`edit${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
        if (errEl) {
          errEl.textContent = msg;
          errEl.style.display = 'block';
        }
      }
    }
    showToast(err.message || 'Failed to update student', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
}

function clearEditErrors() {
  ['Name', 'Email', 'Course', 'Age'].forEach(f => {
    const el = document.getElementById(`edit${f}Error`);
    if (el) {
      el.textContent = '';
      el.style.display = 'none';
    }
  });
}

window.openDeleteModal = function(id, name) {
  studentToDeleteId = id;
  document.getElementById('deleteStudentId').textContent = id;
  document.getElementById('deleteStudentName').textContent = name;
  document.getElementById('deleteModal').classList.add('active');
};

async function handleDeleteConfirm() {
  if (!studentToDeleteId) return;

  const confirmBtn = document.getElementById('confirmDeleteBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Deleting...';

  try {
    await fetchWithAuth(`/api/students/${studentToDeleteId}`, {
      method: 'DELETE'
    });

    showToast('Student deleted successfully', 'success');
    document.getElementById('deleteModal').classList.remove('active');

    // Remove from local dataset
    allStudents = allStudents.filter(s => s.id !== studentToDeleteId);
    populateCourseFilter();
    applyFilters();
  } catch (err) {
    showToast(err.message || 'Failed to delete student', 'error');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Delete Student';
    studentToDeleteId = null;
  }
}

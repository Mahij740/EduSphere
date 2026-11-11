/**
 * EduSphere - Add Student Page JavaScript
 * Searchable Course Dropdown with Dynamic Creation, Form Validation & Submissions
 */

const PRESET_COURSES = [
  'Computer Science',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Business Administration',
  'Commerce',
  'Mathematics'
];

let availableCourses = [...PRESET_COURSES];

document.addEventListener('DOMContentLoaded', () => {
  initCoursesList();
  initCustomSelect();
  initFormValidation();
});

/**
 * Fetch existing courses from database and merge with preset courses
 */
async function initCoursesList() {
  try {
    const dbCourses = await fetchWithAuth('/api/students/courses');
    if (dbCourses && Array.isArray(dbCourses)) {
      const merged = new Set([...availableCourses, ...dbCourses]);
      availableCourses = Array.from(merged).filter(Boolean).sort();
    }
  } catch (err) {
    console.warn('Could not load existing courses from DB, using presets:', err);
  }
  renderCourseOptions('');
}

/**
 * Setup custom searchable dropdown behaviors
 */
function initCustomSelect() {
  const trigger = document.getElementById('courseSelectTrigger');
  const dropdown = document.getElementById('courseDropdown');
  const searchInput = document.getElementById('courseSearchInput');
  const wrapper = document.getElementById('courseSelectWrapper');

  function openDropdown() {
    dropdown.style.display = 'block';
    searchInput.focus();
    trigger.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    dropdown.style.display = 'none';
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', () => {
    if (dropdown.style.display === 'block') {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDropdown();
    }
  });

  searchInput.addEventListener('input', (e) => {
    renderCourseOptions(e.target.value.trim());
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      closeDropdown();
    }
  });
}

/**
 * Render options inside searchable dropdown, including dynamic "Add new course" option
 */
function renderCourseOptions(query) {
  const optionsList = document.getElementById('courseOptionsList');
  const selectedVal = document.getElementById('selectedCourseValue').value;

  const filtered = availableCourses.filter(c => 
    c.toLowerCase().includes(query.toLowerCase())
  );

  let html = '';

  filtered.forEach(course => {
    const isSelected = course === selectedVal;
    html += `
      <div class="custom-select-option ${isSelected ? 'selected' : ''}" onclick="selectCourse('${escapeHtml(course.replace(/'/g, "\\'"))}')">
        ${escapeHtml(course)}
      </div>
    `;
  });

  // If query is non-empty and does not match any existing course exactly, allow adding new course
  const exactMatch = availableCourses.some(c => c.toLowerCase() === query.toLowerCase());
  if (query && !exactMatch) {
    html += `
      <div class="custom-select-option new-course-option" onclick="selectCourse('${escapeHtml(query.replace(/'/g, "\\'"))}', true)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Add "<strong>${escapeHtml(query)}</strong>" as new course</span>
      </div>
    `;
  }

  if (!filtered.length && !query) {
    html = `<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No courses available</div>`;
  }

  optionsList.innerHTML = html;
}

window.selectCourse = function(course, isNew = false) {
  if (isNew && !availableCourses.includes(course)) {
    availableCourses.push(course);
    availableCourses.sort();
  }

  document.getElementById('selectedCourseValue').value = course;
  const label = document.getElementById('selectedCourseLabel');
  label.textContent = course;
  label.style.color = 'var(--text-primary)';

  document.getElementById('courseDropdown').style.display = 'none';
  document.getElementById('courseSearchInput').value = '';

  const courseError = document.getElementById('courseError');
  if (courseError) {
    courseError.style.display = 'none';
  }
};

/**
 * Form submission and validation handling
 */
function initFormValidation() {
  const form = document.getElementById('addStudentForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const course = document.getElementById('selectedCourseValue').value.trim();
    const ageVal = document.getElementById('studentAge').value.trim();
    const age = parseInt(ageVal, 10);

    let hasClientError = false;

    // Validate Name
    if (!name) {
      showFieldError('name', 'Student name is required');
      hasClientError = true;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showFieldError('email', 'Email address is required');
      hasClientError = true;
    } else if (!emailRegex.test(email)) {
      showFieldError('email', 'Please enter a valid email format');
      hasClientError = true;
    }

    // Validate Course
    if (!course) {
      showFieldError('course', 'Please select or enter a course');
      hasClientError = true;
    }

    // Validate Age
    if (!ageVal) {
      showFieldError('age', 'Age is required');
      hasClientError = true;
    } else if (isNaN(age) || age < 5 || age > 100) {
      showFieldError('age', 'Age must be between 5 and 100');
      hasClientError = true;
    }

    if (hasClientError) return;

    // Submit payload to REST endpoint
    const saveBtn = document.getElementById('saveStudentBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      <span>Enrolling Student...</span>
    `;

    try {
      const created = await fetchWithAuth('/api/students', {
        method: 'POST',
        body: JSON.stringify({ name, email, course, age })
      });

      if (created) {
        showToast(`Student ${created.name} successfully registered!`, 'success');
        // Redirect to /students
        setTimeout(() => {
          window.location.href = '/students';
        }, 800);
      }
    } catch (err) {
      if (err.data && err.data.errors) {
        // Field-level server validation errors
        for (const [field, message] of Object.entries(err.data.errors)) {
          showFieldError(field, message);
        }
      } else if (err.status === 409) {
        showFieldError('email', err.message || 'This email is already registered to another student');
      }

      showToast(err.message || 'Failed to enroll student', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Student';
    }
  });
}

function showFieldError(field, message) {
  const errEl = document.getElementById(`${field}Error`);
  if (errEl) {
    errEl.textContent = message;
    errEl.style.display = 'block';
  }
}

function clearErrors() {
  ['name', 'email', 'course', 'age'].forEach(field => {
    const errEl = document.getElementById(`${field}Error`);
    if (errEl) {
      errEl.textContent = '';
      errEl.style.display = 'none';
    }
  });
}

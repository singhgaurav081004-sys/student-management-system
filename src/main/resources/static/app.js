/**
 * StudentHub Application Client
 * Modern JavaScript controlling REST interactions, state, and UI rendering.
 */

const API_BASE = window.location.origin;

const state = {
  students: [],
  courses: [],
  enrollments: [],
  dashboard: {},
  currentTab: 'dashboard'
};

// Initial boot
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  refreshAllData();
});

// ==========================================================================
// API Client & Data Fetching
// ==========================================================================

async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Server request failed');
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

async function refreshAllData() {
  try {
    await Promise.all([
      loadDashboard(),
      loadStudents(),
      loadCourses(),
      loadEnrollments()
    ]);
  } catch (err) {
    showToast('Failed to load some data: ' + err.message, 'error');
  }
}

async function loadDashboard() {
  try {
    const data = await apiRequest('/api/dashboard');
    state.dashboard = data;
    renderDashboard();
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

async function loadStudents() {
  try {
    const data = await apiRequest('/api/students');
    state.students = data;
    renderStudents();
    updateBadges();
    populateEnrollmentDropdowns();
  } catch (err) {
    console.error('Failed to load students:', err);
  }
}

async function loadCourses() {
  try {
    const data = await apiRequest('/api/courses');
    state.courses = data;
    renderCourses();
    updateBadges();
    populateEnrollmentDropdowns();
  } catch (err) {
    console.error('Failed to load courses:', err);
  }
}

async function loadEnrollments() {
  try {
    const data = await apiRequest('/api/enrollments');
    state.enrollments = data;
    renderEnrollments();
    updateBadges();
  } catch (err) {
    console.error('Failed to load enrollments:', err);
  }
}

async function seedSampleData() {
  try {
    showToast('Seeding sample academic data...', 'info');
    await apiRequest('/api/seed', { method: 'POST' });
    showToast('Sample data successfully loaded!', 'success');
    await refreshAllData();
  } catch (err) {
    showToast('Seeding failed: ' + err.message, 'error');
  }
}

// ==========================================================================
// Rendering Logic
// ==========================================================================

function renderDashboard() {
  const d = state.dashboard;
  document.getElementById('kpiStudentCount').textContent = d.studentCount ?? state.students.length;
  document.getElementById('kpiCourseCount').textContent = d.courseCount ?? state.courses.length;
  document.getElementById('kpiEnrollmentCount').textContent = d.enrollmentCount ?? state.enrollments.length;
  document.getElementById('kpiActiveCount').textContent = d.activeEnrollments ?? 
    state.enrollments.filter(e => e.status === 'ACTIVE').length;

  if (d.databaseMode) {
    document.getElementById('heroDbStatus').textContent = d.databaseMode;
    const sysMode = document.getElementById('sysDbMode');
    if (sysMode) sysMode.textContent = d.databaseMode;
  }
}

function updateBadges() {
  document.getElementById('badgeStudents').textContent = state.students.length;
  document.getElementById('badgeCourses').textContent = state.courses.length;
  document.getElementById('badgeEnrollments').textContent = state.enrollments.length;
}

function renderStudents(filterTerm = '') {
  const tbody = document.getElementById('studentsTableBody');
  const empty = document.getElementById('studentsEmptyState');

  let list = state.students;
  if (filterTerm) {
    const q = filterTerm.toLowerCase();
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  tbody.innerHTML = list.map(s => {
    const initials = s.name ? s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
    const coursesCount = s.enrolledCourses ?? (s.enrolledCourseIds ? s.enrolledCourseIds.length : 0);

    return `
      <tr>
        <td>
          <div class="student-meta-cell">
            <div class="table-avatar">${initials}</div>
            <div>
              <div class="student-name-text">${escapeHtml(s.name)}</div>
              <div class="student-email-text">${escapeHtml(s.email)}</div>
            </div>
          </div>
        </td>
        <td><code>${escapeHtml(s.rollNumber)}</code></td>
        <td><span class="dept-badge">${escapeHtml(s.department)}</span></td>
        <td><span class="year-pill">Year ${s.year}</span></td>
        <td><strong>${coursesCount}</strong> enrolled</td>
        <td class="text-right">
          <div class="actions-cell">
            <button class="btn btn-secondary btn-sm" onclick="editStudent('${s.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function handleStudentSearch(val) {
  renderStudents(val.trim());
}

function renderCourses() {
  const grid = document.getElementById('coursesGrid');
  const empty = document.getElementById('coursesEmptyState');

  if (state.courses.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = state.courses.map(c => {
    const percent = c.capacity > 0 ? Math.round((c.enrolledCount / c.capacity) * 100) : 0;
    let progressColor = 'progress-green';
    if (percent >= 100) progressColor = 'progress-red';
    else if (percent >= 75) progressColor = 'progress-amber';

    return `
      <div class="course-card" id="course-${c.id}">
        <div class="course-top">
          <span class="course-code-badge">${escapeHtml(c.id)}</span>
          <span class="course-credits">${c.credits} Credits</span>
        </div>
        <h4 class="course-title">${escapeHtml(c.name)}</h4>
        <div class="course-instructor">Instructor: <strong>${escapeHtml(c.instructor)}</strong></div>
        
        <div class="course-capacity-bar-wrap">
          <div class="capacity-labels">
            <span>Occupancy (${percent}%)</span>
            <span><strong>${c.enrolledCount}</strong> / ${c.capacity} Seats</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill ${progressColor}" style="width: ${Math.min(percent, 100)}%;"></div>
          </div>
        </div>

        <div class="course-card-actions">
          <button class="btn btn-secondary btn-sm btn-block" onclick="editCourse('${c.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCourse('${c.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderEnrollments() {
  const tbody = document.getElementById('enrollmentsTableBody');
  const empty = document.getElementById('enrollmentsEmptyState');

  if (state.enrollments.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  tbody.innerHTML = state.enrollments.map(e => {
    const student = state.students.find(s => s.id === e.studentId);
    const course = state.courses.find(c => c.id === e.courseId);

    const studentDisplay = student ? `${student.name} (${student.rollNumber})` : e.studentId;
    const courseDisplay = course ? `${course.name} [${course.id}]` : e.courseId;
    const statusClass = e.status === 'ACTIVE' ? 'status-active' :
                        e.status === 'COMPLETED' ? 'status-completed' : 'status-dropped';

    return `
      <tr>
        <td><small><code>${e.id.substring(0, 8)}...</code></small></td>
        <td><strong>${escapeHtml(studentDisplay)}</strong></td>
        <td>${escapeHtml(courseDisplay)}</td>
        <td><small>${escapeHtml(e.enrollmentDate || 'Recent')}</small></td>
        <td><span class="status-badge ${statusClass}">${escapeHtml(e.status)}</span></td>
        <td><span class="grade-badge">${escapeHtml(e.grade || 'N/A')}</span></td>
        <td class="text-right">
          <button class="btn btn-secondary btn-sm" onclick="openGradeModal('${e.id}')">Evaluate</button>
        </td>
      </tr>
    `;
  }).join('');
}

function populateEnrollmentDropdowns() {
  const stuSelect = document.getElementById('enrollStudentSelect');
  const crsSelect = document.getElementById('enrollCourseSelect');

  if (stuSelect) {
    stuSelect.innerHTML = '<option value="">-- Choose Student --</option>' +
      state.students.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.rollNumber)})</option>`).join('');
  }

  if (crsSelect) {
    crsSelect.innerHTML = '<option value="">-- Choose Course --</option>' +
      state.courses.map(c => `<option value="${c.id}">${escapeHtml(c.id)} - ${escapeHtml(c.name)} (${c.enrolledCount}/${c.capacity} filled)</option>`).join('');
  }
}

// ==========================================================================
// Student Operations
// ==========================================================================

function openStudentModal(id = null) {
  const modal = document.getElementById('studentModal');
  const title = document.getElementById('studentModalTitle');
  const form = document.getElementById('studentForm');
  form.reset();

  document.getElementById('studentFormId').value = id || '';
  if (id) {
    const s = state.students.find(st => st.id === id);
    if (s) {
      title.textContent = 'Edit Student Record';
      document.getElementById('studentNameInput').value = s.name;
      document.getElementById('studentEmailInput').value = s.email;
      document.getElementById('studentRollInput').value = s.rollNumber;
      document.getElementById('studentDeptInput').value = s.department;
      document.getElementById('studentYearInput').value = s.year;
      document.getElementById('studentPasswordGroup').style.display = 'none';
      document.getElementById('studentPasswordInput').required = false;
    }
  } else {
    title.textContent = 'Register New Student';
    document.getElementById('studentPasswordGroup').style.display = 'block';
    document.getElementById('studentPasswordInput').required = true;
  }

  modal.classList.add('open');
}

function closeStudentModal() {
  document.getElementById('studentModal').classList.remove('open');
}

function editStudent(id) {
  openStudentModal(id);
}

async function handleStudentFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('studentFormId').value;
  const payload = {
    name: document.getElementById('studentNameInput').value.trim(),
    email: document.getElementById('studentEmailInput').value.trim(),
    rollNumber: document.getElementById('studentRollInput').value.trim(),
    department: document.getElementById('studentDeptInput').value,
    year: parseInt(document.getElementById('studentYearInput').value, 10),
    password: document.getElementById('studentPasswordInput').value
  };

  try {
    if (id) {
      await apiRequest(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Student record updated successfully!', 'success');
    } else {
      await apiRequest('/api/students', { method: 'POST', body: JSON.stringify(payload) });
      showToast('New student created successfully!', 'success');
    }
    closeStudentModal();
    await Promise.all([loadStudents(), loadDashboard()]);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student record?')) return;
  try {
    await apiRequest(`/api/students/${id}`, { method: 'DELETE' });
    showToast('Student deleted successfully.', 'success');
    await Promise.all([loadStudents(), loadDashboard(), loadEnrollments()]);
  } catch (err) {
    showToast('Cannot delete student: ' + err.message, 'error');
  }
}

// ==========================================================================
// Course Operations
// ==========================================================================

function openCourseModal(id = null) {
  const modal = document.getElementById('courseModal');
  const title = document.getElementById('courseModalTitle');
  const form = document.getElementById('courseForm');
  form.reset();

  const idInput = document.getElementById('courseIdInput');
  document.getElementById('courseFormMode').value = id ? 'edit' : 'create';

  if (id) {
    const c = state.courses.find(crs => crs.id === id);
    if (c) {
      title.textContent = 'Edit Course Offering';
      idInput.value = c.id;
      idInput.disabled = true;
      document.getElementById('courseNameInput').value = c.name;
      document.getElementById('courseInstructorInput').value = c.instructor;
      document.getElementById('courseCreditsInput').value = c.credits;
      document.getElementById('courseCapacityInput').value = c.capacity;
    }
  } else {
    title.textContent = 'Create Course Offering';
    idInput.disabled = false;
  }

  modal.classList.add('open');
}

function closeCourseModal() {
  document.getElementById('courseModal').classList.remove('open');
}

function editCourse(id) {
  openCourseModal(id);
}

async function handleCourseFormSubmit(e) {
  e.preventDefault();
  const mode = document.getElementById('courseFormMode').value;
  const courseId = document.getElementById('courseIdInput').value.trim().toUpperCase();

  const payload = {
    id: courseId,
    name: document.getElementById('courseNameInput').value.trim(),
    instructor: document.getElementById('courseInstructorInput').value.trim(),
    credits: parseInt(document.getElementById('courseCreditsInput').value, 10),
    capacity: parseInt(document.getElementById('courseCapacityInput').value, 10)
  };

  try {
    if (mode === 'edit') {
      await apiRequest(`/api/courses/${courseId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Course offering updated!', 'success');
    } else {
      await apiRequest('/api/courses', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Course offering created successfully!', 'success');
    }
    closeCourseModal();
    await Promise.all([loadCourses(), loadDashboard()]);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteCourse(id) {
  if (!confirm(`Are you sure you want to delete course ${id}?`)) return;
  try {
    await apiRequest(`/api/courses/${id}`, { method: 'DELETE' });
    showToast(`Course ${id} deleted successfully.`, 'success');
    await Promise.all([loadCourses(), loadDashboard(), loadEnrollments()]);
  } catch (err) {
    showToast('Failed to delete course: ' + err.message, 'error');
  }
}

// ==========================================================================
// Enrollment Operations
// ==========================================================================

async function handleEnrollmentSubmit(e) {
  e.preventDefault();
  const studentId = document.getElementById('enrollStudentSelect').value;
  const courseId = document.getElementById('enrollCourseSelect').value;

  if (!studentId || !courseId) {
    showToast('Please select both a student and a course.', 'error');
    return;
  }

  try {
    await apiRequest('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId })
    });
    showToast('Student successfully enrolled in course!', 'success');
    document.getElementById('enrollmentForm').reset();
    await refreshAllData();
  } catch (err) {
    showToast('Enrollment failed: ' + err.message, 'error');
  }
}

function openGradeModal(enrollmentId) {
  const e = state.enrollments.find(en => en.id === enrollmentId);
  if (!e) return;

  const student = state.students.find(s => s.id === e.studentId);
  const course = state.courses.find(c => c.id === e.courseId);

  document.getElementById('gradeEnrollmentId').value = e.id;
  document.getElementById('gradeSelect').value = e.grade || 'Not Assigned';
  document.getElementById('statusSelect').value = e.status || 'ACTIVE';

  document.getElementById('gradeModalSummary').innerHTML = `
    <div><strong>Student:</strong> ${student ? student.name : e.studentId}</div>
    <div><strong>Course:</strong> ${course ? course.name : e.courseId}</div>
  `;

  document.getElementById('gradeModal').classList.add('open');
}

function closeGradeModal() {
  document.getElementById('gradeModal').classList.remove('open');
}

async function handleGradeFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('gradeEnrollmentId').value;
  const grade = document.getElementById('gradeSelect').value;
  const status = document.getElementById('statusSelect').value;

  try {
    await apiRequest(`/api/enrollments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ grade, status })
    });
    showToast('Evaluation updated successfully!', 'success');
    closeGradeModal();
    await Promise.all([loadEnrollments(), loadDashboard()]);
  } catch (err) {
    showToast('Failed to update: ' + err.message, 'error');
  }
}

// ==========================================================================
// Tab Switching
// ==========================================================================

function switchTab(tabId) {
  state.currentTab = tabId;

  // Toggle nav buttons
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Toggle tab sections
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.toggle('active', section.id === `tab-${tabId}`);
  });

  // Update topbar heading
  const headings = {
    dashboard: 'Executive Dashboard',
    students: 'Students Directory',
    courses: 'Course Catalog & Capacities',
    enrollments: 'Enrollments & Grades',
    architecture: 'System Architecture & MongoDB'
  };
  document.getElementById('pageHeading').textContent = headings[tabId] || 'Dashboard';
}

// ==========================================================================
// Theme Management
// ==========================================================================

function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcons(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcons(next);
}

function updateThemeIcons(theme) {
  const sun = document.getElementById('themeIconSun');
  const moon = document.getElementById('themeIconMoon');
  if (theme === 'dark') {
    sun.classList.remove('hidden');
    moon.classList.add('hidden');
  } else {
    sun.classList.add('hidden');
    moon.classList.remove('hidden');
  }
}

// ==========================================================================
// Toast Notification Utility
// ==========================================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ';
  toast.innerHTML = `<strong>${icon}</strong> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

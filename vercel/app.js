/**
 * StudentHub Application - Vercel Edition
 * Full client-side store with localStorage persistence.
 * Mimics the Java REST API behaviour entirely in-browser.
 */

function generateId(prefix) {
  return prefix + '-' + Math.random().toString(36).substr(2, 9);
}

function loadStore() {
  try {
    var raw = localStorage.getItem('studenthub_store');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

function saveStore() {
  localStorage.setItem('studenthub_store', JSON.stringify(store));
}

function getDefaultStore() {
  var past15 = new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0];
  var past10 = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];
  return {
    students: [
      { id: 's-101', name: 'Gaurav Singh', email: 'gaurav@srm.edu', password: 'pass123', rollNumber: 'RA2511026001', department: 'CSE(AIML)', year: 2, enrolledCourseIds: ['CS101'] },
      { id: 's-102', name: 'Priya Sharma', email: 'priya@srm.edu', password: 'pass123', rollNumber: 'RA2511026002', department: 'CSE', year: 3, enrolledCourseIds: ['CS202'] },
      { id: 's-103', name: 'Aman Verma', email: 'aman@srm.edu', password: 'pass123', rollNumber: 'RA2511026003', department: 'Information Technology', year: 1, enrolledCourseIds: [] }
    ],
    courses: [
      { id: 'CS101', name: 'Data Structures and Algorithms', instructor: 'Dr. A. Sharma', credits: 4, capacity: 60, enrolledCount: 1 },
      { id: 'CS202', name: 'Database Management Systems', instructor: 'Prof. R. Patel', credits: 4, capacity: 45, enrolledCount: 1 },
      { id: 'CS303', name: 'Machine Learning and AI', instructor: 'Dr. S. Mukherjee', credits: 3, capacity: 30, enrolledCount: 0 },
      { id: 'CS404', name: 'Cloud Computing and DevOps', instructor: 'Prof. K. Iyer', credits: 3, capacity: 40, enrolledCount: 0 }
    ],
    enrollments: [
      { id: 'e-101', studentId: 's-101', courseId: 'CS101', enrollmentDate: past15, grade: 'A', status: 'ACTIVE' },
      { id: 'e-102', studentId: 's-102', courseId: 'CS202', enrollmentDate: past10, grade: 'B', status: 'ACTIVE' }
    ]
  };
}

var store = loadStore() || getDefaultStore();

var DB = {
  getAllStudents: function() { return store.students.slice(); },
  getStudent: function(id) { return store.students.find(function(s){return s.id===id;}) || null; },
  createStudent: function(data) {
    if (!data.name || !data.name.trim()) throw new Error('Name is required.');
    if (!data.email || !data.email.trim()) throw new Error('Email is required.');
    if (!data.rollNumber || !data.rollNumber.trim()) throw new Error('Roll number is required.');
    if (store.students.some(function(s){return s.rollNumber.toLowerCase()===data.rollNumber.toLowerCase();}))
      throw new Error('Roll number already registered: ' + data.rollNumber);
    if (store.students.some(function(s){return s.email.toLowerCase()===data.email.toLowerCase();}))
      throw new Error('Email already registered: ' + data.email);
    var student = { id: generateId('s'), name: data.name.trim(), email: data.email.trim(), password: data.password||'', rollNumber: data.rollNumber.trim(), department: data.department||'CSE', year: parseInt(data.year)||1, enrolledCourseIds: [] };
    store.students.push(student);
    saveStore();
    return student;
  },
  updateStudent: function(id, data) {
    var idx = store.students.findIndex(function(s){return s.id===id;});
    if (idx===-1) throw new Error('Student not found.');
    var s = store.students[idx];
    if (data.name) s.name = data.name;
    if (data.email) s.email = data.email;
    if (data.rollNumber) s.rollNumber = data.rollNumber;
    if (data.department) s.department = data.department;
    if (data.year) s.year = parseInt(data.year);
    if (data.password && data.password.trim()) s.password = data.password;
    saveStore();
    return s;
  },
  deleteStudent: function(id) {
    var idx = store.students.findIndex(function(s){return s.id===id;});
    if (idx===-1) throw new Error('Student not found.');
    store.students.splice(idx, 1);
    store.enrollments = store.enrollments.filter(function(e){return e.studentId!==id;});
    saveStore();
  },
  getAllCourses: function() { return store.courses.slice(); },
  getCourse: function(id) { return store.courses.find(function(c){return c.id===id;}) || null; },
  createCourse: function(data) {
    if (!data.id || !data.id.trim()) throw new Error('Course ID is required.');
    if (store.courses.some(function(c){return c.id.toUpperCase()===data.id.toUpperCase();}))
      throw new Error('Course ID already exists: ' + data.id);
    var course = { id: data.id.trim().toUpperCase(), name: data.name||'', instructor: data.instructor||'', credits: parseInt(data.credits)||3, capacity: parseInt(data.capacity)||50, enrolledCount: 0 };
    store.courses.push(course);
    saveStore();
    return course;
  },
  updateCourse: function(id, data) {
    var c = store.courses.find(function(c){return c.id===id;});
    if (!c) throw new Error('Course not found.');
    if (data.name) c.name = data.name;
    if (data.instructor) c.instructor = data.instructor;
    if (data.credits) c.credits = parseInt(data.credits);
    if (data.capacity) c.capacity = parseInt(data.capacity);
    saveStore();
    return c;
  },
  deleteCourse: function(id) {
    var c = store.courses.find(function(c){return c.id===id;});
    if (!c) throw new Error('Course not found.');
    if (c.enrolledCount > 0) throw new Error('Cannot delete course with active enrollments (' + c.enrolledCount + ').');
    store.courses = store.courses.filter(function(c){return c.id!==id;});
    saveStore();
  },
  getAllEnrollments: function() { return store.enrollments.slice(); },
  createEnrollment: function(studentId, courseId) {
    var student = store.students.find(function(s){return s.id===studentId;});
    var course = store.courses.find(function(c){return c.id===courseId;});
    if (!student) throw new Error('Student not found.');
    if (!course) throw new Error('Course not found.');
    if (store.enrollments.some(function(e){return e.studentId===studentId && e.courseId===courseId && e.status==='ACTIVE';}))
      throw new Error('Student is already actively enrolled in this course.');
    if (course.enrolledCount >= course.capacity) throw new Error('Course capacity reached (' + course.capacity + ' seats full).');
    course.enrolledCount++;
    if (!student.enrolledCourseIds.includes(courseId)) student.enrolledCourseIds.push(courseId);
    var enrollment = { id: generateId('e'), studentId: studentId, courseId: courseId, enrollmentDate: new Date().toISOString().split('T')[0], grade: 'Not Assigned', status: 'ACTIVE' };
    store.enrollments.push(enrollment);
    saveStore();
    return enrollment;
  },
  updateEnrollment: function(id, data) {
    var e = store.enrollments.find(function(e){return e.id===id;});
    if (!e) throw new Error('Enrollment not found.');
    if (data.grade !== undefined) e.grade = String(data.grade).toUpperCase();
    if (data.status !== undefined) e.status = String(data.status).toUpperCase();
    saveStore();
    return e;
  },
  getDashboard: function() {
    var active = store.enrollments.filter(function(e){return e.status==='ACTIVE';}).length;
    return { studentCount: store.students.length, courseCount: store.courses.length, enrollmentCount: store.enrollments.length, activeEnrollments: active, databaseMode: 'Client-Side Store (localStorage)', status: 'System Online' };
  },
  seedData: function() { store = getDefaultStore(); saveStore(); }
};

var state = { students: [], courses: [], enrollments: [], dashboard: {}, currentTab: 'dashboard' };

document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  refreshAllData();
  var el = document.getElementById('systemStatusText');
  if (el) el.textContent = 'System Online - Vercel Edge';
});

function refreshAllData() {
  loadDashboard(); loadStudents(); loadCourses(); loadEnrollments();
}

function loadDashboard() { state.dashboard = DB.getDashboard(); renderDashboard(); }
function loadStudents() { state.students = DB.getAllStudents(); renderStudents(); updateBadges(); populateEnrollmentDropdowns(); }
function loadCourses() { state.courses = DB.getAllCourses(); renderCourses(); updateBadges(); populateEnrollmentDropdowns(); }
function loadEnrollments() { state.enrollments = DB.getAllEnrollments(); renderEnrollments(); updateBadges(); }

function seedSampleData() {
  DB.seedData();
  showToast('Sample academic data successfully initialized!', 'success');
  refreshAllData();
}

function renderDashboard() {
  var d = state.dashboard;
  document.getElementById('kpiStudentCount').textContent = d.studentCount || 0;
  document.getElementById('kpiCourseCount').textContent = d.courseCount || 0;
  document.getElementById('kpiEnrollmentCount').textContent = d.enrollmentCount || 0;
  document.getElementById('kpiActiveCount').textContent = d.activeEnrollments || 0;
  var heroDb = document.getElementById('heroDbStatus');
  if (heroDb) heroDb.textContent = d.databaseMode || 'localStorage';
  var sysMode = document.getElementById('sysDbMode');
  if (sysMode) sysMode.textContent = d.databaseMode || 'localStorage';
}

function updateBadges() {
  document.getElementById('badgeStudents').textContent = state.students.length;
  document.getElementById('badgeCourses').textContent = state.courses.length;
  document.getElementById('badgeEnrollments').textContent = state.enrollments.length;
}

function renderStudents(filterTerm) {
  filterTerm = filterTerm || '';
  var tbody = document.getElementById('studentsTableBody');
  var empty = document.getElementById('studentsEmptyState');
  var list = state.students;
  if (filterTerm) {
    var q = filterTerm.toLowerCase();
    list = list.filter(function(s) { return s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.department.toLowerCase().includes(q); });
  }
  if (list.length === 0) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  tbody.innerHTML = list.map(function(s) {
    var initials = s.name ? s.name.split(' ').map(function(n){return n[0];}).join('').substring(0,2).toUpperCase() : 'ST';
    var cnt = s.enrolledCourseIds ? s.enrolledCourseIds.length : 0;
    return '<tr><td><div class="student-meta-cell"><div class="table-avatar">' + initials + '</div><div><div class="student-name-text">' + escapeHtml(s.name) + '</div><div class="student-email-text">' + escapeHtml(s.email) + '</div></div></div></td><td><code>' + escapeHtml(s.rollNumber) + '</code></td><td><span class="dept-badge">' + escapeHtml(s.department) + '</span></td><td><span class="year-pill">Year ' + s.year + '</span></td><td><strong>' + cnt + '</strong> enrolled</td><td class="text-right"><div class="actions-cell"><button class="btn btn-secondary btn-sm" onclick="editStudent(\'' + s.id + '\')">Edit</button><button class="btn btn-danger btn-sm" onclick="deleteStudent(\'' + s.id + '\')">Delete</button></div></td></tr>';
  }).join('');
}

function handleStudentSearch(val) { renderStudents(val.trim()); }

function renderCourses() {
  var grid = document.getElementById('coursesGrid');
  var empty = document.getElementById('coursesEmptyState');
  if (state.courses.length === 0) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  grid.innerHTML = state.courses.map(function(c) {
    var percent = c.capacity > 0 ? Math.round((c.enrolledCount / c.capacity) * 100) : 0;
    var pc = percent >= 100 ? 'progress-red' : (percent >= 75 ? 'progress-amber' : 'progress-green');
    return '<div class="course-card" id="course-' + c.id + '"><div class="course-top"><span class="course-code-badge">' + escapeHtml(c.id) + '</span><span class="course-credits">' + c.credits + ' Credits</span></div><h4 class="course-title">' + escapeHtml(c.name) + '</h4><div class="course-instructor">Instructor: <strong>' + escapeHtml(c.instructor) + '</strong></div><div class="course-capacity-bar-wrap"><div class="capacity-labels"><span>Occupancy (' + percent + '%)</span><span><strong>' + c.enrolledCount + '</strong> / ' + c.capacity + ' Seats</span></div><div class="progress-track"><div class="progress-fill ' + pc + '" style="width:' + Math.min(percent,100) + '%;"></div></div></div><div class="course-card-actions"><button class="btn btn-secondary btn-sm btn-block" onclick="editCourse(\'' + c.id + '\')">Edit</button><button class="btn btn-danger btn-sm" onclick="deleteCourse(\'' + c.id + '\')">Delete</button></div></div>';
  }).join('');
}

function renderEnrollments() {
  var tbody = document.getElementById('enrollmentsTableBody');
  var empty = document.getElementById('enrollmentsEmptyState');
  if (state.enrollments.length === 0) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  tbody.innerHTML = state.enrollments.map(function(e) {
    var student = state.students.find(function(s){return s.id===e.studentId;});
    var course = state.courses.find(function(c){return c.id===e.courseId;});
    var sd = student ? student.name + ' (' + student.rollNumber + ')' : e.studentId;
    var cd = course ? course.name + ' [' + course.id + ']' : e.courseId;
    var sc = e.status==='ACTIVE' ? 'status-active' : (e.status==='COMPLETED' ? 'status-completed' : 'status-dropped');
    return '<tr><td><small><code>' + e.id.substring(0,8) + '...</code></small></td><td><strong>' + escapeHtml(sd) + '</strong></td><td>' + escapeHtml(cd) + '</td><td><small>' + escapeHtml(e.enrollmentDate||'Recent') + '</small></td><td><span class="status-badge ' + sc + '">' + escapeHtml(e.status) + '</span></td><td><span class="grade-badge">' + escapeHtml(e.grade||'N/A') + '</span></td><td class="text-right"><button class="btn btn-secondary btn-sm" onclick="openGradeModal(\'' + e.id + '\')">Evaluate</button></td></tr>';
  }).join('');
}

function populateEnrollmentDropdowns() {
  var stuSelect = document.getElementById('enrollStudentSelect');
  var crsSelect = document.getElementById('enrollCourseSelect');
  if (stuSelect) stuSelect.innerHTML = '<option value="">-- Choose Student --</option>' + state.students.map(function(s){return '<option value="' + s.id + '">' + escapeHtml(s.name) + ' (' + escapeHtml(s.rollNumber) + ')</option>';}).join('');
  if (crsSelect) crsSelect.innerHTML = '<option value="">-- Choose Course --</option>' + state.courses.map(function(c){return '<option value="' + c.id + '">' + escapeHtml(c.id) + ' - ' + escapeHtml(c.name) + ' (' + c.enrolledCount + '/' + c.capacity + ' filled)</option>';}).join('');
}

function openStudentModal(id) {
  id = id || null;
  var modal = document.getElementById('studentModal');
  var title = document.getElementById('studentModalTitle');
  document.getElementById('studentForm').reset();
  document.getElementById('studentFormId').value = id || '';
  if (id) {
    var s = state.students.find(function(st){return st.id===id;});
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

function closeStudentModal() { document.getElementById('studentModal').classList.remove('open'); }
function editStudent(id) { openStudentModal(id); }

function handleStudentFormSubmit(e) {
  e.preventDefault();
  var id = document.getElementById('studentFormId').value;
  var payload = { name: document.getElementById('studentNameInput').value.trim(), email: document.getElementById('studentEmailInput').value.trim(), rollNumber: document.getElementById('studentRollInput').value.trim(), department: document.getElementById('studentDeptInput').value, year: parseInt(document.getElementById('studentYearInput').value, 10), password: document.getElementById('studentPasswordInput').value };
  try {
    if (id) { DB.updateStudent(id, payload); showToast('Student record updated successfully!', 'success'); }
    else { DB.createStudent(payload); showToast('New student registered successfully!', 'success'); }
    closeStudentModal(); loadStudents(); loadDashboard();
  } catch(err) { showToast(err.message, 'error'); }
}

function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student record?')) return;
  try { DB.deleteStudent(id); showToast('Student deleted successfully.', 'success'); loadStudents(); loadEnrollments(); loadDashboard(); }
  catch(err) { showToast('Cannot delete: ' + err.message, 'error'); }
}

function openCourseModal(id) {
  id = id || null;
  var modal = document.getElementById('courseModal');
  var title = document.getElementById('courseModalTitle');
  document.getElementById('courseForm').reset();
  var idInput = document.getElementById('courseIdInput');
  document.getElementById('courseFormMode').value = id ? 'edit' : 'create';
  if (id) {
    var c = state.courses.find(function(crs){return crs.id===id;});
    if (c) {
      title.textContent = 'Edit Course Offering';
      idInput.value = c.id; idInput.disabled = true;
      document.getElementById('courseNameInput').value = c.name;
      document.getElementById('courseInstructorInput').value = c.instructor;
      document.getElementById('courseCreditsInput').value = c.credits;
      document.getElementById('courseCapacityInput').value = c.capacity;
    }
  } else { title.textContent = 'Create Course Offering'; idInput.disabled = false; }
  modal.classList.add('open');
}

function closeCourseModal() { document.getElementById('courseModal').classList.remove('open'); }
function editCourse(id) { openCourseModal(id); }

function handleCourseFormSubmit(e) {
  e.preventDefault();
  var mode = document.getElementById('courseFormMode').value;
  var courseId = document.getElementById('courseIdInput').value.trim().toUpperCase();
  var payload = { id: courseId, name: document.getElementById('courseNameInput').value.trim(), instructor: document.getElementById('courseInstructorInput').value.trim(), credits: parseInt(document.getElementById('courseCreditsInput').value,10), capacity: parseInt(document.getElementById('courseCapacityInput').value,10) };
  try {
    if (mode==='edit') { DB.updateCourse(courseId, payload); showToast('Course offering updated!', 'success'); }
    else { DB.createCourse(payload); showToast('Course offering created!', 'success'); }
    closeCourseModal(); loadCourses(); loadDashboard();
  } catch(err) { showToast(err.message, 'error'); }
}

function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete course ' + id + '?')) return;
  try { DB.deleteCourse(id); showToast('Course ' + id + ' deleted successfully.', 'success'); loadCourses(); loadDashboard(); }
  catch(err) { showToast('Failed to delete course: ' + err.message, 'error'); }
}

function handleEnrollmentSubmit(e) {
  e.preventDefault();
  var studentId = document.getElementById('enrollStudentSelect').value;
  var courseId = document.getElementById('enrollCourseSelect').value;
  if (!studentId || !courseId) { showToast('Please select both a student and a course.', 'error'); return; }
  try { DB.createEnrollment(studentId, courseId); showToast('Student successfully enrolled in course!', 'success'); document.getElementById('enrollmentForm').reset(); refreshAllData(); }
  catch(err) { showToast('Enrollment failed: ' + err.message, 'error'); }
}

function openGradeModal(enrollmentId) {
  var e = state.enrollments.find(function(en){return en.id===enrollmentId;});
  if (!e) return;
  var student = state.students.find(function(s){return s.id===e.studentId;});
  var course = state.courses.find(function(c){return c.id===e.courseId;});
  document.getElementById('gradeEnrollmentId').value = e.id;
  document.getElementById('gradeSelect').value = e.grade || 'Not Assigned';
  document.getElementById('statusSelect').value = e.status || 'ACTIVE';
  document.getElementById('gradeModalSummary').innerHTML = '<div><strong>Student:</strong> ' + (student ? student.name : e.studentId) + '</div><div><strong>Course:</strong> ' + (course ? course.name : e.courseId) + '</div>';
  document.getElementById('gradeModal').classList.add('open');
}

function closeGradeModal() { document.getElementById('gradeModal').classList.remove('open'); }

function handleGradeFormSubmit(e) {
  e.preventDefault();
  var id = document.getElementById('gradeEnrollmentId').value;
  var grade = document.getElementById('gradeSelect').value;
  var status = document.getElementById('statusSelect').value;
  try { DB.updateEnrollment(id, { grade: grade, status: status }); showToast('Evaluation updated successfully!', 'success'); closeGradeModal(); loadEnrollments(); loadDashboard(); }
  catch(err) { showToast('Failed to update: ' + err.message, 'error'); }
}

function switchTab(tabId) {
  state.currentTab = tabId;
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(function(btn) { btn.classList.toggle('active', btn.dataset.tab === tabId); });
  document.querySelectorAll('.tab-content').forEach(function(section) { section.classList.toggle('active', section.id === 'tab-' + tabId); });
  var headings = { dashboard: 'Executive Dashboard', students: 'Students Directory', courses: 'Course Catalog and Capacities', enrollments: 'Enrollments and Grades', architecture: 'System Architecture and MongoDB' };
  document.getElementById('pageHeading').textContent = headings[tabId] || 'Dashboard';
}

function initTheme() {
  var saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcons(saved);
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcons(next);
}

function updateThemeIcons(theme) {
  var sun = document.getElementById('themeIconSun');
  var moon = document.getElementById('themeIconMoon');
  if (theme === 'dark') { sun.classList.remove('hidden'); moon.classList.add('hidden'); }
  else { sun.classList.add('hidden'); moon.classList.remove('hidden'); }
}

function showToast(message, type) {
  type = type || 'info';
  var container = document.getElementById('toastContainer');
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  var icon = type==='success' ? 'OK' : (type==='error' ? 'ERR' : 'INF');
  toast.innerHTML = '<strong>' + icon + '</strong> <span>' + escapeHtml(message) + '</span>';
  container.appendChild(toast);
  setTimeout(function() { toast.style.opacity='0'; toast.style.transform='translateY(-10px)'; toast.style.transition='all 0.3s ease'; setTimeout(function(){toast.remove();},300); }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
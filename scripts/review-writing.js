// Plan B: Fetch students from API and render
let studentList = [];
const reviewSection = document.getElementById('reviewSection');
const studentInfo = document.getElementById('studentInfo');
const writingContent = document.getElementById('writingContent');
const feedback = document.getElementById('feedback');
const submitFeedback = document.getElementById('submitFeedback');

document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
});

async function loadStudents() {
  try {
    const res = await fetch('api_students.php', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const list = await res.json();
    studentList = list;
    renderStudentList(list);
  } catch (err) {
    console.error('Failed to load students:', err);
    showStudentListError('Failed to load students');
  }
}

function showStudentListError(msg) {
  const container = document.querySelector('.student-modern-list');
  if (container) container.innerHTML = `<li><span style="color:#888;">${msg}</span></li>`;
}

function renderStudentList(list) {
  // Sort: pending first, then completed
  list.sort((a, b) => {
    const aCompleted = a.writing_score !== null && a.writing_score !== undefined && a.writing_score !== '';
    const bCompleted = b.writing_score !== null && b.writing_score !== undefined && b.writing_score !== '';
    if (aCompleted === bCompleted) return 0;
    return aCompleted ? 1 : -1;
  });
  const container = document.querySelector('.student-modern-list');
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = '<li><span style="color:#888;">No students found.</span></li>';
    return;
  }
  list.forEach(student => {
    const completed = student.writing_score !== null && student.writing_score !== undefined && student.writing_score !== '';
    const statusText = completed ? 'Completed' : 'Pending';
    const statusClass = completed ? 'status-completed' : 'status-pending';
    const statusStyle = completed ? 'background:linear-gradient(90deg,#e0eaff 60%,#2563eb 100%);color:#2563eb;border:2px solid #2563eb;' : '';
    const li = document.createElement('li');
    li.className = 'student-modern-item';
    li.setAttribute('data-student-id', student.id);
    li.innerHTML = `
      <span class="student-name">${student.name}</span>
      <span class="student-status ${statusClass}" style="${statusStyle}">${statusText}</span>
      <span class="student-email">${student.email}</span>
      <button class="review-modern-btn lux-btn" data-student-id="${student.id}">Review</button>
    `;
    container.appendChild(li);
  });
  // Add event listeners for review buttons
  container.querySelectorAll('.review-modern-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      selectStudent(parseInt(this.getAttribute('data-student-id')));
    });
  });
}

function selectStudent(studentId) {
  const student = studentList.find(s => parseInt(s.id) === studentId);
  if (!student) return;
  showReviewPanel(student);
}

function showReviewPanel(student) {
  if (!reviewSection) return;
  reviewSection.style.display = 'block';
  studentInfo.textContent = `${student.name}  ${student.email}`;
  document.getElementById('studentName').textContent = student.name;
  document.getElementById('studentEmail').textContent = student.email;
  document.getElementById('studentPhone').textContent = student.phone || '';
  document.getElementById('writingPrompt').textContent = `Prompt: ${student.writing_prompt || ''}`;
  document.getElementById('writingQuestion').textContent = '';
  document.getElementById('studentWritingText').textContent = student.writing_answer || '';
  const markInput = document.getElementById('writingMark');
  markInput.value = student.writing_score !== null && student.writing_score !== undefined ? student.writing_score : '';

  // Save mark logic
  const saveMarkBtn = document.getElementById('saveMarkBtn');
  if (saveMarkBtn) {
    // Remove previous event listeners by cloning
    const newBtn = saveMarkBtn.cloneNode(true);
    saveMarkBtn.parentNode.replaceChild(newBtn, saveMarkBtn);
    newBtn.addEventListener('click', function() {
      const mark = parseFloat(markInput.value);
      if (isNaN(mark) || mark < 0 || mark > 10) {
        markInput.style.borderColor = '#ff4d4f';
        markInput.focus();
        return;
      }
      markInput.style.borderColor = '#d1eaff';
      // Save to backend
      fetch('save_writing_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          submission_id: student.submission_id, // use correct exam_submissions.id
          writing_score: mark
        })
      })
      .then(resp => resp.json())
      .then(data => {
        if (data.success) {
          // Update the score in the studentList and re-render
          student.writing_score = mark;
          renderStudentList(studentList);
          newBtn.textContent = 'Saved!';
          newBtn.style.background = 'linear-gradient(90deg,#FFA500 60%,#2563eb 100%)';
          setTimeout(() => {
            newBtn.textContent = 'Save';
            newBtn.style.background = 'linear-gradient(90deg,#2563eb 60%,#FFA500 100%)';
          }, 1200);
        } else {
          alert('Failed to save score: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(() => {
        alert('Network error while saving score.');
      });
    });
  }
}

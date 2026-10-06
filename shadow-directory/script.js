const API_URL = 'https://jsonplaceholder.typicode.com/users';
let students = [];

const elements = {
  grid: document.getElementById('studentGrid'),
  search: document.getElementById('searchInput'),
  city: document.getElementById('cityFilter'),
  status: document.getElementById('status'),
  stats: document.getElementById('stats'),
  reset: document.getElementById('resetBtn')
};

async function fetchStudents() {
  setStatus('Summoning student data...');
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    students = await response.json();
    students = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      city: student.address.city
    }));
    populateCities();
    renderStudents(students);
    elements.stats.textContent = `${students.length} STUDENTS • SYSTEM READY`;
    setStatus('');
  } catch (error) {
    console.error('Student API error:', error);
    elements.stats.textContent = 'SYSTEM OFFLINE';
    setStatus('Unable to summon students. Check your internet connection and try again.', true);
  }
}

function populateCities() {
  const cities = [...new Set(students.map(student => student.city))].sort();
  elements.city.innerHTML = '<option value="all">All Cities</option>' +
    cities.map(city => `<option value="${city}">${city}</option>`).join('');
}

function filterStudents() {
  const searchTerm = elements.search.value.trim().toLowerCase();
  const selectedCity = elements.city.value;
  return students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm) || student.email.toLowerCase().includes(searchTerm);
    const matchesCity = selectedCity === 'all' || student.city === selectedCity;
    return matchesSearch && matchesCity;
  });
}

function renderStudents(list) {
  if (!list.length) {
    elements.grid.innerHTML = '<div class="empty"><b>NO RESULTS FOUND</b>The gate contains no student matching your search.</div>';
    return;
  }
  elements.grid.innerHTML = list.map((student, index) => `
    <article class="student-card">
      <span class="rank">GUILD MEMBER #${String(index + 1).padStart(2, '0')}</span>
      <div class="avatar">${getInitials(student.name)}</div>
      <h3>${escapeHtml(student.name)}</h3>
      <p class="detail">✉ <strong>${escapeHtml(student.email)}</strong></p>
      <p class="detail">◈ <strong>${escapeHtml(student.city)}</strong></p>
      <span class="city">${escapeHtml(student.city.toUpperCase())}</span>
    </article>`).join('');
}

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle('error', isError);
}

function handleFilters() {
  renderStudents(filterStudents());
}

function resetFilters() {
  elements.search.value = '';
  elements.city.value = 'all';
  renderStudents(students);
}

elements.search.addEventListener('input', handleFilters);
elements.city.addEventListener('change', handleFilters);
elements.reset.addEventListener('click', resetFilters);
fetchStudents();

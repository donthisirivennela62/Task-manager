const apiBase = '/api';

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const userPanel = document.getElementById('user-panel');
const userInfo = document.getElementById('user-info');

const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');

const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupRole = document.getElementById('signupRole');
const signupBtn = document.getElementById('signupBtn');

const logoutBtn = document.getElementById('logoutBtn');
const projectName = document.getElementById('projectName');
const projectDescription = document.getElementById('projectDescription');
const createProjectBtn = document.getElementById('createProjectBtn');

const projectSelect = document.getElementById('projectSelect');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskDueDate = document.getElementById('taskDueDate');
const createTaskBtn = document.getElementById('createTaskBtn');

const projectsContainer = document.getElementById('projectsContainer');
const tasksContainer = document.getElementById('tasksContainer');

const projectCount = document.getElementById('projectCount');
const totalTasks = document.getElementById('totalTasks');
const todoCount = document.getElementById('todoCount');
const inProgressCount = document.getElementById('inProgressCount');
const doneCount = document.getElementById('doneCount');
const overdueCount = document.getElementById('overdueCount');

const getAuthHeaders = () => {
  const token = localStorage.getItem('ttm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const updateUI = (user) => {
  if (!user) {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    userPanel.classList.add('hidden');
    return;
  }
  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');
  userPanel.classList.remove('hidden');
  userInfo.textContent = `${user.name} (${user.role})`;
};

const showMessage = (message) => {
  alert(message);
};

const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const loadDashboard = async () => {
  const data = await fetchJSON(`${apiBase}/dashboard`, { headers: getAuthHeaders() });
  projectCount.textContent = data.projectCount;
  totalTasks.textContent = data.totalTasks;
  todoCount.textContent = data.todo;
  inProgressCount.textContent = data.inProgress;
  doneCount.textContent = data.done;
  overdueCount.textContent = data.overdue;
};

const loadProjects = async () => {
  const projects = await fetchJSON(`${apiBase}/projects`, { headers: getAuthHeaders() });
  projectSelect.innerHTML = '<option value="">Select a project</option>';
  projectsContainer.innerHTML = '';
  projects.forEach((project) => {
    projectSelect.innerHTML += `<option value="${project._id}">${project.name}</option>`;
    const memberList = project.members.map((member) => member.name).join(', ') || 'No members';
    projectsContainer.innerHTML += `
      <div class="list-item">
        <h3>${project.name}</h3>
        <p>${project.description || 'No description yet.'}</p>
        <small>Owner: ${project.owner.name}</small><br />
        <small>Members: ${memberList}</small>
      </div>
    `;
  });
};

const loadTasks = async () => {
  const tasks = await fetchJSON(`${apiBase}/tasks`, { headers: getAuthHeaders() });
  tasksContainer.innerHTML = '';
  tasks.forEach((task) => {
    tasksContainer.innerHTML += `
      <div class="list-item">
        <h3>${task.title}</h3>
        <p>${task.description || 'No description.'}</p>
        <small>Project: ${task.project?.name || 'Unknown'}</small><br />
        <small>Status: ${task.status}</small><br />
        <small>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</small>
      </div>
    `;
  });
};

const refreshApp = async () => {
  try {
    await loadDashboard();
    await loadProjects();
    await loadTasks();
  } catch (error) {
    console.error(error);
    showMessage(error.message);
  }
};

loginBtn.addEventListener('click', async () => {
  try {
    const data = await fetchJSON(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail.value, password: loginPassword.value })
    });
    localStorage.setItem('ttm_token', data.token);
    localStorage.setItem('ttm_user', JSON.stringify(data.user));
    updateUI(data.user);
    await refreshApp();
  } catch (error) {
    showMessage(error.message);
  }
});

signupBtn.addEventListener('click', async () => {
  try {
    const data = await fetchJSON(`${apiBase}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: signupName.value,
        email: signupEmail.value,
        password: signupPassword.value,
        role: signupRole.value
      })
    });
    localStorage.setItem('ttm_token', data.token);
    localStorage.setItem('ttm_user', JSON.stringify(data.user));
    updateUI(data.user);
    await refreshApp();
  } catch (error) {
    showMessage(error.message);
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('ttm_token');
  localStorage.removeItem('ttm_user');
  updateUI(null);
});

createProjectBtn.addEventListener('click', async () => {
  try {
    await fetchJSON(`${apiBase}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ name: projectName.value, description: projectDescription.value })
    });
    projectName.value = '';
    projectDescription.value = '';
    await refreshApp();
  } catch (error) {
    showMessage(error.message);
  }
});

createTaskBtn.addEventListener('click', async () => {
  try {
    if (!projectSelect.value) {
      throw new Error('Please select a project.');
    }
    await fetchJSON(`${apiBase}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        title: taskTitle.value,
        description: taskDescription.value,
        dueDate: taskDueDate.value,
        projectId: projectSelect.value
      })
    });
    taskTitle.value = '';
    taskDescription.value = '';
    taskDueDate.value = '';
    await refreshApp();
  } catch (error) {
    showMessage(error.message);
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('ttm_user'));
  updateUI(user);
  if (user) {
    await refreshApp();
  }
});

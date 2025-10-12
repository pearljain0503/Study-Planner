//EVENTS
const addUpdateTaskForm = document.querySelector('#addUpdateTaskForm');
const txtTaskId = document.querySelector('#taskId');
const txtTaskTitle = document.querySelector('#taskTitle');
const txtTaskDescription = document.querySelector('#taskDescription');
//values
const choiceTaskCategory = document.querySelector('#taskCategory');
const choiceTaskPriority = document.querySelector('#taskPriority');
const addUpdateTaskModal = document.querySelector('#addUpdateTaskModal');
const deleteTaskModal = document.querySelector('#deleteTaskModal');
const btnDeleteTask = document.querySelector('#btnDeleteTask');
const messageToast = document.querySelector('#messageToast');
const todoLaneCards = document.querySelector('#todoLane .task-cards');
const inProgressLaneCards = document.querySelector('#inProgressLane .task-cards');
const doneLaneCards = document.querySelector('#doneLane .task-cards');
const addUpdateTaskModalLabel = document.querySelector('#addUpdateTaskModalLabel');
const btnAddUpdateTask = document.querySelector('#btnAddUpdateTask');
const kanbanBoard = document.querySelector('#kanban-board');
const btnAddTask = document.querySelector('#btnAddTask');
const btnAddTaskShortcut = document.querySelector('#btnAddTaskShortcut');

let tasks = [];
let draggedTaskId = null;
/**** GLOBAL CONSTANTS****/
const TASKS_KEY = "tasks";

const laneNameToDOMElementMapping = {
  todo: todoLaneCards,
  inProgress: inProgressLaneCards,
  done: doneLaneCards
};
const laneIdToLaneNameMapping = {
  todoLane: 'todo',
  inProgressLane: 'inProgress',
  doneLane: 'done'
};
const categoriesColor = {
    Personal: 'text-bg-info',
    Work: 'text-bg-dark'
};
const prioritiesColor = {
    Low: 'text-bg-success',
    Medium: 'text-bg-warning',
    High: 'text-bg-danger'
};

/**** HELPER FUNCTIONS *****/
function clearAllFields() {
    txtTaskId.value = '';
    txtTaskTitle.value = '';
    txtTaskDescription.value = '';
    choiceTaskCategory.value = 'Personal';
    choiceTaskPriority.value = 'Low';
}
function loadAllFields(task) {
    txtTaskId.value = task.id;
    txtTaskTitle.value = task.title;
    txtTaskDescription.value = task.description;
    choiceTaskCategory.value = task.category;
    choiceTaskPriority.value = task.priority;
}
function createTaskCard(taskId, taskTitle, taskDescription, taskCategory, taskPriority) {
    const taskCard = document.createElement('div');
    taskCard.classList.add('card');
    taskCard.classList.add('my-3');
    taskCard.setAttribute('draggable', true);
    taskCard.dataset.taskId = taskId;
    taskCard.innerHTML = `
    <div class="card-body">
                <h5 class="card-title">${taskTitle}</h5>
                <p class="card-text small">
                 ${taskDescription}
                </p>

                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <span class="badge ${categoriesColor[taskCategory]}">${taskCategory}</span>
                    <span class="badge ${prioritiesColor[taskPriority]}">${taskPriority}</span>
                  </div>
                  <div>
                    <button class="btn btn-sm btn-warning edit-task" title="Edit Task" data-task-id="${taskId}">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-task" title="Delete Task" data-task-id="${taskId}">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </div>
              </div>
    `;
    taskCard.addEventListener('dragstart', handleDragStart);
    return taskCard;
}
function getTaskObject(taskTitle, taskDescription, taskCategory, taskPriority, taskId = null, lane ='todo') {
  const task = {
    id: taskId ? taskId : Date.now(),
    title: taskTitle,
    description: taskDescription,
    category: taskCategory,
    priority:taskPriority,
    lane: lane
  };
  return task;
}
function saveToLocalStorage() {
localStorage.setItem(TASKS_KEY,JSON.stringify(tasks));
}
function loadFromLocalStorage() {
tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
}
function renderTasks() {
   for(const key in laneNameToDOMElementMapping) {
    while(laneNameToDOMElementMapping[key].firstChild) { 
      laneNameToDOMElementMapping[key].firstChild.remove();
    }
   }

   tasks.forEach(function(task) {
    const taskCard = createTaskCard(task.id, task.title, task.description, task.category, task.priority);
    if(task.lane === "done") {
      taskCard.removeAttribute('draggable');
      taskCard.style.background = 'rgb(240 , 240 , 240)';
      console.log(taskCard);
    }
    laneNameToDOMElementMapping[task.lane].appendChild(taskCard);
  });
}
function loadTasks() {
  loadFromLocalStorage();
  renderTasks();
}
function findTask(taskId) {
  return tasks.find(function(task) { return task.id == taskId; });
}
function showDeleteTaskModal() {
  bootstrap.Modal.getOrCreateInstance(deleteTaskModal).show();
}
function hideDeleteTaskModal() {
  bootstrap.Modal.getOrCreateInstance(deleteTaskModal).hide();
}
function hideAddUpdateTaskModal() {
    bootstrap.Modal.getInstance(addUpdateTaskModal).hide();
}
function showAddUpdateTaskModal(operation) {
  if(operation == "update") {
    addUpdateTaskModalLabel.textContent = 'Update Task';
    btnAddUpdateTask.textContent = 'Update Task';
    btnAddUpdateTask.classList.remove('btn-primary'); 
    btnAddUpdateTask.classList.add('btn-warning');
  } else if(operation == "add") {
    clearAllFields();
    addUpdateTaskModalLabel.textContent = 'Add Task';
    btnAddUpdateTask.textContent = 'Add Task';
    btnAddUpdateTask.classList.remove('btn-warning');
    btnAddUpdateTask.classList.add('btn-primary'); 
  }
  bootstrap.Modal.getOrCreateInstance(addUpdateTaskModal).show();
}
function addTask() {
    const taskTitle = txtTaskTitle.value;
    const taskDescription = txtTaskDescription.value;
    const taskCategory = choiceTaskCategory.value;
    const taskPriority = choiceTaskPriority.value;

    const task = getTaskObject(taskTitle, taskDescription, taskCategory, taskPriority);
    tasks.push(task);

    const taskCard = createTaskCard(task.id, task.title, task.description, task.category, task.priority);
    todoLaneCards.appendChild(taskCard);

    saveToLocalStorage();

    clearAllFields();
    bootstrap.Modal.getInstance(addUpdateTaskModal).hide();
    bootstrap.Toast.getOrCreateInstance(messageToast).show();
}
function updateTask() {
    const taskId = txtTaskId.value;
    const taskTitle = txtTaskTitle.value;
    const taskDescription = txtTaskDescription.value;
    const taskCategory = choiceTaskCategory.value;
    const taskPriority = choiceTaskPriority.value;

    tasks = tasks.map(function(task) {
      if(task.id == taskId) {
        return getTaskObject(taskTitle, taskDescription, taskCategory, taskPriority, taskId);
      }
      return task;
    });

    saveToLocalStorage();
    renderTasks();
    hideAddUpdateTaskModal();
}
/****** EVENT HANDLERS*******/
function handleDragStart(evt) {
  draggedTaskId = evt.target.dataset.taskId;
}
function handleDeleteTask(evt){
const taskId = btnDeleteTask.dataset.taskId;
tasks = tasks.filter(function(task) {return task.id != taskId});
saveToLocalStorage();
renderTasks();
hideDeleteTaskModal();
}
function handleAddUpdateTask(evt) {
  evt.preventDefault();
  const taskId = txtTaskId.value;
  taskId ? updateTask() : addTask();
}
function handleDragOver(evt) {
  evt.preventDefault();
}
function handleDrop(evt) {
  const laneId = evt.target.closest('.kanban-lane').id;
  tasks = tasks.map(function(task) {
    if(task.id == draggedTaskId) {
      return {...task, lane: laneIdToLaneNameMapping[laneId]};
    }
    return task;
  });
  saveToLocalStorage();
  renderTasks();
}
function handleEdit(evt) {
  const editButton = evt.target.closest('.edit-task');
  if(editButton) {
    const taskId = editButton.dataset.taskId;
    // console.log(taskId);
    const task = findTask(taskId);
    // console.log(task);
    loadAllFields(task);
    showAddUpdateTaskModal("update");
  }
}
function handlePrepareToAddTask(evt) {
  showAddUpdateTaskModal("add");
}
function handlePrepareToDelete(evt) {
  const deleteButton = evt.target.closest('.delete-task');
  if(deleteButton) {
    const taskId = deleteButton.dataset.taskId;
    btnDeleteTask.dataset.taskId = taskId;
    showDeleteTaskModal();
  }
}
/****** EVENT REGISTRATIONS*****/
function registerEvent() {
    addUpdateTaskForm.addEventListener('submit', handleAddUpdateTask);
    kanbanBoard.addEventListener('click', handleEdit);
    kanbanBoard.addEventListener('click', handlePrepareToDelete); //modal dikhega
    btnAddTask.addEventListener('click', handlePrepareToAddTask);
    btnAddTaskShortcut.addEventListener('click', handlePrepareToAddTask);
    btnDeleteTask.addEventListener('click', handleDeleteTask);
    enableDragDrop();
}
function enableDragDrop() {
  const lanes = document.querySelectorAll('.kanban-lane');
  lanes.forEach(function(lane) {
    lane.addEventListener('dragover',handleDragOver);
    lane.addEventListener('drop',handleDrop);
  });
}
registerEvent();
loadTasks(); //local se task load ,foreach loop tak bana
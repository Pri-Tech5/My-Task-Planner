// This file contains the JavaScript code for the website. It handles interactivity, DOM manipulation, and any client-side logic required for the web application.

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document is ready!');

    // Example: Add a click event listener to a button
    const button = document.getElementById('myButton');
    if (button) {
        button.addEventListener('click', () => {
            alert('Button was clicked!');
        });
    }

    // Store tasks in localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {
        main: [],
        side: [],
        daily: []
    };

    // Function to save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Modal logic
    let currentModalType = null;

    // Track which section to add to (default to main, but can be changed if needed)
    let currentAddSection = 'main';
    window.openTaskModal = function(type) {
        // Default to main, but allow override
        currentAddSection = type || 'main';
        document.getElementById('modal-task-destination').value = currentAddSection;
        document.getElementById('modal-task-title').value = '';
        document.getElementById('modal-task-desc').value = '';
        document.getElementById('modal-task-importance').value = 'normal';
        document.getElementById('modal-task-deadline').value = '';
        document.getElementById('task-modal-overlay').style.display = 'block';
        document.getElementById('task-modal').style.display = 'block';
        document.getElementById('modal-task-title').focus();
    };

    window.closeTaskModal = function() {
        document.getElementById('task-modal-overlay').style.display = 'none';
        document.getElementById('task-modal').style.display = 'none';
        currentModalType = null;
    };

    window.submitTaskModal = function(event) {
        event.preventDefault();
        const type = document.getElementById('modal-task-destination').value;
        const text = document.getElementById('modal-task-title').value.trim();
        const description = document.getElementById('modal-task-desc').value.trim();
        const importance = document.getElementById('modal-task-importance').value;
        const deadline = document.getElementById('modal-task-deadline').value;
        if (text) {
            closeTaskModal();
            setTimeout(() => {
                animateRocketToSection(type, () => {
                    tasks[type].push({
                        text,
                        description,
                        importance,
                        deadline,
                        completed: false,
                        createdAt: new Date().toISOString()
                    });
                    saveTasks();
                    renderTasks(type, true); // Pass true to animate the last task
                });
            }, 250); // Wait for modal to close visually
        }
    };

    function animateRocketToSection(type, callback) {
        // Find floating add button (start) and section header (end)
        const addBtn = document.querySelector('.floating-add-btn');
        const sectionHeader = document.querySelector(`#${type}-goals h2`);
        if (!addBtn || !sectionHeader) {
            callback();
            return;
        }
        const btnRect = addBtn.getBoundingClientRect();
        const headerRect = sectionHeader.getBoundingClientRect();
        // Start at button center, end at header center
        const startX = btnRect.left + btnRect.width / 2;
        const startY = btnRect.top + btnRect.height / 2;
        const endX = headerRect.left + headerRect.width / 2;
        const endY = headerRect.top + headerRect.height / 2;
        // Create rocket element
        const rocket = document.createElement('div');
        rocket.className = 'rocket-fly-anim';
        rocket.textContent = '🚀';
        rocket.style.left = `${startX}px`;
        rocket.style.top = `${startY}px`;
        rocket.style.transform = `translate(-50%, -50%)`;
        document.body.appendChild(rocket);
        // Animate with JS (since we need to move from start to end)
        rocket.animate([
            { opacity: 0.7, transform: `translate(-50%, -50%) scale(1) rotate(-18deg)` },
            { opacity: 1, transform: `translate(${endX - startX - 20}px, ${endY - startY - 20}px) scale(1.15) rotate(8deg)` },
            { opacity: 1, transform: `translate(${endX - startX}px, ${endY - startY}px) scale(1.05) rotate(-2deg)` },
            { opacity: 0, transform: `translate(${endX - startX + 10}px, ${endY - startY - 10}px) scale(0.7) rotate(-30deg)` }
        ], {
            duration: 1700,
            easing: 'cubic-bezier(.4,2,.6,1)'
        });
        setTimeout(() => {
            rocket.remove();
            callback();
        }, 1700);
    }

    // Function to create a new task
    function createTaskElement(text, type, index) {
        const li = document.createElement('li');
        li.className = 'task-item';

        // Emoji for importance
        const task = tasks[type][index];
        let emoji = '🟢';
        if (task.importance === 'high') emoji = '🔴';
        else if (task.importance === 'low') emoji = '🟡';
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'task-emoji';
        emojiSpan.textContent = emoji;

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = !!task.completed;
        checkbox.onchange = () => toggleComplete(type, index);

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.onclick = () => deleteTask(type, index);

        // Add edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'task-edit-btn';
        editBtn.innerHTML = '✏️';
        editBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent triggering the task details modal
            showEditTaskModal(type, index);
        };

        // Row for main content
        const contentRow = document.createElement('div');
        contentRow.className = 'task-item-content';
        contentRow.appendChild(emojiSpan);
        contentRow.appendChild(checkbox);
        contentRow.appendChild(taskText);
        contentRow.appendChild(deleteBtn);
        contentRow.appendChild(editBtn); // Add edit button to the row
        li.appendChild(contentRow);

        // Description (secondary, next line)
        if (task.description) {
            const descElem = document.createElement('div');
            descElem.className = 'task-desc';
            descElem.textContent = task.description;
            li.appendChild(descElem);
        }

        if (task.completed) {
            li.classList.add('completed');
        }

        return li;
    }

    // Function to delete a task
    function deleteTask(type, index) {
        const list = document.getElementById(`${type}-goals-list`);
        const li = list.children[index];
        if (li) {
            li.classList.add('throw-away');
            setTimeout(() => {
                tasks[type].splice(index, 1);
                saveTasks();
                renderTasks(type);
            }, 700); // Match animation duration
        } else {
            // fallback
            tasks[type].splice(index, 1);
            saveTasks();
            renderTasks(type);
        }
    }

    // Function to toggle task completion
    function toggleComplete(type, index) {
        tasks[type][index].completed = !tasks[type][index].completed;
        saveTasks();
        renderTasks(type);
    }

    // Function to render tasks
    function renderTasks(type, animateLast) {
        const list = document.getElementById(`${type}-goals-list`);
        list.innerHTML = '';
        tasks[type].forEach((task, index) => {
            const taskElement = createTaskElement(task.text, type, index);
            if (animateLast && index === tasks[type].length - 1) {
                setTimeout(() => {
                    taskElement.classList.add('rocket-in');
                }, 50);
            }
            list.appendChild(taskElement);
        });
    }

    // Initial render of all tasks
    window.addEventListener('DOMContentLoaded', () => {
        renderTasks('main');
        renderTasks('side');
        renderTasks('daily');
    });
});

// Add this at the end of the file

document.addEventListener('DOMContentLoaded', function() {
    // Delegate click event for all task items
    document.body.addEventListener('click', function(e) {
        const editBtn = e.target.closest('.task-edit-btn');
        if (editBtn) {
            const taskItem = editBtn.closest('.task-item');
            if (taskItem) {
                showTaskDetailsModal(taskItem);
            }
            e.stopPropagation();
            return;
        }
        // Remove: opening details modal on any task click
        // const taskItem = e.target.closest('.task-item');
        // if (taskItem && !e.target.classList.contains('task-edit-btn')) {
        //     showTaskDetailsModal(taskItem);
        // }
    });
});

function showEditTaskModal(taskItem) {
    const title = taskItem.querySelector('.task-title')?.textContent || '';
    const desc = taskItem.querySelector('.task-desc')?.textContent || '';
    document.getElementById('modal-task-title').value = title;
    document.getElementById('modal-task-desc').value = desc;
    // Optionally, set a flag or store the task id for update
    document.getElementById('task-modal-overlay').style.display = 'block';
    document.getElementById('task-modal').style.display = 'flex';
}

function showTaskDetailsModal(taskItem) {
    const modalOverlay = document.getElementById('task-details-modal-overlay');
    const modal = document.getElementById('task-details-modal');
    const content = document.getElementById('task-details-content');
    // Extract task info
    const title = taskItem.querySelector('.task-title')?.textContent || '';
    const desc = taskItem.querySelector('.task-desc')?.textContent || '';
    // Store reference for editing
    modal.dataset.taskId = taskItem.dataset.taskId || '';
    content.innerHTML = `
        <h3 style="text-align:center; color:#3498db;">Task Details</h3>
        <div><strong>Title:</strong> <span id='details-title'>${title}</span></div>
        <div><strong>Description:</strong> <span id='details-desc'>${desc}</span></div>
    `;
    modalOverlay.style.display = 'block';
    modal.style.display = 'flex';
}

function editTaskFromDetails() {
    // Get current details
    const modal = document.getElementById('task-details-modal');
    const title = document.getElementById('details-title').textContent;
    const desc = document.getElementById('details-desc').textContent;
    // Open the add/edit modal with current values
    document.getElementById('modal-task-title').value = title;
    document.getElementById('modal-task-desc').value = desc;
    // Optionally, set a flag or store the task id for update
    // Show the add/edit modal
    document.getElementById('task-modal-overlay').style.display = 'block';
    document.getElementById('task-modal').style.display = 'flex';
    // Hide the details modal
    closeTaskDetailsModal();
}

function closeTaskDetailsModal() {
    document.getElementById('task-details-modal-overlay').style.display = 'none';
    document.getElementById('task-details-modal').style.display = 'none';
}

function renderTaskItem(task) {
    return `
        <li class="task-item" data-task-id="${task.id}">
            <div class="task-item-content" style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 0.5em;">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-title">${task.title}</span>
                    <span class="task-desc">${task.desc}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5em;">
                    <button class="task-edit-btn" title="Edit Task" onclick="showEditTaskModalFromBtn(event, this, '${task.id}')">🖉</button>
                    <button class="task-delete-btn" title="Delete Task" onclick="deleteTaskFromBtn(event, this, '${task.id}')">🗑️</button>
                </div>
            </div>
        </li>
    `;
}

function showEditTaskModalFromBtn(event, btn, taskId) {
    event.stopPropagation();
    const taskItem = btn.closest('.task-item');
    if (taskItem) {
        // Get task data (you may need to fetch from your data store)
        const title = taskItem.querySelector('.task-title')?.textContent || '';
        const desc = taskItem.querySelector('.task-desc')?.textContent || '';
        // If you store importance and deadline, fetch them here as well
        document.getElementById('edit-task-title').value = title;
        document.getElementById('edit-task-desc').value = desc;
        // Optionally set importance and deadline if available
        // Show the edit modal
        document.getElementById('edit-task-modal-overlay').style.display = 'block';
        document.getElementById('edit-task-modal').style.display = 'flex';
        // Store the task id for saving
        document.getElementById('edit-task-modal-form').dataset.editingTaskId = taskId;
    }
}

function deleteTaskFromBtn(event, btn, taskId) {
    event.stopPropagation();
    // Implement your delete logic here, e.g., remove from data and re-render
    // ...delete logic here...
}

function closeEditTaskModal() {
    document.getElementById('edit-task-modal-overlay').style.display = 'none';
    document.getElementById('edit-task-modal').style.display = 'none';
}

function submitEditTaskModal(event) {
    event.preventDefault();
    const form = document.getElementById('edit-task-modal-form');
    const taskId = form.dataset.editingTaskId;
    const title = document.getElementById('edit-task-title').value;
    const desc = document.getElementById('edit-task-desc').value;
    // Optionally get importance and deadline
    // Update the task in your data store and re-render the list
    // ...update logic here...
    closeEditTaskModal();
}
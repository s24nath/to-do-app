// Fetch DOM Elements in a variable
const taskInputForm = document.querySelector('#adding_task'); // Input form
const taskInputValue = document.querySelector('#task_input'); // Input box in the form for getting the value provided 
const tabContentList = document.querySelector(`#tab_content_list`); // List of tasks
const navTabLinksList = document.querySelectorAll('.nav-link'); // Tab links 
const filterNavLinks = document.querySelectorAll('.filter_nav_link');
const filterNavLinksParentWrapper = document.querySelector('#navigation_tab_section');
const emptyTaskValue = document.querySelector('#empty_task_value');
const doubleClickSuggestion = document.querySelector('#double_click_suggestion');

let todoListDataContainerGlobal = [];
let inEditMode = false;
let editTaskId;
let currentTabFilter = "all";

const filterTask = () => {
    filterNavLinks.forEach((currentTabLink) => {
        currentTabLink.addEventListener('click', (event) => {
            let lastActiveTabLink = filterNavLinksParentWrapper.querySelector('.active');
            if (!currentTabLink.classList.contains('active')) {                
                lastActiveTabLink.classList.remove('active');
                currentTabLink.classList.add('active');
                currentTabFilter = currentTabLink.dataset.filter;                
            }
            displayTasks();
        });
    });
};

// Function definition to create task data in Local Storage
const setToLocalStorage = () => {
    localStorage.setItem('taskData', JSON.stringify(todoListDataContainerGlobal));
};

// Function definition to fetch task data from Local Storage
const getFromLocalStorage = () => {
    let fetchedFromLocalStorage = JSON.parse(localStorage.getItem('taskData'));
    if (fetchedFromLocalStorage) {
        todoListDataContainerGlobal = fetchedFromLocalStorage;
    } else {
        console.log("Empty List");
    }
};

// Function definition for updating the status of the task
const updateTaskStatus = (currentTask) => {
    currentTask.addEventListener('dblclick', () => {
        if(!currentTask.children[0].classList.contains('task-checked')) {
            currentTask.children[0].classList.add('task-checked');
            todoListDataContainerGlobal[currentTask.dataset.id].isTaskChecked = true;
        } else {
            currentTask.children[0].classList.remove('task-checked');
            todoListDataContainerGlobal[currentTask.dataset.id].isTaskChecked = false;
        }
        setToLocalStorage();
    });
};

// Function definition for editing each task 
const editTaskName = (taskId) => {
    inEditMode = true;
    editTaskId = taskId;
    taskInputValue.value = todoListDataContainerGlobal[taskId].text;
    taskInputValue.focus();
};

// Function definition for displaying task list
const displayTasks = () => {   
    let taskListHTML = ''; 
    todoListDataContainerGlobal.forEach((currentElement,index) => {
        let taskStatus = currentElement.isTaskChecked ? "task-checked" : "";
        if((currentTabFilter === "all") 
        || (currentTabFilter === "completed" && currentElement.isTaskChecked) 
        || (currentTabFilter === "pending" && !currentElement.isTaskChecked)) {            
            taskListHTML = `
            <li class="list-group-item" data-id="${index}">
                <p class="task_text ${taskStatus}">
                    ${currentElement.text}
                </p>
                <button class="btn action-btn">
                    <img src="./img/dots.png" alt="">
                </button>
                <ul class="action-list">
                    <li>Edit</li>
                    <hr>
                    <li>Delete</li>
                </ul>
            </li>
            ` + taskListHTML;
        } 
    });
    if(!taskListHTML) {
        taskListHTML = `<p class="empty-list">Empty List!</p>`;
        doubleClickSuggestion.style.opacity = "0";
    }
    tabContentList.innerHTML = taskListHTML;
    actionBtnFunctionality();
};

// Function definition for deleting each task
const deleteTask = (deleteTaskIndex) => {
    todoListDataContainerGlobal.splice(deleteTaskIndex, 1);
    setToLocalStorage();
    displayTasks();
};

// Letting all the DOM elements to be loaded first
document.addEventListener('DOMContentLoaded', function() {
    getFromLocalStorage();
    filterTask();
    displayTasks();    

    // Event listner for input form to add and edit each task
    taskInputForm.addEventListener("submit", function(event) {
        event.preventDefault();
        let taskEntered = String(taskInputValue.value);        
        if (taskEntered.length !== 0) {
            if(!inEditMode) {
                const taskData = {
                    text: taskEntered,
                    isTaskChecked: false,
                    uniqueTimeStamp: Date.now()
                };
                todoListDataContainerGlobal.push(taskData);                                
            } else {
                todoListDataContainerGlobal[editTaskId].text = taskInputValue.value;
                inEditMode = false;
            }
            setToLocalStorage();
            taskInputValue.value = "";
            displayTasks();
            doubleClickSuggestion.style.opacity = "1";
            emptyTaskValue.style.opacity = '0';
        } else {
            emptyTaskValue.style.opacity = '1';
        }
    });
});

// Function definition for action button for each task in the list
const actionBtnFunctionality = () => {
    const actionBtnAll = document.querySelectorAll('.action-btn');
    actionBtnAll.forEach((currentElement) => {
        let actionList = currentElement.nextElementSibling;
        currentElement.addEventListener('click', (event) => {
            event.stopPropagation();
            let lastActiveActionList = tabContentList.getElementsByClassName("active")[0];
            if (lastActiveActionList && lastActiveActionList !== actionList) {
                lastActiveActionList.classList.remove("active");
            }
            if (!actionList.classList.contains('active')) {
                actionList.classList.add('active');
            } else {
                actionList.classList.remove('active');
            }
        });
        updateTaskStatus(actionList.parentElement);
        actionList.addEventListener('click', (event) => {
            if(event.target === actionList.children[0]) {
                editTaskName(actionList.parentElement.dataset.id);
            } else if (event.target === actionList.children[2]) {
                deleteTask(actionList.parentElement.dataset.id);
            } 
        });
    });
    document.addEventListener('click', (event) => {
        actionBtnAll.forEach((currentElement) => {
            currentElement.nextElementSibling.classList.remove('active');
        });
    });
};
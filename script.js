const addForm = document.querySelector(".add-form");
const taskInput = document.querySelector(".add-form input[type='text']");
const hoursInput = document.querySelector(".add-form input[type='number']");
const taskList = document.querySelector(".task-list");
const filters = document.querySelectorAll(".filter");
const markAllBtn = document.querySelector(".mark-all");
const clearBtn = document.querySelector(".clear-btn");
const taskSummary = document.querySelector(".task-summary span");

let currentFilter = "All";

function getDifficulty(hours) {
    if (hours > 5) {
        return "hard";
    } else if (hours > 2) {
        return "medium";
    } else {
        return "easy";
    }
}

function updateDifficulty(row) {
    const hours = Number(row.dataset.hours);
    const difficulty = getDifficulty(hours);
    const label = row.querySelector(".difficulty");

    label.className = "difficulty " + difficulty;

    const name = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    label.textContent = name + " · " + hours + "h";
}

addForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();
    const hours = Math.max(0, Number(hoursInput.value) || 0);

    if (taskText === "") {
        return;
    }

    const row = document.createElement("div");
    row.className = "task-row";
    row.dataset.hours = hours;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const name = document.createElement("span");
    name.className = "task-name";
    name.textContent = taskText;

    const difficulty = document.createElement("span");
    difficulty.className = "difficulty";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "&times;";

    row.appendChild(checkbox);
    row.appendChild(name);
    row.appendChild(difficulty);
    row.appendChild(deleteBtn);

    taskList.appendChild(row);

    updateDifficulty(row);

    taskInput.value = "";
    hoursInput.value = "0";

    updateTasks();
});

taskList.addEventListener("change", function(event) {
    if (event.target.type === "checkbox") {
        const row = event.target.closest(".task-row");

        row.classList.toggle("completed", event.target.checked);

        updateTasks();
    }
});

taskList.addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-btn")) {
        const row = event.target.closest(".task-row");

        row.remove();

        updateTasks();
    }
});

taskList.addEventListener("dblclick", function(event) {
    const row = event.target.closest(".task-row");

    if (!row) return;

    const name = event.target.closest(".task-name");
    const difficulty = event.target.closest(".difficulty");

    if (name) {
        editTask(row, "text");
    } else if (difficulty) {
        editTask(row, "hours");
    }
});

function editTask(row, type) {
    const isText = type === "text";
    const element = isText
        ? row.querySelector(".task-name")
        : row.querySelector(".difficulty");

    if (element.querySelector("input")) return;

    const oldValue = isText
        ? element.textContent
        : row.dataset.hours;

    const input = document.createElement("input");

    input.type = isText ? "text" : "number";
    input.value = oldValue;

    if (!isText) {
        input.min = "0";
        input.step = "any";
    }

    input.style.width = isText ? "200px" : "80px";
    input.style.padding = "5px";
    input.style.fontSize = "15px";

    element.replaceChildren(input);

    input.focus();
    input.select();

    let finished = false;

    function saveEdit(save) {
        if (finished) return;
        finished = true;

        if (save) {
            if (isText) {
                const newText = input.value.trim();

                if (newText === "") {
                    row.remove();
                } else {
                    element.textContent = newText;
                }
            } else {
                const newHours = Math.max(0, Number(input.value) || 0);

                row.dataset.hours = newHours;

                updateDifficulty(row);
            }
        } else {
            if (isText) {
                element.textContent = oldValue;
            } else {
                updateDifficulty(row);
            }
        }

        updateTasks();
    }

    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            saveEdit(true);
        }

        if (event.key === "Escape") {
            saveEdit(false);
        }
    });

    input.addEventListener("blur", function() {
        saveEdit(true);
    });
}

filters.forEach(function(button) {
    button.addEventListener("click", function() {
        filters.forEach(function(filter) {
            filter.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.textContent.trim();

        updateTasks();
    });
});

markAllBtn.addEventListener("click", function() {
    const rows = taskList.querySelectorAll(".task-row");

    const allDone = rows.length > 0 &&
        [...rows].every(row => row.classList.contains("completed"));

    rows.forEach(function(row) {
        const checkbox = row.querySelector("input[type='checkbox']");

        checkbox.checked = !allDone;

        row.classList.toggle("completed", !allDone);
    });

    updateTasks();
});

clearBtn.addEventListener("click", function() {
    const completedTasks = taskList.querySelectorAll(".task-row.completed");

    completedTasks.forEach(function(row) {
        row.remove();
    });

    updateTasks();
});

function updateTasks() {
    const rows = taskList.querySelectorAll(".task-row");

    let remainingTasks = 0;
    let totalHours = 0;
    let completedCount = 0;

    rows.forEach(function(row) {
        const completed = row.classList.contains("completed");

        if (completed) {
            completedCount++;
        } else {
            remainingTasks++;
            totalHours += Number(row.dataset.hours);
        }

        if (currentFilter === "All") {
            row.style.display = "flex";
        } else if (currentFilter === "Active") {
            row.style.display = completed ? "none" : "flex";
        } else if (currentFilter === "Completed") {
            row.style.display = completed ? "flex" : "none";
        }
    });

    taskSummary.textContent =
        remainingTasks + " items left · " + totalHours + " hours total";

    markAllBtn.textContent =
        rows.length > 0 && completedCount === rows.length
            ? "Mark all active"
            : "Mark all done";

    markAllBtn.style.display = rows.length > 0 ? "block" : "none";

    clearBtn.style.display =
        completedCount > 0 ? "block" : "none";
}

updateTasks();
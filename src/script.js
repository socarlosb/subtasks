class SubtaskApp {
  constructor() {
    this.data = [];
    this.selectedPaths = [null, null, null]; // Track selected items in each column
    this.editingElement = null;
    this.maxItemsPerColumn = 50;

    this.init();
  }

  init() {
    this.loadData();
    this.bindEvents();
    this.render();
  }

  // Data Management
  loadData() {
    try {
      const stored = localStorage.getItem("subtask-app-data");
      if (stored) {
        this.data = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      this.data = [];
    }
  }

  saveData() {
    try {
      localStorage.setItem("subtask-app-data", JSON.stringify(this.data));
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
      alert("Failed to save data. Storage might be full.");
    }
  }

  generateId() {
    return "task-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  }

  // Event Binding
  bindEvents() {
    // Column click events for adding tasks
    document
      .querySelectorAll(".tasks-container")
      .forEach((container, index) => {
        container.addEventListener("click", (e) => {
          if (e.target === container && !this.editingElement) {
            this.showAddInput(index);
          }
        });
      });

    // Copy button events
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const column = parseInt(e.target.dataset.column);
        this.copyColumnToClipboard(column);
      });
    });
  }

  // Rendering
  render() {
    this.renderColumn(0, this.data);

    if (this.selectedPaths[0] !== null) {
      const selectedTask = this.data[this.selectedPaths[0]];
      this.renderColumn(1, selectedTask.tasks || []);
      document.getElementById("column-title-1").textContent =
        selectedTask.title;
      document.querySelector('[data-column="1"] .copy-btn').disabled = false;

      if (this.selectedPaths[1] !== null && selectedTask.tasks) {
        const selectedSubtask = selectedTask.tasks[this.selectedPaths[1]];
        this.renderColumn(2, selectedSubtask["sub-tasks"] || []);
        document.getElementById("column-title-2").textContent =
          selectedSubtask.title;
        document.querySelector('[data-column="2"] .copy-btn').disabled = false;
      } else {
        this.renderColumn(2, []);
        document.getElementById("column-title-2").textContent =
          "Select a subtask";
        document.querySelector('[data-column="2"] .copy-btn').disabled = true;
      }
    } else {
      this.renderColumn(1, []);
      this.renderColumn(2, []);
      document.getElementById("column-title-1").textContent = "Select a task";
      document.getElementById("column-title-2").textContent =
        "Select a subtask";
      document.querySelector('[data-column="1"] .copy-btn').disabled = true;
      document.querySelector('[data-column="2"] .copy-btn').disabled = true;
    }
  }

  renderColumn(columnIndex, tasks) {
    const container = document.getElementById(`tasks-${columnIndex}`);
    container.innerHTML = "";

    if (tasks.length === 0 && columnIndex === 0) {
      container.innerHTML =
        '<div class="empty-message">Add your task here...</div>';
      return;
    }

    tasks.forEach((task, index) => {
      const taskElement = this.createTaskElement(task, columnIndex, index);
      container.appendChild(taskElement);
    });
  }

  createTaskElement(task, columnIndex, taskIndex) {
    const div = document.createElement("div");
    div.className = "task-item";
    div.dataset.column = columnIndex;
    div.dataset.index = taskIndex;

    if (this.selectedPaths[columnIndex] === taskIndex) {
      div.classList.add("selected");
    }

    // Create icon
    const icon = document.createElement("div");
    icon.className = "task-icon";

    if (columnIndex < 2) {
      // Progress icon for columns 0 and 1
      const progressInfo = this.getProgressInfo(task, columnIndex);
      icon.innerHTML = this.createProgressIcon(progressInfo);
    } else {
      // Checkbox for column 2
      const checkbox = document.createElement("div");
      checkbox.className = "checkbox";
      if (task.status === "complete") {
        checkbox.classList.add("checked");
      }
      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleTaskComplete(task);
      });
      icon.appendChild(checkbox);
    }

    // Create text
    const text = document.createElement("div");
    text.className = "task-text";
    if (columnIndex === 2 && task.status === "complete") {
      text.classList.add("completed");
    }
    text.textContent = task.title;

    // Add hover event for editing
    text.addEventListener("mouseenter", () => {
      if (!this.editingElement) {
        text.style.cursor = "text";
      }
    });

    text.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!this.editingElement) {
        this.startEdit(task, text, columnIndex, taskIndex);
      }
    });

    // Add click event for selection
    div.addEventListener("click", () => {
      if (!this.editingElement) {
        this.selectTask(columnIndex, taskIndex);
      }
    });

    div.appendChild(icon);
    div.appendChild(text);

    return div;
  }

  createProgressIcon(progressInfo) {
    if (progressInfo.percentage === 100) {
      return '<div class="icon-complete"></div>';
    } else if (progressInfo.percentage === 0) {
      return '<div class="icon-empty"></div>';
    } else {
      return `<div class="icon-progress" style="--progress: ${progressInfo.percentage}%">
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: ${progressInfo.percentage}%; background-color: var(--accent-blue);"></div>
                     </div>`;
    }
  }

  getProgressInfo(task, columnIndex) {
    let total = 0;
    let completed = 0;

    if (columnIndex === 0 && task.tasks) {
      // Count direct subtasks only (column 2 items)
      task.tasks.forEach((subtask) => {
        total++;
        // Check if subtask has any sub-subtasks
        if (subtask["sub-tasks"] && subtask["sub-tasks"].length > 0) {
          // If it has sub-subtasks, check if all are completed
          const allSubSubtasksComplete = subtask["sub-tasks"].every(
            (subsubtask) => subsubtask.status === "complete"
          );
          if (allSubSubtasksComplete) {
            completed++;
          }
        }
        // If no sub-subtasks, assume incomplete for now
      });
    } else if (columnIndex === 1 && task["sub-tasks"]) {
      // Count sub-subtasks only
      task["sub-tasks"].forEach((subsubtask) => {
        total++;
        if (subsubtask.status === "complete") {
          completed++;
        }
      });
    }

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  }

  // Task Management
  selectTask(columnIndex, taskIndex) {
    // Toggle selection
    if (this.selectedPaths[columnIndex] === taskIndex) {
      // Deselect and clear subsequent columns
      this.selectedPaths[columnIndex] = null;
      this.selectedPaths[columnIndex + 1] = null;
      this.selectedPaths[columnIndex + 2] = null;
    } else {
      // Select and clear subsequent columns
      this.selectedPaths[columnIndex] = taskIndex;
      this.selectedPaths[columnIndex + 1] = null;
      this.selectedPaths[columnIndex + 2] = null;
    }

    this.render();
  }

  showAddInput(columnIndex) {
    const tasks = this.getTasksForColumn(columnIndex);

    if (tasks.length >= this.maxItemsPerColumn) {
      alert(
        `You've reached the limit of ${this.maxItemsPerColumn} items per column.`
      );
      return;
    }

    const container = document.getElementById(`tasks-${columnIndex}`);

    // Remove empty message if present
    const emptyMessage = container.querySelector(".empty-message");
    if (emptyMessage) {
      emptyMessage.remove();
    }

    const inputContainer = document.createElement("div");
    inputContainer.className = "add-input";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "task-input";
    input.placeholder = "Enter task name...";

    let hasSubmitted = false;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !hasSubmitted) {
        hasSubmitted = true;
        const title = input.value.trim();
        if (title) {
          this.addTask(columnIndex, title);
        }
        inputContainer.remove();
      }
    });

    input.addEventListener("blur", () => {
      if (!hasSubmitted) {
        hasSubmitted = true;
        const title = input.value.trim();
        if (title) {
          this.addTask(columnIndex, title);
        }
        inputContainer.remove();
      }
    });

    inputContainer.appendChild(input);
    container.appendChild(inputContainer);
    input.focus();
  }

  addTask(columnIndex, title) {
    const newTask = {
      id: this.generateId(),
      title: title,
      order: this.getNextOrder(columnIndex),
      created: new Date().toISOString().split("T")[0],
    };

    if (columnIndex === 0) {
      newTask.tasks = [];
      this.data.push(newTask);
    } else if (columnIndex === 1 && this.selectedPaths[0] !== null) {
      newTask["sub-tasks"] = [];
      const parentTask = this.data[this.selectedPaths[0]];
      if (!parentTask.tasks) parentTask.tasks = [];
      parentTask.tasks.push(newTask);
    } else if (
      columnIndex === 2 &&
      this.selectedPaths[0] !== null &&
      this.selectedPaths[1] !== null
    ) {
      newTask.status = "incomplete";
      const parentTask = this.data[this.selectedPaths[0]];
      const parentSubtask = parentTask.tasks[this.selectedPaths[1]];
      if (!parentSubtask["sub-tasks"]) parentSubtask["sub-tasks"] = [];
      parentSubtask["sub-tasks"].push(newTask);
    }

    this.saveData();
    this.render();
  }

  getNextOrder(columnIndex) {
    const tasks = this.getTasksForColumn(columnIndex);
    return tasks.length;
  }

  getTasksForColumn(columnIndex) {
    if (columnIndex === 0) {
      return this.data;
    } else if (columnIndex === 1 && this.selectedPaths[0] !== null) {
      return this.data[this.selectedPaths[0]].tasks || [];
    } else if (
      columnIndex === 2 &&
      this.selectedPaths[0] !== null &&
      this.selectedPaths[1] !== null
    ) {
      const parentTask = this.data[this.selectedPaths[0]];
      const parentSubtask = parentTask.tasks[this.selectedPaths[1]];
      return parentSubtask["sub-tasks"] || [];
    }
    return [];
  }

  // Task Editing
  startEdit(task, textElement, columnIndex, taskIndex) {
    this.editingElement = textElement;
    textElement.parentElement.classList.add("editing");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "task-input";
    input.value = task.title;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const newTitle = input.value.trim();
        if (newTitle) {
          task.title = newTitle;
          this.saveData();
          this.render();
        } else {
          this.deleteTask(task, columnIndex, taskIndex);
        }
        this.editingElement = null;
      }
    });

    input.addEventListener("blur", () => {
      const newTitle = input.value.trim();
      if (newTitle) {
        task.title = newTitle;
        this.saveData();
        this.render();
      } else {
        this.deleteTask(task, columnIndex, taskIndex);
      }
      this.editingElement = null;
    });

    textElement.textContent = "";
    textElement.appendChild(input);
    input.focus();
    input.select();
  }

  deleteTask(task, columnIndex, taskIndex) {
    if (columnIndex === 0) {
      this.data.splice(taskIndex, 1);
      // Clear selections if deleted task was selected
      if (this.selectedPaths[0] === taskIndex) {
        this.selectedPaths = [null, null, null];
      } else if (this.selectedPaths[0] > taskIndex) {
        this.selectedPaths[0]--;
      }
    } else if (columnIndex === 1) {
      const parentTask = this.data[this.selectedPaths[0]];
      parentTask.tasks.splice(taskIndex, 1);
      if (this.selectedPaths[1] === taskIndex) {
        this.selectedPaths[1] = null;
        this.selectedPaths[2] = null;
      } else if (this.selectedPaths[1] > taskIndex) {
        this.selectedPaths[1]--;
      }
    } else if (columnIndex === 2) {
      const parentTask = this.data[this.selectedPaths[0]];
      const parentSubtask = parentTask.tasks[this.selectedPaths[1]];
      parentSubtask["sub-tasks"].splice(taskIndex, 1);
      if (this.selectedPaths[2] === taskIndex) {
        this.selectedPaths[2] = null;
      } else if (this.selectedPaths[2] > taskIndex) {
        this.selectedPaths[2]--;
      }
    }

    this.saveData();
    this.render();
  }

  toggleTaskComplete(task) {
    task.status = task.status === "complete" ? "incomplete" : "complete";

    if (task.status === "complete") {
      task.completed = new Date().toISOString().split("T")[0];
    } else {
      delete task.completed;
    }

    this.saveData();
    this.render();
  }

  // Copy to Clipboard
  copyColumnToClipboard(columnIndex) {
    const tasks = this.getTasksForColumn(columnIndex);
    if (tasks.length === 0) return;

    const taskList = tasks.map((task) => `- ${task.title}`).join("\n");

    navigator.clipboard
      .writeText(taskList)
      .then(() => {
        this.showSuccessMessage();
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = taskList;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        this.showSuccessMessage();
      });
  }

  showSuccessMessage() {
    const message = document.getElementById("success-message");
    message.classList.add("show");
    setTimeout(() => {
      message.classList.remove("show");
    }, 2000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SubtaskApp();
});

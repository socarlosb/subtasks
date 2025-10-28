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
      btn.addEventListener("click", () => {
        const column = parseInt(btn.dataset.column);
        this.copyColumnToClipboard(column);
      });
    });

    // Options menu events
    const optionsBtn = document.getElementById("options-btn");
    const optionsMenu = document.getElementById("options-menu");
    const importBtn = document.getElementById("import-btn");
    const exportBtn = document.getElementById("export-btn");

    if (optionsBtn && optionsMenu) {
      optionsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        optionsMenu.classList.toggle("show");
      });

      // Close options menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!optionsBtn.contains(e.target) && !optionsMenu.contains(e.target)) {
          optionsMenu.classList.remove("show");
        }
      });

      if (importBtn) {
        importBtn.addEventListener("click", () => {
          this.importData();
          optionsMenu.classList.remove("show");
        });
      }

      if (exportBtn) {
        exportBtn.addEventListener("click", () => {
          this.exportData();
          optionsMenu.classList.remove("show");
        });
      }
    }

    // Handle window resize to redraw connections
    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.drawConnectionLines();
      }, 100);
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

    // Draw connecting lines after rendering
    this.drawConnectionLines();
  }

  drawConnectionLines() {
    // Remove existing connection SVG
    const existingSvg = document.querySelector(".connection-svg");
    if (existingSvg) {
      existingSvg.remove();
    }

    // Create SVG container
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("connection-svg");

    // Create gradient definitions
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // Gray to blue gradient
    const grayToBlueGradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    grayToBlueGradient.setAttribute("id", "grayToBlueGradient");
    grayToBlueGradient.setAttribute("x1", "0%");
    grayToBlueGradient.setAttribute("y1", "0%");
    grayToBlueGradient.setAttribute("x2", "100%");
    grayToBlueGradient.setAttribute("y2", "0%");
    grayToBlueGradient.setAttribute("gradientUnits", "objectBoundingBox");

    const stop1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#969696"); // gray

    const stop2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "var(--accent)");

    grayToBlueGradient.appendChild(stop1);
    grayToBlueGradient.appendChild(stop2);
    defs.appendChild(grayToBlueGradient);
    svg.appendChild(defs);

    // Create paths between selected items
    for (let i = 0; i < 2; i++) {
      if (
        this.selectedPaths[i] !== null &&
        this.selectedPaths[i + 1] !== null
      ) {
        const path = this.createConnectionPath(i, i + 1);
        if (path) {
          // If this path has a custom gradient, add it to defs
          const gradientId = path.getAttribute("data-gradient-id");
          if (gradientId) {
            const gradientData = JSON.parse(path.getAttribute("data-gradient"));

            const gradient = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "linearGradient"
            );
            gradient.setAttribute("id", gradientId);
            gradient.setAttribute("x1", gradientData.x1);
            gradient.setAttribute("y1", gradientData.y1);
            gradient.setAttribute("x2", gradientData.x2);
            gradient.setAttribute("y2", gradientData.y2);
            gradient.setAttribute("gradientUnits", "userSpaceOnUse");

            const stop1 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop1.setAttribute("offset", "0%");
            stop1.setAttribute("stop-color", "#969696"); // gray

            const stop2 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop2.setAttribute("offset", "100%");
            stop2.setAttribute("stop-color", "var(--accent)"); // blue

            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);

            // Set the stroke to use this gradient
            path.style.stroke = `url(#${gradientId})`;

            // Clean up the data attributes
            path.removeAttribute("data-gradient-id");
            path.removeAttribute("data-gradient");
          }

          svg.appendChild(path);
        }
      }
    }

    if (svg.children.length > 0) {
      document.querySelector(".columns-container").appendChild(svg);
    }
  }

  createConnectionPath(fromColumn, toColumn) {
    const fromElement = document.querySelector(
      `[data-column="${fromColumn}"] .task-item.selected`
    );
    const toElement = document.querySelector(
      `[data-column="${toColumn}"] .task-item.selected`
    );

    if (!fromElement || !toElement) return null;

    const containerRect = document
      .querySelector(".columns-container")
      .getBoundingClientRect();
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();

    // Calculate positions relative to container
    const fromX = fromRect.right - containerRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
    const toX = toRect.left - containerRect.left;
    const toY = toRect.top + toRect.height / 2 - containerRect.top;

    // Create curved path
    const controlX1 = fromX + (toX - fromX) * 0.5;
    const controlY1 = fromY;
    const controlX2 = fromX + (toX - fromX) * 0.5;
    const controlY2 = toY;

    const pathData = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.classList.add("connection-path");

    // Only apply gradient to the line connecting TO the final selection
    const finalSelectionColumn = this.getFinalSelectionColumn();
    if (toColumn === finalSelectionColumn && finalSelectionColumn > 0) {
      // Create a unique gradient for this specific path
      const gradientId = `gradient-${fromColumn}-${toColumn}`;
      const gradient = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "linearGradient"
      );
      gradient.setAttribute("id", gradientId);
      gradient.setAttribute("x1", fromX);
      gradient.setAttribute("y1", fromY);
      gradient.setAttribute("x2", toX);
      gradient.setAttribute("y2", toY);
      gradient.setAttribute("gradientUnits", "userSpaceOnUse");

      const stop1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "stop"
      );
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", "#969696"); // gray

      const stop2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "stop"
      );
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("stop-color", "#0078d4"); // blue

      gradient.appendChild(stop1);
      gradient.appendChild(stop2);

      // Add gradient to defs (we'll need to get the parent SVG)
      path.setAttribute("data-gradient-id", gradientId);
      path.setAttribute(
        "data-gradient",
        JSON.stringify({
          x1: fromX,
          y1: fromY,
          x2: toX,
          y2: toY,
        })
      );

      path.classList.add("to-final");
    }

    return path;
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

      // Determine if this is the final (rightmost) selection
      const isFinalSelection = this.getFinalSelectionColumn() === columnIndex;
      if (isFinalSelection) {
        div.classList.add("final-selection");
      }
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

  getFinalSelectionColumn() {
    // Find the rightmost column that has a selection
    for (let i = 2; i >= 0; i--) {
      if (this.selectedPaths[i] !== null) {
        return i;
      }
    }
    return 0; // Default to first column if no selections
  }

  createProgressIcon(progressInfo) {
    if (progressInfo.percentage === 100) {
      return '<div class="icon-complete"></div>';
    } else if (progressInfo.percentage === 0) {
      return '<div class="icon-empty"></div>';
    } else {
      // Create SVG circular progress
      const radius = 6;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset =
        circumference - (progressInfo.percentage / 100) * circumference;

      return `<div class="icon-progress-circular">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle 
                    cx="8" 
                    cy="8" 
                    r="${radius}"
                    fill="none"
                    stroke="var(--text-primary)"
                    stroke-width="2"
                  />
                  <circle 
                    cx="8" 
                    cy="8" 
                    r="${radius}"
                    fill="none"
                    stroke="var(--accent)"
                    stroke-width="2"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${strokeDashoffset}"
                    stroke-linecap="round"
                    transform="rotate(-90 8 8)"
                    class="progress-circle"
                  />
                </svg>
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
    // Validate that parent columns have selections
    if (columnIndex === 1 && this.selectedPaths[0] === null) {
      // Cannot add to column 2 without selecting from column 1
      return;
    }

    if (
      columnIndex === 2 &&
      (this.selectedPaths[0] === null || this.selectedPaths[1] === null)
    ) {
      // Cannot add to column 3 without selecting from both columns 1 and 2
      return;
    }

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
          // Create new input for next entry if under limit
          setTimeout(() => {
            this.showAddInputIfPossible(columnIndex);
          }, 50);
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

  showAddInputIfPossible(columnIndex) {
    const tasks = this.getTasksForColumn(columnIndex);

    if (tasks.length < this.maxItemsPerColumn) {
      this.showAddInput(columnIndex);
    }
    // If at limit, silently do nothing (no alert)
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

  getColumnTitle(columnIndex) {
    if (columnIndex === 0) {
      return "All Tasks";
    } else if (columnIndex === 1 && this.selectedPaths[0] !== null) {
      return this.data[this.selectedPaths[0]].title;
    } else if (
      columnIndex === 2 &&
      this.selectedPaths[0] !== null &&
      this.selectedPaths[1] !== null
    ) {
      const parentTask = this.data[this.selectedPaths[0]];
      const parentSubtask = parentTask.tasks[this.selectedPaths[1]];
      return parentSubtask.title;
    }
    return "";
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
          // Create new input for next entry if under limit
          setTimeout(() => {
            this.showAddInputIfPossible(columnIndex);
          }, 50);
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

    const clipHeader = this.getColumnTitle(columnIndex) || "Tasks";
    const taskList = tasks.map((task) => `- ${task.title}`).join("\n");
    const fullText = `${clipHeader}\n${taskList}`;

    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        this.showSuccessMessage();
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = fullText;
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

  // Import/Export functionality
  exportData() {
    try {
      const dataStr = JSON.stringify(this.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `subtasks-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.showSuccessMessage();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  }

  importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);

          // Basic validation
          if (Array.isArray(importedData)) {
            const confirmed = confirm(
              "This will replace all your current tasks. Are you sure?"
            );
            if (confirmed) {
              this.data = importedData;
              this.selectedPaths = [null, null, null];
              this.saveData();
              this.render();
              this.showSuccessMessage();
            }
          } else {
            throw new Error("Invalid file format");
          }
        } catch (error) {
          console.error("Import failed:", error);
          alert("Import failed. Please check the file format.");
        }
      };
      reader.readAsText(file);
    });

    input.click();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SubtaskApp();
});

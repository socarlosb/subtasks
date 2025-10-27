# Subtask App

A simple web application for managing tasks in a hierarchical structure with three levels: Tasks → Subtasks → Sub-subtasks.

## Features

- **3-Column Layout**: Organized view with main tasks, subtasks, and sub-subtasks
- **Intuitive Task Management**: Click to add, hover to edit, delete by clearing text
- **Progress Tracking**: Visual indicators showing completion status for parent tasks
- **Local Storage**: All data persists in your browser
- **Copy to Clipboard**: Export task lists from any column
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Support**: ESC to cancel editing, Enter to save

## How to Use

### Adding Tasks

1. Click anywhere in a column to add a new task
2. Type the task name and press Enter or click outside to save
3. Tasks are automatically saved to local storage

### Editing Tasks

1. Hover over any task to see the edit cursor
2. Click on the task text to edit
3. Press Enter to save or Escape to cancel
4. Delete a task by removing all text while editing

### Navigation

1. Click on a main task to see its subtasks in the second column
2. Click on a subtask to see its sub-subtasks in the third column
3. Click the same task again to collapse and hide child tasks

### Completing Tasks

- Only sub-subtasks (third column) can be marked as complete
- Click the checkbox next to the task name
- Completed tasks show with strikethrough text
- Parent tasks show progress indicators based on child completion

### Copy to Clipboard

- Each column has a copy button (📋) in the top-right corner
- Copies all visible tasks in that column as a simple list
- A success message confirms the copy operation

## Technical Details

### File Structure

```
/src
  ├── index.html       # Main HTML file
  ├── styles.css       # Styling and theme
  ├── script.js        # Application logic
  └── assets/          # Icons and images
      └── icons/
```

### Data Structure

Tasks are stored in localStorage as a JSON array:

```json
[
  {
    "id": "task-1",
    "title": "My first task",
    "order": 0,
    "created": "2025-10-27",
    "tasks": [
      {
        "id": "subtask-1-1",
        "title": "My sub task",
        "order": 0,
        "sub-tasks": [
          {
            "id": "microTask-1-1-1",
            "title": "My micro task",
            "order": 0,
            "status": "complete",
            "completed": "2025-10-27"
          }
        ]
      }
    ]
  }
]
```

### Browser Compatibility

- Modern browsers with ES6+ support
- Local Storage support required
- Clipboard API support (with fallback for older browsers)

## Getting Started

1. Open `src/index.html` in your web browser
2. Start adding tasks by clicking in the first column
3. Your data will be automatically saved and restored between sessions

## Limitations

- Maximum 50 items per column (configurable in code)
- Data is stored locally in browser only
- No synchronization between devices/browsers

## Future Enhancements

- Drag and drop reordering
- Import/Export functionality
- Keyboard shortcuts
- Data synchronization
- Mobile app version

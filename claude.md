# subtask app

A simple web app that helps dissecting your tasks in sub tasks. we will use ony html, css and javascript.

## ui

we will have the app divided in 3 columns. on the first column we will have main tasks, when a user selects one of the main tasks the second column will show sub tasks of that main tasks. when the user selects a subtask of the second column we show subsubtasks of that subtask, on the 3rd column.
each column have a title, the first we have the text "Tasks", the second will have the title of a main task if selected, the 3rd column will have a subtask title, if selected.

![example of 3 columns](<3 columns example.png>)

## features

- adding tasks: clicking anywhere on a column will show an input text just bellow the last entry of that column. Each entry will transform itself into an input on mouse hover so that it can be edited
  ![adding task example](<adding task.png>)
- user can delete tasks by removing any text, while editing, of that entry
- an entry can marked as completed on the 3rd column
- the first and second column entries should have an icon that shows the progress of it's tasks, just like in the image
  - finish ones should show a check-circle icon
  - if no entry was finish we show an empty circle
  - parent tasks should auto-complete when all children are done
  - unfinish ones should show a circle with an inner circle shaped calculated from the percentage of finish entries
    ![example of entry icons](<example of entry icons.png>)
- use the same style from the shared images
- data should be saved to local storage, format should be simple and direct, may something like:

```json
[
  {
    "id": "task-1", // Add unique IDs for better data management
    "title": "My first task",
    "order": 0, // Use numbers instead of strings
    "created": "2025-10-27", // Track creation date
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
            "completed": "2025-10-27" // Track completion date
          },
          {
            "id": "microTask-1-1-2",
            "title": "My second micro task",
            "order": 1,
            "status": "incomplete"
          }
        ]
      }
    ]
  }
]
```

- copy feature: each column have a copy button at that column top right corner, always visible, we copy to clipboard only the content from that column as a simple list, we export all the entries as a simple list, even if some are completed:

```
- do this
- do that
```

- we should show a message that the copy to the clipboard was done successfully
- navigation: show a line just like in the "adding task.png" image, and we show the selected entry with a background color and that blue line.

## user experience

- when there are no tasks show a text "Add your task here..."
- mobile/smaller screens: keep 3 columns, user can scroll horizontally
- performance: limit the number of entries for every column to 50, when the user tries to add the 51th entry we alert them that they exced the 50 items limit, and cancel that entry
- **escape** key cancels editing, **enter** key save changes
- auto focus on input when adding new tasks

## file structure

```
/src
    index.html
    styles.css
    script.js
    README.md
    assets/
        icons/
```

## nice to have

- drag and drop to reorder just withing the same column
- toggle active entry: when selecting an entry from column 1 we show the entry children on the second column, selecting it again should clean the second and third columns
- import and export feature: on import we replace the local storage, and export as a json file
- add the necessary accessibility arias

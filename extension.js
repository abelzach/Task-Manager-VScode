const vscode = require('vscode');

const tasks = [];

function activate(context) {
	// console.log("Working")
	let disposableCreateTask = vscode.commands.registerCommand('taskManager.createTask', () => {
    vscode.window.showInputBox({ prompt: 'Enter task description' }).then((taskDescription) => {
		if (taskDescription) {
			showDueDatePicker((dueDate) => {
			tasks.push({ description: taskDescription, dueDate });
			vscode.window.showInformationMessage('Task Added!');
			});
		}
		});
	});

	let disposableListTasks = vscode.commands.registerCommand('taskManager.listTasks', () => {
		if (tasks.length === 0) {
			vscode.window.showInformationMessage('No tasks available.');
			return;
		}
		const currentDate = new Date();
    	currentDate.setHours(0, 0, 0, 0);
		
		const taskItems = tasks.map((task, index) => {
			const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
			let labelString = `${index + 1}. ${task.description}`;
			if (taskDueDate) {
				if (taskDueDate < currentDate) {
					labelString = `${labelString} [OVERDUE]`;
				}
			}
			return {
				label: labelString,
				taskIndex: index,
				detail: `Due: ${task.dueDate || 'No due date'}`,
				description: 'Delete',
				picked: false,
			};
		});
		// console.log(taskItems);

		vscode.window.showQuickPick(taskItems, { placeHolder: 'Select a task to view details or delete' }).then((selectedTask) => {
			if (selectedTask) {
				if (selectedTask.description === 'Delete') {
					const indexToRemove = selectedTask.taskIndex;
					const removedTask = tasks.splice(indexToRemove, 1)[0];
					vscode.window.showInformationMessage(`Task removed: ${removedTask.description}`);
				} else {
					vscode.window.showInformationMessage(
					`Task ${selectedTask.taskIndex + 1}: ${tasks[selectedTask.taskIndex].description}`,
					`Due Date: ${tasks[selectedTask.taskIndex].dueDate || 'No due date'}`
					);
				}
			}
		});
	});



	let disposableRemoveTask = vscode.commands.registerCommand('taskManager.removeTask', () => {
		if (tasks.length === 0) {
		vscode.window.showInformationMessage('No tasks available to remove.');
		return;
		}

		const taskItems = tasks.map((task, index) => ({ label: `${index + 1}. ${task.description}`, taskIndex: index }));
		vscode.window.showQuickPick(taskItems, { placeHolder: 'Select a task to remove' }).then((selectedTask) => {
			if (selectedTask) {
				const indexToRemove = selectedTask.taskIndex;
				const removedTask = tasks.splice(indexToRemove, 1)[0];
				vscode.window.showInformationMessage(`Task removed: ${removedTask.description}`);
			}
		});
	});

  	// Register the commands
	context.subscriptions.push(disposableCreateTask);
	context.subscriptions.push(disposableListTasks);
	context.subscriptions.push(disposableRemoveTask);
}

function deactivate() {}

function showDueDatePicker(callback) {
  const dueDateOptions = [
	{ label: 'No Due Date', dueDate: null }, 
    { label: 'Today', dueDate: getFormattedDate(new Date()) },
    { label: 'Tomorrow', dueDate: getFormattedDate(new Date(Date.now() + 86400000)) },
    { label: 'Pick a date', dueDate: 'custom' }
  ];

  vscode.window.showQuickPick(dueDateOptions, { placeHolder: 'Select a due date' }).then((selectedOption) => {
    if (selectedOption) {
      if (selectedOption.dueDate === 'custom') {
        // If the user selects 'Pick a date', open a date picker
        vscode.window.showInputBox({ prompt: 'Enter a custom due date (YYYY-MM-DD)' }).then((customDueDate) => {
          if (customDueDate) {
            callback(customDueDate);
          }
        });
      } else {
        callback(selectedOption.dueDate);
      }
    }
  });
}

function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = {
  activate,
  deactivate
};

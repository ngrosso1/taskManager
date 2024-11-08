import React, { useEffect, useState } from 'react';

interface Task {
    id: number;
    title: string;
    completed: boolean;
    dueDate?: string; // Make dueDate optional
}

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState<string>('');
    const [newTaskDueDate, setNewTaskDueDate] = useState<string>(''); // State for due date
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingTaskTitle, setEditingTaskTitle] = useState<string>('');
    const [editingTaskDueDate, setEditingTaskDueDate] = useState<string>(''); // State for editing due date
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://localhost:3001/tasks'); // Adjusted port
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: Task[] = await response.json();
                setTasks(data);
            } catch (error) {
                setError('Error fetching tasks');
            }
        };

        fetchTasks();
    }, []);

    const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTaskTitle) return;

        try {
            const response = await fetch('http://localhost:3001/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: newTaskTitle, dueDate: newTaskDueDate }), // Include dueDate
            });

            const data = await response.json(); // Log the response data
            if (!response.ok) {
                throw new Error(data.error || 'Error adding task'); // Capture error details from the response
            }

            setTasks((prevTasks) => [...prevTasks, data]);
            setNewTaskTitle('');
            setNewTaskDueDate(''); // Reset due date input
        } catch (error) {
            console.error('Error adding task:', error); // Log the error to console
            setError('Error adding task'); // Set the error message for display
        }
    };

    const handleToggleTask = async (taskId: number) => {
        try {
            const taskToUpdate = tasks.find((task) => task.id === taskId);
            if (!taskToUpdate) return;

            const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };

            const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: updatedTask.completed }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, completed: updatedTask.completed } : task
                )
            );
        } catch (error) {
            setError('Error updating task');
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        } catch (error) {
            setError('Error deleting task');
        }
    };

    const handleEditTask = async (taskId: number) => {
        if (!editingTaskTitle) return;

        try {
            const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: editingTaskTitle, dueDate: editingTaskDueDate }), // Include dueDate
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, title: editingTaskTitle, dueDate: editingTaskDueDate } : task
                )
            );

            setEditingTaskId(null);
            setEditingTaskTitle('');
            setEditingTaskDueDate(''); // Reset editing due date
        } catch (error) {
            setError('Error editing task');
        }
    };

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditingTaskTitle(task.title);
        setEditingTaskDueDate(task.dueDate || ''); // Set due date for editing
    };

    // Filtering Logic
    const filteredTasks = tasks.filter((task) => {
        if (filter === 'completed') return task.completed; // Only completed tasks
        if (filter === 'not-completed') return !task.completed; // Only not completed tasks
        return true; // For 'all', return all tasks
    });

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <form onSubmit={handleAddTask}>
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="New Task Title"
                />
                <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    placeholder="Due Date"
                />
                <button className="button-33" type="submit">Add Task</button> {/* Updated button */}
            </form>

            {/* Filter Dropdown */}
            <label htmlFor="filter">Filter Tasks:</label>
            <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="not-completed">Not Completed</option>
            </select>

            <ul>
                {filteredTasks.map(task => (
                    <li key={task.id} onClick={() => handleToggleTask(task.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {editingTaskId === task.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editingTaskTitle}
                                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                                />
                                <input
                                    type="date"
                                    value={editingTaskDueDate}
                                    onChange={(e) => setEditingTaskDueDate(e.target.value)}
                                />
                                <button onClick={() => handleEditTask(task.id)}>Save</button>
                            </>
                        ) : (
                            <>
                                <span style={{ flex: 1 }}>
                                    {task.title} - {task.completed ? 'Completed' : 'Not Completed'}
                                    {task.dueDate && ` (Due: ${task.dueDate})`} {/* Display due date */}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <button className="delete-button" onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                    }}>
                                        🗑️
                                        <span className="tooltip">Delete Task</span> {/* Tooltip for delete */}
                                    </button>
                                    <button className="edit-button" onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(task);
                                    }}>
                                        ✏️
                                        <span className="tooltip">Edit Task</span> {/* Tooltip for edit */}
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;

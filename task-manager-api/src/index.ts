import express, { Request, Response } from 'express';
import { Task } from './task.model';
import Joi from 'joi';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors()); // Enable CORS for all routes

// Middleware to parse JSON bodies
app.use(express.json());

const taskSchema = Joi.object({
  title: Joi.string().required(),
  dueDate: Joi.string().optional(),
});

const completedSchema = Joi.object({
  completed: Joi.boolean().required(),
});


// In-memory database
let tasks: Task[] = [];
let nextId = 1;

// Create a new task with validation
app.post('/tasks', (req: Request, res: Response) => {
  const {error} = taskSchema.validate(req.body);
  if(error) return res.status(400).json({error: error.details[0].message});

  //old code before Joi
  /*const { title } = req.body;
  if (!title || typeof title !== 'string')
    return res.status(400).json({ error: 'Title is required and must be a string.' });
  */

  const newTask: Task = 
  { 
    id: tasks.length + 1, 
    title: req.body.title,
    completed: false,
    dueDate: req.body.dueDate,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update a task (PATCH)
app.patch('/tasks/:id', (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  // Update the title if provided
  if (req.body.title) {
    if (typeof req.body.title !== 'string') {
      return res.status(400).json({ error: 'Title must be a string.' });
    }
    task.title = req.body.title;
  }

  // Update the completed status if provided
  if (req.body.completed !== undefined) {
    if (typeof req.body.completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean.' });
    }
    task.completed = req.body.completed;
  }

  // Update the due date if provided
  if (req.body.dueDate) {
    if (typeof req.body.dueDate !== 'string') {
        return res.status(400).json({ error: 'Due date must be a string.' });
      }
    task.dueDate = req.body.dueDate; // Add this line
  }

  // Respond with the updated task
  res.json(task);
});


// Update a task by ID with validation
app.put('/tasks/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { title, completed } = req.body;

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const {error} = completedSchema.validate(req.body);
  if(error) res.status(400).json({error: error.details[0].message})
  //old code before joi
  /*if (title && typeof title !== 'string') 
    return res.status(400).json({ error: 'Title must be a string.' });*/

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean.' });
  }

  //task.title = title !== undefined ? title : task.title;
  //task.completed = completed !== undefined ? completed : task.completed;
  task.completed = req.body.completed;
  res.json(task);
});

// Get all tasks
app.get('/tasks', (req: Request, res: Response) => {
  res.json(tasks);
});

// Get a specific task by ID
app.get('/tasks/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// Update a task by ID
// PUT /tasks/:id endpoint
app.put('/tasks/:id', (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id);
  const { completed } = req.body;

  // Find the task by ID
  const task = tasks.find(t => t.id === taskId);

  if (!task) return res.status(404).json({ error: 'Task not found.' });
  
  // Ensure completed is a boolean
  if (typeof completed !== 'boolean') return res.status(400).json({ error: 'Completed must be a boolean.' });

  // Update the completed status
  task.completed = completed; // Update completed status based on input
  res.json(task); // Respond with the updated task
});

// Delete a task by ID
app.delete('/tasks/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);
  
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


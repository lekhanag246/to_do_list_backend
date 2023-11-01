const { Router } = require('express');
const taskRouter = Router();

const { getAllTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/tasksControllers');
const { authorize } = require('../controllers/userControllers');

taskRouter.get('/tasks', authorize, getAllTasks);
taskRouter.post('/task', authorize, createTask);
taskRouter.get('/task/:id', authorize, getTask);
taskRouter.patch('/task/:id', authorize, updateTask);
taskRouter.delete('/task/:id', authorize, deleteTask);


module.exports = {
    taskRouter
}
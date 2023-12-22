import express from 'express'

import { getAllTasks, createTaskController, getTask } from '../controllers/tasks'
import { isAuthenticated, isAdmin, addIdToRequest } from '../middlewares'

export default (router: express.Router) => {
  router.get('/tasks', getAllTasks)
  router.post('/tasks/create', isAuthenticated, isAdmin, addIdToRequest, createTaskController)
  router.get('/tasks/:id', getTask)
};

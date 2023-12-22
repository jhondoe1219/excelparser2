import multiparty from 'multiparty'
import express from 'express'
import request from 'request'
import fs from 'fs'
import util from 'util'

import { getTasks, getTaskById, createTask, statuses, getTaskByRequestid } from '../db/tasks'

const URL_SERVER2 = 'http://localhost:4000/upload'
const UPLOAD_DIR = '../uploadsapp'

export const getAllTasks = async (req: express.Request, res: express.Response) => {
  try {
    const tasks = await getTasks();

    return res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const getTask = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const task = await getTaskById(id);

    return res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const createTaskController = async (req: express.Request, res: express.Response) => {
  try {
    //await createTask({ requestid: req.id, status: statuses.PROCESSING_STARTED })
    console.log('+++ 1 create task by requestid set status created', { reqid: req.id, status: 'processing_started' })
    const form = new multiparty.Form()

    form.parse(req, async (err, fields, files) => { // срабатывает 2


      // return res.status(200).json({ fields, files, task })
      console.log('+++ 2 add originalFilename, pathserver1 to task by requestid set status uploaded_service_1', {
        originalFilename: files.file[0].originalFilename,
        pathserver1: files.file[0].path,
        taskname: fields.taskname[0],
        reqid: req.id,
        status: 'uploaded_service_1',
        
      }) //  reqid taskname originalFilename pathserver1 pathserver2 status

      await createTask({ requestid: req.id, status: statuses.PROCESSING_STARTED })
      const task = await getTaskByRequestid(req.id)

      task.originalFilename = files?.file[0]?.originalFilename
      task.pathFileServer1 = files?.file[0]?.path
      task.taskname = fields?.taskname[0]
      task.status = statuses.UPLOADED_SERVICE_1

      const result = await task.save()

      res.writeHead(200, { 'content-type': 'text/plain' });
      res.write('received upload:\n\n');
      res.end(util.inspect({ fields: fields, files: files }));
    })

    let progressBar = 0;
    form.on('progress', function (a, b) {
      const percents = Math.floor(a / b * 100)
      console.log(`downloading progress ${req.id}: ${percents}%`)
      // if (percents > progressBar + 9) {
      //   progressBar = percents
      //   console.log(`downloading progress ${req.id}: ${progressBar}%`)
      // }
    })

    form.on('file', function (_, file) {
      const filestream = fs.createReadStream(file.path)
      const formData = {
        file: {
          value: filestream,
          options: {
            filename: req.id,
          }
        }
      }

      // Post the file to the upload server
      request.post({ url: URL_SERVER2, formData })
    })

  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}
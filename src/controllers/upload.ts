import multiparty from 'multiparty'
import express from 'express'
import { statuses, getTaskByRequestid } from '../db/tasks'
import { fork } from 'child_process'

const UPLOAD_DIR = './uploadsapp'

export const processingFileController = async (req: express.Request, res: express.Response) => {
  try {
    const form = new multiparty.Form({ uploadDir: UPLOAD_DIR })

    form.parse(req, async (err, fields, files) => {
      const requestid = files?.file[0]?.originalFilename.split('.')[0]
      if (!requestid) throw Error('No requestid')

      const task = await getTaskByRequestid(files?.file[0]?.originalFilename.split('.')[0])
      if (!task) throw Error('No task in db by requestid: ' + requestid)

      task.pathFileServer2 = files?.file[0]?.path
      task.status = statuses.UPLOADED_SERVICE_2
      await task.save()

      const child = fork('./src/BackgroundProcesses')
      child.send(task.pathFileServer2)

      console.log({ err, fields, files, task })
      res.send({ err, fields, files, task })
    })

    let progressBar = 0
    form.on('progress', function (a, b) {
      const percents = Math.ceil(a / b * 100)
      if (percents > progressBar + 9) {
        progressBar = percents
        console.log(`downloading progress: ${progressBar}%`)
      }
    })
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}
import express from 'express'
import cors from 'cors'
import { processingFileController } from '../controllers/upload'


export default (router: express.Router) => {
  router.post('/upload',cors(), processingFileController)
};

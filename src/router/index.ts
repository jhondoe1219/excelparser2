import express from 'express'
import upload from './upload'

const router = express.Router()

export default (): express.Router => {
  upload(router)
  return router;
}

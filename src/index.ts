import mongoose from 'mongoose'
import express from 'express'
import cors from 'cors'
import http from 'http'

import router from './router'

const PORT = 4000
const MONGO_URL = 'mongodb://localhost:27017'

const app = express()

app.use(cors())
app.use('/', router())


http
  .createServer(app)
  .listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`))

mongoose
  .connect(MONGO_URL)
  .then(() => console.log(`MongoDB connected on ${MONGO_URL}`))
  .catch(error => console.log(`MongoDB connecting error on ${MONGO_URL}`, error))


process.on('uncaughtException', (error: Error) => console.log('Service uncaught error: ', error))
mongoose.connection.on('error', (error: Error) => console.log('MongoDB error: ', error))
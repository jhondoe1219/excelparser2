import mongoose from 'mongoose'
import XLSX from 'xlsx'
import { statuses, getTasksByStatus, getUploadedFilesTasksSortByCreatedAt } from '../db/tasks'
import { createFiledata } from '../db/filedata'

const MONGO_URL = 'mongodb://localhost:27017'

mongoose
    .connect(MONGO_URL)
    .then(() => console.log(`MongoDB connected on ${MONGO_URL}`))
    .catch(error => console.log(`MongoDB connecting error on ${MONGO_URL}`, error))

mongoose.connection.on('error', (error: Error) => console.log('MongoDB error: ', error))

console.log('CHILD CREATED!', process.pid)

process.on('message', async (path) => {
    console.log(path)
    const result = await proccessingExcelQueue()
    console.log({ result }, process.pid)
    process.exit(1)
})

async function proccessingExcelQueue(): Promise<any> {
    const parse = (filename: string) => {
        const excelData = XLSX.readFile(filename)
        return Object.keys(excelData.Sheets).map((name) => XLSX.utils.sheet_to_json(excelData.Sheets[name]))
    }

    const taskParsing = await getTasksByStatus(statuses.PARSING_STARTED)
    if (taskParsing.length) return 'task parsing'

    const uploadedTask = await getUploadedFilesTasksSortByCreatedAt()
    if (!uploadedTask.length) return 'no tasks for processing'

    const parsingTask = uploadedTask[0]

    parsingTask.status = statuses.PARSING_STARTED
    await parsingTask.save()
    try {
        console.log({ message: `start parsing`, processid: process.pid, task: parsingTask._id })

        const filedata = parse(parsingTask.pathFileServer2)[0]

        let progressBar = 0
        for (let i = 0; i < filedata.length; i++) {
            const row: any = filedata[i]
            await createFiledata({
                Price: row[Object.keys(row)[0]],
                ProductName: row[Object.keys(row)[1]],
                Count: row[Object.keys(row)[2]],
                Quantity: row[Object.keys(row)[3]],
                Date: row[Object.keys(row)[4]],
                file: parsingTask.pathFileServer2,
                row: i
            })

            const percents = Math.ceil(i * 100 / filedata.length)

            if (percents > progressBar + 9) {
                progressBar = percents
                console.log({ message: `progress parsing - ${percents}%`, processid: process.pid, task: parsingTask._id })
            }

        }

        parsingTask.status = statuses.PARSED
        await parsingTask.save()

        return await proccessingExcelQueue()
    } catch (e) {
        parsingTask.status = statuses.PARSING_ERROR
        console.log('error parsing', process.pid, process.exit(1))
        process.exit(1)
    }
}
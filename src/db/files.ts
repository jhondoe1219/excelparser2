import mongoose from 'mongoose'

// File Config
const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filesrc: { type: String, required: true },
  taskid: { ref: 'Task', type: mongoose.Schema.Types.ObjectId },
  filedata: [],
})

export const FileModel = mongoose.model('File', FileSchema)

// File Actions
export const createFile = (values: Record<string, any>) => new FileModel(values).save().then((file) => file.toObject())
export const getFileById = (id: string) => FileModel.findById(id)
export const updateFileById = (id: string, values: Record<string, any>) => FileModel.findByIdAndUpdate(id, values)
export const deleteFileById = (id: string) => FileModel.findOneAndDelete({ _id: id })

export const getFileByFilename = (filename: string) => FileModel.findOne({ filename })
export const getFileByFilesrc = (filesrc: string) => FileModel.findOne({ filesrc })
export const getFileByTaskid = (taskid: string) => FileModel.findOne({ taskid })

export const getFiles = () => FileModel.find()
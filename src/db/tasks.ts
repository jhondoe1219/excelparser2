import mongoose from 'mongoose';

// Task Config
const TaskSchema = new mongoose.Schema({
  taskname: { type: String, required: true },
  filesrc: { type: String, required: true },
  userid: { ref: 'User', type: mongoose.Schema.Types.ObjectId }
});

export const TaskModel = mongoose.model('Task', TaskSchema)

// Task Actions
export const getTasks = () => TaskModel.find();
export const getTasksByUserid = (userid: string) => TaskModel.find({ userid })
export const getTaskByFilesrc = (filesrc: string) => TaskModel.findOne({ filesrc })
export const getTaskByTaskname = (taskname: string) => TaskModel.findOne({ taskname })
export const getTaskById = (id: string) => TaskModel.findById(id)
export const createTask = (values: Record<string, any>) => new TaskModel(values).save().then((task) => task.toObject())
export const deleteTaskById = (id: string) => TaskModel.findOneAndDelete({ _id: id })
export const updateTaskById = (id: string, values: Record<string, any>) => TaskModel.findByIdAndUpdate(id, values)

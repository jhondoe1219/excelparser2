import mongoose from 'mongoose'

export const roles = Object.freeze({
  ADMIN: 'admin',
  CONSUMER: 'consumer',
})

// User Config
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false },
    sessionToken: { type: String, select: false },
    role: { type: String, select: false, enum: Object.values(roles), default: 'consumer' },
  },
})

export const UserModel = mongoose.model('User', UserSchema)

// User Actions
export const createUser = (values: Record<string, any>) => new UserModel(values).save().then((user) => user.toObject())
export const getUserById = (id: string) => UserModel.findById(id)
export const updateUserById = (id: string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values)
export const deleteUserById = (id: string) => UserModel.findOneAndDelete({ _id: id })

export const getUserByEmail = (email: string) => UserModel.findOne({ email })
export const getUserBySessionToken = (sessionToken: string) => UserModel.findOne({ 'authentication.sessionToken': sessionToken })

export const getUsers = () => UserModel.find()
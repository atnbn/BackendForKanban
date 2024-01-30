const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
    name: String,
    done: Boolean
})

const statusSchema = new mongoose.Schema({
    id: String,
    columnName: String,
})

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    subtasks: [subtaskSchema],
    status: [statusSchema],
    id: String
})


const columnSchema = new mongoose.Schema({
    columnName: String,
    tasks: [taskSchema],
    id: String,
    boardId: String
})


const boardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    columns: [columnSchema],
    id: String,
    userId: String

})

const Status = mongoose.model('Status', statusSchema);
const Subtask = mongoose.model('Subtask', subtaskSchema);
const Task = mongoose.model('Task', taskSchema);
const Column = mongoose.model('Column', columnSchema);
const Board = mongoose.model('Board', boardSchema);

module.exports = {
    Board,
    Column,
    Task,
    Subtask,
    Status
};
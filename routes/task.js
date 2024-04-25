const express = require('express');
const router = express.Router();
const { Task, Board } = require('../models/board.js');




router.post('/api/create-task/:boardId/:columnId', async (req, res) => {
    try {
        const { boardId, columnId } = req.params;
        const taskData = req.body;
        // Validate taskData
        if (!taskData.title || !taskData.description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const board = await Board.findOne({ id: boardId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const column = board.columns.find(col => col.id === columnId);
        if (!column) {
            return res.status(404).json({ error: 'Column not found' });
        }

        const newTask = new Task(taskData);

        column.tasks.push(newTask);

        await board.save();
        res.status(201).json({
            message: 'Task added successfully', task: {
                title: newTask.title,
                description: newTask.description,

            },
        });

    } catch (err) {
        res.status(500).json({ error: 'An error occurred while adding the task' });
    }
});

router.put('/api/edit-task/:boardId/:columnId/:taskId', async (req, res) => {
    try {
        const { boardId, columnId, taskId } = req.params;
        const { ...updatedTaskData } = req.body;
        const newColumnStatus = req.body.status[0].id
        const board = await Board.findOne({ id: boardId });
        if (!board) {
            return res.status(404).send('Board not found');
        }

        // Find the current column and the task
        let currentColumn = board.columns.find(col => col.id === columnId);
        let task = currentColumn?.tasks.find(t => t.id === taskId);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        Object.assign(task, updatedTaskData);

        if (newColumnStatus && newColumnStatus !== columnId) {
            let newColumn = board.columns.find(col => col.id === newColumnStatus);
            if (!newColumn) {
                return res.status(404).send('New column not found');
            }

            currentColumn.tasks = currentColumn.tasks.filter(t => t.id !== taskId);

            newColumn.tasks.push(task);
        }

        await board.save();

        res.status(200).json({ message: 'Task updated successfully', board });
    } catch (err) {
        res.status(500).send('An error occurred while updating the task');
    }
})

router.delete('/api/delete-task/:boardId/:columnId/:taskId', async (req, res) => {
    try {
        const { boardId, columnId, taskId } = req.params;

        const board = await Board.findOne({ id: boardId });
        if (!board) {
            return res.status(404).send('Board not found');
        }

        const column = board.columns.find(col => col.id === columnId);
        if (!column) {
            return res.status(404).send('Column not found');
        }

        const taskIndex = column.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).send('Task not found');
        }

        column.tasks.splice(taskIndex, 1);
        await board.save();
        res.status(200).json({ message: 'Task deleted successfully', board });
    } catch (err) {
        res.status(500).send({ message: 'An error occurred while deleting the task' });
    }
});


module.exports = router;
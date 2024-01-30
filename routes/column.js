const express = require('express');
const router = express.Router();
const Column = require('../models/board.js');


router.post('/api/create-column', async (req, res) => {
    try {
        const { columnName, tasks, id } = req.body

        const newColumn = new Column({
            columnName,
            tasks,
            id,
            boardId,
        });
        const saveColumn = await newColumn.save();
        res.status(201).json(saveColumn);
    } catch (err) {
        res.status(500).send('Server error')
    }
})

module.exports = router
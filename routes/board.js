const express = require('express');
const router = express.Router();
const { Board, columns } = require('../models/board.js');


router.post('/api/create-board', async (req, res) => {
    try {
        const { title, columns, id } = req.body
        const newBoard = new Board({
            title,
            columns: columns,
            id,
            userId: req.session.userId,
        })
        await newBoard.save();
        res.status(201).send({ message: 'Board created successfully' })
    } catch (err) {
        res.status(500).send('Server error')
    }
})


router.get('/api/get-boards', async (req, res) => {
    try {
        const boards = await Board.find({ userId: req.session.userId }).exec();
        if (!boards) {
            return res.status(404).send('No boards found');
        }
        res.json(boards);
    } catch (error) {
        res.status(500).send('Server error');
    }
});


router.post('/api/edit-board/:boardId', async (req, res) => {
    const boardId = req.params.boardId;
    const updatedData = req.body

    try {
        const board = await Board.findOne({ id: boardId });
        if (!board) {
            return res.status(404).send('Board not found');
        }
        Object.assign(board, updatedData)

        await board.save();

        res.status(200).json({ message: 'Board updated successfully', })


    } catch (err) {
        res.status(500).send('An error occurred while updating the board');

    }
})

router.delete('/api/delete-board/:boardId', async (req, res) => {
    const boardId = req.params.boardId
    try {
        const board = await Board.deleteOne({ id: boardId });
        if (board.deletedCount === 0) {
            return res.status(404).send('User not found');
        }
        res.send({ message: 'Board deleted successfully' });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router
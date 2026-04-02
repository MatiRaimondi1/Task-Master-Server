const Task = require('../models/Task');

/**
 * Fetches all tasks for the authenticated user
 * @param {*} req 
 * @param {*} res 
 */
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
};

/**
 * Creates a new task for the authenticated user
 * @param {*} req 
 * @param {*} res 
 */
exports.createTask = async (req, res) => {
    try {
        const newTask = new Task({
            ...req.body,
            user: req.user.id
        });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Updates an existing task for the authenticated user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id }, 
            req.body, 
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Deletes an existing task for the authenticated user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user.id 
        });

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting task" });
    }
};
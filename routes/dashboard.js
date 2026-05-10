const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const projects = await Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] });
  const projectIds = projects.map((project) => project._id);

  const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
  const todo = await Task.countDocuments({ project: { $in: projectIds }, status: 'todo' });
  const inProgress = await Task.countDocuments({ project: { $in: projectIds }, status: 'in-progress' });
  const done = await Task.countDocuments({ project: { $in: projectIds }, status: 'done' });
  const overdue = await Task.countDocuments({ project: { $in: projectIds }, dueDate: { $lt: new Date() }, status: { $ne: 'done' } });

  res.json({
    projectCount: projects.length,
    totalTasks,
    todo,
    inProgress,
    done,
    overdue
  });
});

module.exports = router;

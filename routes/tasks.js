const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const filter = { $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }] };
  if (req.query.projectId) {
    filter.project = req.query.projectId;
  }
  const tasks = await Task.find(filter).populate('project', 'name').populate('assignedTo', 'name email');
  res.json(tasks);
});

router.post('/', auth, async (req, res) => {
  const { title, description, status, dueDate, projectId, assignedTo } = req.body;
  if (!title || !projectId) return res.status(400).json({ message: 'Title and project are required.' });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found.' });

  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    dueDate: dueDate ? new Date(dueDate) : undefined,
    project: projectId,
    assignedTo,
    createdBy: req.user._id
  });

  res.json(task);
});

router.put('/:id', auth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  if (!task.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Permission denied.' });
  }

  const { title, description, status, dueDate, assignedTo } = req.body;
  if (title) task.title = title;
  if (description) task.description = description;
  if (status) task.status = status;
  if (dueDate) task.dueDate = new Date(dueDate);
  if (assignedTo !== undefined) task.assignedTo = assignedTo;

  await task.save();
  res.json(task);
});

router.delete('/:id', auth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  if (!task.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Permission denied.' });
  }

  await task.remove();
  res.json({ message: 'Task deleted.' });
});

module.exports = router;

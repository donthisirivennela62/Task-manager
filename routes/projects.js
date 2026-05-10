const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const projects = await Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] }).populate('owner', 'name email role').populate('members', 'name email role');
  res.json(projects);
});

router.post('/', auth, async (req, res) => {
  const { name, description, members } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name is required.' });

  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    members: Array.isArray(members) ? members : []
  });
  res.json(project);
});

router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  if (!project.owner.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Permission denied.' });
  }

  const { name, description, members } = req.body;
  if (name) project.name = name;
  if (description) project.description = description;
  if (Array.isArray(members)) project.members = members;
  await project.save();
  res.json(project);
});

router.get('/users', auth, permit('admin'), async (req, res) => {
  const users = await User.find({}, 'name email role');
  res.json(users);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Получение всех студентов
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Получение одного студента по ID
router.get('/:id', getStudent, (req, res) => {
  res.json(res.student);
});

// Создание студента
router.post('/', async (req, res) => {
  const student = new Student({
    name: req.body.name,
    age: req.body.age,
    courses: req.body.courses,
    address: req.body.address
  });
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Обновление студента по ID
router.patch('/:id', getStudent, async (req, res) => {
    if (req.body.name != null) {
        res.student.name = req.body.name;
    }
    if (req.body.age != null) {
        res.student.age = req.body.age;
    }
    if (req.body.courses != null) {
        res.student.courses = req.body.courses;
    }
    if (req.body.address != null) {
        res.student.address = req.body.address;
    }

    try {
        const updatedStudent = await res.student.save();
        res.json(updatedStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Удаление студента по ID
router.delete('/:id', getStudent, async (req, res) => {
  try {
    await res.student.deleteOne();
    res.json({ message: 'Deleted Student' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getStudent(req, res, next) {
  let student;
  try {
    student = await Student.findById(req.params.id);
    if (student == null) {
      return res.status(404).json({ message: 'Cannot find student' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.student = student;
  next();
}

module.exports = router;

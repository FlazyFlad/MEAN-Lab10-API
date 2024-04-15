const express = require('express');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');
const fs = require('fs').promises;
const sendNotification = require('../mailer/mailer');
const { RateLimiterMongo } = require('rate-limiter-flexible');

const maxLoginAttempts = 5;
const lockoutTime = 10;
const limiter = new RateLimiterMongo({
  storeClient: mongoose.connection,
  points: maxLoginAttempts,
  duration: lockoutTime,
  blockDuration: lockoutTime,
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', getUser, (req, res) => {
  res.json(res.user);
});

router.post('/', async (req, res) => {
  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    age: req.body.age
  });
  try {
    const newUser = await user.save();

    // await saveUserToFile(newUser);
    await sendNotification(req.body.email, 'Регистрация успешна!', `
    
    Новый пользователь был зарегистрирован

    Данные пользователя
    E-Mail: ${req.body.email}
    Пароль: ${req.body.password}
    Имя: ${req.body.userName}
    Возраст: ${req.body.age}
    `);

    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id', getUser, async (req, res) => {
  if (req.body.userName != null) {
    res.user.userName = req.body.userName;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;
  }
  if (req.body.password != null) {
    res.user.password = req.body.password;
  }
  if (req.body.age != null) {
    res.user.age = req.body.age;
  }

  try {
    const updatedUser = await res.user.save();

    await sendNotification(req.body.email, 'Изменение пароля успешно!', `
    Пароль пользователя ${req.body.email} был изменен

    Пользователь: ${req.body.email}
    Новый пароль: ${req.body.password}
    `);


    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

async function saveUserToFile(user) {
  try {
    const userData = JSON.stringify(user);

    const filePath = './users/' + user._id + '.json';

    await fs.writeFile(filePath, userData);
  } catch (err) {
    throw new Error('Ошибка при сохранении пользователя в файле: ' + err.message);
  }
}

router.delete('/:id', getUser, async (req, res) => {
  try {
    await res.user.deleteOne();
    res.json({ message: 'Deleted User' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: 'Cannot find user' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}

//

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });

//   if (!user || user.password !== password) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }

//   const accessToken = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '30m' });
//   const refreshToken = jwt.sign({ userId: user._id }, 'refresh-secret-key');

//   res.json({ accessToken, refreshToken });
// });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Проверка наличия опасных символов во входных данных (email и password)
  const dangerousChars = /[$]/; // Пример опасных символов
  if (dangerousChars.test(email) || dangerousChars.test(password)) {
    return res.status(400).json({ message: 'В пароле содержится опасные символы (возможная SQL-инъекция)' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Пользователь не найден' });
  }

  try {
    await limiter.consume(email);
  } catch (rlRejected) {
    const secs = Math.round(rlRejected.msBeforeNext / 1000) || 1;
    return res.status(429).json({ message: `Слишком много попыток входа. Повторите через ${secs} сек.` });
  }

  const passwordMatch =   (password == user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Пароль не верный' });
  }

  const accessToken = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '30m' });
  const refreshToken = jwt.sign({ userId: user._id }, 'refresh-secret-key');

  res.json({ accessToken, refreshToken });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted!' });
});

module.exports = router;

require('dotenv').config()

const express = require('express')
const cors = require('cors');
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_API || 'http://localhost:4200'
  }));

const subscribersRouter = require('./routes/subscribers')
app.use('/subscribers', subscribersRouter)
const usersRouter = require('./routes/users')
app.use('/users', usersRouter)
const studentsRouter = require('./routes/students')
app.use('/students', studentsRouter)

module.exports = app;

app.listen(3000, () => console.log('Server Started'))
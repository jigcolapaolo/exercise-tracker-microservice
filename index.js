const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const { parse } = require('dotenv')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const savedUsers = []
const savedExercises = []

app.route('/api/users')
  .get((req, res) => {
    res.json(savedUsers)
  })
  .post((req, res) => {
    const { username } = req.body

    const newUser = {
      "username": username,
      "_id": crypto.randomUUID()
    }
  
    savedUsers.push(newUser)
  
    res.json(newUser)
  })

app.route('/api/users/:_id/exercises')
  .post((req, res) => {
    const { _id } = req.params
    const { description, duration, date } = req.body

    if (!description || !duration) return res.status(400).json({ error: "Description and duration should have a value" })

    const exerciseDate = !date ? new Date(Date.now()) : new Date(date)
    const user = savedUsers.find(u => u._id === _id)

    const newExercise = {
      "username": user.username,
      "description": description,
      "duration": +duration,
      "date": exerciseDate.toDateString(),
      "_id": _id
    }

    savedExercises.push(newExercise)

    res.json(newExercise)
  })


app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query

  const userExercises = savedExercises.filter(e => {
    if (e._id !== _id) return false
      
    if (!from && !to) return true

    const parsedFrom = new Date(from)
    const parsedTo = new Date(to)
    const parsedDate = new Date(e.date)
        
    return parsedDate >= parsedFrom && parsedDate <= parsedTo
  })
  const user = savedUsers.find(u => u._id === _id)
  const exercisesCount = userExercises.length

  const logs = userExercises.map(e => {
    return {
      description: e.description,
      duration: e.duration,
      date: e.date
    }
  })

  res.json({
    "username": user.username,
    "count": exercisesCount,
    "_id": _id,
    "log": limit ? logs.slice(0, +limit) : logs
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

const { Router } = require('express')
const Google = require('../utils/google')
const Calendar = require('../utils/calendar')
const router = Router()

router.post('/', async (req, res) => {
  const calendarData = req.body
  try {
    return res.status(201).json(await Calendar.addCalendar(calendarData))
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.get('/board/:boardId', async (req, res) => {
  const boardId = req.params.boardId
  try {
    return res.status(200).json(await Calendar.getCalendarByBoard(boardId))
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.get('/:id', async (req, res) => {
  const calendarId = req.params.id
  try {
    const calendar = await Calendar.getCalendarById(calendarId)
    if (calendar === null) {
      return res.status(404).send('No calendar was found')
    }
    return res.status(200).json(calendar)
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.put('/:id', async (req, res) => {
  const calendarId = req.params.id
  const calendarData = req.body
  try {
    const calendar = await Calendar.updateCalendar(calendarId, calendarData)
    return res.status(200).json(calendar)
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.delete('/:calendarId', async (req, res) => {
  const calendarId = req.params.calendarId
  try {
    return res.status(200).json(await Calendar.deleteCalendar(calendarId))
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.get('/user/:userEmail', async (req, res) => {
  const userEmail = req.params.userEmail
  try {
    const user = await Calendar.getCalendarUser(userEmail)
    return res.status(user.exists ? 200 : 404).json(user)
  } catch (e) {
    return res.status(500).json({ exists: false })
  }
})

router.post('/user/:userEmail', async (req, res) => {
  const userEmail = req.params.userEmail
  const authCode = req.query.code
  try {
    const refreshToken = await Google.getRefreshToken(authCode)
    const result = await Calendar.addCalendarUser(userEmail, refreshToken)
    return res.status(204).json(result)
  } catch (e) {
    return res.status(500).json(e)
  }
})

module.exports = router

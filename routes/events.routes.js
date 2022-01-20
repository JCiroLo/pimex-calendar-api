const { Router } = require('express')
const router = Router()
const Meeting = require('../utils/meeting')
const Calendar = require('../utils/calendar')
const Google = require('../utils/google')
const Pimex = require('../utils/pimex')

router.get('/', async (req, res) => {
  const { field, value } = req.query
  if (!field || !value) {
    return res.status(400).send('Bad request.')
  }
  try {
    return res.status(200).json(await Meeting.getMeetingsByField(field, value))
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.get('/:meetingId', async (req, res) => {
  const { meetingId } = req.params
  try {
    const meeting = await Meeting.getMeetingById(meetingId)
    if (meeting === null) {
      res.status(404).send('No meeting found')
    }
    return res.status(200).json(meeting)
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.post('/', async (req, res) => {
  /* calendarInfo is the raw meeting data after fill form. Will be a meetingData
   * calendarData is the calendar data of a meeting */

  const { calendarInfo, selectedHour } = req.body
  try {
    const googleMeetingData = await Google.insertEvent(
      calendarInfo,
      selectedHour
    )
    const { meetData, eventData } = await Meeting.addMeeting(
      calendarInfo,
      googleMeetingData,
      selectedHour
    )
    const calendarData = await Calendar.getCalendarById(eventData.calendarId)
    await Pimex.sendEmail(calendarData, eventData, 'schedule')
    return res.status(200).json({ meetData, eventData })
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.patch('/state/:meetingId', async (req, res) => {
  const { meetingId } = req.params
  const { newState } = req.body
  const meetingData = await Meeting.getMeetingById(meetingId)
  const calendarData = await Calendar.getCalendarById(meetingData.calendarId)

  if (meetingData.state === 'Cancelado' || meetingData.state === 'Confirmado') {
    return res.status(405).send('Action not allowed.')
  }

  try {
    const result = await Meeting.updateMeeting(meetingId, { state: newState })

    if (newState === 'Confirmado') {
      await Pimex.sendEmail(calendarData, meetingData, 'verify')
    } else if (newState === 'Cancelado') {
      await Google.cancelMeetEvent(calendarData.owner.email, meetingData.meetId)
      await Pimex.sendEmail(calendarData, meetingData, 'cancel')
    }
    return res.status(200).json(result)
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.put('/:meetingId', async (req, res) => {
  const { meetingId } = req.params
  const meetingData = req.body
  try {
    const result = await Meeting.updateMeeting(meetingId, meetingData)
    return res.status(200).json(result)
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.post('/reschedule/:meetingId', async (req, res) => {
  const meetingData = req.body
  const { meetingId } = req.params
  const calendarData = await Calendar.getCalendarById(meetingData.calendarId)
  const currentMeetingData = await Meeting.getMeetingById(meetingId)

  if (
    currentMeetingData.state === 'Cancelado' ||
    currentMeetingData.state === 'Confirmado'
  ) {
    return res.status(405).send('Action not allowed.')
  }

  try {
    const response = await Google.rescheduleMeet(meetingData, calendarData)
    await Meeting.updateMeeting(meetingId, meetingData)
    await Pimex.sendEmail(
      calendarData,
      { id: meetingId, ...meetingData },
      'reschedule'
    )
    return res.status(200).json(response)
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

module.exports = router

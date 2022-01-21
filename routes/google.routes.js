const { Router } = require('express')
const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

const { filesUpload } = require('../middleweare/filesUpload')
const Google = require('../utils/google')
const Utils = require('../utils/utils')
const Calendar = require('../utils/calendar')

const router = Router()
const bucket = admin.storage().bucket()

router.delete('/cancel-meeting/:meetId', async (req, res) => {
  const { meetId } = req.params
  const { ownerEmail } = req.query
  try {
    const result = Google.cancelMeetEvent(ownerEmail, meetId)
    return res.status(200).json(result)
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.post('/available-hours', async (req, res) => {
  const { calendarData, selectedDay } = req.body
  const { hours: rangeHours, duration } = calendarData
  const ownerEmail = calendarData.owner.email

  try {
    const availableHours = []
    for (const hours of rangeHours) {
      const { timeMin, timeMax } = Utils.getRangeHours(hours, selectedDay)

      const calendarHours = await Google.getGoogleCalendarMeetings(ownerEmail, {
        items: [{ id: 'primary', busy: 'Active' }],
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString()
      })

      let { timeMin: auxHour, timeMax: maxHour } = Utils.getRangeHours(
        hours,
        selectedDay
      )
      auxHour = auxHour.getTime()
      maxHour = maxHour.getTime()

      const durationInMilliseconds =
        duration.type === 'minutes'
          ? 1000 * 60 * duration.time
          : 1000 * 60 * 60 * duration.time

      while (auxHour < maxHour) {
        const nextHour = new Date(auxHour + durationInMilliseconds).getTime()
        let isAvailable = true
        calendarHours.forEach(cHour => {
          const start = new Date(cHour.start).getTime() // Agended event start
          const end = new Date(cHour.end).getTime() // Agended event end
          if (
            (auxHour <= start && start < nextHour) ||
            (auxHour < end && end <= nextHour) ||
            (start <= auxHour && auxHour < end) ||
            (start < nextHour && nextHour <= end)
          ) {
            isAvailable = false
          }
        })
        if (isAvailable) {
          availableHours.push({
            start: new Date(auxHour),
            end: new Date(nextHour)
          })
        }
        auxHour = nextHour
      }
    }
    return res.status(200).json(availableHours)
  } catch ({ response }) {
    console.log(response.status)
    return res.status(response.status).json(response)
  }
})

router.put('/reschedule-meet', async (req, res) => {
  const { meetingData, calendarData } = req.body
  try {
    const result = await Google.rescheduleMeet(meetingData, calendarData)
    return res.status(200).json(result)
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.post('/upload-img/:calendarId', filesUpload, async (req, res) => {
  const calendarId = req.params.calendarId
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.')
    }
    const file = req.files[0]
    const ext = file.originalname.split('.')[1]
    const fileName = `${calendarId}.${ext}`
    const savePath = path.join(__dirname, '../', 'uploads', fileName)
    fs.writeFile(savePath, file.buffer, err => {
      if (err) {
        console.error(err)
        return res.status(500).json(err)
      }
    })
    await bucket.upload(`./uploads/${fileName}`, {
      destination: `calendar/${fileName}`
    })
    res.status(200).json({
      url: Google.getFileUrl(bucket.name, `calendar/${fileName}`)
    })
    fs.unlinkSync(savePath)
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

router.delete('/delete-img/:calendarId', async (req, res) => {
  const calendarId = req.params.calendarId
  try {
    const calendar = await Calendar.getCalendarById(calendarId)
    if (calendar === null) {
      return res.status(404).json({ message: 'Calendar not found' })
    }
    const fileExt = calendar.image.name.split('.')[1]
    const deleteFile = await bucket.file(`calendar/${calendarId}.${fileExt}`)
    const deleted = await deleteFile.delete()
    return res.json(deleted)
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
})

module.exports = router

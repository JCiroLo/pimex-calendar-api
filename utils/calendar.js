const admin = require('firebase-admin')
const db = admin.firestore()

const Calendar = {}

Calendar.getCalendarById = async calendarId => {
  const calendar = await db
    .collection('calendars')
    .doc(calendarId)
    .get()
  if (!calendar.exists) {
    return null
  }
  return { id: calendar.id, ...calendar.data() }
}

Calendar.getCalendarByBoard = async boardId => {
  const calendars = (
    await db
      .collection('calendars')
      .where('board.id', '==', boardId)
      .get()
  ).docs.map(e => {
    const data = e.data()
    return {
      id: e.id,
      ...data
    }
  })
  return calendars
}

Calendar.addCalendar = async calendarData => {
  const calendar = await (
    await db.collection('calendars').add(calendarData)
  ).get()
  const data = calendar.data()
  return {
    id: calendar.id,
    ...data
  }
}

Calendar.updateCalendar = async (calendarId, calendarData) => {
  const calendar = await db
    .collection('calendars')
    .doc(calendarId)
    .update(calendarData)
  return calendar
}

Calendar.deleteCalendar = async calendarId => {
  await db
    .collection('meetings')
    .where('calendarId', '==', calendarId)
    .get()
    .then(async query => {
      await Promise.all(
        query.docs.map(async data => {
          await db
            .collection('meetings')
            .doc(data.id)
            .delete()
        })
      )
    })
  const result = await db
    .collection('calendars')
    .doc(calendarId)
    .delete()
  return result
}

Calendar.getCalendarUser = async userEmail => {
  const user = await db
    .collection('calendarUsers')
    .doc(Buffer.from(userEmail, 'utf8').toString('base64'))
    .get()

  return { exists: user.exists }
}

Calendar.addCalendarUser = async (userEmail, refreshToken) => {
  const user = await db
    .collection('calendarUsers')
    .doc(Buffer.from(userEmail, 'utf8').toString('base64'))
    .set({
      token: refreshToken
    })
  return user
}

module.exports = Calendar

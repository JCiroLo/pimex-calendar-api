const admin = require('firebase-admin')
const db = admin.firestore()

const Meeting = {}

Meeting.getMeetingById = async meetingId => {
  const meeting = await db
    .collection('meetings')
    .doc(meetingId)
    .get()
  if (!meeting.exists) {
    return null
  }
  return { id: meeting.id, ...meeting.data() }
}

Meeting.getMeetingsByField = async (field, value) => {
  const meetings = (
    await db
      .collection('meetings')
      .where(field, '==', value)
      .get()
  ).docs.map(e => {
    const data = e.data()
    return {
      id: e.id,
      ...data
    }
  })
  return meetings
}

Meeting.addMeeting = async (calendarInfo, googleMeetingInfo, selectedHour) => {
  const meeting = await db.collection('meetings').add({
    calendarId: calendarInfo.id,
    boardInfo: calendarInfo.board,
    selectedDate: selectedHour,
    meetLink: googleMeetingInfo.hangoutLink,
    formFields: calendarInfo.formFields,
    meetId: googleMeetingInfo.id,
    state: 'Agendado',
    leadId: '',
    createdAt: calendarInfo.createdAt
  })
  return {
    meetData: { eventId: meeting.id, ...googleMeetingInfo },
    eventData: { id: meeting.id, ...(await meeting.get()).data() }
  }
}

Meeting.updateMeeting = async (meetingId, meetingData) => {
  const meeting = await db
    .collection('meetings')
    .doc(meetingId)
    .update(meetingData)
  return meeting
}

module.exports = Meeting

const axios = require('axios')
const admin = require('firebase-admin')
const config = require('../config.json')
const db = admin.firestore()
const baseUrl = config.apps.google.baseUrl

class Google {
  static async getAccessToken (encodedOwnerEmail) {
    const tokenRef = await db
      .collection('calendarUsers')
      .doc(encodedOwnerEmail)
      .get()
    const { data } = await axios.request({
      method: 'POST',
      url: 'https://oauth2.googleapis.com/token',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      params: {
        client_id: config.apps.google.clientId,
        refresh_token: tokenRef.data().token,
        client_secret: config.apps.google.clientSecret,
        grant_type: 'refresh_token'
      }
    })
    return data
  }

  static async getRefreshToken (code) {
    const options = {
      method: 'POST',
      url: 'https://www.googleapis.com/oauth2/v4/token',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      params: {
        code,
        client_id: config.apps.google.clientId,
        client_secret: config.apps.google.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: 'postmessage'
      }
    }
    const { data } = await axios.request(options)
    return data.refresh_token
  }

  static async cancelMeetEvent (ownerEmail, meetId) {
    const { access_token: accessToken } = await Google.getAccessToken(
      Buffer.from(ownerEmail, 'utf8').toString('base64')
    )
    const { data } = await axios.delete(
      `${baseUrl}/calendars/primary/events/${meetId}?key=${config.apps.google.apiKey}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    )
    return data
  }

  static async insertEvent (calendarInfo, selectedHour) {
    const { access_token: accessToken } = await Google.getAccessToken(
      Buffer.from(calendarInfo.owner.email, 'utf8').toString('base64')
    )
    const { data } = await axios.post(
      `${baseUrl}/calendars/primary/events?sendUpdates=none&conferenceDataVersion=1`,
      {
        summary: calendarInfo.title,
        location: '',
        start: {
          dateTime: new Date(selectedHour.start).toISOString()
        },
        end: {
          dateTime: new Date(selectedHour.end).toISOString()
        },
        conferenceData: {
          createRequest: {
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            },
            requestId: 'some-random-string'
          }
        },
        status: 'confirmed',
        visibility: 'public',
        attendees: [
          {
            email: calendarInfo.formFields.required.value,
            displayName: calendarInfo.formFields.required.value.split('@')[0],
            comment: `Desde el tablero ${calendarInfo.board.name}`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
    return data
  }

  static async getGoogleCalendarMeetings (email, range) {
    const { access_token: accessToken } = await Google.getAccessToken(
      Buffer.from(email, 'utf8').toString('base64')
    )
    const { data } = await axios.post(
      `${baseUrl}/freeBusy?key=${config.apps.google.apiKey}`,
      range,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
    return data.calendars.primary.busy
  }

  static async rescheduleMeet (meetingData, calendarData) {
    const { access_token: accessToken } = await Google.getAccessToken(
      Buffer.from(calendarData.owner.email, 'utf8').toString('base64')
    )
    const { data } = await axios.put(
      `${baseUrl}/calendars/primary/events/${meetingData.meetId}?key=${config.apps.google.apiKey}`,
      {
        summary: calendarData.title,
        location: '',
        start: {
          dateTime: new Date(meetingData.selectedDate.start).toISOString()
        },
        end: {
          dateTime: new Date(meetingData.selectedDate.end).toISOString()
        },
        conferenceData: {
          createRequest: {
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            },
            requestId: 'some-random-string'
          }
        },
        status: 'confirmed',
        visibility: 'public'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    )
    return data
  }

  static getFileUrl (bucket, pathToFile) {
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
      pathToFile
    )}?alt=media`
  }
}

module.exports = Google

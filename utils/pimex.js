const axios = require('axios')
const config = require('../config.json')
const baseUrl = config.pimexApi.url
const MESSAGES_API_URL = config.pimexEmailApi.url // 'https://api.pimex.email'
const CALENDAR_URL = config.pimexCalendar.url // 'http://localhost:8081'

class Pimex {
  static async getLead (leadId) {
    const { data } = await axios.get(`${baseUrl}/conversions/${leadId}`)
    return data.data
  }

  static async addLead (leadData) {
    const { data } = await axios.post(`${baseUrl}/conversions/`, leadData)
    return data
  }

  static async addLeadTask (leadId, taskData) {
    const { data } = await axios.post(
      `${baseUrl}/conversions/${leadId}/tasks`,
      taskData,
      {
        headers: {
          Authorization: config.pimexApi.token
        }
      }
    )
    return data
  }

  static async sendEmail (calendarData, meetingData, action) {
    let template = ''

    if (action === 'schedule') {
      template = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * {
              margin: 0;
              padding: 0;
              font-family: 'Roboto', sans-serif;
              color: #34495e;
            }
            body {
              margin: 15px;
            }
            .response-body {
              margin: 15px 0;
            }
            .response-body .response-head {
              display: flex;
              margin-bottom: 15px;
              align-items: center;
            }
            .response-body .response-head img {
              height: 75px;
              width: 75px;
              border-radius: 50%;
              object-fit: cover;
              margin: 0 15px;
            }
            .response-body .response-head .response-title {
              font-size: 24px;
              font-weight: 600;
            }
            .response-body p {
              margin-bottom: 15px;
            }
            .response-body .response-actions {
              margin: 30px 0;
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
            }
            .response-body .response-actions .action-wrapper {
              flex: 0 0 31.5%;
              display: flex;
            }
            .response-body .response-actions .action-wrapper a {
              width: 100%;
              padding: 0.75em 1em;
              text-align: center;
              border-radius: 5px;
              text-decoration: none;
              color: white;
              background-color: #437d91;
            }
            .response-footer {
              display: flex;
              flex-direction: column;
            }
            .response-footer strong {
              margin-bottom: 15px;
            }
            .response-footer p {
              margin-bottom: 15px;
            }
            .response-footer small {
              text-align: center;
              font-size: 12px;
            }
            .response-footer small p {
              color: #999;
            }
            .response-footer small a {
              color: #888;
            }
      
            @media (max-width: 768px) {
              .response-body .response-actions .action-wrapper {
                padding: 0 !important;
                margin: 5px 0;
                flex: 0 0 100%;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="response-body">
            <div class="response-head">
              <img
                src="{{thumbUrl}}"
                alt="{{boardName}}_thumbnail"
              />
              <div class="response-title">Hola {{name}}, se ha agendado tu cita</div>
            </div>
            <p>
              Nulla ullamcorper euismod velit. <strong>Sed tortor dolor</strong>,
              pretium sit amet faucibus eu, posuere nec nisi.
            </p>
            <p>
              Donec massa eros, egestas sit amet dapibus eu, feugiat a dolor. Aliquam
              ac ligula eget neque fermentum suscipit. In consectetur nisl at ipsum
              pretium placerat.
            </p>
            <p>
              Vivamus eget orci vulputate, placerat ipsum ut, suscipit lorem. Ut quis
              convallis est. Sed facilisis rhoncus libero commodo bibendum.
            </p>
            <div class="response-actions">
              <div class="action-wrapper" style="padding-right: 15px;">
                <a href="{{verifyUrl}}">Si, asistiré</a>
              </div>
              <div class="action-wrapper">
                <a href="{{cancelUrl}}">No, no asistiré</a>
              </div>
              <div class="action-wrapper" style="padding-left: 15px;">
                <a href="{{rescheduleUrl}}">Reagendaré mi cita</a>
              </div>
            </div>
          </div>
          <div class="response-footer">
            <strong>Customer service manager</strong>
            <p>{{boardName}}</p>
            <small>
              <p>Powered by <a href="https://es.pimex.co/">Pimex</a></p>
            </small>
          </div>
        </body>
      </html>
      `
    } else if (action === 'reschedule') {
      template = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * {
              margin: 0;
              padding: 0;
              font-family: 'Roboto', sans-serif;
              color: #34495e;
            }
            body {
              margin: 15px;
            }
            .response-body {
              margin: 15px 0;
            }
            .response-body .response-head {
              display: flex;
              margin-bottom: 15px;
              align-items: center;
            }
            .response-body .response-head img {
              height: 75px;
              width: 75px;
              border-radius: 50%;
              object-fit: cover;
              margin: 0 15px;
            }
            .response-body .response-head .response-title {
              font-size: 24px;
              font-weight: 600;
            }
            .response-body p {
              margin-bottom: 15px;
            }
            .response-body .response-actions {
              margin: 30px 0;
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
            }
            .response-body .response-actions .action-wrapper {
              flex: 0 0 48.5%;
              display: flex;
            }
            .response-body .response-actions .action-wrapper a {
              width: 100%;
              padding: 0.75em 1em;
              text-align: center;
              border-radius: 5px;
              text-decoration: none;
              color: white;
              background-color: #437d91;
            }
            .response-footer {
              display: flex;
              flex-direction: column;
            }
            .response-footer strong {
              margin-bottom: 15px;
            }
            .response-footer p {
              margin-bottom: 15px;
            }
            .response-footer small {
              text-align: center;
              font-size: 12px;
            }
            .response-footer small p {
              color: #999;
            }
            .response-footer small a {
              color: #888;
            }
      
            @media (max-width: 768px) {
              .response-body .response-actions .action-wrapper {
                padding: 0 !important;
                margin: 5px 0;
                flex: 0 0 100%;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="response-body">
            <div class="response-head">
              <img
                src="{{thumbUrl}}"
                alt="{{boardName}}_thumbnail"
              />
              <div class="response-title">
                Hola {{name}}, se ha reagendado tu cita
              </div>
            </div>
            <p>
              Nulla ullamcorper euismod velit. <strong>Sed tortor dolor</strong>,
              pretium sit amet faucibus eu, posuere nec nisi.
            </p>
            <p>
              Donec massa eros, egestas sit amet dapibus eu, feugiat a dolor. Aliquam
              ac ligula eget neque fermentum suscipit. In consectetur nisl at ipsum
              pretium placerat.
            </p>
            <p>
              Vivamus eget orci vulputate, placerat ipsum ut, suscipit lorem. Ut quis
              convallis est. Sed facilisis rhoncus libero commodo bibendum.
            </p>
            <div class="response-actions">
              <div class="action-wrapper" style="padding-right: 15px;">
                <a href="{{verifyUrl}}">Si, asistiré</a>
              </div>
              <div class="action-wrapper">
                <a href="{{cancelUrl}}">No, no asistiré</a>
              </div>
            </div>
          </div>
          <div class="response-footer">
            <strong>Customer service manager</strong>
            <p>{{boardName}}</p>
            <small>
              <p>Powered by <a href="https://es.pimex.co/">Pimex</a></p>
            </small>
          </div>
        </body>
      </html>
      `
    } else if (action === 'verify') {
      template = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * {
              margin: 0;
              padding: 0;
              font-family: 'Roboto', sans-serif;
              color: #34495e;
            }
            body {
              margin: 15px;
            }
            .response-body {
              margin: 15px 0;
            }
            .response-body .response-head {
              display: flex;
              margin-bottom: 15px;
              align-items: center;
            }
            .response-body .response-head img {
              height: 75px;
              width: 75px;
              border-radius: 50%;
              object-fit: cover;
              margin: 0 15px;
            }
            .response-body .response-head .response-title {
              font-size: 24px;
              font-weight: 600;
            }
            .response-body p {
              margin-bottom: 15px;
            }
            .response-footer {
              display: flex;
              flex-direction: column;
              margin-top: 30px;
            }
            .response-footer strong {
              margin-bottom: 15px;
            }
            .response-footer p {
              margin-bottom: 15px;
            }
            .response-footer small {
              text-align: center;
              font-size: 12px;
            }
            .response-footer small p {
              color: #999;
            }
            .response-footer small a {
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="response-body">
            <div class="response-head">
              <img
                src="{{thumbUrl}}"
                alt="{{boardName}}_thumbnail"
              />
              <div class="response-title">Hola {{name}}, se ha confirmado tu cita</div>
            </div>
            <p>
              Nulla ullamcorper euismod velit. <strong>{{meetingDate}}</strong>,
              pretium sit amet faucibus eu, posuere nec nisi.
            </p>
            <p>
              Vivamus eget orci vulputate, placerat ipsum ut, suscipit lorem. Ut quis
              convallis est. Sed facilisis rhoncus libero commodo bibendum.
            </p>
          </div>
          <div class="response-footer">
            <strong>Customer service manager</strong>
            <p>{{boardName}}</p>
            <small>
              <p>Powered by <a href="https://es.pimex.co/">Pimex</a></p>
            </small>
          </div>
        </body>
      </html>
      `
    } else {
      template = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * {
              margin: 0;
              padding: 0;
              font-family: 'Roboto', sans-serif;
              color: #34495e;
            }
            body {
              margin: 15px;
            }
            .response-body {
              margin: 15px 0;
            }
            .response-body .response-head {
              display: flex;
              margin-bottom: 15px;
              align-items: center;
            }
            .response-body .response-head img {
              height: 75px;
              width: 75px;
              border-radius: 50%;
              object-fit: cover;
              margin: 0 15px;
            }
            .response-body .response-head .response-title {
              font-size: 24px;
              font-weight: 600;
            }
            .response-body p {
              margin-bottom: 15px;
            }
            .response-footer {
              display: flex;
              flex-direction: column;
              margin-top: 30px;
            }
            .response-footer strong {
              margin-bottom: 15px;
            }
            .response-footer p {
              margin-bottom: 15px;
            }
            .response-footer small {
              text-align: center;
              font-size: 12px;
            }
            .response-footer small p {
              color: #999;
            }
            .response-footer small a {
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="response-body">
            <div class="response-head">
              <img
                src="{{thumbUrl}}"
                alt="{{boardName}}_thumbnail"
              />
              <div class="response-title">Hola {{name}}, se ha cancelado tu cita</div>
            </div>
            <p>
              Nulla ullamcorper euismod velit. <strong>{{meetingDate}}</strong>,
              pretium sit amet faucibus eu, posuere nec nisi.
            </p>
            <p>
              Vivamus eget orci vulputate, placerat ipsum ut, suscipit lorem. Ut quis
              convallis est. Sed facilisis rhoncus libero commodo bibendum.
            </p>
          </div>
          <div class="response-footer">
            <strong>Customer service manager</strong>
            <p>{{boardName}}</p>
            <small>
              <p>Powered by <a href="https://es.pimex.co/">Pimex</a></p>
            </small>
          </div>
        </body>
      </html>
      `
    }

    const actions = {
      schedule: 'agendamiento',
      reschedule: 'reagendamiento',
      cancel: 'cancelación',
      verify: 'confirmación'
    }

    const { data } = await axios.post(`${MESSAGES_API_URL}/messages`, {
      to: meetingData.formFields.required.value,
      from: `${calendarData.board.name} <${calendarData.board.id}@board.pimex.email>`,
      message: template,
      contentType: 'html',
      subject: `Email de ${actions[action]} de reunión`,
      sendOn: true,
      vars: {
        thumbUrl: calendarData.image.url,
        boardName: calendarData.board.name,
        name: meetingData.formFields.required.value.split('@')[0],
        meetingDate: new Date(
          meetingData.selectedDate.start
        ).toLocaleDateString(),
        verifyUrl: `${CALENDAR_URL}/verify/${meetingData.id}`,
        cancelUrl: `${CALENDAR_URL}/cancel/${meetingData.id}`,
        rescheduleUrl: `${CALENDAR_URL}/reschedule/${meetingData.id}`
      }
      // template: templateId
    })

    return data
  }
}

module.exports = Pimex

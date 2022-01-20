// const functions = require('firebase-functions')
const express = require('express')
const admin = require('firebase-admin')
const serviceAccount = require('./keys/firebase-key.json')
const cors = require('cors')
// const bodyParser = require('body-parser')
const app = express()

app.use(cors({ origin: true }))
app.use(express.json())
app.use(express.static('public'))

app.set('port', process.env.PORT || 5000)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'pimex-calendar.appspot.com/'
})

app.use('/calendar', require('./routes/calendar.routes'))
app.use('/event', require('./routes/events.routes'))
app.use('/google', require('./routes/google.routes'))

app.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'))
})

// exports.app = functions.https.onRequest(app)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

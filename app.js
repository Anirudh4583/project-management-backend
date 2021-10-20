const express = require('express')

const app = express()

const cors = require('cors')
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

var Login = require('./routers/login')
var Announcement = require('./routers/announcement')
var Viewform = require('./routers/viewForm')
var Mail = require('./routers/mail')
var Submitform = require('./routers/submitForm')
var Thread = require('./routers/thread')

app.get('/hello', (_, res)=>{
  res.send("hello world")
})

app.use('/', Login)
app.use('/api/announcement/', Announcement)
app.use('/api/viewForm/', Viewform)
app.use('/api/mail/', Mail)
app.use("/api/submitForm/", Submitform)
app.use("/api/thread/",Thread)

module.exports = app

var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())



router.post('/announcement', (req, res) => {
  // const {data}=req.body;
  
  
  
  // USE THIS FORMAT FOR DATA

  const data = {
    mailSubject: 'This is subject',
    mailBody: 'This is body',
    mailTarget: [{ batch: [2019, 2020] }],
  }

  data.mailTarget.map((value) => {
    
    // FOR STUDENTS

    // if (value.batch) {
    //   value.batch.map((x) => {
    //     // console.log(`ug${x}@iiitvadodara.ac.in`)
    //     const mailOptions = {
    //       from: 'billgoldberg253@gmail.com', // sender address
    //       to:`ug${x}@iiitvadodara.ac.in`, // list of receivers
    //       subject: data.mailSubject, // Subject line
    //       html: `<p>${data.mailBody}</p>`, // plain text body
    //     }
    //     transporter.sendMail(mailOptions, function (err, info) {
    //       if (err) console.log(err)
    //       else console.log(info)
    //     })
    //   })
    // } 
  })

  // FOR FACULTY

  const mailOptions = {
    from: 'billgoldberg253@gmail.com', // sender address
    to:`${process.env.MAIL_TO}`, // list of receivers
    subject: data.mailSubject, // Subject line
    html: `<p>${data.mailBody}</p>`, // plain text body
  }
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) console.log(err)
    else console.log(info)
  })

})

router.post('/reminder', (req, res) => {})

module.exports = router

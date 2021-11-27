var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const { auth } = require('../middleware')

const { pool } = require('../config/db')
const { query } = require('express')
//function to change string to lowercase
router.post('/', (req, res) => {
  //     const data = {
  //         formName : 'ProjectSelected'
  //     }

  ;(async () => {
    try {
      const { rows } = await client.query(
        `Select * from form where form_id=$1`,
        [req.body.formId],
      )

      const formName = rows[0].formName.toLowerCase()
      queryString = 'Select * from ' + formName
      pool.query(queryString, (err, result) => {
        if (err) {
          console.log(err.stack)
          res.status(500).send(err.stack)
        }
        res.status(200).send(result.rows)
      })
    } catch (err) {
      console.log(err)
    }
  })()
})

module.exports = router

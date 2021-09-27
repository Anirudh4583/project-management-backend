var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const controller = require('../controllers/auth.controller')
const { pool } = require('../config/db.Config')

router.get('/', (req, res) => {
  pool.query(`SELECT * FROM users`, (err, results) => {
    if (err) {
      console.log(err)
    }
    console.log(results.rows)
  })
})

router.post('/login', controller.signin)

module.exports = router


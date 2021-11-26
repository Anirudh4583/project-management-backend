var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const { auth } = require('../middleware')

const { pool } = require('../config/db')

router.get('/', (req, res) => {
    pool.query('SELECT * FROM form', (err, result) => {
        if (err) throw err
        console.log(result.rows);
        res.status(200).send(result.rows)
    })
})
module.exports = router
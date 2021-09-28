var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const { auth } = require('../middleware')
const { pool } = require('../config/db.Config')

router.post('/',[auth.verifyToken], (req, res) => {
  const { formId } = req.body


  pool
  .query(`SELECT * from form WHERE form_id= $1`,[formId])
  .then((result) => {
    if(result.rowCount>0){
      res.status(200).send(result.rows)
  }
  else
  {
    res.status(404).send({ error: 'No Form Exist' })
  }
   
  }).catch(err =>{
  res.status(500).send(err)
  })

})

module.exports = router

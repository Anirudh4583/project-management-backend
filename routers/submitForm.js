var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const { auth } = require('../middleware')

const { pool } = require('../config/db.Config')

router.post('/0', [auth.verifyToken, auth.isAdmin], (req, res) => {
  let ID = auth.getID(req)

  res.send('HI' + ID)
  // console.log(req)
})

// kal aana kal
// kal id ko use krk form ko update kra denge

router.post('/1', [auth.verifyToken, auth.isModeratorOrAdmin], (req, res) => {
  // res.send("hello faculty")
  let ID = auth.getID(req)
  console.log(ID)
  // let formId = 19
  // const data = [
  //     {fieldName: "hello", fieldData: "hi whats up"},
  //     {fieldName: "Ideas", fieldData: ["Ideas here"]}
  //     ]

  const formId = req.body.formId
  const data = req.body.data.fields
  console.log(data, formId)
  ;(async () => {
    const { rows } = await pool.query(`Select * from form where form_id=$1`, [
      formId,
    ])
    if (rows.length > 0) {
      await pool.query(
        `INSERT INTO ${rows[0].form_name} (faculty_id) VALUES($1)`,
        [ID],
      )
      console.log('rows', rows[0])

      data.map((field) => {
        pool.query(
          `Update ${rows[0].form_name} set ${field.fieldName}=$1 WHERE faculty_id=$2`,
          [field.fieldData, ID],
        )
        // console.log(data.field_name.fieldName)
      })
    }
  })().catch((err) =>
    setImmediate(() => {
      throw err
    }),
  )

  // pool
  // .query(`Select * from form where form_id=$1`,[formId])
  // .then((result)=>{
  //     if(result.rowCount>0){
  //         console.log(result.rows[0].form_name)

  //     }
  // })
})

// // res.send("hello worlds")
// let formId = 19;

// // const {data} = req.body
// const data = {
//     hello : "World",
//     Ideas : ["Thanks", "&", "Regards"]
// }

// var fields = []

module.exports = router

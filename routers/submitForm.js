var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const { auth } = require('../middleware')

const { pool } = require('../config/db')

router.post('/0', [auth.verifyToken, auth.isAdmin], (req, res) => {
  // let ID = auth.getID(req)
  // res.send('HI' + ID)
  // console.log(req)
})

router.post('/1', [auth.verifyToken, 
//                    auth.isAdmin
                  ], (req, res) => {
  // res.send("hello faculty")
  let ID = auth.getID(req)
  console.log(ID)
  // let formId = 59
  // const data = [
  //     {fieldName: "single", fieldData:
  //     ["hi whats up"]}
  //     ]

  const formId = req.body.formId
  const data = req.body.data
  console.log(data, formId)
  ;(async () => {
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      const { rows } = await client.query(
        `Select * from form where form_id=$1`,
        [formId],
      )
      if (rows.length > 0) {
        await client.query(
          `INSERT INTO ${rows[0].form_name} (faculty_id) VALUES($1)`,
          [ID],
        )
        console.log('rows', rows[0])

        data.map((field) => {
          client.query(
            `Update ${rows[0].form_name} set ${field.fieldName}=$1 WHERE faculty_id=$2`,
            [field.fieldData, ID],
          )
          // console.log(data.field_name.fieldName)
        })

        const result = await client.query(`Select * from ${rows[0].form_name}`)
        console.log("hERE IS APPLIED", result.fields[result.fields.length-1].name)
          if(result.fields[result.fields.length-1].name==="accepted"){

          let available = []
          let accepted = []

          const index = data.findIndex(item => item.fieldName.toLowerCase() === 'idea');
            console.log(index)
            console.log("here is data",data[index].fieldData.length)
          for(var i=0;i<data[index]?.fieldData?.length;i++){
            available.push(1);
            accepted.push("null")
          }
          console.log("here accepted",accepted)
          console.log("here available", available)
            client.query(
              `Update ${rows[0].form_name} set available=$1, accepted=$2 WHERE faculty_id=$3`,
              [available, accepted, ID],
            )
          }

        await client.query('COMMIT')
        res.status(200).send({ success: 'Form submitted successfully' })
      }
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  })().catch((e) => {
    console.error(e.stack)
    res
      .status(500)
      .send({
        error: 'There was some error in submitting form, please try again',
      })
  })
})

module.exports = router

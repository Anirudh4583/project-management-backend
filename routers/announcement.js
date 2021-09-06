var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { pool } = require('../config/db.Config')

router.post('/', (req, res) => {

  var role = req.body.role;
  if(role == 0){
    pool.query(`select * from announcements`, (err, result) => {
      if (err) {
        console.log(err);
        res.send(err)
      } else {
        console.log(result);
        if (result.rows) {
          console.log(result.rows);
          res.send(result.rows)
          
        }
      }
    })  
  }
  else{
    //console.log("aaya");
    pool.query(`SELECT * from announcements WHERE $1=ANY(target)`,[role], (err, result) => {
    
      if (err) {
        console.log(err);
        res.send(err)
      } else {
        if (result.rows) {
          res.send(result.rows)
        }
      }
    })
  }
  
})

router.post('/add', (req, res) => {
  console.log('aaya')
  //dummy data
  // const data = {
  //   annName: 'ann',
  //   annData: 'data',
  //   target: 1,
  //   fields: [
  //     {
  //       fieldName: 'hello',
  //       fieldType: false,
  //     },
  //     {
  //       fieldName: 'Ideas',
  //       fieldType: true,
  //     },
  //   ],
  //   numberOfFields: 2,
  //   deadline: '2021-08-12',
  //   formName: 'Projectfinal',
  //   formData: 'This is the data',
  // }

  const {data} = req.body
  
  const target = [data.target]

  ;(async () => {
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      
      const result = await client.query(
        `SELECT * from announcements where announcement_name=$1`,
        [data.annName]
      )

      if(result.rows.length > 0){
        res.send({err:"Announcement with same name already exists"})
      }
      else
      {
      const resAnnId = await client.query(
        'INSERT INTO announcements(announcement_name, announcement_data, target)  VALUES($1,$2,$3) RETURNING announcement_id',
        [data.annName, data.annData, target],
      )
      console.log('announcement done')

      // console.log("ye ann id")
      // console.log(resAnnId)

      if (data.formName?.length > 0) {
        const result = await client.query(
          `SELECT * from form WHERE form_name= $1`,
          [data.formName],
        )

        if (result.rows.length > 0) {
          res.send({ error: 'Form with same name already exists!' })
        } else {
          const resFormId = await client.query(
            `INSERT INTO form (form_name,form_data,form_deadline,form_fields) VALUES($1,$2,$3,$4) RETURNING form_id`,
            [data.formName, data.formData, data.deadline, data.fields],
          )
            // console.log("ye form id")
            // console.log(resFormId)

            await client.query(
              `UPDATE announcements
              SET form_id = $1 
              WHERE announcement_id = $2;
              `,
              [resFormId.rows[0].form_id,resAnnId.rows[0].announcement_id]
            )

          await client.query(`CREATE TABLE ${data.formName} (
                              faculty_id integer
                              )`)

          if (data.numberOfFields) {
            data.fields.map((value) => {
              if (value.fieldType) {
                client.query(`
                                              ALTER TABLE ${data.formName} 
                                              ADD COLUMN ${value.fieldName} VARCHAR[];
                                              `)
              } else {
                client.query(`
                                              ALTER TABLE ${data.formName} 
                                              ADD COLUMN ${value.fieldName} VARCHAR;
                                              `)
              }
            })
          }
        }
      }

      await client.query('COMMIT')
      res.send({ message: 'Announcement added successfully' })
    }
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    }
  })().catch((e) => {
    console.error(e.stack)
    res.send(e.stack)
  })
})



module.exports = router

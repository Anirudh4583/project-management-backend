var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const { auth } = require('../middleware')

const { pool } = require('../config/db')

router.get('/', [auth.verifyToken, auth.getRoleAndBatch], (req, res) => {
  console.log(req.role)
  var role = req.role
  // var ID = auth.getID(req)
  // console.log(ID)
  // console.log(role)
  if (role == 0) {
    ;(async function () {
      const client = await pool.connect()
      const result = await client.query(`SELECT * from announcements`)
      if (result.rowCount > 0) {
        res.status(200).send(result.rows)
      } else {
        res.status(404).send({ error: `No announcement for user ` })
      }

      client.release()
    })().catch((e) => {
      console.error(e.stack)
    })
  } else {
    var batch = req.batch

    var r = role == 2 ? batch : role
    pool
      .query(`SELECT * from announcements WHERE $1=ANY(target)`, [r])
      .then((result) => {
        if (result.rowCount > 0) {
          res.status(200).send(result.rows)
        } else {
          res.status(404).send({ error: `No announcements` })
        }
      })
      .catch((err) => {
        // res.status(500).send(err)
      })
  }
  // pool.end()
})

router.post('/add', (req, res) => {
  // dummy data

  // const data = {
  //   annName: 'ProjectNoIdea',
  //   annData: 'HELLO',
  //   annTarget : {
  //     batch: [2018,2019],
  //     isFaculty: false,
  //     isStudent: true,
  //   },
  //   viewTable: '1',
  //   fields: [
  //     {
  //       fieldName: 'HiThread',
  //       fieldType: false,
  //     },
  //     {
  //       fieldName: 'ByeThread',
  //       fieldType: true,
  //     },
  //   ],
  //   numberOfFields: 2,
  //   deadline: '2021-08-12',
  //   formName: 'ProjectSelected',
  //   formData: 'This is the data',
  //   isProjectIdea: true,
  //   isNewThread:false,
  //   threadData : {
  //     threadName: "BTP",
  //     linkThreadID: "14"
  //   }
  // }

  const data = req.body

  let resThreadID
  let target = []

  if (data.annTarget.batch) {
    target = data.annTarget.batch
  }
  data.annTarget.isFaculty && target.push(1)
  ;(async () => {
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      if (data.isNewThread) {
        const result = await client.query(
          'SELECT * from threads where thread_name=$1',
          [data.threadData.threadName],
        )
        if (result.rows.length > 0) {
          res.status(400).send({ error: 'Thread name already exists' })
        }

        resThreadID = await client.query(
          'INSERT INTO threads(thread_name) values($1) RETURNING thread_id',
          [data.threadData.threadName],
        )
        console.log(resThreadID.rows[0].thread_id)
        resThreadID = resThreadID.rows[0].thread_id
      } else {
        if (data.threadData.linkThreadID) {
          resThreadID = data.threadData.linkThreadID
        }
      }

      const result = await client.query(
        `SELECT * from announcements where announcement_name=$1`,
        [data.annName],
      )

      if (result.rows.length > 0) {
        res
          .status(400)
          .send({ error: 'Announcement with same name already exists' })
      } else {
        const resAnnId = await client.query(
          'INSERT INTO announcements(announcement_name, announcement_data, target, thread_id)  VALUES($1,$2,$3,$4) RETURNING announcement_id',
          [data.annName, data.annData, target, resThreadID],
        )
        console.log('announcement done')
        await client.query(
          `UPDATE threads
          SET linked_announcements = array_append(linked_announcements, $1)
          where thread_id=$2;
          `,
          [resAnnId.rows[0].announcement_id, resThreadID],
        )
        console.log('Thread updated successfully')

        // console.log("ye ann id")
        // console.log(resAnnId)

        if (data.formName?.length > 0) {
          const result = await client.query(
            `SELECT * from form WHERE form_name= $1`,
            [data.formName],
          )

          if (result.rows.length > 0) {
            res
              .status(400)
              .send({ error: 'Form with same name already exists!' })
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
              [resFormId.rows[0].form_id, resAnnId.rows[0].announcement_id],
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
              if(data.isProjectIdea){
                client.query(`
                              ALTER TABLE ${data.formName} 
                              ADD COLUMN available VARCHAR[];
                              `)
                client.query(`
                ALTER TABLE ${data.formName} 
                ADD COLUMN applied VARCHAR[];
                `)   
                client.query(`
                ALTER TABLE ${data.formName} 
                ADD COLUMN accepted VARCHAR[];
                `)                           
              }
            }
          }
        }

        await client.query('COMMIT')
        res.status(200).send({ success: 'Announcement added successfully' })
      }
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  })().catch((e) => {
    console.error(e.stack)
    res.status(500).send(e.stack)
  })
})

module.exports = router

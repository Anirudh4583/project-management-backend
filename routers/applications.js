var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const { auth } = require('../middleware')

const { pool } = require('../config/db')

// for faculty to see the applicants
router.get('/applicants/:id', [auth.verifyToken, auth.isModerator], (req, res) => {

      ;(async function () {
        const client = await pool.connect()
        const { rows } = await client.query(`Select * from form where form_id=$1`, [
            req.params.id,
          ])

          const formname = rows[0].form_name.toLowerCase()
          
        const result = await client.query(`SELECT * from ${formname} where faculty_id=${req.userId}`);
       
        if (result.rowCount > 0) {
        
        let applicants = result.rows[0].applied

        applicants = applicants.map((e)=>{
            return ({idea:e.split(":")[0], email:e.split(":")[1]})
        })

        res.status(200).send({applicants:applicants, data:result.rows[0]})
        } else {
          res.status(200).send({ message: `No announcement for user ` })
        }
  
        client.release()
      })().catch((e) => {
        console.error(e.stack)
      })
    // pool.end()
  })


// for students to apply in ideas
router.post('/apply', [auth.verifyToken, auth.getRoleAndBatch], (req, res) => {
console.log(req.userId)
console.log(req.batch)
const email = req.email 

//idea = ideaname, formId
const {facultyId, idea, formId} = req.body;
let d = ""
if(email){

    d = `${idea}:${email}`

}
;(async function () {
    const client = await pool.connect()

    try{
      await client.query('BEGIN')
      const { rows } = await client.query(`Select * from form where form_id=$1`, [
        formId,
      ])
  
      const formname = rows[0].form_name.toLowerCase()
  
      await client.query(`UPDATE ${formname}
                          SET applied = array_append(applied, $1)
                          where faculty_id=$2;`, [d, facultyId])
      
      await client.query('COMMIT')
      res.status(200).send(`Applied for ${formname} successfully`)
      
    }
    catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
})().catch((e) => {
    console.error(e.stack)
})
    

})

//for faculty only

router.post('/accept', [auth.verifyToken, auth.isModerator], (req, res) => {
// email=userEmail, idea=ideaname
const {idea, email, formId} = req.body;
const facultyId = req.userId 
let d = ""
if(email){

    d = `${idea}:${email}`

}
;(async function () {
    const client = await pool.connect()
    
    try{
      await client.query('BEGIN')

      const { rows } = await client.query(`Select * from form where form_id=$1`, [
        formId,
      ])
  
      const formname = rows[0].form_name.toLowerCase()
  
      const result = await client.query(`select * from ${formname} where faculty_id=$1`,[facultyId]);
      if (result.rowCount > 0) {
      var idx = result.rows[0].idea.indexOf(idea)
      console.log("here buddy", idx)
  
      let available = result.rows[0]?.available;
      available[idx] = '0';
  
      let accepted = result.rows[0]?.accepted;
      accepted[idx] = email
  
      let applied = result.rows[0]?.applied.filter((e)=>{
          return e.split(":")[0]!==idea || e.split(":")[1]!==email;
      })
        
      console.log(available)
      console.log(applied)
      await client.query(`update ${formname} set available=$1, applied=$2, accepted=$3 where faculty_id=$4;`,[available, applied, accepted, facultyId]);
        
        await client.query('COMMIT')
        res.status(200).send({message:`user with email: ${email} is accepted`});
      
    }
    }
    catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
})().catch((e) => {
    console.error(e.stack)
})
})


router.post('/reject', [auth.verifyToken, auth.isModerator], (req, res) => {
  // id=studentsId, email=userEmail
  const {idea, email, formId} = req.body;
  const facultyId = req.userId 
  let d = ""
  if(email){
  
      d = `${idea}:${email}`
  
  }
  ;(async function () {
      const client = await pool.connect()
      
      try{
        await client.query('BEGIN')
  
        const { rows } = await client.query(`Select * from form where form_id=$1`, [
          formId,
        ])
    
        const formname = rows[0].form_name.toLowerCase()
    
        const result = await client.query(`select * from ${formname} where faculty_id=$1`,[facultyId]);
        if (result.rowCount > 0) {
        var idx = result.rows[0].idea.indexOf(idea)
        console.log("here buddy", idx)
    
        
    
    
        let applied = result.rows[0]?.applied.filter((e)=>{
            return e!==d;
        })
          
        console.log(available)
        await client.query(`update ${formname} set applied=$1 where faculty_id=$2;`,[applied, facultyId]);
          
          await client.query('COMMIT')
          res.status(200).send({message:`user with email: ${email} is rejected`});
        
        } else {
        res.status(401).send({ error: `error while accepting the user` })
        }
      }
      catch (e) {
        await client.query('ROLLBACK')
        throw e
      } finally {
        client.release()
      }
  })().catch((e) => {
      console.error(e.stack)
  })
  })

module.exports = router

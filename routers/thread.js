var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const { auth } = require('../middleware')
const {pool} = require("../config/db.Config")



router.get('/', (req, res) => {
    
    // ;(async function() {
    //     const client = await pool.connect()
    //     const result = await client.query('SELECT * from threads')
    //     if(result.rowCount>0){
    //         res.status(200).send({data:result.rows})
    //     }
    //    res.status(404).send({err:"No threads available"})
    //     client.release()
    //   })().catch((e) => {
    //     console.error(e.stack)
    //     res.status(500).send(e.stack)
    //   })

      pool
      .query('SELECT * from threads')
      .then((result) => {
        if(result.rowCount>0){
            res.status(200).send({data:result.rows})
        }
        else{
            res.status(404).send({error:"No threads available"})
        }
       
      }).catch(err =>{
      res.status(500).send(err)
      })

    })

router.post('/linkedAnnouncements', (req, res) => {
    
     const data = req.body.threadID
    
    pool
    .query('SELECT announcement_name, announcement_id from announcements where thread_id=$1',[data])
    .then((result) => {
        if(result.rowCount>0)
        {
            res.status(200).send(result.rows)
        }
        else 
        {
            res.status(404).send({error:"No such thread exists"})
        }   
    }).catch(err =>
    res.status(500).send(err)
    )        
    
})


module.exports = router

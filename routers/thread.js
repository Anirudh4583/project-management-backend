var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const { auth } = require('../middleware')
const {pool} = require("../config/db.Config")



router.get('/',[auth.verifyToken, auth.isAdmin], (req, res) => {
    
    ;(async function() {
        const client = await pool.connect()
        const result = await client.query('SELECT * from threads')
        if(result.rowCount>0){
            res.status(200).send({data:result.rows})
        }
       res.status(404).send({err:"No threads available"})
        client.release()
      })()

})

router.post('/linkedAnnouncements',[auth.verifyToken, auth.isAdmin], (req, res) => {
    
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
            res.status(404).send({message:"No such thread exists"})
        }   
    }).catch(err =>
    setImmediate(() => {
        throw err
    })
    )        
    pool.end()
})


module.exports = router

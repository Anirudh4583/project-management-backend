var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const {pool} = require("../config/db.Config")



router.get('/', (req, res) => {
    
    ;(async function() {
        const client = await pool.connect()
        const result = await client.query('SELECT * from threads')
        if(result.rowCount>0){
            res.send({data:result.rows})
        }
       res.send({err:"No threads available"})
        client.release()
      })()

})

router.post('/linkedAnnouncements', (req, res) => {
    
    const data = req.body.threadID
    let linkedAnn = []
    let annNames = []
    ;(async function() {
        const client = await pool.connect()
        const result = await client.query('SELECT linked_announcements from threads where thread_id=$1',[data])
        if(result.rowCount>0){
            linkedAnn=result.rows[0].linked_announcements
            console.log(linkedAnn)
            linkedAnn.map((ann)=>{
                const names = client.query('SELECT announcement_name from announcements where announcement_id=$1',[ann])
                console.log(names)
            })
            // console.log(annNames)
        }
       res.send({err:"No announcements linked to current thread"})
        client.release()
      })()

})


module.exports = router

var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const { auth } = require('../middleware')
const {pool} = require("../config/db.Config")



router.get('/', [auth.verifyToken, auth.getRoleAndBatch],(req, res) => {
    
    var role = req.role
    var batch = req.batch
    var r = (role==2 ? batch : role)
    const query = r==0 ? "select * from threads Inner join announcements on (threads.thread_id = announcements.thread_id) " : "select * from threads Inner join announcements on (threads.thread_id = announcements.thread_id and "+r+" =ANY(announcements.target))"
    pool
    .query(query)
    .then((result) => {
        if(result.rowCount>0)
        {
            res.status(200).send(result.rows)
        }
        else 
        {
            res.status(404).send({message:"No such thread exists"})
        }   
    }).catch(err =>{
        console.log(err);
        res.status(500).send(err)
    }
    )       
})


module.exports = router

var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { pool } = require('../config/db.Config')

router.post("/",(req,res)=>{
    const {formId} = req.body;

    pool.query(`SELECT * from form WHERE form_id= $1`,[formId],(err,result)=>{
        if(err){
            res.send(err);
        }
        else {
            if(result.rowCount>0){
                res.send(result.rows)
            }
            else{
                res.send({error:"No Form Exist"})
            }
        }
    })
 
})


module.exports = router
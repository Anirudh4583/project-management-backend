var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const {auth} = require("../middleware");

const { pool } = require('../config/db.Config')
const { response } = require('express')

router.post("/0",[auth.verifyToken, auth.isAdmin], (req,res)=>{
    let ID = auth.getID(req)
    
    res.send("HI" +ID)
    // console.log(req)
})

// kal aana kal
// kal id ko use krk form ko update kra denge

router.post("/1",[auth.verifyToken, auth.isModerator], (req,res)=>{

// res.send("hello faculty")
    let ID = auth.getID(req)
    console.log(ID)
    let formId = 19

    ;(async () => {
        const { rows } = await pool.query(`Select * from form where form_id=$1`,[formId])
        console.log(rows.length>0){
            await pool.query(`Update ${rows.form_name}`)
        }
        
      })().catch(err =>
        setImmediate(() => {
          throw err
        })
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
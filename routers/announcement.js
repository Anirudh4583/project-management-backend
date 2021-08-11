var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const { pool } = require("../config/dbConfig");



router.get("/",(req,res)=>{
    pool.query(`select * from announcements`,(err,result)=>{
        if(err){
            res.send(err);
        }
        else 
        {
            if(result.rows){
                res.send(res.result.rows);  
            }
          
            
        }
        
    })
});

router.post("/add",(req,res)=>{

    //dummy data
    const data ={
        fields:[
            {
                fieldName:"hello",
                fieldType:false
            },
            {
                fieldName:"Ideas",
                fieldType:true
            }
        ],
        numberOfFields:2,
        deadline:"2021-08-12",
        formName:"Project",
        formData:"This is the data"
    }

    // const {data} = req.body;
    let ID;

    pool.query(`SELECT * from announcements WHERE announcement_name= $1`,[data.formName],(err,result)=>{
    if(err){
      console.log(err)
    }
    else
    {
        if(result.rows.length>0)
        {
       res.send({error:'Announcement already exists!'});
        }
        else
        {
         pool.query(`INSERT INTO announcements (announcement_name,announcement_data,deadline) VALUES($1,$2,$3)`,[data.formName,data.formData,data.deadline],(err,result)=>{
            if(err){
                 console.log(err)
             }
            else
             {
                console.log("announcement added successfully")
            

                pool.query(`CREATE TABLE ${data.formName} (
                    announcement_id integer references announcements(id),
                    faculty_id SERIAL PRIMARY KEY
                    )`,(err,results)=>{
                    if(err)
                      {
                        console.log(err)
                      }
                    else
                    {
                        console.log("table created successfully");
                        if(data.numberOfFields)
                        {
                            data.fields.map((value)=>{
                                if(value.fieldType){
                                    pool.query(`
                                    ALTER TABLE ${data.formName} 
                                    ADD COLUMN ${value.fieldName} VARCHAR[];
                                    `,(err,result)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                        else
                                        {
                                            console.log("Column added successfully")
                                        }
                                    })
                                }
                                else
                                {
                                    pool.query(`
                                    ALTER TABLE ${data.formName} 
                                    ADD COLUMN ${value.fieldName} VARCHAR;
                                    `,(err,result)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                        else
                                        {
                                            console.log("Column added successfully")
                                        }
                                    })
                                }
                               
                            })
                                    
                        }
                    res.send({message:"Announcement added successfully"})
                    }
                })
             }
         })
        }
    }
    
  })
})




  module.exports = router;

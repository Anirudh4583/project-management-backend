var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const { pool } = require("../config/dbConfig");



router.get("/",(req,res)=>{
    pool.query(`SELECT * from announcements`,(err,result)=>{
        if(errr){
            res.send(err);
        }
        else 
        {
            if(result.rows){
                res.send(results.rows);
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
                fieldData:"HELLO I AM HUMAN",
                fieldType:false
            },
            {
                fieldName:"Ideas",
                fieldData:["whats up!","Hi"],
                fieldType:true
            }
        ],
        numberOfFields:2,
        deadline:"2021-08-12",
        formName:"IDEA",
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
       res.send({message:'Announcement already exists!'});
        }
        else
        {
         pool.query(`INSERT INTO announcements (announcement_name) VALUES($1)`,[data.formName],(err,result)=>{
            if(err){
                 console.log(err)
             }
            else
             {
                console.log("announcement added successfully")
                
                
                pool.query(`SELECT * from announcements WHERE announcement_name= $1`,[data.formName],(err,result)=>{
                    if(err){
                      console.log(err)
                    }
                    else
                    {
                         ID = result.rows[0].id
                         
                    }
                })

                pool.query(`CREATE TABLE ${data.formName} (
                    announcement_id integer references announcements(id),
                    AnnouncementName VARCHAR NOT NULL,
                    AnnouncementData VARCHAR NOT NULL,
                    deadline VARCHAR NOT NULL)`,(err,results)=>{
                    if(err)
                      {
                        console.log(err)
                      }
                    else
                    {
                        console.log("table created successfully");
                        pool.query(`INSERT INTO ${data.formName} (announcement_id,AnnouncementName,AnnouncementData,deadline) VALUES ($1,$2,$3,$4)`,[ID,data.formName,data.formData,data.deadline],(err,results)=>{
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                console.log("Entries added into table successfully")
                            }
                        })
                        
                        if(data.numberOfFields)
                        {
                            data.fields.map((value)=>{
                                if(value.fieldType)
                                {
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
                                            if(value.fieldData){
                                                pool.query(`UPDATE ${data.formName}
                                                SET ${value.fieldName} = $1
                                                WHERE announcement_id = $2;`,[value.fieldData,ID],(err,result)=>{
                                                    if(err)
                                                    {
                                                        console.log(err)
                                                    }
                                                                
                                                })
                                            }
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
                                            console.log(err)
                                        }
                                        else
                                        {
                                            console.log("Column added successfully")
                                            if(value.fieldData){
                                                pool.query(`UPDATE ${data.formName}
                                                SET ${value.fieldName} = $1
                                                WHERE announcement_id = $2;`,[value.fieldData,ID],(err,result)=>{
                                                    if(err)
                                                    {
                                                        console.log(err)
                                                    }
                                                                
                                                })
                                            }
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

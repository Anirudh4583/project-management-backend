var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const { pool } = require("../config/dbConfig");



router.get("/",(req,res)=>{
    pool.query(`SELECT * from announce`,(err,result)=>{
        if(err){
            res.send(err);
        }
        else 
        {
            if(result.rows){
                result.rows[0].fields.map((value)=>{
                    console.log(JSON.parse(value));
                })
                
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
                                    pool.query(`
                                    ALTER TABLE ${data.formName} 
                                    ADD COLUMN fields VARCHAR[];
                                    `,(err,result)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                        else
                                        {
                                            console.log("Column added successfully")
                                            
                                                pool.query(`UPDATE ${data.formName}
                                                SET fields = $1
                                                WHERE announcement_id = $2;`,[data.fields,ID],(err,result)=>{
                                                    if(err)
                                                    {
                                                        console.log(err)
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
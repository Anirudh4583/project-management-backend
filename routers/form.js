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
               res.send(result);  
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
        formName:"Project12",
        formData:"This is the data"
    }

    // const {data} = req.body;
    let ID;

    ;(async () => {
        const client = await pool.connect()
        
        try {
            await client.query('BEGIN')
            const result = await client.query(`SELECT * from form WHERE form_name= $1`,[data.formName])
            
                    if(result.rows.length>0)
                      {
                     res.send({error:'Form with same name already exists!'});
                      }
                      else
                      {
                    await client.query(`INSERT INTO form (form_name,form_data,form_deadline,form_fields) VALUES($1,$2,$3,$4)`,[data.formName,data.formData,data.deadline,data.fields])
                  
                          
              
                    await client.query(`CREATE TABLE ${data.formName} (
                                  faculty_id integer
                                  )`)
                                     
                    if(data.numberOfFields)
                    {
                            data.fields.map((value)=>{
                                if(value.fieldType){
                                    client.query(`
                                                  ALTER TABLE ${data.formName} 
                                                  ADD COLUMN ${value.fieldName} VARCHAR[];
                                                  `)
                                                   }
                                              else
                                              {
                                                  client.query(`
                                                  ALTER TABLE ${data.formName} 
                                                  ADD COLUMN ${value.fieldName} VARCHAR;
                                                  `)
                                              }
                                             
                                        })
                                                  
                    }
                                 
                    }
                              
                    await client.query('COMMIT')
                    res.send({message:"form added successfully"})
                  } catch (e) {
          await client.query('ROLLBACK')
          throw e
        }
      })().catch(e => console.error(e.stack))
     
    
 
})




  module.exports = router;

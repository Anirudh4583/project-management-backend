var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const { pool } = require('../config/dbConfig');
const {transporter} = require("../helpers/utils/nodemailer");

let maillist = [];
   




router.post('/announcement', (req, res) => {
    
    // const {data}=req.body;
    const data={
        mailSubject:"This is subject",
        mailBody:"This is body",
        mailTarget:[{name:'students',batch:[2019,2020]}]
    }
    
        data.mailTarget.map((value)=>{
            
                if(value.batch){
                    value.batch.map((x)=>{
                        pool.query(`SELECT email from ${value.name} WHERE student_batch=$1`,[x],(err,result)=>{
                            if(err){
                                console.log(err)
                            }
                            else
                            {
                            //    console.log(result.rows)
                             maillist = result.rows.map(item => {return (item.email)});
                             const mailOptions = {
                                from: 'billgoldberg253@gmail.com', // sender address
                                to: maillist, // list of receivers
                                subject: data.mailSubject, // Subject line
                                html: `<p>${data.mailBody}</p>`// plain text body
                               };
                            transporter.sendMail(mailOptions, function (err, info) {
                                if(err)
                                  console.log(err)
                                else
                                  console.log(info);
                             });
                            }
                        })
                    })
                   
                }
                else {
                    pool.query(`SELECT email from ${value}`,(err,result)=>{
                        if(err){
                            console.log(err)
                        }
                        else{
                            //    console.log(result.rows)
                            maillist = result.rows.map(item => {return (item.email)});
                            const mailOptions = {
                               from: 'billgoldberg253@gmail.com', // sender address
                               to: maillist, // list of receivers
                               subject: 'hi', // Subject line
                               html: '<p>mail vala hogaya</p>'// plain text body
                              };
                           transporter.sendMail(mailOptions, function (err, info) {
                               if(err)
                                 console.log(err)
                               else
                                 console.log(info);
                            });
                        }
                        
                    })
                }  
        })
});

router.post('/reminder', (req, res) => {
 
});

module.exports = router;

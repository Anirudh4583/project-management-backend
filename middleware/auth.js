const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const {pool} = require("../config/db.config");

verifyToken = (req,res,next) => {
    let token = req.headers["accesstoken"];
    console.log(req.headers)
    console.log(token)

    if(!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secret, (err,decoded)=>{
        if(err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        next();
    });
};





isAdmin = (req,res,next) => {
    pool
  .query('SELECT role FROM users WHERE id = $1', [req.userId])
  .then(response => {
    if(response.rowCount>0){
        // console.log(response.rows[0].role.length)
        for (let i=0;i<response.rows[0].role.length;i++){
           
            if(response.rows[0].role[i] == 0){
                next();
                return;
            }
        }
    }
    
        res.status(403).send({
            message: "Require Admin Role"
        });
        return;
    
  })
  .catch(err =>
    setImmediate(() => {
      throw err
    })
  )        
        
}


isFaculty = (req,res,next) => {
    console.log(req.userId);
    pool
  .query('SELECT role FROM users WHERE id = $1', [req.userId])
  .then(response => {
     
    if(response.rowCount>0){  
        for (let i=0;i<response.rows[0].role.length;i++){
            console.log(response.rows[0].role[i])
            if(response.rows[0].role[i] == 1){
                next();
                return;
            }
        }
    }
    
        res.status(403).send({
            message: "Require Moderator Role"
        });
        return;
    
  })
  .catch(err =>
    setImmediate(() => {
      throw err
    })
  )        
        
}



isFacultyOrAdmin = (req,res,next) => {
    pool
  .query('SELECT role FROM users WHERE id = $1', [req.userId])
  .then(response => {
    if(response.rowCount>0){
        for (let i=0;i<response.rows[0].role.length;i++){
            if(response.rows[0].role[i] == 1){
                next();
                return;
            }

            if(response.rows[0].role[i] === 0){
                next();
                return;
            }
        }
    }
        res.status(403).send({
            message: "Require Moderator or Admin Role"
        });
        return;
    
  })
  .catch(err =>
    setImmediate(() => {
      throw err
    })
  )        
        
}

getId = (req) => {
    // console.log(req)
    return req.userId;
}


const auth = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isModerator: isFaculty,
    isModeratorOrAdmin: isFacultyOrAdmin,
    getID: getId
  };
  module.exports = auth;
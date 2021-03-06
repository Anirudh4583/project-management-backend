const jwt = require('jsonwebtoken')
const config = require('../config/auth.config.js')
const { pool } = require('../config/db')

verifyToken = (req, res, next) => {
  let token = req.headers['accesstoken']
  // console.log(req.headers)
  // console.log(token)

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!',
    })
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized!',
      })
    }
    req.userId = decoded.id
    next()
  })
}

isAdmin = (req, res, next) => {
  pool
    .query('SELECT role FROM users WHERE id = $1', [req.userId])
    .then((response) => {
      if (response.rowCount > 0) {
        // console.log(response.rows[0].role.length)
        for (let i = 0; i < response.rows[0].role.length; i++) {
          if (response.rows[0].role[i] == 0) {
            next()
            return
          }
        }
      }

      res.status(403).send({
        message: 'Require Admin Role',
      })
      return
    })
    .catch((err) =>
      setImmediate(() => {
        throw err
      }),
    )
}

isFaculty = (req, res, next) => {
  console.log(req.userId)
  pool
    .query('SELECT role FROM users WHERE id = $1', [req.userId])
    .then((response) => {
      if (response.rowCount > 0) {
        for (let i = 0; i < response.rows[0].role.length; i++) {
          console.log(response.rows[0].role[i])
          if (response.rows[0].role[i] == 1) {
            next()
            return
          }
        }
      }

      res.status(403).send({
        message: 'Require Moderator Role',
      })
      return
    })
    .catch((err) =>
      setImmediate(() => {
        throw err
      }),
    )
}

isFacultyOrAdmin = (req, res, next) => {
  pool
    .query('SELECT role FROM users WHERE id = $1', [req.userId])
    .then((response) => {
      if (response.rowCount > 0) {
        for (let i = 0; i < response.rows[0].role.length; i++) {
          if (response.rows[0].role[i] == 1) {
            next()
            return
          }

          if (response.rows[0].role[i] === 0) {
            next()
            return
          }
        }
      }
      res.status(403).send({
        message: 'Require Moderator or Admin Role',
      })
      return
    })
    .catch((err) =>
      setImmediate(() => {
        throw err
      }),
    )
}

getId = (req) => {
  // console.log(req)
  return req.userId
}

getRoleAndBatch = (req, res, next) => {
  pool
    .query(`Select * from users where id=$1`, [req.userId])
    .then((result) => {
      console.log(result.rows[0])
      req.role = result.rows[0].role[0]
      const email = result.rows[0].email
      if (result.rows[0].role[0] == 2) {
        pool
          .query(`SELECT * from students where user_id=$1`, [
            req.userId,
          ])
          .then((response) => {
            if (response.rowCount > 0) {
              const batch = response.rows[0].student_batch
              
              console.log(batch)
              console.log(email)
              req.batch = batch
              req.email = email
              next()
            } else {
              next()
            }
          })
      } else {
        next()
      }
    })
    .catch((err) =>
      setImmediate(() => {
        throw err
      }),
    )
}

const auth = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isModerator: isFaculty,
  isModeratorOrAdmin: isFacultyOrAdmin,
  getID: getId,
  getRoleAndBatch: getRoleAndBatch,
}
module.exports = auth

var jwt = require('jsonwebtoken')

const config = require('../config/auth.config')
const { pool } = require('../config/db')

exports.signin = (req, res) => {
  console.log(req.body.email)
  pool
    .query('SELECT * FROM users WHERE email = $1', [req.body.email])
    .then((response) => {
      if (!response.rows.length) {
        console.log(response)
        return res.status(404).send({ error: 'User not found.' })
      }

      if (req.body.password != response.rows[0].password) {
        return res.status(401).send({
          accessToken: null,
          error: 'Invalid Password!',
        })
      }

      var token = jwt.sign({ id: response.rows[0].id }, config.secret, {
        expiresIn: 86400,
      })

      res.status(200).send({
        id: response.rows[0].id,
        username: response.rows[0].name,
        email: response.rows[0].email,
        role: response.rows[0].role,
        accessToken: token,
      })
    })
    .catch((err) => {
      res.status(500).send({ error: err.message })
    })
}

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const { pool } = require('../config/dbConfig');


router.get('/', (req, res) => {
  pool.query(`SELECT * FROM users`, (err, results) => {
    if (err) {
      console.log(err);
    }
    console.log(results.rows);
    res.send(results);
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  pool.query(
    `SELECT role from users WHERE email= $1`,
    [email],
    (err, result) => {
      if (err) {
        console.error('err by sql',err);
      } else {
        console.log(result.rows[0].role );
        res.send({ role: result.rows[0].role });
      }
    }
  );
});

module.exports = router;



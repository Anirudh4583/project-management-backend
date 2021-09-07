var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
const controller = require("../controllers/auth.controller");
const {pool} = require("../config/db.Config")

router.get('/', (req, res) => {
  pool.query(`SELECT * FROM users`, (err, results) => {
    if (err) {
      console.log(err)
    }
    console.log(results.rows)
  })
})

router.post('/login', controller.signin);

module.exports = router

// router.post("/register", async (req, res) => {
//   let { name, email, password, password2 } = req.body;

//   let errors = [];

//   console.log({
//     name,
//     email,
//     password,
//     password2
//   });

//   if (!name || !email || !password || !password2) {
//     errors.push({ message: "Please enter all fields" });
//   }

//   if (password.length < 6) {
//     errors.push({ message: "Password must be a least 6 characters long" });
//   }

//   if (password !== password2) {
//     errors.push({ message: "Passwords do not match" });
//   }

//   if (errors.length > 0) {
//     res.send({message:err.message});
//   } else {
//     hashedPassword = await bcrypt.hash(password, 10);
//     console.log(hashedPassword);

//     pool.query(
//       `SELECT * FROM users
//         WHERE email = $1`,
//       [email],
//       (err, results) => {
//         if (err) {
//           console.log(err);
//         }
//         console.log(results.rows);

//         if (results.rows.length > 0) {
//           res.send({message:"email exists"});
//         } else {
//           pool.query(
//             `INSERT INTO users (name, email, password)
//                 VALUES ($1, $2, $3)
//                 RETURNING id, password`,
//             [name, email, password],
//             (err, results) => {
//               if (err) {
//                 throw err;
//               }
//               console.log(results.rows);

//             }
//           );
//         }
//       }
//     );
//   }
// });

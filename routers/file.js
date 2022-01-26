const express = require("express");
const router = express.Router();
const controller = require("../controllers/file.controller");

  router.post("/upload", controller.upload);
  router.get("/file", controller.getListFiles);
  router.get("/files/:name", controller.download);


module.exports = router;

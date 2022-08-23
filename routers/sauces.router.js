const express = require("express")
const {createSauces, getSauceId, deleteSauceId, modifySauces, likeSauce, sendSauces} = require ("../controllers/sauces")
const {authenticateUser} = require("../middleware/authenticate");
const {upload} = require("../middleware/multer")
const saucesRouter = express.Router()
const bodyParser = require("body-parser")

saucesRouter.use(bodyParser.json())
saucesRouter.get("/api/sauces", authenticateUser)


saucesRouter.get("/", sendSauces);
saucesRouter.post("/", upload.single("image"), createSauces)
saucesRouter.get("/:id", getSauceId)
saucesRouter.delete("/:id", deleteSauceId)
saucesRouter.put("/:id", upload.single("image"), modifySauces)
saucesRouter.post("/:id/like", likeSauce)
saucesRouter.get('/', (req, res) => res.send('Test'))

module.exports = { saucesRouter }
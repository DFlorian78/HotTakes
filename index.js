/// Dotenv est une dépendance pour cacher nos infos perso
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const port = 3000
/// On utilise bodyParser pour lire les données HTTP POST
const bodyParser = require("body-parser")
/// On utilise Multer pour récupérer les données envoyés du formulaire
const multer = require("multer")
//// Path pour récuperer les images
const path = require("path")
/// On utilise diskStorage pour récuperer le nom de notre image et qu'elle soit affiché dans son format dans le string des sauces
const storage = multer.diskStorage({
destination: "images/", 
filename: function (req, file, cb) {
    cb(null, imageFile(req, file))
}
})
//// Fonction pour récupérer les imagees grâce à Multer et les renommer
function imageFile(req, file) {
    const fileName = `${Date.now()}-${file.originalname}`
    file.fileName = fileName
    return fileName
}

const upload = multer({ storage: storage })
/// Connextion à mongo
require("./mongo")

/// Connextion aux fichiers controllers
const { createUser, logUser } = require("./controllers/user")
const { getSauces, createSauces } = require("./controllers/sauces")
//Middleware
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extendre: true}))

// Routes
// INSCRIPTION DE L'USER 
app.post('/api/auth/signup', createUser)
app.post("/api/auth/login", logUser)
app.get("/api/sauces", getSauces)
app.post("/api/sauces", upload.single("image"), createSauces)
app.get('/', (req, res) => res.send('Test'))



////Middleware pour que notre dossier images soit public et donc y afficher les images
app.use("/images", express.static(path.join(__dirname, "images")))
/// Listen
app.listen(port, () => console.log('Listening on port' + port))


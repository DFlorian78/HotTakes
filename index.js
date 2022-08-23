/// Dotenv est une dépendance pour cacher nos infos perso
require('dotenv').config()
///// Routes pour nos routers
const {saucesRouter} = require("./routers/sauces.router")
const {authRouter} = require("./routers/auth.router")
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
const port = 3000

/// On utilise bodyParser pour lire les données HTTP POST
const bodyParser = require("body-parser")

/// Connextion à mongo
require("./mongo")


//Middleware
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extendre: true}))


app.use(bodyParser.json())
app.use("/api/sauces", saucesRouter)
app.use("/api/auth", authRouter)

////Middleware pour que notre dossier images soit public et donc y afficher les images
app.use("/images", express.static(path.join(__dirname, "images")))
/// On demande à l'app d'écouter sur le port 3000 et de renvoyer le message
app.listen(port, () => console.log('Listening on port' + port))
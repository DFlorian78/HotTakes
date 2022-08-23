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

module.exports = {upload}
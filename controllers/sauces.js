///// On utilise JWT de vérifier le token
const jwt = require("jsonwebtoken")
const { default: mongoose } = require("mongoose")



/// On crée notre schema de sauces
const productSchema = new mongoose.Schema({
    userId: String,
    name: String,
    manufacturer: String,
    description: String,
    mainPepper: String,
    imageUrl: String,
    heat: Number,
    likes: Number,
    dislikes: Number,
    usersLiked: [String],
    usersDisliked: [String]
})
/// On crée notre constance pour que mongoose l'utilise en tant que modèle
const Product = mongoose.model("Product", productSchema)


function getSauces(req, res) {
    ///// On récupére le header 
    const headers = req.header("Authorization")
    ///// Si on ne récupére pas de token => Erreur 403
    if (headers == null) return res.status(403).send({ message: "Invalide" })
    /// On utilise split pour avoir uniquement le token
    const token = headers.split(" ")[1]
    if (token == null) return res.status(403).send({ message: "Invalide" })
    ////// On vérifie le token avec JWT et on le décode avec notre fonction
    jwt.verify(token, process.env.DB_JWT, (err, decoded) => decodeToken(err, decoded, res))   
}
/// Fonction qui décode le token, en cas de réussite affichage du array
function decodeToken(err, decoded, res) {
    if (err) res.status(401).send({ message: " Token non validé " + err })
    else {
        /// On affiche un array des sauces lors de la connexion
         Product.find({}).then(products => res.send(products)) 
}
}
//// Creation de la fonction createsauce pour créer nos sauces
function createSauces(req, res) {
    const {body, file } = req
    const sauce = JSON.parse(body.sauce)
    const fileName = file.fileName
    const userId = sauce.userId
    const name = sauce.name
    const manufacturer = sauce.manufacturer
    const description = sauce.description
    const mainPepper = sauce.mainPepper
    const heat = sauce.heat
    //// On fait cette fonction pour récuperer le chemin qui nous permet d'afficher les images à partir du port 3000 grâce à express et Path
function urlImage(req, fileName) {
    return req.protocol + "://" + req.get("host") + "/images/" + fileName
}
     console.log('sauce', sauce) 
     console.log({ file })
    

    const product = new Product({
        userId: userId,
        name: name,
        manufacturer: manufacturer,
        description: description,
        mainPepper: mainPepper,
        imageUrl: urlImage(req, fileName),
        heat: heat,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    })
    product.save().then((res)=> console.log("Produit enregistré !")).catch(console.error)
}

/// On exporte getSauce et createSAUCES dans notre index.js
module.exports = { getSauces, createSauces } 
///// On utilise JWT de vérifier le token
const jwt = require("jsonwebtoken")
const { default: mongoose } = require("mongoose")
//// On utilise unlink 
const {unlink} = require("fs/promises")

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
         Product.find({}).then(products => res.send(products)).catch(error => res.status(500).send(error))
}
}




function GetSauceTest(req,res) {
    const id = req.params.id
    return Product.findById(id)
}



//// On crée la fonction qui nous permet d'aller sur la page produits grâce a un id variable
function getSauceId(req, res) {
GetSauceTest(req,res)
    .then(product => clientResponse(product, res))
}

/// On crée la fonction pour supprimer un produit
function deleteSauceId(req, res) {
    const id = req.params.id
    Product.findByIdAndDelete(id)
    .then(deleteImage)
    .then((Product) => res.send({message: "product"})) 
    .catch(err => res.status(500).send({message: err}))
}
/// Fonction pour supprimer les images de notre dossier PAS TOUCHER
function deleteImage (Product) {
const imageUrl = Product.imageUrl
const fileToDelete = imageUrl.split("/").at(-1)
unlink(`images/${fileToDelete}`, (err) => {
    console.error(err)
})
return Product
}
  //// MODIFICATIONS DES PRODUITS ///
function modifySauces(req, res) {
/// On cherche notre id dans params, qui est dans la requête
    const {
    params: { id }
    } = req


//////// On crée cette constante pour modifier l'image
    const hasNewImage = req.file != null
    const modify = makeModifyImage(hasNewImage, req)
    /// On cherche nos produits à modifier dans la base de données, avec une réponse ou alors une erreur
    Product.findByIdAndUpdate (id, modify)
        .then((mongoRes) => clientResponse(mongoRes, res))
        .then((product)=> deleteOldImage(product))
        .then((res) => console.log("Image supprimé", res))
        .catch(err => console.error("Problème lors de la modification", err))
}
////// SUPRESSION DES ANCIENNES PHOTOS LORS DE LA MODIFICATION
function deleteOldImage(product) {
    if (product == null) return
    console.log("Delete image", product)
    ///// Ici on utilise split et -1 pour supprimer la dernière branche de l'adresse donc le fichier image
    const imageToDelete = product.imageUrl.split("/").at(-1)
    return unlink("images/" + imageToDelete)

}
///// Fonction pour modifier notre image avec Multer
function makeModifyImage(hasNewImage, req) {
    console.log("hasNewImage:", hasNewImage)
    if (!hasNewImage) return req.body
////// On utilise JSON pour transformer en objet
    const modify = JSON.parse(req.body.sauce)
    modify.imageUrl = urlImage(req, req.file.fileName)
    console.log("Nouvelle image ajouter")
    console.log("Voici la modification :", modify)
    return modify
}
//// Fonction pour valider ou non nos mises à jour produits 
function clientResponse(product, res) {
    if (product == null) {
        console.log("Rien à mettre à jour")
        return res.status(404).send({ message : "Le produit n'es pas dans la base de donnée"})
    }
        console.log("Le produit à été mis à jour", product)
        return Promise.resolve(res.status(200).send(product)).then(()=> product)
}


//// On fait cette fonction pour récuperer le chemin qui nous permet d'afficher les images à partir du port 3000 grâce à express et Path
function urlImage(req, fileName) {
    return req.protocol + "://" + req.get("host") + "/images/" + fileName
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
    product.save().then((message) => {
        //// Reponse du serveur qui nous renvoi sur un message:string
        res.status(201).send({message: message})
      return console.log("Produit enregistré !")
    })
        .catch(console.error)
}

////// On met en place les likes

function likeSauce(req, res) {
    const like = req.body.like
    const userId = req.body.userId
/// On utilise includes pour le nombre de likes
if (![1, -1, 0].includes(like)) return res.status(403).send( {message: "mauvaise requête" })

GetSauceTest(req, res)
    .then((product) => voteUpdate(product, like, userId, res))
    .then((produit) => produit.save())
    .then(total => clientResponse(total, res))
    .catch((err) => res.status(500).send(err))
}


/////// FONCTION POUR LIKES OU DISLIKES
function voteUpdate(product, like, userId, res) {
    if (like === 1 || like === -1) return voteLike(product, userId, like)
   return resetVote(product, userId, res)
}
//// On remet à 0 les likes/dislikes
function resetVote(product, userId, res) {
const { usersLiked, usersDisliked } = product
//// On gères nos cas d'erreurs ici
//// On utilise Every pour vérifier les valeurs de l'userId dans notre array
if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId))) 
    return Promise.reject("L'utilisateur à déjà voter")
//// On utilise Some pour faire le contraire de Every
if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId))) 
    return Promise.reject("L'utilisateur n'a pas voter")

///// On utilise filter pour renvoyer une array des différents userId
if (usersLiked.includes(userId)) {
    --product.likes
    product.usersLiked = product.usersLiked.filter(id => id !== userId)
} else {
    --product.dislikes
    product.usersDisliked = product.usersDisliked.filter(id => id !== userId)
}
return product
}

//// ON REGROUPE LES LIKES ET DISLIKES DANS UNE MEME FONCTION ET ON EN FAIT UNE ARRAY
function voteLike(product, userId, like) {
const { usersLiked, usersDisliked } = product

const arrayVote = like === 1 ? usersLiked : usersDisliked
if (arrayVote.includes(userId)) return product
arrayVote.push(userId)


like === 1 ? ++product.likes : ++product.dislikes
return product
}

/// On exporte dans notre index.js
module.exports = { getSauces, createSauces, getSauceId, deleteSauceId, modifySauces, likeSauce } 
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
module.exports = {Product};
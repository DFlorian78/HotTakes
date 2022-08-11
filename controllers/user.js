/// On appelle mongo
const { User } = require("../mongo")
/// On initialise la variable Bcrypt
const bcrypt = require("bcrypt")
/// On initialise la variable JWT
const jwt = require("jsonwebtoken")

async function createUser(req, res) {
    const { email, password } = req.body
    // Constance pour hash notre mdp
    const hashedPassword = await hashPassword(password)

    const user = new User({ email, password: hashedPassword })
    user
        .save()
        /// Ici une erreur est envoyé si le compte n'es pas crée
        .then(() => res.status(201).send({ message: "Utilisateur enregistré !" }))
        .catch((err) => res.status(409).send({ message: "Utilisateur non enregistré" + err }))
}
////Fonction pour hash les mots de passe
function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds)
}
//// Fonction async pour résoudre la promesse pour se log au site
async function logUser(req, res) {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findOne({ email: email })

    //// Le MDP est comparer avec bcrypt pour savoir le résultat
    const passwordValid = await bcrypt.compare(password, user.password)
    //// Si le MDP n'est pas bon ça donne une erreur 403
    if (!passwordValid) {
        res.status(403).send({ message: "Votre mot de passe incorect !" })
    }
    //// Si le MDP est correct avec la comparaison hash on valide + on envoi le token unique à l'utilisateur
    const token = createToken(email)
    res.status(200).send({ userId: user?._id, token: token })

}
//// Creation de la fonction createToken pour JWT
function createToken(email) {
    //// ICI ON UTILISE ENCORE .ENV POUR CRYPTER NOTRE MDP
    const passwordJWT = process.env.DB_JWT
    //// On veux un objet(ici l'email) ainsi qu'un mot de passe aléatoire et une durée d'expiration en cas de vol
    return jwt.sign({ email: email }, passwordJWT, { expiresIn: "24h" })
}


module.exports = { createUser, logUser }
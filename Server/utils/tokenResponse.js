const jwt = require("jsonwebtoken");
const constants = require("../config/constants");
const { TOKEN } = constants;

//Creats token. function is called at the moment of user login req.
//retuens the generat token jibrish 
//We want the token to be a token for a long time to make it easier for adults to logIn
//or you can login with Google to solve it
//For now, Token is valid for a 30 days
const createToken = (_id, _email, _user, _avatar, _profile_id) => {
    let newToken = jwt.sign({ email: _email, _id: _id, user: _user, avatar: _avatar, profile_id: _profile_id }, `${TOKEN}`, { expiresIn: "30d" });
    console.log(newToken)
    return newToken;
}
exports.createToken = createToken;
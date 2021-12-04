const jwt = require("jsonwebtoken");
const constants = require("../config/constants");
const { TOKEN } = constants;

const createToken = (_id, _email, _user) => {
    let newToken = jwt.sign({ email: _email, _id: _id, user: _user }, `${TOKEN}`, { expiresIn: "3000mins" });
    console.log(newToken)
    return newToken;
}
exports.createToken = createToken;
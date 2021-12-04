const jwt = require("jsonwebtoken");
// const asyncHandler = require("async");

//for privit routes
const authToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        res.status(403).json({ message: 'Access denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        req.email = decoded.email;
        req._id = decoded._id
        req.user = decoded.user;
        next();
    }
    catch (err) {
        // If the token is incorrect
        return res.status(400).json(err)
    }
};
exports.authToken = authToken;
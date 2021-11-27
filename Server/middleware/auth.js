const jwt = require("jsonwebtoken");
const asyncHandler = require("async");

const auth = asyncHandler((req, res, next) => {
    const token = req.header('x-auth-token');
    if(!token) {
        res.status(403).json({message:'Access denied'});
    }

    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    req.user = decoded;
    next();
});
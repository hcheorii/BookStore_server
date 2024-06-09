const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

const ensureAuthorization = (req, res) => {
    try {
        let receivedJwt = req.get("authorization");
        console.log("received JWT : ", receivedJwt);

        if (receivedJwt) {
            let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
            return decodedJwt;
        } else {
            throw new ReferenceError("jwt must be provided");
        }
    } catch (err) {
        console.log(err.name);
        console.log(err.message);
        return err;
    }
};

module.exports = ensureAuthorization;

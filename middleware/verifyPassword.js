const jwt = require('jsonwebtoken');
module.exports = (fields = []) => {
    return (req, res, next) => {
        for (let field of fields) {
            try {
                if (req.body[field]) {
                    req.body[field] = jwt.verify(req.body[field], _const.JJMSECKEY)
                }
            } catch (error) {
                return res.BadRequest();
            }
        }
        next();
    }
}
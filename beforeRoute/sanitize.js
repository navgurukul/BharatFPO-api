const { check, validationResult } = require('express-validator');

module.exports = async (req, res, next) => {
    let body = req.body || req.query || req.params;
    var loginValidate = [];
    try {
        if(body){
            const requestBody = body.length ? body : [body];
            for (const bData of requestBody) {
                for (const obj of Object.keys(bData)) {
                    loginValidate.push(check(bData[obj]).trim().escape());
                }
            }
        }
    
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        else {
            next();
        }
    } catch (error) {
        return res.status(400).json({ errors: error.array() });
    }

    // var loginValidate = [
    //     // Check Username
    //     check('username', 'Username Must Be an Email Address').isEmail()
    //     .trim().escape().normalizeEmail(),
    //     // Check Password
    //     check('password').isLength({ min: 8 }).withMessage('Password Must Be at Least 8 Characters').matches('[0-9]').withMessage('Password Must Contain a Number').matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter').trim().escape()];
}
var checkForSpecialChar = (json, query = false) => {
    let specialChars = query ? "<>!#$%^&*()+[]{}?;|'\"\\~`=" : "<>!%^()+;~`";
    for (let key in json) {
        let string = json[key];
        if (typeof string == 'string') {
            for (let char of specialChars) {
                if (string.includes(char)) {
                    return true
                }
            }
        }
    }
    return false;
}
module.exports = (req, res, next) => {
    const { body, query, params } = req;
    if (checkForSpecialChar(body)) {
        return res.BadRequest({}, "Invalid request!",401);
    }
    if (checkForSpecialChar(query, true)) {
        return res.BadRequest({}, "Invalid request!",401);
    }
    next();
}

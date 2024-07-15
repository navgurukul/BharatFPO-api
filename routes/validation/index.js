const validator = {
}
module.exports = (key) => {
    return async (req, res, next) => {
        if (validator[key]) {
            try {
                const { error } = validator[key].querySchema.validate(req.query, { abortEarly: false, allowUnknown: false, stripUnknown: false });
                if (error) {
                    return res.BadRequest({}, `Validation error: ${error.details.map(x => x.message).join(', ')}`,401);
                }
                next()
            } catch (error) {
                console.log("err", error);
                return res.BadRequest({}, `Server error.`,401);
            }
        } else {
            next();
        }
    }
}
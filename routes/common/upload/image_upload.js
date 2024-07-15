const uploadImage = require('../../../services/s3-services');
module.exports = async function (req, res, next) {
    let data = req.body[0];
    uploadImage.generateSignedUrl(data, (err, d) => {
        if (err) {
            return res.BadRequest(err, "Got Error while getting",401);
        } else {
            return res.Ok(d, "Successfully get url");
        }
    })
}
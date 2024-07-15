const { Captcha } = require('../model');
const moment = require('moment');
const captcha = require('../../../services/captcha');

module.exports.refresh = async (req, res) => {
    const { captcha_id } = req.params;
    const width = parseInt(req.query.width) || 100;
    const height = parseInt(req.query.height) || 70;
    const { image, text } = captcha(width, height);
    let data = {
        captcha_text: text
    };
    Captcha.update(data, { where: { id: captcha_id } })
        .then((dd, d) => {
            return res.status(200).send({
                timestamp: moment().unix(),
                success: true,
                message: 'Created Sucessfully',
                data: { id: captcha_id, captcha: image }
            });
        })
        .catch((err) => {
            return res.status(400).send({
                timestamp: moment().unix(),
                success: false,
                message: 'Error while table entry!'
            });
        });
}

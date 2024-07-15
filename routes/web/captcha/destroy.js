const moment = require('moment');
const { Captcha } = require('../model')

module.exports.destroy = async function (req, res, next) {
	let condition = { id: req.params.id };
	let body = {
		updatedAt: new Date(),
		status: false
	};
	try {
		let data = await Captcha.update(body, { where: condition, individualHooks: true });
		return res.status(200).send({
			timestamp: moment().unix(),
			success: true,
			message: 'UPDATED SUCCESSFULLY!',
			data: data
		});
	} catch (err) {
		return res.status(400).send({
			timestamp: moment().unix(),
			success: false,
			message: 'ERROR WHILE UPDATING!'
		});
	}
};

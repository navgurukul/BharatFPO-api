const { Captcha } = require('../model')
const ua = require('ua-parser');
const os = require('os');
const uuid = require('uuid').v4;
const captcha = require('../../../services/captcha');

module.exports.create = function (req, res, next) {
	let userAgent = req.headers['user-agent'];
	var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
	const width = parseInt(req.query.width) || 100;
	const height = parseInt(req.query.height) || 70;
	const { image, text } = captcha(width, height);
	let data = {
		uuid: uuid(),
		captcha_text: text,
		os_version: ua.parseOS(userAgent).toString(),
		os_release: os.release(),
		browser: ua.parseUA(userAgent).toString(),
		ip_address: ip,
		login_at: new Date(),
		referer: req.headers.referer
	};
	Captcha.create(data)
		.then(({ id, uuid }, d) => {
			return res.Ok({ id, uuid, captcha: image }, 'Created Sucessfully');
		})
		.catch((err) => {
			return res.BadRequest({}, 'Error while table entry!');
		});
};
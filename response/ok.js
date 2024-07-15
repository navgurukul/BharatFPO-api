const moment = require("moment");
module.exports = function (data = [], message = "", total = null, status = 200) {
	const res = this;
	let resData = {
		timestamp: moment().unix(),
		success: true,
		message: message,
		data: data
	};
	if (total || total == 0) {
		resData['total'] = total;
	}
	res.status(status).json(resData);
}
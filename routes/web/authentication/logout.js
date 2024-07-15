const { LoginHistory } = require('../model');

/* Updating the login history table with the logout time and location. */
module.exports = async function (req, res) {
	let updateData = { logged_out_at: new Date() };
	if (req.body.lat && req.body.lng)
		updateData = { ...updateData, "logout_location_lat": req.body.lat, "logout_location_lng": req.body.lng }
	let condition = { id: req.user.loginId }
	let data = await LoginHistory.update(updateData, { where: condition })
	try {
		if (data != null) return res.Ok(data, "logout successfully");
		return res.UnAuthorized({}, "token is not valid");
	} catch (error) {
		console.log("error:", error)
		return res.BadRequest({}, "Something went wrong!");
	}
}
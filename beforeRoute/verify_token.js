var jwt = require('jsonwebtoken');
var moment = require('moment');
const { LoginHistory, User } = require("../routes/web/model");
var CONFIG = require('config');

module.exports = async function (req, res, next) {
  if (req.hasOwnProperty('shouldSkipVerifyToken') && req.shouldSkipVerifyToken) {
    next();
  } else {
    var token = req.body.token || req.query.token || req.params.token || req.headers['x-access-token'];
    const timestampHeader = req.headers.timestamp || '';
    if (!token) return res.status(403).send({ success: false, message: 'No token provided.' });
    try {
      const decoded = jwt.verify(token, CONFIG.superSecret);
      const user = await User.findOne({ where: { id: decoded.id }, raw: true });
      if (!user) return res.UnAuthorized({}, 'User UnAuthorized');
      const loginHistory = await LoginHistory.findOne({ where: { user_id: decoded.id, id: decoded.loginId }, raw: true });
      if (!loginHistory || loginHistory.logged_out_at) return res.BadRequest({}, 'User UnAuthorized Token', 401);
      if (loginHistory.type === 'web' && moment().unix() > loginHistory.logged_out_date)
        return res.status(401).send({ success: false, message: 'Your token has been expired.', err: {}, logout: true });
      req.user = decoded;
      req.user.timestamp = timestampHeader;
      return next();
    } catch (error) {
      return res.status(401).send({ success: false, message: 'Something went wrong with token.' });
    }
  }
};


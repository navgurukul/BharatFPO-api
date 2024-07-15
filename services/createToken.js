const JWT = require('jsonwebtoken');
module.exports.createToken = (data, callback)=>{
  JWT.sign(data,'secretkey',callback);
}
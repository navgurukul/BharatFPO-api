const express = require('express');
const apiRoutes = express.Router();
const get = require('./get');
// const { update, create} = require('./post');
// const verifyToken = require('../../../beforeRoute/verify_token');

//this is the route for get user profile.
// apiRoutes.post("/create",create);
apiRoutes.get("/", get);
// apiRoutes.put("/update", verifyToken, update);
// apiRoutes.get("/get_all", verifyToken, get.getAll);

module.exports = apiRoutes;
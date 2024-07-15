const express = require('express');
const apiRoutes = express.Router();
const get = require('./get');
const {create} = require('./post');
const verifyToken = require('../../../beforeRoute/verify_token');

//this is the route for get user profile.
apiRoutes.post("/create",verifyToken,create);
// apiRoutes.post("/update",verifyToken,update);
apiRoutes.get("/get", verifyToken,get);
// apiRoutes.get("/get_all", get.getAll);

module.exports = apiRoutes;
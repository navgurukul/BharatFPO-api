const express = require('express');
const apiRoutes = express.Router();
const get = require('./get');
// const { update, create} = require('./post');
const {create, update} = require('./post');
const verifyToken = require('../../../beforeRoute/verify_token');
const getOrgData = require('../organisation-details/get');

//this is the route for get user profile.
apiRoutes.post("/create",verifyToken,create);
apiRoutes.post("/update",verifyToken,update);
apiRoutes.get("/get", get,getOrgData);
apiRoutes.get("/get_all", get.getAll);

module.exports = apiRoutes;
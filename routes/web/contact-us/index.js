const express = require('express');
const apiRoutes = express.Router();
const get = require('./get');
const {create} = require('./post');
//this is the route for get contact us.
apiRoutes.post("/create", create);
apiRoutes.get("/get", get);
apiRoutes.get("/get_all", get.getAll);

module.exports = apiRoutes;
const express = require('express');
const apiRoutes = express.Router();
const get = require('./get');
const {create, update} = require('./post');

apiRoutes.post("/create",create);
apiRoutes.post("/update",update);
//this is the route for get directors profile by cin or din or fpo_id
apiRoutes.get("/get_all", get.getAll);

module.exports = apiRoutes;
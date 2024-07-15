const express = require('express');
const apiRoutes = express.Router();
const get = require('./get');

//this is the route for get Dashboard data.
apiRoutes.get("/dashboard/get/:fpo_id", get);
apiRoutes.get("/dashboard", get.get_dashboard);

module.exports = apiRoutes;


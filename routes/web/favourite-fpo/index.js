const express = require('express');
const apiRoutes = express.Router();
const get = require('./get');
const {create, update} = require('./post');


apiRoutes.post("/create", create);
apiRoutes.post("/update", update);
apiRoutes.get("/get", get);
apiRoutes.get("/get_all_by_type", get.getAllByType);

module.exports = apiRoutes;
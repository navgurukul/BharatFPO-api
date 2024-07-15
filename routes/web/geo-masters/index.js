require('rootpath')();
const express = require('express');
const apiRoutes = express.Router();
const { get_geo,getAll } = require('./get');
const { create } = require('./post');

// this is the route for captcha.

apiRoutes.get('/get-geo/:geo_type', get_geo);
apiRoutes.get('/get-all/:geo_type', getAll);
apiRoutes.post('/master/:master_type', create);


module.exports = apiRoutes;
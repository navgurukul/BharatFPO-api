require('rootpath')();
const express = require('express');
const apiRoutes = express.Router();
const { create } = require('./create');
const { destroy } = require('./destroy');
const { refresh } = require('./captcha')

// this is the route for captcha.

apiRoutes.get('/user/captcha/create', create);
apiRoutes.post('/user/captcha/destroy/:id', destroy);
apiRoutes.get('/user/captcha/refresh/:captcha_id', refresh);

module.exports = apiRoutes;
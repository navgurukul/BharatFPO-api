/* Define an as routing of the Home, Resource, ImpactStories pages api's */
const models = require('../../../services/all-models');
const { publicRoutesforUsers, privateRoutesforAdmin } = require('./home');

const privateRoutes = [
  {
    method: 'post',
    model: 'Cms',
    endPoint: '/cms/create',
  },
  ...privateRoutesforAdmin
];

const publicRoutes = [
  {
    method: 'post',
    model: 'Cms',
    endPoint: '/cms/create',
  }, // dummy endpoint so
  ...publicRoutesforUsers
]

module.exports = { privateRoutes, publicRoutes };
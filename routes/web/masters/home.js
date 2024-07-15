/* Define an as routing of the contact management system api's */
const models = require('../../../services/all-models');

const publicRoutesforUsers = [
    {
        method: 'post',
        model: 'Inquiry',
        endPoint: '/user/inquiry'
    }, // dummy route for post
]

const privateRoutesforAdmin = [
    {
        method: 'post',
        model: 'Cms',
        endPoint: '/cms/create',
    },
];

module.exports = { publicRoutesforUsers, privateRoutesforAdmin }
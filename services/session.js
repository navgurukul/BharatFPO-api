const Session = require('model/Session');
module.exports = {
    destroy: (id) => {
        Session.update({ status: false }, { where: { id } });
    }
}
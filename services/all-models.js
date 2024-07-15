const mainModel = require('../routes/web/model');

/* Exporting all the models from the file. */
/* Destructuring the mainModel object and assigning the mapper and masters to the mapperModel and masterModel respectively. */
const { _,_2, ...extractOnlyMainModel } = mainModel;

module.exports = {
    ...extractOnlyMainModel,
}
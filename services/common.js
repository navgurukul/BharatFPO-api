const models = require('./all-models');
const Op = Sequelize.Op;
const { updateOrCreate, findAndUpdate, create }  = require('../routes/utils/common-function');

module.exports.bulkCreateOrUpdate = async (req, res) => {
    const body = req.body;
    try {
        if(!body.hasOwnProperty('data') || body.data == '' || !body.data) throw new Error('Data not found!');
        if(!body.hasOwnProperty('model') || body.model == '' || !body.model) throw new Error('Model not found!');
        if(!models.hasOwnProperty(body.model)) throw new Error('Invalid model request!');

        const bodydata = Array.isArray(body.data) ? body.data : [body.data];
        for (const object of bodydata) {
            if(object.hasOwnProperty('id') && (object.id != '' || object.id != null)){
                let condition1 = {where : {id : object.id}};
                await updateOrCreate(models[body.model],condition1,object);
            }else{
                await create(models[body.model],object);
            }
        }
        if(bodydata && bodydata.length && bodydata[0] && bodydata[0].hasOwnProperty('id')){
            // let condition2 = {where : {id : {[Op.notIn] : bodydata.map(e => e.id)}}};
            // await findAndUpdate(models[body.model],condition2,{isActive : '0'})
        }
        return res.Ok({},'Create/Update Successfully');
    } catch (error) {
        return res.Ok(error,error.message,401);
    }
}
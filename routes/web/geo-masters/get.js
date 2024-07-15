const db = require("../../../dbConnection");
const { findAll, findOne } = require("../../utils/common-function");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// const { State, District, Block } = require("../model");
const list_of_masters_with_other = ['license', 'supporting_agency']

module.exports.get_geo = async function (req, res) {
  let geo_type = req.params.geo_type;
  const geo_id = req.query.id;
  try {
    const model = db[geo_type];
    let result = [],
      include = [];
    if (model.associations) {
      // Iterate through model associations
      Object.values(model.associations).forEach((association) => {
        include.push({
          model: association.target,
        });
      });
    }
    result = await findOne(model, {
      where: { id: geo_id, isActive: true },
      include
    });
    return res.Ok(result, "Data fetched successfully!");
  } catch (error) {
    console.log(error);
  }
};


module.exports.getAll = async (req, res) => {
    let geo_type = req.params.geo_type;
    const model = db[geo_type];
    const geo_id = Object.keys(req.query).map(key => req.query[key]);
    if(geo_id.length>1){ return res.BadRequest({}, 'Pass only name or id or pass nothing');}
    if(geo_id.length && !model.tableAttributes.hasOwnProperty(Object.keys(req.query))){ return res.BadRequest({}, 'Property does not exist.');}
    try {
        let geo_data;
        if(geo_id.length){
            if(req.query.name){
                geo_data= await model.findAll({
                    where: {
                        name: {[Op.iLike]: req.query.name}
                    }
                })
            }else{
                geo_data = await findAll(model,{
                    where:{...req.query, isActive:true} 
                }
                );
            }
         }else{
            geo_data = await findAll(model,{
                where:{isActive:true} 
                }
            );
        }

    // Append 'Other' in the list with id =999
        if(list_of_masters_with_other.includes(geo_type)){
          geo_data.rows.push(
            {
              "id": 999,
              "name": "Other"
          }
          )
        }
        return res.Ok(geo_data, "Data fetched successfully!");
    } catch (error) {
      console.log(error);
      return res.BadRequest({}, 'Something went wrong!');
    }
}
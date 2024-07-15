const { findOne, findAll } = require("../../utils/common-function");
const { FpoInputOutput, SubCategory, Category} = require("../model");
const Op = Sequelize.Op;
// const getOrgData = require("../organisation-details/get");

module.exports = async (req, res, next) => {
    let {fpo_id} = req.query;
    let { limit } = req.query;
    let { offset } = req.query;
    if (!fpo_id) return res.BadRequest({}, 'fpo id is mandatory!');
    try {
        let fpo_inputOutput = await findAll(FpoInputOutput,{
            where:{fpo_id,isActive:true},
            include:[
                {   model: SubCategory,
                    as:'sub_category',
                    attributes:['id','name'],
                    include: {
                        model: Category,
                        as: 'category',
                        attributes: ['id','name'],
                        where: {isActive:true}
                    },
                    where:{isActive:true},
                }
             ], 
            limit,
            offset,
            order: [["id", "DESC"]],
            subQuery: false,
            raw: false
            }
        );

        return res.Ok(fpo_inputOutput, "Data fetched successfully!");
    } catch (error) {
      console.log(error);
      return res.BadRequest({}, 'Something went wrong!');
    }
  };
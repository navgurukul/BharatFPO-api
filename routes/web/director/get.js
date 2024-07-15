const { findOne, findAll } = require("../../utils/common-function");
const { Director, Block, District, State, UserProfile } = require("../model");
const Op = Sequelize.Op;
// const getOrgData = require("../organisation-details/get");

module.exports = async (req, res, next) => {
    let {id} = req.query;
    if (!id) return res.BadRequest({}, 'director id is mandatory!');
    try {
        let director_data = await findOne(Director,{
            where:{id,isActive:true},
            include:[
                {   model: UserProfile,
                    as:'user_profile',
                    attributes:['fpo_name'],
                    include: {
                        model: Block,
                        as: 'block',
                        attributes: ['name'],
                        include: [{
                            model: District,
                            as: 'district',
                            attributes: ['name'],
                            include: [{
                                model: State,
                                as: 'state',
                                attributes: ['name'],
                            }],
                        }],
                    }
                }
             ], 
            }
        );

        return res.Ok(director_data, "Data fetched successfully!");
    } catch (error) {
      console.log(error);
      return res.BadRequest({}, 'Something went wrong!');
    }
  };

  module.exports.getAll = async (req, res) => {
    let {cin} = req.query;
    let {din} = req.query;
    let {fpo_id} = req.query;

    let where = {isActive:true} ;

    if (cin)
    where.cin = cin

    if (din)
    where.din = din

    if (fpo_id)
    where.fpo_id = fpo_id

    try {
        let director_data = await findAll(Director,{
            where,
            include:[
                {   model: UserProfile,
                    as:'user_profile',
                    attributes:['fpo_name'],
                    include: {
                        model: Block,
                        as: 'block',
                        attributes: ['name'],
                        include: [{
                            model: District,
                            as: 'district',
                            attributes: ['name'],
                            include: [{
                                model: State,
                                as: 'state',
                                attributes: ['name'],
                            }],
                        }],
                    }
                }
             ], 
            }
        );
        return res.Ok(director_data, "Data fetched successfully!");
    } catch (error) {
      console.log(error);
      return res.BadRequest({}, 'Something went wrong!');
    }
}
  
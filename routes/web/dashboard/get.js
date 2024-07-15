const { Op } = require("sequelize");
const { findOne, findAll } = require("../../utils/common-function");
const { ContactUs, UserProfile, Block, District, State } = require("../model");

module.exports = async (req, res) => {
    let {id} = req.query;
    if (!id) return res.BadRequest({}, 'Contact Us id is mandatory!');
    try {
        let conatct_us_data = await findOne(ContactUs,{
            where:{id,isActive:true}
            }
        );

        return res.Ok(conatct_us_data, "Data fetched successfully!");
    } catch (error) {
      console.log(error);
      return res.BadRequest({}, 'Something went wrong!');
    }
  };

  module.exports.get_dashboard = async (req, res) => {
    try {
        /* Dashboard data:
            1. heat map- state FPO counts
            2. Total Registered FPO's
            3. Total Farmer Members
            4. FPO with updated contact information         */
        
        //  1. heat map- state FPO counts 
        let {state_id} = req.query;
        let {all_women_fpo} = req.query;
        let where = {'$user_profile.isActive$':true, '$user_profile.user_id$': {[Op.not]: null}};

        if(state_id){
            where = { 
                $and: [
                     where,
                    {'$block->district->state.id$' : state_id.split(',')}
                ]}
        }

        if(all_women_fpo==1){
            where.number_of_members= { [Op.eq]: Sequelize.col('number_of_women_members')}
        }
        
        let heatmap_data = await UserProfile.findAll({
            where,
            attributes: [
              'block->district->state.id',
              'block->district->state.name',
              'block->district->state.code',
              [sequelize.fn('COUNT', sequelize.col('user_profile.id')), 'count'],
            ],
            include: [
                {
                    model: Block,
                    attributes: [],
                    include: [
                        {
                        model: District,
                        attributes: [],
                        include: [{
                            model: State,
                            attributes: [],
                            include: []
                        }]
                    }
                ]
                }
            ],
            group:["block->district->state.id","block->district->state.name","block->district->state.code"],
            raw:true
            }
        );
        // 2. Total Registered FPO's
        // 3. Total Farmer Members
        // 4. FPO with updated contact information
            let total_fpo = await findAll(UserProfile,{
                // where:state_id?{ 
                //     $and: [
                //         {'$user_profile.isActive$':true},
                //         {'$block->district->state.id$' : state_id.split(',')}
                //     ]}:{'$user_profile.isActive$':true},
                where,
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('user_profile.id')), 'fpoCount'],
                    [sequelize.fn('SUM', sequelize.col('user_profile.number_of_members')), 'farmerMemberCount'],
                    [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN profile_update = true THEN 1 ELSE 0 END')), 'totalFpoUpdated']  
                ],
                include: [
                    {
                        model: Block,
                        attributes: [],
                        include: [
                            {
                            model: District,
                            attributes: [],
                            include: [{
                                model: State,
                                attributes: [],
                                include: []
                            }]
                        }
                    ]
                    }
                ],
            }
        );
        
        let dashboard_data = {
            total_fpo: total_fpo.count,
            total_farmer_member_count: total_fpo.rows[0]?total_fpo.rows[0].farmerMemberCount:0,
            total_fpo_updated: total_fpo.rows[0]?total_fpo.rows[0].totalFpoUpdated:0,
            heatmap_data: heatmap_data
        };
        return res.Ok(dashboard_data, "Data fetched successfully!");
    } catch (error) {
      console.log(error);
      return res.BadRequest({}, 'Something went wrong!');
    }
}
  
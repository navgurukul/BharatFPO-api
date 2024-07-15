const { literal, Sequelize } = require("sequelize");
const { findOne, countRecord } = require("../../utils/common-function");
const {
  UserProfile,
  Block,
  District,
  State,
  Director,
  FavouriteFpo,
  FpoSupportingAgencyMapper,
} = require("../model");
const model = require("../model");

const Op = Sequelize.Op;
// const getOrgData = require("../organisation-details/get");

module.exports = async (req, res, next) => {
  let { cin } = req.query;
  let { id } = req.query;
  if (!(cin || id))
    return res.BadRequest(
      {},
      "Organisation/user profile CIN or id is mandatory!"
    );

  let where = { isActive: true };

  if (cin) where.cin = cin;
  else {
    where.id = id;
  }

  try {
    let org_data = await findOne(UserProfile, {
      where,
      include: [
        {
          model: Block,
          as: "block",
          attributes: ["name"],
          include: [
            {
              model: District,
              as: "district",
              attributes: ["name"],
              include: [
                {
                  model: State,
                  as: "state",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
        {
          model: Director,
          as: "directors",
          attributes: [
            "din",
            "director_name",
            "designation",
            "appointment_date",
          ],
          where: {isActive: true },
          required: false,
        },
        {
          model: FpoSupportingAgencyMapper,
          as: "fpo_supporting_agency_mappers",
          attributes: ["supporting_agency_id","from_date","to_date"],
          where: {isActive: true },
          required: false,
        },
      ],
      raw: false,
    });
    // '/organisation-details?cin='org_data.cin_no;
    // getDIN = await getOrgData(req,res);
    // org_data['directors_details'] = 'DIN';

    return res.Ok(org_data, "Data fetched successfully!");
    // req.query.cin = org_data.cin;
    // req.orgData = org_data;
    //     next();
  } catch (error) {
    console.log(error);
    return res.BadRequest({}, "Something went wrong!");
  }
};

module.exports.getAll = async (req, res) => {
  let { search_by_name } = req.query;
  let { state_id } = req.query;
  let { all_women_fpo } = req.query;
  let { limit } = req.query;
  let { offset } = req.query;
  let { user_id } = req.query;
  let {from_auth_cap, to_auth_cap} = req.query;
  let {from_paidup_cap, to_paidup_cap} = req.query;
  let {from_last_activity, to_last_activity} = req.query;
  let {from_incorp_date, to_incorp_date} = req.query;
  let {state_code} = req.query
  
  user_id? user_id: null;

try {
  let where = { isActive: true };

  if (search_by_name){
    where = {...where, 
      [Op.or]:[
        {company_name: { [Sequelize.Op.iLike]: "%" + search_by_name + "%" } },
        {fpo_pincode:{ [Sequelize.Op.iLike]: "%" + search_by_name + "%" } }
      ]}
  }
  
  if(all_women_fpo==1)
      where.number_of_members= { [Op.eq]: Sequelize.col('number_of_women_members')}

  if (state_id)
    where = { ...where, "$block->district->state.id$": state_id.split(",") };
  
  
  if (state_code)
    where = { ...where, state_code: state_code.split(",") };
    
  if (from_incorp_date && to_incorp_date)
    where.date_of_incorporation = {[Op.between]: [from_incorp_date, to_incorp_date]};

  if (from_auth_cap && to_auth_cap)
    where.authorised_capital = {[Op.between]: [from_auth_cap, to_auth_cap]};

  if (from_paidup_cap && to_paidup_cap)
    where.paid_up_capital = {[Op.between]: [from_paidup_cap, to_paidup_cap]};


  if(from_last_activity && to_last_activity){
    let AfterLoginList = await model.LoginHistory.findAll({
      attributes: ['user_id'],
      where: {
        logged_in_at: {
          [Op.gt]: to_last_activity
        }
      },
      raw: true
    });
    AfterLoginList = AfterLoginList.map((record) => record.user_id);

    let userIds = await model.LoginHistory.findAll({
      attributes: ['user_id'],
      where: {
        logged_in_at: {
          [Op.between]: [from_last_activity, to_last_activity]
        },
        user_id: {
          [Op.notIn]: AfterLoginList
        }
      },
      raw: true,
      group: ['user_id']
    })
    userIds = userIds.map((record)=> record.user_id);

  where.user_id = userIds
  }
  let include = [
    // {
    //   model: Block,
    //   attributes: ['id','name'],
    //   include: [
    //     {
    //       model: District,
    //       attributes: ['id','name'],
    //       include: [
    //         {
    //           model: State,
    //           attributes: ['id','name'],
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      model: State,
      attributes:['id', 'name']
    }
  ];
  if(user_id){
    include.push(
      {
        model: FavouriteFpo,
        as: "favourite_fpos",
        attributes: ["fpo_id"],
        where: { user_id:user_id, type: 2, isActive: true },
        required: false,
      }
    )
  }

  // if (user_id) {
  //     include = [
  //       // {
  //       //   model: Director,
  //       //   attributes: ['id','din', 'director_name', 'designation', 'appointment_date'],
  //       //   required:false
  //       // },
  //       {
  //         model: Block,
  //         attributes: ['id','name'],
  //         include: [
  //           {
  //             model: District,
  //             attributes: ['id','name'],
  //             include: [
  //               {
  //                 model: State,
  //                 attributes: ['id','name'],
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //       {
  //         model: FavouriteFpo,
  //         as: "favourite_fpos",
  //         attributes: ["fpo_id"],
  //         where: { user_id:user_id, type: 2, isActive: true },
  //         required: false,
  //       },
  //     ]
  // }
  // else{
  //     include =[
  //       // {
  //       //   model: Director,
  //       //   attributes: ['id','din', 'director_name', 'designation', 'appointment_date'],
  //       //   required:false
  //       // },
  //       {
  //         model: Block,
  //         attributes: ['id','name'],
  //         include: [
  //           {
  //             model: District,
  //             attributes: ['id','name'],
  //             include: [
  //               {
  //                 model: State,
  //                 attributes: ['id','name'],
  //               },
  //             ],
  //           },
  //         ],
  //       }
  //     ]
  // }



const orgs_data = await UserProfile.findAndCountAll({
  // logging: console.log,
  where,
  include,
  limit,
  offset,
  order: [["id", "DESC"]],
  subQuery: false
});
// for count of FPOs
// const count_data = await UserProfile.findAll({
//   attributes:[[literal('COUNT(DISTINCT "user_profile"."id")'), 'totalRows']],
//   // logging: console.log,
//   where,
//   include:[
//     {
//       model: Director,
//       attributes: [],
//       required:false
//     },
//     {
//       model: Block,
//       attributes: [],
//       include: [
//         {
//           model: District,
//           attributes: [],
//           include: [
//             {
//               model: State,
//               attributes: [],
//             },
//           ],
//         },
//       ],
//     }
//   ],
//   group: ['user_profile.id'],
//   // limit,
//   // offset,
//   // order: [["id", "DESC"]],
//   // subQuery: false
// });

if(user_id){
  orgs_data.rows.map(item=>{
      item.dataValues['isFavorite'] = item.dataValues.favourite_fpos.length > 0
      delete item.dataValues['favourite_fpos']
  });
}


  return res.Ok(orgs_data, "Data fetched successfully!");
} catch (error) {
    console.log(error);
    return res.BadRequest({}, "Something went wrong!");
  }
};

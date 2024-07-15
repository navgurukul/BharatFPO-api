const Models = require('../../../dbConnection');
const { Op } = require('sequelize');
const { Readable } = require('stream');
const { profilePercentage, getOptionValue, changeFields, findOne } = require('../../utils/common-function');
const { User, UserProfile, FavouriteFpo, Block, District, State } = require('../model');
const { ROLE } = require('../../utils/constant');
const jwt = require('jsonwebtoken');
const moment = require('moment');


module.exports = async (req, res) => {
    try {
        let {id} = req.query;
        console.log(id);
        if (!id) return res.BadRequest({}, "id is required in params!")
        // let data = await User.findByPk(id);
        // data = JSON.parse(JSON.stringify(data));
            let uData = await findOne(User,{
                where: { id ,'isActive':true},
                include: [
                        {
                            model: UserProfile,
                            // attributes:['id','cin'],
                            include:  {
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
                            as: 'user_profile'
                        },
                        {
                            model: FavouriteFpo,
                            as: 'favourite_fpos',
                            attributes: ['type','fpo_id'],
                            where:{isActive:true},
                            required: false
                            // group: ['type'],
                        }
                ],
                raw:false
            });
            let viewCount = 0;
            let favCount = 0;

            await uData.favourite_fpos.map((user) => {
                if (user.type==1){
                    viewCount++
                }else{
                    favCount++
                }
            });
            delete uData.dataValues['favourite_fpos']

            uData.dataValues['fpo_viewed'] =viewCount
            uData.dataValues['fpo_saved'] =favCount
            return res.Ok(uData, "Fetched data successfully!");
                
    } catch (error) {
        console.log("error:", error)
        res.BadRequest({}, "Something went wrong!")
    }
}

module.exports.getUserByToken = async (req, res)=> {
    let {token} = req.query;
     jwt.verify(token, process.env.SUPERSECRET,async (err, decoded) => {
        if (err) {
            // Token verification failed
            console.error('JWT verification failed:', err);
            return res.BadRequest(err, 'Something went wrong!');
        } else {
            // Token verification succeeded, and 'decoded' contains the payload data
            try {
                let uData = await findOne(User,{
                    where: { 'email': decoded.email ,'isActive':true},
                    include: [
                            {
                                model: UserProfile,
                                attributes:['id','cin'],
                                as: 'user_profile'
                            },
                            {
                                model: FavouriteFpo,
                                as: 'favourite_fpos',
                                attributes: ['type','fpo_id'],
                                where:{isActive:true},
                                required: false
                                // group: ['type'],
                            }
                    ],
                    raw:false
                });
              
                let loginData = {
                    id: decoded.id,
                    role_id: decoded.role_id,
                    email: decoded.email,
                    name:decoded.name,
                    profile_img: decoded.profile_img,
                    // fpo_viewed:viewCount,
                    // fpo_saved:favCount,
                    cin_no:uData.user_profile.cin,
                    fpo_id:uData.user_profile.id, // user-profile id
                    mobile: decoded.mobile ? rowData.mobile : null,
                    created_at: decoded.created_at,
                }
                return res.status(200).send({
                    timestamp: moment().unix(),
                    success: true,
                    message: "Logged in successfully...",
                    token,
                    data: loginData
                });
            }catch(err){
                console.log(err);
            }
        }
    });
}


module.exports.getAll = async (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : null;
    let offset = req.query.page ? parseInt((req.query.page - 1) * 10) : 0;
    let whereCondition = filter_condition(req);
    let total = 0;

    try {
        if (!offset) {
            total = await Models['user'].count({
                where: whereCondition,
                distinct: true,
                include: [
                    {
                        model: Models.paymentInfo,
                        as: 'payments',
                        attributes: [],
                    },
                ],
            });
        };

        let getAllUserQuery = {
            where: whereCondition,
            distinct: true,
            attributes: [
                'id',
                'facility_name',
                'state_name',
                'is_payment',
                'updated_at',
                'overall_payment_status',
                [Sequelize.literal('(SELECT COALESCE(SUM("payments"."paid_amount"), 0) FROM public."paymentInfo" AS "payments" WHERE "payments"."user_id" = "user"."id")'), 'total_paid_amount']
            ],
            include: [
                {
                    model: Models.paymentInfo,
                    as: 'payments',
                    attributes: ['status', 'paid_amount', 'total_amount', 'payment_reciept', 'remarks'],
                },
            ],
            order: [['updated_at', 'DESC']],
            limit,
            offset
        }

        if (req.query.cse_mapped) getAllUserQuery['order'] = [['facility_name', 'ASC']];

        let getAllUser = await User.findAll(getAllUserQuery);

        getAllUser = JSON.parse(JSON.stringify(getAllUser));

        for (let elem of getAllUser) {
            const userData = await User.findOne({ where: { id: elem.id }, raw: true });
            let profileperc = profilePercentage(userData);

            //if the user made the complete payment the profile percentage increases to 10%
            if (userData.is_payment == true) profileperc += 10
            elem.profilePercentage = profileperc;
        }

        if (req.query.cse_id && req.query.cse_mapped) {
            let getUser = await User.findAll({
                where: { cse_id: req.query.cse_id },
                raw: true,
                attributes: ["id", "facility_name", "state_name"],
                order: [['updated_at', 'DESC']]
            });
            getAllUser = [...getAllUser, ...getUser]
        }

        if (limit === null) {
            return res.Ok(getAllUser, "Data fetched successfully!");
        }
        return res.Ok(getAllUser, 'Data Fetched Successfully!', total);
    } catch (error) {
        console.log("error:", error)
        res.BadRequest({}, "Something went wrong!")
    }
}

module.exports.profilePercentage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.BadRequest({}, "id is required in params!");
        const user = await User.findByPk(id, { raw: true });
        if (!user) return res.BadRequest({}, "user not found!")
        let profileperc = profilePercentage(user);

        //if the user made the complete payment the profile percentage increases to 10%
        if (user.is_payment == true) profileperc += 10;
        return res.Ok({ profile_percentage: profileperc }, "profile percentage get successfully!");
    } catch (error) {
        console.log("error:", error)
        res.BadRequest({}, "Something went wrong!");
    }
}

module.exports.csv = async function (req, res, next) {
    try {
        let whereCondition = filter_condition(req);
        res.setHeader('Content-disposition', 'attachment; filename=Facility.csv');
        res.set('Content-Type', 'text/csv');
        let i = 1; let perPage = 10000;
        var s = new Readable({
            async read(size) {
                try {

                    let data = await User.findAll({
                        where: whereCondition,
                        include: [
                            {
                                model: Cse,
                                as: 'ref_cse',
                                attributes: ['name'],
                                nested: true
                            },
                        ],
                        attributes: {
                            exclude: ['role_id', 'coupon_id', 'hospital_name', 'payment_id', 'is_verify_email', 'is_password_change',
                                'updated_at', 'overall_payment_status', 'is_draft', 'is_mobile_check', 'is_poc_email_check', 'password',
                                'updated_by', 'is_deleted', 'cse_id', 'profile_submitted_at', 'payment_date', 'ref_cse_id'],
                            include: [
                                // [Sequelize.literal(`to_char("user"."created_at", 'YYYY-MM-DD')`), 'Registration Date'],
                                [Sequelize.literal('(SELECT COALESCE(SUM("payments"."paid_amount"), 0) FROM public."paymentInfo" AS "payments" WHERE "payments"."user_id" = "user"."id")'), 'total_paid_amount']
                            ]
                        },
                        order: [['updated_at', 'DESC']],
                        limit: perPage,
                        offset: (i - 1) * perPage,
                    });

                    data = JSON.parse(JSON.stringify(data));
                    let optionData = await Models['option'].findAll({ where: { model_name: { $in: ['user'] } } });
                    let sortKeys = [...new Set(optionData.map((x) => x.sort_key))];

                    const userIds = data.map((elem) => elem.id);
                    const userData = await User.findAll({
                        where: { id: userIds },
                        raw: true
                    });

                    // Process additional data and update the data array
                    for (let elem of data) {
                        const user = userData.find((user) => user.id === elem.id);
                        let profileperc = profilePercentage(user);
                        if (user.is_payment == true) profileperc += 10;

                        await getOptionValue(sortKeys, elem, optionData);

                        elem['ref_cse_name'] = elem.ref_cse ? elem.ref_cse.name : '';
                        elem['profile_completion'] = profileperc;
                        elem['amount_approved'] = elem.total_paid_amount;

                        if (req.query.fromDashboard) {
                            elem['profile_completed'] = elem.is_profile_updated ? 'Yes' : 'No';
                            elem['payment_completed'] = elem.is_payment ? 'Yes' : 'No';
                        }

                        delete elem.ref_cse;
                        delete elem.is_payment;
                        delete elem.id;
                        delete elem.total_paid_amount;
                        delete elem.is_profile_updated;

                        //Change Heading of the csv.
                        changeFields(req, elem)
                    }

                    if (i == 1 && data.length) {
                        this.push(Object.keys(data[0]).join(",") + "\r\n");
                    }
                    let str = await convertToCSVString(data);
                    this.push(str);
                    i++;
                    if (!data.length) {
                        this.push(null);
                    }
                } catch (error) {
                    console.log("Got Error while fetching User data", error)
                    return res.BadRequest({}, "Something went wrong!");
                }
            }
        });
        s.on('error', (err) => {
            console.log("error", err)
            return res.BadRequest(err, "Got Error while streaming User data");
        });
        s.pipe(res);
    } catch (error) {
        console.log("error", error)
        return res.BadRequest(error, "Got Error while handling request");
    }
};

module.exports.getUserByState = async function (req, res) {
    try {
        let { type, state_name } = req.query;
        type = type.trim()
        if (!type) throw new Error("Please Provide Type !")
        const condition = {
            state_name: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.not]: ''
            }
        };
        if (state_name) {
            condition['state_name'] = state_name;
        }
        const censusData = await User.findAll({
            attributes: [
                `${type}_name`,
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            where: condition,
            group: [`${type}_name`],
            raw: true
        });
        return res.Ok(censusData, 'Data Fetched Successfully!');
    } catch (error) {
        return res.BadRequest({}, error.message || "Error while getting user");
    }
};

const filter_condition = (req) => {
    const condition = { is_deleted: false, role_id: ROLE.FACILITY };
    if (req.query.id) condition.id = req.query.id;

    if (req.query.facility_name) {
        condition['facility_name'] = { [Op.iLike]: `%${req.query.facility_name}%` };
    }
    if (req.query.state_name) {
        condition['state_name'] = { [Op.iLike]: `%${req.query.state_name}%` };
    }
    if (req.query.cse_mapped) {
        condition['cse_id'] = null
    };
    if (req.query.payment) {
        condition['payment_id'] = null
    };
    if (req.query.is_payment) {
        condition['is_payment'] = req.query.is_payment;
    };
    if (req.query.status) {
        condition['overall_payment_status'] = req.query.status;
    };
    return condition;
}
const { phone } = require('phone');
const Op = Sequelize.Op;
const request = require('request');
const { Attributes } = require('./constant');
const models = require('../../dbConnection/index');
const modelObj = require('../../services/all-models');

/**
 * Generates a dynamic search condition for a Sequelize model based on a search value.
 * Check if the search value is empty; if so, return an empty search condition.
 * Normalize the filterKey value by removing extra spaces and trimming it.
 * Initialize the search condition object with an 'OR' clause.
 * Helper function to process a model's attribute for search.
 * Check if the attribute is a known type that should not be searched.
 * Check if the attribute is of type 'STRING' or 'TEXT' and add a case-insensitive search condition.
 * Helper function to process a model's attributes.
 * Iterate through the model's raw attributes and process each one.
 * Iterate through the attributes of the provided modelObj and process each one.
 * Check if the attribute has references to another model.
 * Find the referenced model in the list of models and process its attributes.
 * Return the generated search condition.
 * @param {string} filterKey - The search value to filter records by.
 * @param {object} modelObj - The Sequelize model object to apply the search condition to.
 * @returns {object} - A Sequelize search condition object that can be used in queries to filter records matching the search criteria.
**/

const globalSearch = async (filterKey, modelObj) => {
    if (!filterKey) return {};
    filterKey = (filterKey || '').replace(/\s+/g, ' ').trim();
    const search = { [Sequelize.Op.or]: [] };
    const processAttribute = (key, attribute, model) => {
        if (Attributes[attribute.field.toLowerCase()]) {
            return;
        }
        if (attribute.type.key === 'STRING' || attribute.type.key === 'TEXT') {
            search[Sequelize.Op.or].push({ [model ? `$${model}.${key}$` : key]: { [Sequelize.Op.iLike]: `%${filterKey}%` } });
        }
    };
    const processModelAttributes = (modelObject) => {
        Object.entries(modelObject.rawAttributes).forEach(([key, attribute]) => {
            processAttribute(key, attribute, modelObject.tableName);
        });
    };
    Object.entries(modelObj).forEach(([key, attribute]) => {
        processAttribute(key, attribute);
        if (attribute.references && attribute.references.model) {
            const matchedModel = Object.values(models).find(value => value && value['tableName'] === attribute.references.model);
            matchedModel && processModelAttributes(matchedModel);
        }
    });
    return search;
}

/**
 * This asynchronous function handles query parameters from a request and processes them to extract relevant information.
 * It is typically used in the context of a web server or API to filter and paginate data based on query parameters.
 * It performs the following tasks:
 * 1. Extracts the 'fetched' parameter from the request's query string.
 * 2. Parses the 'limit' and 'page' parameters for pagination or sets default values.
 * 3. Generates a filter query based on a 'searchKey' using a global search function.
 * 4. Removes the processed query parameters from the request object to prepare it for further processing.
 * @param req - The request object containing query parameters.
 * @param config - A configuration object that specifies the model and its attributes.
 * @param models - An object containing model definitions.
 * @returns An object with the processed data including 'fetched', 'limit', 'skip', and 'filterQuery'.
**/

const handleQueryParams = async (req) => {
    const { fetched } = req.query;
    let limit = null;
    let skip = null;
    if (!fetched && (fetched !== 'all' && fetched !== 'All')) {
        limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        skip = (page - 1) * limit;
    }
    delete req.query.fetched;
    delete req.query.limit;
    delete req.query.page;
    return { fetched, limit, skip };
}

/**
 * It takes a model, a condition, and a newItem, and either creates a new item or updates an existing
 * one
 * @param model - The model you want to update or create
 * @param condition - {where: {id: 1}}
 * @param newItem - The object you want to create or update.
 * @param [transaction=false] - Sequelize transaction object
 */
const updateOrCreate = (model, condition, newItem, transaction = false) => {
    // First try to find the record
    condition = !condition.hasOwnProperty('where') ? { where: condition } : condition;
    return new Promise(async (resolve, reject) => {
        model
            .findOne(condition)
            .then(function (foundItem) {
                if (!foundItem) {
                    if (model.name == 'ngo_profile') {
                        const constVar = global._const;
                        newItem['isActive'] = constVar.isActive.false;
                    }
                    // Item not found, create a new one
                    model
                        .create(newItem, transaction)
                        .then(function (item) { return resolve(item); }).catch(function (error) {
                            reject(error);
                        });
                } else {
                    if (newItem.createdBy) {
                        delete newItem['createdBy'];
                    }

                    newItem['updatedAt'] = new Date();
                    // Found an item, update it
                    condition['transaction'] = transaction;
                    return model
                        .update(newItem, condition)
                        .then(async function (item) {
                            const findData = await model.findOne(condition);
                            resolve(findData);
                        }).catch(function (error) {
                            reject(error);
                        });
                }
            }).catch(err => {
                reject(err);
            })
    })
}

/**
 * It takes a model, a condition and a newItem, and returns a promise that resolves to the updated
 * item.
 * @param model - The model you want to update
 * @param condition - {where: {id: 1}}
 * @param newItem - The new item to be updated
 * @returns A promise.
 */
const findAndUpdate = async (model, condition, newItem) => {
    // First try to find the record
    let where = condition.hasOwnProperty('where') ? condition.where : condition;
    let attributes = condition.hasOwnProperty('attributes') ? condition.attributes : ['*'];
    return new Promise((resolve, reject) => {
        model
            .findOne({ where })
            .then(async function (foundItem) {
                if (!foundItem) {
                    reject("Error while getting data for update");
                } else {
                    newItem['updatedAt'] = new Date();
                    model.update(newItem, condition).then(async function (item) {
                        const d = await model.findOne({ where, attributes, raw: true });
                        resolve(d);
                    }).catch(function (error) {
                        reject(error);
                    });
                }
            }).catch(err => {
                reject(err);
            })
    })
}

/**
 * It creates a new item in the database using the model provided and returns the item created.
 * @param model - The model you want to create the new item in.
 * @param newItem - The object you want to create
 * @param [transaction=false] - This is the transaction object that is passed to the function.
 * @returns A promise.
 */
const create = async (model, newItem, transaction = false) => {
    return new Promise((resolve, reject) => {
        model.create(newItem, transaction).then(function (item) {
            resolve(item);
        }).catch(function (error) {
            reject(error);
        });
    });
}

const createOrUpdateData = async (modelName, condition, body, loginId, t) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = null;
            if (Object.keys(condition).length > 0) {
                data = await modelName.findOne({ where: { ...condition }, raw: true });
            }
            const { transaction } = t ? { transaction: t } : {};
            if (data) {
                const updatedBody = {
                    updated_by: loginId,
                    updated_at: new Date(),
                    ...body,
                };
                let [affectedRows, [updatedRecord]] = await modelName.update(updatedBody, { where: condition, individualHooks: true, ...transaction });
                data = updatedRecord;
            } else {
                const newBody = {
                    createdBy: loginId || null,
                    ...body,
                };
                data = await modelName.create(newBody, { transaction });
            }
            resolve(data);
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * It takes a model and a condition and returns a promise that resolves to the result of the
 * model.destroy(condition) call.
 * @param model - The data you want to delete from model
 * @param condition - {
 * @returns A promise that resolves to the result of the delete operation.
 */
const deleteRecord = async (model, condition) => {
    return new Promise((resolve, reject) => {
        model.destroy(condition).then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * It takes a model, an array of objects, and a transaction object (optional) and returns a promise
 * that resolves with the response from the bulkCreate function.
 * @param model - The model you want to create the new item in.
 * @param newItem - is an array of objects
 * @param [transaction=false] - This is the transaction object that you get from the
 * sequelize.transaction() function.
 * @returns The response is an array of objects.
 */
const bulkCreate = async (model, newItem, transaction = false) => {
    return new Promise((resolve, reject) => {
        model.bulkCreate(newItem, transaction)
            .then(function (response) {
                resolve(response);
            })
            .catch(function (error) {
                reject(error);
            })
    });
}

/**
 * It fetches data from a database using sequelize.
 * @param model - The model you want to query
 * @param condition - { where , attributes, skip, limit, order }
 * @param _cb - callback function
 */
const findAll = async (model, condition, mapper = []) => {
    // First try to find the record
    condition['raw'] = !condition.hasOwnProperty('raw') ? true : condition['raw'];
    return new Promise((resolve, reject) => {
        try {
            model
                .findAndCountAll(condition)
                .then(function (foundItem) {
                    if (!foundItem) {
                        // Item not found
                        resolve("Error while getting data");
                    } else {
                        if (foundItem.length && mapper.length) {
                            getMapperdata(foundItem, mapper).then(result => {
                                resolve(result);
                            }).then(err => {
                                reject(err);
                            })
                        } else {
                            resolve(foundItem);
                        }
                    }
                }).catch(err => {
                    console.log(err)
                    reject(err);
                })
        } catch (err) {
            reject(err);
        }
    })
}

/**
 * It takes a model, a condition, and a mapper, and returns a promise that resolves to the found item,
 * or an error.
 * @param model - The model you want to query
 * @param condition -  { where , attributes, skip, limit, order }
 * @param [mapper] - [{
 * @returns A promise.
 */
const findOne = async (model, condition, mapper = []) => {
    // First try to find the record
    condition['raw'] = !condition.hasOwnProperty('raw') ? true : condition['raw'];
    return new Promise((resolve, reject) => {
        try {
            model
                .findOne(condition)
                .then(function (foundItem) {
                    if (!foundItem) {
                        // Item not found
                        resolve({});
                    } else {
                        if (mapper.length) {
                            getMapperdata(foundItem.hasOwnProperty('dataValues') ? foundItem.dataValues : foundItem, mapper).then(result => {
                                resolve(result);
                            }).then(err => {
                                reject(err);
                            })
                        } else {
                            resolve(foundItem);
                        }
                    }
                }).catch(err => {
                    reject(err);
                })
        } catch (err) {
            reject(err);
        }
    })
}

/**
 * It takes a model, a condition, and a mapper, and returns a promise that resolves to the found item,
 * or an error.
 * @param model - The model you want to query
 * @param condition -  { where , skip, limit }
 * @param [mapper] - [{
 * @returns A promise.
 */
const countRecord = async (model, condition) => {
    // First try to find the record
    return new Promise(async (resolve, reject) => {
        try {
            const count = await model.count(condition);
            resolve(count);
        } catch (err) {
            reject(err);
        }
    })
}

/**
 * It takes a parent record and a mapper object and returns a promise that resolves to the parent
 * record with the mapper data added to it.
 * @param parentRecord - The parent record that you want to map the data to.
 * @param mapper - [{model: 'modelName', where: {}, for: 'fieldName'}]
 * @returns [
 *   {
 *     "id": 1,
 *     "name": "John",
 *     "age": "20",
 *     "address": "New York",
 *     "hobbies": [
 *       {
 *         "id": 1,
 *         "name": "Swimming"
 *       },
 */
const getMapperdata = async (parentRecord, mapper) => {
    return await new Promise((resolve, reject) => {
        let setIndex = Array.isArray(parentRecord) ? true : 0;
        let parentData = Array.isArray(parentRecord) ? parentRecord : [parentRecord];
        let i = 0;
        let totalLeng = parentData.length * mapper.length;
        for (let first of parentData) {
            first = first.hasOwnProperty('dataValues') ? first.dataValues : first
            for (const obj of mapper) {
                let condition = {};
                if (!obj.where) {
                    condition['where'] = { [obj['attributes'][0]]: first.id };
                } else {
                    condition = {
                        where: obj.where
                    };
                }
                if (obj.attributes) {
                    condition['attributes'] = obj.attributes;
                }

                if (obj.include) {
                    condition['include'] = obj.include;
                }
                condition['nest'] = condition['raw'] = true;
                findAll(modelObj[obj.model], condition).then(result => {
                    i++;
                    first[obj.for] = result.map(l => {
                        return l.data ? l.data : l;
                    });
                    if (totalLeng == i) {
                        resolve(setIndex ? parentData : parentData[setIndex]);
                    }
                }).catch(err => {
                    reject(err);
                });
            }
        }
    });
}

/**
 * It takes a model, a parentId, and a transaction, and then it deletes all the records in the mapper
 * table that match the parentId, and then it creates new records in the mapper table based on the data
 * in the mapperArr.
 * @param req - The request object
 * @param model - The model name
 * @param parentId - {id: 1}
 * @param transaction - Sequelize transaction object
 * @returns [
 *   {
 *     "id": 1,
 *     "createdAt": "2019-07-03T07:00:00.000Z",
 *     "updatedAt": "2019-07-03T07:00:00.000Z",
 *     "mapperId": 1,
 *     "mapperType": "mapper",
 *     "
 */
const createAndUpdateMappertable = async (req, model, parentId, transaction) => {
    // First try to find the record
    return new Promise(async (resolve, reject) => {
        let mapperArr = req.body.mapperArr;

        await new Promise(async (res, rej) => {
            let i = 0;
            let successArr = [];
            await model.destroy({ where: parentId, transaction }).then(async function () {
                if (mapperArr.length > 0) {
                    for (const d of mapperArr) {
                        modifyObject(d, parentId, model).then(async (data) => {
                            if (!data.hasOwnProperty('error')) {
                                if (req.user) {
                                    data['createdBy'] = req.user.id;
                                    data['lastUpdatedBy'] = req.user.id;
                                }
                                await mapper.post.create(model.name, data, transaction).then((item) => {
                                    i++;
                                    successArr.push(item);
                                    if (mapperArr.length === i) {
                                        res(successArr);
                                    }
                                }).catch(err => rej(err));
                            } else {
                                rej(data);
                            }
                        }).catch(err => rej(err));
                    }
                } else {
                    res(true);
                }
            }).catch(err => rej(err));
        })
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}

/**
 * It takes a model name, a parentId, and a data object, and returns a new object with the parentId and
 * the data object merged together.
 * @param d - the value of the dropdown
 * @param parentId - {
 * @param model - {
 * @returns {
 *     id: 1,
 *     childId: 2
 * }
 */
const modifyObject = async (data, parentId, model) => {
    let newObj = {
        ...parentId,
    };
    let errObj = {
        error: true,
        message: "Error while getting model field."
    }
    return new Promise((resolve, reject) => {
        switch (model.name) {
            case 'profile_engagement_mapper':
                Object.assign(newObj, { engagementId: data });
                break;
            default:
                Object.assign(newObj, errObj);
                reject(newObj);
                break;
        }
        resolve(newObj);
    });
}

/* Checking if the email is valid or not. */
const validateEmail = (mail) => {
    if (
        mail &&
        /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(mail)
    ) {
        return true;
    }
    return false;
};

/* Checking if the input is a 10 digit number. */
const validatePhoneNumber = (contactNo) => {
    if (!contactNo.hasOwnProperty('countryCode')) {
        var phoneno = /^\d{10}$/;
        if (contactNo && contactNo.match(phoneno)) {
            return true;
        } else {
            return false;
        }
    } else {
        let codeWithNumber = contactNo.countryCode + ' ' + contactNo.number;
        let checkIsValid = phone(codeWithNumber);
        return checkIsValid.isValid;
    }
};

const validatePanCardNumber = (pancardNo) => {
    let txtPANCard = pancardNo.toUpperCase();
    var regex = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/;
    if (regex.test(txtPANCard)) {
        let splitPanCard = txtPANCard.split("");
        // The fourth character is based on the category of the PAN Holder
        // Total fourth character list - "P","C","H","A","B","G","J","L","F","T"
        const fourthCharacterList = ["C", "A", "B", "G", "L", "F", "T"]; // Remove P,H,J as It's not for our related categories which need to register pancard verification
        // Match 4th character for validate 
        if (fourthCharacterList.includes(splitPanCard[3])) {
            return { status: true, msg: "Success" };
        } else {
            return { status: false, msg: "Invalid pancard category request." };
        }
    } else {
        return { status: false, msg: "Invalid pancard string." };
    }
}

/**
 * It takes the query parameters from the request and creates a condition object that can be used to
 * filter the results
 * @param req - the request object
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 */
const filterBind = (req, res, next) => {
    let apiURL = req.originalUrl.replace(`${req.baseUrl}/`, "");
    let condition = {}
    if (req.query) {
        if (req.query.name) {
            req.query.name = { [Op.like]: `%${req.query.name}%` };
        }
        if (req.query.type) {
            req.query.type = { [Op.like]: `%${req.query.type}%` };
        }
        if (req.query.title) {
            req.query.title = { [Op.like]: `%${req.query.title}%` };
        }
    }
    if (apiURL.includes('glossary/list') || apiURL.includes('user/glossary')) {
        condition.order = [['term', 'ASC']];
    } else if (apiURL.includes('impactstories/list') || apiURL.includes('user/impactstories')) {
        condition.order = [['id', 'DESC']];
    } else {
        condition['order'] = [
            ['id', 'ASC']
        ]
    }
    req.condition = condition;
    next();
};

/**
 * It makes an API call to the specified URL and returns the response.
 * @param options - The options object that is passed to the request.post() function.
 * @param cb - Callback function to be called when the API call is complete.
 */
async function apiCall(options, cb) {
    cb(await new Promise((resolve) => {
        request(options, (err, response, body) => {
            resolve(body);
        });
    }).then(data => {
        return data;
    }));
}

/**
 * It loops through the object and if it finds a key, it sets the isEmpty variable to false and breaks
 * out of the loop.
 * @param object - The object to check if it's empty.
 * @returns true
 */
const isObjectEmpty = (object) => {
    var isEmpty = true;
    for (const keys in object) {
        isEmpty = false;
        break; // exiting since we found that the object is not empty
    }
    return isEmpty;
}

/**
 * Given a year and a month, return the number of days in that month.
 * @param year - The year you want to get the days in month for.
 * @param month - The month to get the days for.
 */
const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

/**
 * It takes a date and adds a number of months to it, returning a new date
 * @param input - The date you want to add months to.
 * @param months - The number of months to add.
 * @returns A new date object with the same day of the month as the input date, but with the month
 * incremented by the number of months specified.
 */
const addMonths = (input, months) => {
    const date = new Date(input)
    date.setDate(1)
    date.setMonth(date.getMonth() + months)
    date.setDate(Math.min(input.getDate(), getDaysInMonth(date.getFullYear(), date.getMonth() + 1)))
    return date;
}
/**
 * It takes a date, adds 5 hours and 30 minutes to it, and returns the new date
 * @param date - The date you want to convert.
 * @returns The date is being returned with 5 hours and 30 minutes added to it.
 */
const getDate = (date) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    return d;
};
/**
 * This is a middleware function that checks if the user is logged in or not.
 * If the user is logged in,then it will call the next function.
 * If the user is not logged in, then it will return the response.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const verifyUserIsLoggedIn = async (req, res, next) => {
    if (req.headers.hasOwnProperty('x-access-token')) {
        next();
    } else {
        return res.Ok([], 'Register successfully.');
    }
}

/**
 * If the request has a header called x-access-token and it's not empty, then set the
 * shouldSkipVerifyToken property to false (Means token verification not to be skip otherwise verification should be skip). Otherwise, set it to true.
 * @param req - The request object
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 */
const shouldSkipVerifyToken = async (req, res, next) => {
    if (req.headers.hasOwnProperty('x-access-token') && req.headers['x-access-token'] != '') {
        req.shouldSkipVerifyToken = false;
        next();
    } else {
        req.shouldSkipVerifyToken = true;
        next();
    }
}

const checkRequiredFields = (requiredKeys, body) => {
    for (const key of requiredKeys) {
        if (!(key in body)) {
            return false;
        }
    }
    return true;
}

const profilePercentage = (user) => {
    const requiredFields = [
        'email',
        'facility_name',
        'facility_owner_name',
        'facility_owner_mobile',
        'pincode',
        'state_name',
        'district_name',
        'block_name',
        'address',
        'email_user_manyata',
        'mobile',
        'find_manyata',
        'hospital_type',
        'is_hospital_reg_nhp',
        'num_bed_facility',
        'num_obgyn_bed',
        'avg_num_delivery_month',
        'practicing_obg',
        'facility_reg_dha',
        'casuality_ot',
        'is_laboratory',
        'is_staratization',
        'is_cea',
        'shop_estb_act',
        'mou_with_coll_agency',
        'is_lisc_spcb',
        'is_pcpndt_reg',
        'num_obgyn_doctor',
        'num_nurse_anm',
        'num_nurse_gnm',
        'is_nabh',
        'is_pmjy',
        'other_accred_certificate',
        'know_similar_hosp_network'
    ];
    //Some skip logic added...
    if (user["find_manyata"] == "2") requiredFields.push('ref_cse_id');
    if (user["is_hospital_reg_nhp"] == SELECT.YES) requiredFields.push('nhp_id');
    if (user["other_accred_certificate"] == SELECT.YES) requiredFields.push('specify_accred_certificate');
    if (user["know_similar_hosp_network"] == SELECT.YES) requiredFields.push('can_we_contact');

    let filledFields = requiredFields.filter(field => user[field]).length;
    let profilePercentage = Math.round((filledFields / requiredFields.length) * 90);
    return profilePercentage;
}

/**
Transforms the values of specified keys in the given data object based on the provided option data.
@param {Array} sortKeys - An array of keys to be processed.
@param {Object} dataObj - The data object whose values need to be transformed.
@param {Array} optionData - An array of options data used for transformation.
@returns {Object} - The data object with transformed values for the specified keys.
*/
const getOptionValue = async (sortKeys, dataObj, optionData) => {
    if (sortKeys.length > 0) {
        for (let index = 0; index < sortKeys.length; index++) {
            const key = sortKeys[index];
            if (dataObj.hasOwnProperty(key) && dataObj[key]) {
                const keyValue = dataObj[key].split(',');
                const mainArr = keyValue.map(val => {
                    const dk = optionData.find(e => e.op_id == val && e.sort_key == key);
                    return dk ? dk.label : '';
                });
                dataObj[key] = mainArr.join(',');
            }
        }
    }
    return dataObj;
};
/**
 * Change the keys in the given elem object based on the defined key mapping.
 * @param {Object} req - The request object.
 * @param {Object} elem - The object whose keys need to be changed.
 * @returns {Object} - The modified elem object with changed keys.
 */
const changeFields = (req, elem) => {
    // Define the key mapping
    const keyMap = {
        facility_name: 'Facility Name',
        facility_salutation: 'Salutation',
        email: 'Email',
        mobile: 'Mobile',
        address: 'Address',
        state_name: 'State',
        district_name: 'District',
        block_name: 'Block',
        find_manyata: 'Find Manyata',
        pincode: 'Pincode',
        facility_owner_name: 'Owner Name',
        facility_owner_mobile: 'Owner Mobile',
        email_user_manyata: 'Email Manyata',
        hospital_reg_num: 'Registration Number',
        hospital_type: 'Hospital Type',
        is_hospital_reg_nhp: 'Hospital Reg. NHP',
        nhp_id: 'NHP Id',
        num_bed_facility: 'Number Bed Facility',
        num_obgyn_bed: 'Number OBGYN Bed',
        avg_num_delivery_month: 'Avg Number Delivery In Month',
        practicing_obg: 'Practicing Obg',
        facility_reg_dha: 'Facility Reg. Dha',
        casuality_ot: 'Casuality OT',
        is_laboratory: 'Laboratory',
        is_staratization: 'Staratization',
        is_cea: 'CEA',
        mou_with_coll_agency: 'MOU With Coll Agency',
        shop_estb_act: 'Shop Estb. Act',
        is_lisc_spcb: 'Liscence With SPCB',
        is_pcpndt_reg: 'PCPNDT Registration',
        num_obgyn_doctor: 'Number Of OBGYN Doctor',
        num_nurse_anm: 'Number Of Nurse ANM',
        num_nurse_gnm: "Number Of Nurse GNM",
        is_nabh: 'NABH',
        is_pmjy: 'PMJY',
        other: 'Other',
        know_similar_hosp_network: 'Know Similar Hospital Network',
        can_we_contact: 'Can We Connect',
        other_accred_certificate: 'Other Accred Certificate',
        specify_accred_certificate: 'Specify Accred Certificate',
        ref_cse_name: 'Ref. CSE Name',
        profile_completion: 'Profile Percentage',
        amount_approved: 'Amount Approved',
        created_at: 'Registration Date'
    };

    if (req.query.fromDashboard) {
        keyMap['profile_completed'] = 'Profile Completed';
        keyMap['payment_completed'] = 'Payment Completed';
    }

    for (let key in elem) {
        if (keyMap[key]) {
            elem[keyMap[key]] = elem[key];
            delete elem[key];
        }
    }
    return elem;
}

// Function to get the id from a list having a specific name
const getIdForlist= (list,name) => {
    
    let foundObject = list.find(obj => obj.name === name);
    if (foundObject) {
        return foundObject.id;
    } else {
        return null;
    }
}

// Function to convert date format
function convertDateFormat(dateString) {
    const parts = dateString.split("/");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  

module.exports = {
    convertDateFormat,
    getIdForlist,
    updateOrCreate,
    validatePhoneNumber,
    validateEmail,
    findAndUpdate,
    findAll,
    filterBind,
    apiCall,
    isObjectEmpty,
    createAndUpdateMappertable,
    create,
    bulkCreate,
    findOne,
    countRecord,
    addMonths,
    getDate,
    deleteRecord,
    verifyUserIsLoggedIn,
    shouldSkipVerifyToken,
    validatePanCardNumber,
    checkRequiredFields,
    profilePercentage,
    getOptionValue,
    changeFields,
    createOrUpdateData,
    globalSearch,
    handleQueryParams,
};
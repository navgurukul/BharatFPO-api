const fs = require('fs');
const csv = require('csv-parser');
const Models = require('../dbConnection')

module.exports = async function (req, res, next) {
    let arraData = [];
    fs.createReadStream(req.file.path).pipe(csv({})).on('data', (data) => {
        arraData.push(data)
    }).on('end', async () => {
        req['listData'] = arraData;
        next();
    })
}

module.exports.dataUpload = async function (req, res, next) {
    try {
        if (req.listData && req.listData.length) {
            let data = await bulkUpload(req.listData, req);
            return res.Ok({}, "Upload successfully");
        } else {
            return res.BadRequest({}, "Something went wrong!");
        }
    } catch (error) {
        console.log(error);
        return res.BadRequest({}, "Something went wrong!");
    }
}

const bulkUpload = async (listData, req) => {
    let results = [];
    for (const pf of listData) {
        try {
            let existingUser = await Models['user'].findOne({ where: { email: pf.email } });
            let result;
            if (existingUser) {
                result = await Models['user'].update(pf, { where: { email: pf.email } });
            } else {
                pf['role_id'] = 2;
                result = await Models['user'].create(pf);
            }
            results.push(result);
        } catch (error) {
            console.log(pf);
            console.log(`Error creating/updating user with email ${pf.email}: ${error}`);
            results.push({ error: error.toString() });
        }
    }
    return results;
};

// const axios = require('axios');

// const bulkUpload = async (listData, req) => {
//     let results = [];
//     const pincodeCache = {};
//     for (const pf of listData) {
//         try {
//             let existingUser = await Models['user'].findOne({ where: { email: pf.email } });
//             let result;
//             const { Pincode } = pf;
//             let blockName = pincodeCache[Pincode];
//             if (!blockName) {
//                 const { data } = await axios.get(`https://api.postalpincode.in/pincode/${Pincode}`);
//                 blockName = data[0].PostOffice[0].Block;
//                 pincodeCache[Pincode] = blockName;
//             }
//             if (existingUser) {
//                 result = await Models['user'].update({ ...pf, block_name: blockName }, { where: { email: pf.email } });
//             } else {
//                 pf['role_id'] = 2;
//                 result = await Models['user'].create({ ...pf, block_name: blockName });
//             }
//             results.push(result);
//         } catch (error) {
//             console.log(pf);
//             console.log(`Error creating/updating user with email ${pf}: ${error}`);
//             results.push({ error: error.toString() });
//         }
//     }
//     return results;
// };


/**
 * Create a new object by copying the old object and then modifying the new object
 * @param oldObj - The object to be modified.
 * @returns The new object with the modified values.
 */
// async function modifyObject(oldObj) {
//     try {
//         let where = { code: oldObj['languageId'] };
//         let body = { name: oldObj['languageId'], code: oldObj['languageId'] };
//         await findOne(language, { where }).then(async (res) => {
//             if (res && Object.keys(res).length === 0) {
//                 await create(language, body).then(sucessRes => {
//                     oldObj['languageId'] = sucessRes.id;
//                 }).catch(err => {
//                     throw new Error('Error while create language.');
//                 });
//             } else {
//                 oldObj['languageId'] = res.id;
//             }
//         }).catch(err => {
//             throw new Error('Error while getting data page.');
//         });
//         let where1 = { code: oldObj['pageId'] };
//         let body1 = { name: oldObj['pageId'], code: oldObj['pageId'] };
//         await findOne(page, { where: where1 }).then(async (res) => {
//             if (res && Object.keys(res).length === 0) {
//                 await create(page, body1).then(sucessRes => {
//                     oldObj['pageId'] = sucessRes.id;
//                 }).catch(err => {
//                     throw new Error('Error while create language.');
//                 });
//             } else {
//                 oldObj['pageId'] = res.id;
//             }
//         }).catch(err => {
//             throw new Error('Error while getting data page.');
//         });
//         return oldObj;
//     } catch (error) {
//         let err = { message: error.message };
//         let obj = {
//             success: false,
//             message: error.message
//         }
//         Object.assign(obj, { err });
//         return obj;
//     }

// }


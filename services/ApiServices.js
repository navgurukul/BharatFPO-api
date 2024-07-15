const { findAll, create, deleteRecord, filterBind } = require('../routes/utils/common-function');
const models = require('./all-models');
const apiRoutes = require('express').Router();

/**
 * It takes a config object as an argument and returns a function that takes req and res as arguments.
 * @param config - {
 * @returns A function that returns a function
 * returns
 */
const callbackFn = (config) => {
    return async (req, res) => {
        try {
            switch (config.method) {
                case 'get':
                    get(req, res);
                    break;
                case 'post':
                    post(req, res);
                    break;
                case 'delete':
                    deleteData(req, res);
                    break;
                default:
                    break;
            }
        } catch (error) {
            return res.BadRequest(error, "CAUGHT EXCEPTION.", 401);
        }
    }

    /**
     * It takes the request object, and returns the response object.
     * @param req - The request object.
     * @param res - Express response object
     * @returns The result of the findAll function.
     */
    async function get(req, res) {
        let { query, body, headers, params } = req;
        let attributes = [];
        if (config.condition && config.condition.attributes && Object.keys(config.condition.attributes).length) {
            for (let key in config.condition.attributes) {
                if (body[config.condition.attributes[key]]) {
                    body[key] = body[config.condition.attributes[key]];
                    delete body[config.condition.attributes[key]];
                }
                if (query[config.condition.attributes[key]]) {
                    query[key] = query[config.condition.attributes[key]];
                    delete query[config.condition.attributes[key]];
                }
                if (params[config.condition.attributes[key]]) {
                    params[key] = params[config.condition.attributes[key]];
                    delete params[config.condition.attributes[key]];
                }
                if (key != config.condition.attributes[key]) {
                    if (key == 'all') {
                        if (config.condition.attributes[key] == true) {
                            attributes.push('*');
                        }
                    } else {
                        attributes.push([key, config.condition.attributes[key]]);
                    }
                } else {
                    attributes.push(key)
                }
            }
        }
        try {
            let where = { ...query, ...body, ...(config.condition.where) };
            let condition = {
                ...req.condition,
                where,
                attributes
            };
            let result = await findAll(models[config.model], condition)
            return res.Ok(result, "FETCHED DATA.");
        } catch (caughtErr) {
            return res.BadRequest(caughtErr, "CAUGHT EXCEPTION.", 401);
        }
    }

    /**
     * It takes a request and a response object, and then it tries to create a new object in the database.
     * If it succeeds, it returns a success message. If it fails, it returns an error message.
     * @param req - The request object.
     * @param res - The response object.
     * @returns The result of the create function is being returned.
     */
    async function post(req, res) {
        try {
            let obj = req.body;
            let result = await create(models[config.model], obj)
            return res.Ok(result, "CREATED SUCCESSFULLY.");
        } catch (err) {
            return res.BadRequest(err, "Error while saving the form.", 401);
        }
    }

    /**
     * It deletes a record from the database based on the query parameters passed in the request.
     * @param req - The request object.
     * @param res - The response object.
     * @returns a promise.
     */
    async function deleteData(req, res) {
        try {
            if (!req.query) throw new Error('Request parameter must be not empty.');
            let where = req.query;
            let data = await deleteRecord(models[config.model], { where });
            return res.Ok(data, "DELETE SUCCESSFULLY.");
        } catch (caughtErr) {
            return res.BadRequest(caughtErr, "CAUGHT EXCEPTION.", 401);
        }
    }
}

/**
 * A function that takes an array of objects as an argument. 
 * It then iterates over the array and creates routes for each object. 
*/
module.exports = (apis) => {
    for (let api of apis) {
        if (api.method == 'get')
            apiRoutes[api.method](api.endPoint, filterBind, callbackFn(api));
        else
            apiRoutes[api.method == 'delete' ? 'post' : api.method](api.endPoint, callbackFn(api));
    }
    return apiRoutes;
};
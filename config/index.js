exports = Sequelize = require('sequelize')
const Op = Sequelize.Op;
const operatorsAliases = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col
};
module.exports = {
    "superSecret": process.env.SUPERSECRET,
    "hostname": process.env.HOSTNAME,
    "S3BUCKET": {
        "DATA": {
            "production": process.env.AWS_IMG_BUCKET,
            "staging": process.env.AWS_IMG_BUCKET,
            "demo": process.env.AWS_IMG_BUCKET,
            "development": process.env.AWS_IMG_BUCKET
        },
        "IMAGE": {
            "production": process.env.AWS_IMG_BUCKET,
            "staging": process.env.AWS_IMG_BUCKET,
            "demo": process.env.AWS_IMG_BUCKET,
            "development": process.env.AWS_IMG_BUCKET
        }
    },
    "EMAILSEND": {
        host: process.env.EMAIL_HOST, // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: process.env.EMAIL_PORT, // port for secure SMTP
        tls: {
            ciphers: 'SSLv3'
        },
        "auth": {
            "user": process.env.EMAIL_USERNAME,
            "pass": process.env.EMAIL_PASSWORD
        }
    },
    db_operatorsAliases: operatorsAliases,
    internal_db_cred: {
        "development": {
            "host": process.env.DB_HOST,
            "user": process.env.USERS,
            "password": process.env.PASSWORD,
            "database": process.env.DATABASE
        },
        "staging": {
            "host": process.env.DB_HOST,
            "user": process.env.USERS,
            "password": process.env.PASSWORD,
            "database": process.env.DATABASE
        },
        "production": {
            "host": process.env.DB_HOST,
            "user": process.env.USERS,
            "password": process.env.PASSWORD,
            "database": process.env.DATABASE
        }
    },
    rateLimit:
    {
        windowMs: 1 * 60 * 1000, // 1 minutes
        max: 3
    },
    CAPTCHA: {
        SITE_KEY: process.env.SITE_KEY,
        SECRET_KEY: process.env.SECRET_KEY,
    },
}
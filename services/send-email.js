const nodemailer = require("nodemailer");
// const aws = require("aws-sdk");

// // create Nodemailer SES transporter...
// const transporter = nodemailer.createTransport({
//     SES: new aws.SES({
//         region: "ap-south-1",
//         accessKeyId: process.env.EMAIL_USERNAME,
//         secretAccessKey: process.env.EMAIL_PASSWORD,
//     }),
// });

// module.exports = async (mailOptions, cb) => {
//     try {
//         transporter.sendMail(mailOptions, cb ? cb : (error, info) => {
//             if (error) return console.log(error);
//             console.log("Message sent: %s", info.messageId);
//             return info.messageId;
//         });
//     } catch (error) {
//         console.log("Email sending error =====>", error);
//         return { status: false, error };
//     }
// };

module.exports = async (mailOptions, cb) => {
    try {
        var transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            secureConnection: false,
            port: process.env.EMAIL_PORT,
            tls: {
                ciphers: 'SSLv3'
            },
            "auth": {
                "user": process.env.EMAIL_USERNAME,
                "pass": process.env.EMAIL_PASSWORD
            }
        });
        transporter.sendMail(mailOptions, cb ? cb : (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log("Message sent: %s", info.messageId);
            return info.messageId;
        });
    } catch (error) {
        console.log("Email sending error =====>", error)
        return { status: false, error };
    }
};

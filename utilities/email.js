const nodemailer = require('nodemailer');
const path = require('path')
const process = require('process')
const ejs = require('ejs');
const { CustomError } = require('./CustomError');

let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST_SERVER,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})
// TODO ADD PROCESS.ENV
function emailUser(email, content) {

    ejs.renderFile(path.join(__dirname, `../views/${content.filename}`), { link: content.link }, (error, data) => {
        if (error) {
            throw new CustomError("error rendering ejs file " + error.message)
        }
        let message = {
            from: process.env.MAIL_USER,
            to: email,
            subject: content.subject,
            html: data
        };
        transporter.sendMail(message, (err) => {
            if (err) {
                throw new CustomError("error sending email")
            }
        });
    })
}

module.exports.emailUser = emailUser

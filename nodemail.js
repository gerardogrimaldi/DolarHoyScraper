var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: process.env.MAIL_USR,
        pass: process.env.MAIL_PASS
    }
});

var mailOptions = {
    from: "DolarHoy Server Scraper <grimaldi.gerardo@gmail.com>", // sender address
    to: "grimaldi.gerardo@gmail.com", // list of receivers
    subject: "", // Subject line
    text: "", // plaintext body
    html: "" // html body
};

exports.mailOptions = mailOptions;

exports.sendMail = function () {
    smtpTransport.sendMail(mailOptions, function(error, response){
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }
    });
};

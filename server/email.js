const nodeMailer = require("nodemailer");
let transporter = nodeMailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: "njzhch@gmail.com",

    pass: "XXXXXXXXXXXXXX",
  },
});

mailerSend = (defaultOptions) => {
  transporter.sendMail(defaultOptions, (err, info) => {
    if (err) {
      console.log(err);
    }
  });
  return;
};

module.exports = {
  mailerSend: mailerSend,
};

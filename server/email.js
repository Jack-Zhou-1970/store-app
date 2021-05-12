const nodeMailer = require("nodemailer");
/*let transporter = nodeMailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: "njzhch@gmail.com",

    pass: "njzhch544544",
  },
});*/

let transporter = nodeMailer.createTransport({
  host: "smtp.qq.com",
  secure: true,
  port: 465,
  auth: {
    user: "467466257@qq.com",

    pass: "ljkxswfaovarbija",
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

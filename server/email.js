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

/*let transporter = nodeMailer.createTransport({
  host: "smtp.qq.com",
  secure: true,
  port: 465,
  auth: {
    user: "467466257@qq.com",

    pass: "ljkxswfaovarbija",
  },
});*/

let transporter = nodeMailer.createTransport({
  host: "smtpdm-ap-southeast-1.aliyun.com",
  secureConnection: true,
  port: 465,
  auth: {
    user: "webmaster@worldtea.ca",

    pass: "NJzhch655655",
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

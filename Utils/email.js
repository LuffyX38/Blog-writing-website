const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  const transporter = nodemailer.createTransport({
    host: process.env.TRAP_HOST,
    port: process.env.TRAP_PORT,
    auth: {
      user: process.env.TRAP_USERNAME,
      pass: process.env.TRAP_PASSWORD,
    },
  });

  const mailOption = {
    from: "Zorojuro Ronin <ronin@gmail.com>",
    to: option.email,
    subject: option.subject,
    html: `<h3>${option.message}</h3>`,
  };

  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;

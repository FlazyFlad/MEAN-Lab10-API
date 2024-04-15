const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'itzel.schultz@ethereal.email',
        pass: 'JnM7JzrZ7WffK7k7Jv'
    }
});

async function sendNotification(email, subject, message) {
  try {
    await transporter.sendMail({
      from: 'Mailer Test <itzel.schultz@ethereal.email>',
      to: 'igorpak1337@gmail.com',
      subject: subject,
      text: message
    });
    console.log(`Уведомление отправлено на ${email}`);
  } catch (error) {
    console.error('Ошибка при отправке уведомления:', error);
  }
}

module.exports = sendNotification;

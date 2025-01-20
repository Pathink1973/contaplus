const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendRenewalReminder = async (user, subscription) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Lembrete de Renovação de Assinatura',
      html: `
        <h1>Olá ${user.name}!</h1>
        <p>Sua assinatura do serviço ${subscription.service_name} irá renovar em 3 dias.</p>
        <p>Valor: R$ ${subscription.amount}</p>
        <p>Data de renovação: ${subscription.renewal_date}</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
};

module.exports = { sendRenewalReminder }; 
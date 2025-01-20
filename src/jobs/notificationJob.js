const cron = require('node-cron');
const notificationController = require('../controllers/notificationController');
const pool = require('../config/database');

// Função para criar notificações para novas assinaturas
const createUpcomingNotifications = async () => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, renewal_date 
       FROM subscriptions 
       WHERE renewal_date > CURRENT_DATE 
       AND renewal_date <= CURRENT_DATE + INTERVAL '3 days'
       AND id NOT IN (
         SELECT subscription_id 
         FROM notifications 
         WHERE notification_date = CURRENT_DATE
       )`
    );

    for (const subscription of result.rows) {
      await notificationController.createNotification(
        subscription.id,
        subscription.user_id,
        subscription.renewal_date
      );
    }
  } catch (err) {
    console.error('Erro ao criar notificações futuras:', err);
  }
};

// Agendar tarefas
const scheduleJobs = () => {
  // Criar novas notificações todos os dias às 00:01
  cron.schedule('1 0 * * *', createUpcomingNotifications);
  
  // Processar notificações pendentes todos os dias às 08:00
  cron.schedule('0 8 * * *', notificationController.processNotifications);
};

module.exports = { scheduleJobs }; 
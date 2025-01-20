const pool = require('../config/database');
const { sendRenewalReminder } = require('../services/emailService');

const notificationController = {
  // Criar notificação para uma assinatura
  createNotification: async (subscription_id, user_id, notification_date) => {
    try {
      await pool.query(
        `INSERT INTO notifications 
         (subscription_id, user_id, notification_date) 
         VALUES ($1, $2, $3)`,
        [subscription_id, user_id, notification_date]
      );
    } catch (err) {
      console.error('Erro ao criar notificação:', err);
    }
  },

  // Processar notificações pendentes
  processNotifications: async () => {
    try {
      const result = await pool.query(
        `SELECT n.*, u.*, s.*
         FROM notifications n
         JOIN users u ON n.user_id = u.id
         JOIN subscriptions s ON n.subscription_id = s.id
         WHERE n.status = 'pending' 
         AND n.notification_date = CURRENT_DATE`
      );

      for (const row of result.rows) {
        const emailSent = await sendRenewalReminder(row, row);
        
        await pool.query(
          `UPDATE notifications 
           SET status = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [emailSent ? 'sent' : 'failed', row.id]
        );
      }
    } catch (err) {
      console.error('Erro ao processar notificações:', err);
    }
  }
};

module.exports = notificationController; 
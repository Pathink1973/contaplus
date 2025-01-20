import { subscriptionService } from '../services/subscriptionService';

const subscriptionController = {
  // Listar todas as assinaturas do usuário
  list: async (req, res) => {
    try {
      const subscriptions = await subscriptionService.getUserSubscriptions(req.user.id);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Criar nova assinatura
  create: async (req, res) => {
    try {
      const subscription = await subscriptionService.createSubscription(
        req.user.id,
        req.body
      );
      res.status(201).json(subscription);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Atualizar assinatura
  update: async (req, res) => {
    try {
      const subscription = await subscriptionService.updateSubscription(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Deletar assinatura
  delete: async (req, res) => {
    try {
      await subscriptionService.deleteSubscription(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Calcular total mensal
  getMonthlyTotal: async (req, res) => {
    try {
      const total = await subscriptionService.getMonthlyTotal(req.user.id);
      res.json({ total });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = subscriptionController;
import { supabase } from '../config/supabase'

export const subscriptionService = {
  async createSubscription(userId, subscriptionData) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: userId,
        service_name: subscriptionData.service_name,
        amount: subscriptionData.amount,
        renewal_date: subscriptionData.renewal_date,
        frequency: subscriptionData.frequency
      }])
      .select()

    if (error) throw error
    return data[0]
  },

  async getUserSubscriptions(userId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('renewal_date', { ascending: true })

    if (error) throw error
    return data
  },

  async updateSubscription(subscriptionId, userId, updateData) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        service_name: updateData.service_name,
        amount: updateData.amount,
        renewal_date: updateData.renewal_date,
        frequency: updateData.frequency,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .select()

    if (error) throw error
    return data[0]
  },

  async deleteSubscription(subscriptionId, userId) {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .eq('user_id', userId)

    if (error) throw error
    return true
  },

  async getMonthlyTotal(userId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('amount, frequency')
      .eq('user_id', userId)

    if (error) throw error

    return data.reduce((total, subscription) => {
      const amount = parseFloat(subscription.amount)
      return total + (subscription.frequency === 'yearly' ? amount / 12 : amount)
    }, 0)
  }
}

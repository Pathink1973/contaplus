const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

exports.handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    }
  }

  try {
    // Verificar token de autenticação
    const authHeader = event.headers.authorization
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Não autorizado' })
      }
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token inválido' })
      }
    }

    switch (event.httpMethod) {
      case 'GET':
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('renewal_date', { ascending: true })

        if (error) throw error

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        }

      case 'POST':
        const body = JSON.parse(event.body)
        const { data: newSubscription, error: createError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: user.id,
            service_name: body.service_name,
            amount: body.amount,
            renewal_date: body.renewal_date,
            frequency: body.frequency
          }])
          .select()

        if (createError) throw createError

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newSubscription[0])
        }

      case 'PUT':
        const { id } = event.queryStringParameters
        const updateBody = JSON.parse(event.body)
        const { data: updatedSubscription, error: updateError } = await supabase
          .from('subscriptions')
          .update({
            service_name: updateBody.service_name,
            amount: updateBody.amount,
            renewal_date: updateBody.renewal_date,
            frequency: updateBody.frequency,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()

        if (updateError) throw updateError

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedSubscription[0])
        }

      case 'DELETE':
        const { id: deleteId } = event.queryStringParameters
        const { error: deleteError } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', deleteId)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError

        return {
          statusCode: 204,
          headers
        }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Método não permitido' })
        }
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    }
  }
}

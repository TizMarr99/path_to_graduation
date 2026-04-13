import { isSupabaseConfigured, supabase } from './supabaseClient'

function createConfigurationError() {
  return new Error('Configura VITE_SUPABASE_URL e la chiave pubblica Supabase nel file .env.local.')
}

function mapRpcError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage
  }

  if (error.message === 'INVALID_CODE') {
    return 'Il codice personale non e corretto.'
  }

  if (error.message === 'FORBIDDEN') {
    return 'Non hai i permessi necessari per questa operazione.'
  }

  return fallbackMessage
}

async function callRpc(functionName, args, fallbackMessage) {
  if (!isSupabaseConfigured || !supabase) {
    throw createConfigurationError()
  }

  const { data, error } = await supabase.rpc(functionName, args)

  if (error) {
    error.userMessage = mapRpcError(error, fallbackMessage)
    throw error
  }

  return data
}

export async function appLogin(code) {
  return callRpc('app_login', { p_code: code }, 'Accesso non riuscito.')
}

export async function appGetSnapshot(code) {
  return callRpc('app_get_snapshot', { p_code: code }, 'Impossibile ripristinare la sessione.')
}

export async function appSaveSnapshot(code, progress, daily) {
  return callRpc(
    'app_save_snapshot',
    {
      p_code: code,
      p_progress: progress,
      p_daily: daily,
    },
    'Impossibile salvare il progresso.',
  )
}

export async function adminResetDailyLimits(adminCode, targetCode) {
  return callRpc(
    'admin_reset_daily_limits',
    { p_admin_code: adminCode, p_target_code: targetCode },
    'Impossibile azzerare i contatori giornalieri.',
  )
}

export async function adminResetPlayer(adminCode, targetCode) {
  return callRpc(
    'admin_reset_player',
    { p_admin_code: adminCode, p_target_code: targetCode },
    'Impossibile resettare il profilo.',
  )
}
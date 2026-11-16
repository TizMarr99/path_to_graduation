import { isSupabaseConfigured, supabase } from './supabaseClient'

function createConfigurationError() {
  return new Error(
    'Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (oppure VITE_SUPABASE_ANON_KEY) nelle variabili ambiente del client.',
  )
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

  if (error.message === 'ROOM_ARCHIVE_NOT_FOUND') {
    return 'Archivio della stanza non trovato.'
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

export async function appSaveRoomArchive(code, categoryId, archive) {
  return callRpc(
    'app_save_room_archive',
    {
      p_code: code,
      p_category_id: categoryId,
      p_archive: archive,
    },
    "Impossibile archiviare il dettaglio della stanza.",
  )
}

export async function appGetRoomArchive(code, categoryId) {
  return callRpc(
    'app_get_room_archive',
    {
      p_code: code,
      p_category_id: categoryId,
    },
    "Impossibile recuperare l'archivio della stanza.",
  )
}

export async function appClearRoomArchives(code) {
  return callRpc(
    'app_clear_room_archives',
    { p_code: code },
    'Impossibile eliminare gli archivi delle stanze.',
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

export async function appDeletePlayerState(accessCodeId) {
  if (!isSupabaseConfigured || !supabase) {
    throw createConfigurationError()
  }

  const [progressResult, dailyLimitsResult] = await Promise.all([
    supabase
      .from('player_progress')
      .delete()
      .eq('access_code_id', accessCodeId),
    supabase
      .from('player_daily_limits')
      .delete()
      .eq('access_code_id', accessCodeId),
  ])

  const deleteError = progressResult.error ?? dailyLimitsResult.error

  if (deleteError) {
    deleteError.userMessage = 'Impossibile eliminare il profilo dal database.'
    throw deleteError
  }

  return { ok: true }
}

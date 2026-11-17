import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import { ONLINE_MODE, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config'

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined'
const hash = isWeb ? window.location.hash || '' : ''

// Link do e-mail de "esqueci minha senha": o site abre com #...type=recovery.
// Lido aqui, antes do Supabase limpar o endereço, para o app abrir na tela de nova senha.
export const recoveryFromUrl = /type=recovery/.test(hash)
// Link vencido ou já usado: o Supabase devolve #error_code=otp_expired
export const linkErrorFromUrl = /error_code=/.test(hash)

// Endereço para onde o link do e-mail leva (a versão web publicada)
export const RESET_REDIRECT = isWeb ? window.location.origin + window.location.pathname : 'https://caiogomiss.github.io/PetCare/'

export const sb = ONLINE_MODE
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: isWeb,
        flowType: 'implicit',
      },
    })
  : null

// Cores, espaçamentos e fontes do app, tirados dos protótipos.
import { Platform } from 'react-native'

export const colors = {
  primary: '#13A08F',
  primaryDark: '#0C7C6F',
  primarySoft: '#E4F6F3',
  primaryBorder: '#9AD9D0',

  text: '#173A56',
  textMuted: '#5E7387',
  textLight: '#93A3B3',
  textInverse: '#FFFFFF',

  bg: '#F7F9FC',
  card: '#FFFFFF',
  border: '#E3E9F0',
  divider: '#D5DDE6',

  warning: '#B97300',
  warningSoft: '#FFF3D1',
  danger: '#D64545',
  dangerSoft: '#FDE8E8',
  info: '#2F6FD6',
  infoSoft: '#E6EFFD',

  // Atalhos da tela inicial
  tileServicos: '#E3F6F4',
  tileCarteirinha: '#FFF9D6',
  tileAlertas: '#FFE7EC',
  tileOngs: '#E6F8E2',
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 }

export const font = {
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semibold: 'Lexend_600SemiBold',
  bold: 'Lexend_700Bold',
}

export const fontSize = { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26 }

export const shadow = Platform.select({
  ios: { shadowColor: '#173A56', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10 },
  android: { elevation: 2 },
  default: { boxShadow: '0 4px 14px rgba(23,58,86,0.06)' },
})

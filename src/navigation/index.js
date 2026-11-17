// Navegação: abas (Início, Serviços, Carteirinha, Perfil) + telas empilhadas por cima.
import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { colors, font } from '../theme'

import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'
import NewPasswordScreen from '../screens/auth/NewPasswordScreen'
import HomeScreen from '../screens/HomeScreen'
import ServicesScreen from '../screens/services/ServicesScreen'
import PlaceDetailScreen from '../screens/services/PlaceDetailScreen'
import WalletScreen from '../screens/wallet/WalletScreen'
import PetFormScreen from '../screens/wallet/PetFormScreen'
import RecordFormScreen from '../screens/wallet/RecordFormScreen'
import RemindersScreen from '../screens/wallet/RemindersScreen'
import ReminderFormScreen from '../screens/wallet/ReminderFormScreen'
import AlertsScreen from '../screens/alerts/AlertsScreen'
import AlertFormScreen from '../screens/alerts/AlertFormScreen'
import AlertDetailScreen from '../screens/alerts/AlertDetailScreen'
import GuidesScreen, { GuideDetailScreen } from '../screens/guides/GuidesScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'
import ProfileEditScreen from '../screens/profile/ProfileEditScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.primary, text: colors.text } }

const stackOptions = {
  headerTintColor: colors.primary,
  headerTitleStyle: { fontFamily: font.semibold, color: colors.text, fontSize: 18 },
  headerStyle: { backgroundColor: colors.bg },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.bg },
}

const TAB_ICONS = { Inicio: 'home', Servicos: 'search', Carteirinha: 'file-text', Perfil: 'user' }

function Tabs() {
  const insets = useSafeAreaInsets()
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 68 + insets.bottom, paddingTop: 8, paddingBottom: insets.bottom + 8 },
        tabBarIcon: ({ color, size }) => <Feather name={TAB_ICONS[route.name]} size={size - 2} color={color} />,
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Servicos" component={ServicesScreen} options={{ title: 'Serviços' }} />
      <Tab.Screen name="Carteirinha" component={WalletScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function RootNavigator() {
  const { user, loading, recovery } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={stackOptions}>
        {recovery ? (
          <Stack.Screen name="NewPassword" component={NewPasswordScreen} options={{ headerShown: false }} />
        ) : !user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: '' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: '' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} options={{ title: 'Detalhes' }} />
            <Stack.Screen name="PetForm" component={PetFormScreen} options={{ title: 'Pet' }} />
            <Stack.Screen name="RecordForm" component={RecordFormScreen} options={{ title: 'Registro' }} />
            <Stack.Screen name="Reminders" component={RemindersScreen} options={{ title: 'Lembretes' }} />
            <Stack.Screen name="ReminderForm" component={ReminderFormScreen} options={{ title: 'Lembrete' }} />
            <Stack.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alertas' }} />
            <Stack.Screen name="AlertForm" component={AlertFormScreen} options={{ title: 'Novo alerta' }} />
            <Stack.Screen name="AlertDetail" component={AlertDetailScreen} options={{ title: 'Alerta' }} />
            <Stack.Screen name="Guides" component={GuidesScreen} options={{ title: 'Orientações' }} />
            <Stack.Screen name="GuideDetail" component={GuideDetailScreen} options={{ title: 'Orientação' }} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ title: 'Meus dados' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

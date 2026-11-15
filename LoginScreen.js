// UC02: Login
import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Screen from '../../components/Screen'
import { Button, FormError, Input, Muted, PasswordInput, Title } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { MSG } from '../../constants/messages'
import { isValidEmail } from '../../lib/format'
import { colors, font, fontSize, radius, spacing } from '../../theme'

export default function LoginScreen({ navigation, route }) {
  const { signIn, onlineMode } = useAuth()
  const [email, setEmail] = useState(route.params?.email || '')
  const [senha, setSenha] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(route.params?.notice || '')
  const [loading, setLoading] = useState(false)

  // Volta do cadastro com aviso (ex.: confirmar e-mail)
  useEffect(() => {
    if (route.params?.email) setEmail(route.params.email)
    if (route.params?.notice) setFormError(route.params.notice)
  }, [route.params?.email, route.params?.notice])

  async function submit() {
    const e = {}
    if (!email.trim()) e.email = 'Informe seu e-mail.'
    else if (!isValidEmail(email)) e.email = 'E-mail inválido.'
    if (!senha) e.senha = 'Informe sua senha.'
    setErrors(e)
    if (Object.keys(e).length) {
      setFormError(MSG.MSG09)
      return
    }
    setFormError('')
    setLoading(true)
    try {
      await signIn({ email, senha })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Feather name="heart" size={30} color={colors.textInverse} />
        </View>
        <Text style={styles.brandName}>PetCare</Text>
        <Muted style={{ textAlign: 'center' }}>Saúde e cuidados do seu pet em um só lugar.</Muted>
      </View>

      <Title style={{ fontSize: 22, marginBottom: spacing.lg }}>Entrar</Title>
      <FormError text={formError} />

      <Input
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        icon="mail"
        placeholder="seuemail@exemplo.com"
        returnKeyType="next"
      />
      <PasswordInput label="Senha" value={senha} onChangeText={setSenha} error={errors.senha} icon="lock" placeholder="Sua senha" onSubmitEditing={submit} returnKeyType="go" />

      <Button title="Entrar" onPress={submit} loading={loading} style={{ marginTop: spacing.sm }} />

      <Pressable onPress={() => navigation.navigate('Register')} style={styles.switch} accessibilityRole="button">
        <Text style={styles.switchText}>
          Ainda não tem conta? <Text style={{ color: colors.primary, fontFamily: font.semibold }}>Cadastre-se</Text>
        </Text>
      </Pressable>

      {!onlineMode ? (
        <View style={styles.localNote}>
          <Feather name="smartphone" size={14} color={colors.textMuted} />
          <Muted style={{ flex: 1, fontSize: fontSize.xs }}>Modo local: os dados ficam salvos só neste aparelho.</Muted>
        </View>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xxl },
  logo: { width: 68, height: 68, borderRadius: radius.xl, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  brandName: { fontFamily: font.bold, fontSize: 28, color: colors.text, marginBottom: 4 },
  switch: { alignItems: 'center', paddingVertical: spacing.xl },
  switchText: { fontFamily: font.regular, fontSize: fontSize.md, color: colors.textMuted },
  localNote: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
})

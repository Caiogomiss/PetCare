// Esqueci minha senha: envia o link de redefinição para o e-mail
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Screen from '../../components/Screen'
import { Button, FormError, Input, Muted, Title } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { MSG } from '../../constants/messages'
import { isValidEmail } from '../../lib/format'
import { colors, radius, spacing } from '../../theme'

export default function ForgotPasswordScreen({ navigation, route }) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState(route.params?.email || '')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!email.trim()) return setError('Informe seu e-mail.')
    if (!isValidEmail(email)) return setError('E-mail inválido.')
    setError('')
    setFormError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Screen edges={['bottom']}>
        <View style={styles.icon}>
          <Feather name="mail" size={30} color={colors.primary} />
        </View>
        <Title style={{ fontSize: 22, textAlign: 'center', marginBottom: spacing.sm }}>Confira seu e-mail</Title>
        <Muted style={{ textAlign: 'center', marginBottom: spacing.xl }}>{MSG.RESET_SENT}</Muted>
        <Button title="Voltar para o login" onPress={() => navigation.navigate('Login', { email })} />
        <Button title="Enviar de novo" variant="ghost" onPress={() => setSent(false)} style={{ marginTop: spacing.sm }} />
      </Screen>
    )
  }

  return (
    <Screen edges={['bottom']}>
      <Title style={{ fontSize: 22, marginTop: spacing.md }}>Esqueci minha senha</Title>
      <Muted style={{ marginBottom: spacing.xl }}>Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.</Muted>
      <FormError text={formError} />
      <Input
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        icon="mail"
        placeholder="seuemail@exemplo.com"
        onSubmitEditing={submit}
        returnKeyType="send"
      />
      <Button title="Enviar link" onPress={submit} loading={loading} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  icon: { width: 68, height: 68, borderRadius: radius.xl, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: spacing.xxl, marginBottom: spacing.lg },
})

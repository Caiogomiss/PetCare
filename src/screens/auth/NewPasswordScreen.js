// Criar nova senha: aberta pelo link do e-mail de "esqueci minha senha"
import React, { useState } from 'react'
import Screen from '../../components/Screen'
import { Button, FormError, Muted, PasswordInput, Title } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { notify } from '../../lib/confirm'
import { MSG } from '../../constants/messages'
import { spacing } from '../../theme'

export default function NewPasswordScreen() {
  const { updatePassword, cancelRecovery, user } = useAuth()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(user ? '' : MSG.RESET_LINK_INVALID)
  const [loading, setLoading] = useState(false)

  async function submit() {
    const e = {}
    if (senha.length < 6) e.senha = 'A senha precisa ter pelo menos 6 caracteres.'
    else if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) e.senha = 'Use letras e números na senha.'
    if (confirmar !== senha) e.confirmar = 'As senhas não conferem.'
    setErrors(e)
    if (Object.keys(e).length) return
    setFormError('')
    setLoading(true)
    try {
      await updatePassword(senha)
      notify(MSG.RESET_DONE)
      // Já fica logado e o app abre na tela inicial
    } catch (err) {
      setFormError(err.message)
      setLoading(false)
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Title style={{ fontSize: 22, marginTop: spacing.xl }}>Criar nova senha</Title>
      <Muted style={{ marginBottom: spacing.xl }}>{user?.email ? `Conta: ${user.email}` : 'Escolha a nova senha da sua conta.'}</Muted>
      <FormError text={formError} />
      <PasswordInput label="Nova senha" required value={senha} onChangeText={setSenha} error={errors.senha} hint="Mínimo de 6 caracteres, com letras e números." icon="lock" />
      <PasswordInput label="Confirmar nova senha" required value={confirmar} onChangeText={setConfirmar} error={errors.confirmar} icon="lock" onSubmitEditing={submit} />
      <Button title="Salvar nova senha" onPress={submit} loading={loading} disabled={!user} />
      <Button title="Cancelar" variant="ghost" onPress={cancelRecovery} style={{ marginTop: spacing.sm }} />
    </Screen>
  )
}

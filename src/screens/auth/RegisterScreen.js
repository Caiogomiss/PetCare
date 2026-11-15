// UC01: Cadastro de usuário (RN01 a RN06)
import React, { useState } from 'react'
import { Pressable, Text } from 'react-native'
import { confirm, notify } from '../../lib/confirm'
import Screen from '../../components/Screen'
import { Button, FormError, Input, Muted, PasswordInput, Switch, Title } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { MSG } from '../../constants/messages'
import { isValidEmail, isValidPhone, maskPhone } from '../../lib/format'
import { colors, font, fontSize, spacing } from '../../theme'

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth()
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirmar: '' })
  const [aceite, setAceite] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  function validate() {
    const e = {}
    if (form.nome.trim().length < 3) e.nome = 'Informe seu nome completo.'
    if (!form.email.trim()) e.email = 'Informe seu e-mail.'
    else if (!isValidEmail(form.email)) e.email = 'E-mail inválido.'
    if (form.telefone && !isValidPhone(form.telefone)) e.telefone = 'Telefone incompleto. Use DDD + número.'
    if (form.senha.length < 6) e.senha = 'A senha precisa ter pelo menos 6 caracteres.'
    else if (!/[A-Za-z]/.test(form.senha) || !/\d/.test(form.senha)) e.senha = 'Use letras e números na senha.'
    if (form.confirmar !== form.senha) e.confirmar = 'As senhas não conferem.'
    if (!aceite) e.aceite = 'Aceite os termos de uso para continuar.'
    return e
  }

  async function submit() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      setFormError(e.aceite && Object.keys(e).length === 1 ? e.aceite : MSG.MSG05)
      return
    }
    setFormError('')
    if (!(await confirm('Criar conta', MSG.MSG01))) return
    setLoading(true)
    try {
      const res = await signUp({ nome: form.nome, email: form.email, senha: form.senha, telefone: form.telefone })
      if (res.needsConfirmation) {
        navigation.navigate('Login', { email: form.email, notice: MSG.CONFIRM_EMAIL })
      } else {
        // Com sessão criada, o app troca sozinho para a área logada
        notify('Bem-vindo(a)!', MSG.MSG04)
      }
    } catch (err) {
      setFormError(err.message)
      if (err.message === MSG.MSG03) setErrors((x) => ({ ...x, email: 'E-mail já cadastrado.' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Title style={{ fontSize: 24, marginTop: spacing.md }}>Criar conta</Title>
      <Muted style={{ marginBottom: spacing.xl }}>Cadastre-se para organizar a saúde dos seus pets.</Muted>
      <FormError text={formError} />

      <Input label="Nome completo" required value={form.nome} onChangeText={set('nome')} error={errors.nome} autoComplete="name" icon="user" />
      <Input label="E-mail" required value={form.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" icon="mail" />
      <Input label="Telefone" value={form.telefone} onChangeText={(t) => set('telefone')(maskPhone(t))} error={errors.telefone} keyboardType="phone-pad" icon="phone" placeholder="(61) 90000-0000" />
      <PasswordInput label="Senha" required value={form.senha} onChangeText={set('senha')} error={errors.senha} hint="Mínimo de 6 caracteres, com letras e números." icon="lock" />
      <PasswordInput label="Confirmar senha" required value={form.confirmar} onChangeText={set('confirmar')} error={errors.confirmar} icon="lock" />

      <Switch label="Li e aceito os termos de uso e a política de privacidade." value={aceite} onChange={setAceite} />
      {errors.aceite ? <Text style={{ color: colors.danger, fontFamily: font.regular, fontSize: fontSize.xs + 1, marginTop: -10, marginBottom: spacing.md }}>{errors.aceite}</Text> : null}

      <Button title="Criar conta" onPress={submit} loading={loading} />
      <Pressable onPress={() => navigation.goBack()} style={{ alignItems: 'center', paddingVertical: spacing.xl }} accessibilityRole="button">
        <Text style={{ fontFamily: font.regular, fontSize: fontSize.md, color: colors.textMuted }}>
          Já tem conta? <Text style={{ color: colors.primary, fontFamily: font.semibold }}>Entrar</Text>
        </Text>
      </Pressable>
    </Screen>
  )
}

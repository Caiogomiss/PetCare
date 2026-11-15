// Editar dados do tutor (nome, telefone, CPF, endereço)
import React, { useState } from 'react'
import Screen from '../../components/Screen'
import { Button, FormError, Input } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { confirm, notify } from '../../lib/confirm'
import { isValidCpf, isValidPhone, maskCpf, maskPhone } from '../../lib/format'
import { MSG } from '../../constants/messages'

export default function ProfileEditScreen({ navigation }) {
  const { profile, user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    nome: profile?.nome || '',
    telefone: profile?.telefone || '',
    cpf: profile?.cpf || '',
    endereco: profile?.endereco || '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  async function save() {
    const e = {}
    if (form.nome.trim().length < 3) e.nome = 'Informe seu nome completo.'
    if (form.telefone && !isValidPhone(form.telefone)) e.telefone = 'Telefone incompleto. Use DDD + número.'
    if (form.cpf && !isValidCpf(form.cpf)) e.cpf = 'CPF inválido.'
    setErrors(e)
    if (Object.keys(e).length) return setFormError(MSG.MSG05)
    setFormError('')
    if (!(await confirm('Salvar alterações', MSG.MSG11, { confirmText: 'Salvar' }))) return
    setSaving(true)
    try {
      await updateProfile({
        nome: form.nome.trim(),
        telefone: form.telefone || null,
        cpf: form.cpf || null,
        endereco: form.endereco.trim() || null,
      })
      notify(MSG.MSG12)
      navigation.goBack()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen edges={['bottom']}>
      <FormError text={formError} />
      <Input label="Nome completo" required value={form.nome} onChangeText={set('nome')} error={errors.nome} icon="user" maxLength={80} />
      <Input label="E-mail" value={user?.email} editable={false} icon="mail" hint="O e-mail não pode ser alterado." />
      <Input label="Telefone" value={form.telefone} onChangeText={(t) => set('telefone')(maskPhone(t))} error={errors.telefone} keyboardType="phone-pad" icon="phone" />
      <Input label="CPF" value={form.cpf} onChangeText={(t) => set('cpf')(maskCpf(t))} error={errors.cpf} keyboardType="number-pad" icon="credit-card" />
      <Input label="Endereço" value={form.endereco} onChangeText={set('endereco')} icon="home" maxLength={160} />
      <Button title="Salvar" onPress={save} loading={saving} />
    </Screen>
  )
}

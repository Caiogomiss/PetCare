// UC06: Criar lembrete de cuidado (RN20, RN21)
import React, { useLayoutEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import Screen from '../../components/Screen'
import { Button, Chips, DateInput, FormError, Input, Muted } from '../../components/ui'
import { db } from '../../lib/db'
import { cancelReminder, scheduleReminder } from '../../lib/notifications'
import { confirm, notify } from '../../lib/confirm'
import { brToIso, isValidTime, isoToBr, maskTime, todayIso } from '../../lib/format'
import { MSG } from '../../constants/messages'
import { spacing } from '../../theme'

const SUGESTOES = ['Vermífugo', 'Antipulgas', 'Banho', 'Remédio', 'Consulta', 'Vacina'].map((s) => ({ value: s, label: s }))

export default function ReminderFormScreen({ navigation, route }) {
  const { pet, reminder } = route.params
  const [titulo, setTitulo] = useState(reminder?.titulo || '')
  const [data, setData] = useState(isoToBr(reminder?.data) || '')
  const [hora, setHora] = useState(reminder?.hora || '09:00')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({ title: reminder ? 'Editar lembrete' : 'Novo lembrete' })
  }, [navigation, reminder])

  async function save() {
    const e = {}
    if (!titulo.trim()) e.titulo = 'Descreva o cuidado.'
    const iso = brToIso(data)
    if (!data) e.data = 'Informe a data.'
    else if (!iso) e.data = 'Data inválida.'
    else if (!reminder && iso < todayIso()) e.data = 'A data precisa ser hoje ou depois.'
    if (!isValidTime(hora)) e.hora = 'Horário inválido. Ex.: 09:00'
    setErrors(e)
    if (Object.keys(e).length) return setFormError(e.data || e.hora ? MSG.MSG16 : MSG.MSG05)
    setFormError('')

    const row = { pet_id: pet.id, titulo: titulo.trim(), data: iso, hora }
    setSaving(true)
    try {
      const saved = reminder ? await db.update('reminders', reminder.id, row) : await db.insert('reminders', row)
      const scheduled = saved.feito ? false : await scheduleReminder(saved, pet.nome)
      const extra =
        Platform.OS === 'web' || saved.feito
          ? ''
          : scheduled
            ? 'Você vai receber uma notificação no dia.'
            : 'Não foi possível agendar a notificação. Verifique a permissão de notificações do app.'
      notify(reminder ? MSG.MSG13 : MSG.MSG15, extra)
      navigation.goBack()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!(await confirm('Excluir lembrete', `Excluir "${reminder.titulo}"?`, { confirmText: 'Excluir', destructive: true }))) return
    setSaving(true)
    try {
      await db.remove('reminders', reminder.id)
      await cancelReminder(reminder.id)
      navigation.goBack()
    } catch (err) {
      setFormError(err.message)
      setSaving(false)
    }
  }

  return (
    <Screen edges={['bottom']}>
      <FormError text={formError} />
      <Input label="O que precisa ser feito" required value={titulo} onChangeText={setTitulo} error={errors.titulo} placeholder="Ex.: Dar vermífugo" maxLength={80} />
      {!reminder ? (
        <View style={{ marginHorizontal: -spacing.xl, marginTop: -spacing.sm, marginBottom: spacing.lg }}>
          <Chips options={SUGESTOES} value={titulo} onChange={setTitulo} />
        </View>
      ) : null}
      <DateInput label="Data" required value={data} onChangeText={setData} error={errors.data} />
      <Input label="Horário" required value={hora} onChangeText={(t) => setHora(maskTime(t))} error={errors.hora} keyboardType="number-pad" maxLength={5} icon="clock" placeholder="09:00" />
      <Button title={reminder ? 'Salvar alterações' : 'Criar lembrete'} onPress={save} loading={saving} />
      {reminder ? <Button title="Excluir lembrete" variant="danger" icon="trash-2" onPress={remove} disabled={saving} style={{ marginTop: spacing.md }} /> : null}
      {Platform.OS !== 'web' ? <Muted style={{ textAlign: 'center', marginTop: spacing.xl }}>A notificação funciona mesmo sem internet.</Muted> : null}
    </Screen>
  )
}

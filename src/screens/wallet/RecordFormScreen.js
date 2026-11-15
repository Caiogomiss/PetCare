// UC05: Registrar informação de saúde (RN16 a RN18). Também edita e exclui.
import React, { useLayoutEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Screen from '../../components/Screen'
import { Button, DateInput, FormError, Input, Muted, Segmented } from '../../components/ui'
import { db } from '../../lib/db'
import { confirm, notify } from '../../lib/confirm'
import { brToIso, isoToBr, todayIso } from '../../lib/format'
import { RECORD_TYPES, recordType } from '../../constants/options'
import { MSG } from '../../constants/messages'
import { colors, font, fontSize, spacing } from '../../theme'

export default function RecordFormScreen({ navigation, route }) {
  const { pet, record } = route.params
  const [tipo, setTipo] = useState(record?.tipo || route.params.tipo || 'vacina')
  const [titulo, setTitulo] = useState(record?.titulo || '')
  const [data, setData] = useState(isoToBr(record?.data) || isoToBr(todayIso()))
  const [proxima, setProxima] = useState(isoToBr(record?.proxima_data))
  const [detalhes, setDetalhes] = useState(record?.detalhes || {})
  const [obs, setObs] = useState(record?.observacoes || '')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const type = recordType(tipo)

  useLayoutEffect(() => {
    navigation.setOptions({ title: record ? type.singular : `Novo registro · ${pet.nome}` })
  }, [navigation, record, type, pet])

  function validate() {
    const e = {}
    const titleValue = titulo.trim() || (tipo === 'castracao' ? 'Castração' : '')
    if (!titleValue) e.titulo = `Informe: ${type.tituloLabel.toLowerCase()}.`
    const iso = brToIso(data)
    if (!data) e.data = 'Informe a data.'
    else if (!iso) e.data = 'Data inválida.'
    else if (iso > todayIso() && tipo !== 'consulta') e.data = 'Essa data ainda não chegou. Para algo futuro, use a próxima data ou um lembrete.'
    if (proxima) {
      const isoNext = brToIso(proxima)
      if (!isoNext) e.proxima = 'Data inválida.'
      else if (iso && isoNext < iso) e.proxima = 'Precisa ser depois da data do registro.'
    }
    if (detalhes.intervalo_horas && !/^\d{1,3}$/.test(String(detalhes.intervalo_horas))) e.intervalo_horas = 'Use só números. Ex.: 12'
    return { e, titleValue }
  }

  async function save() {
    const { e, titleValue } = validate()
    setErrors(e)
    if (Object.keys(e).length) return setFormError(e.data || e.proxima ? MSG.MSG16 : MSG.MSG05)
    setFormError('')
    if (record && !(await confirm('Salvar alterações', MSG.MSG11, { confirmText: 'Salvar' }))) return

    // Guarda só os campos do tipo escolhido
    const cleanDetails = {}
    type.fields.forEach((f) => {
      const v = String(detalhes[f.key] ?? '').trim()
      if (v) cleanDetails[f.key] = v
    })
    const row = {
      pet_id: pet.id,
      tipo,
      titulo: titleValue,
      data: brToIso(data),
      proxima_data: type.proximaLabel && proxima ? brToIso(proxima) : null,
      detalhes: cleanDetails,
      observacoes: obs.trim() || null,
    }
    setSaving(true)
    try {
      if (record) {
        await db.update('health_records', record.id, row)
        notify(MSG.MSG13)
      } else {
        await db.insert('health_records', row)
        // Castração registrada: marca o pet como castrado
        if (tipo === 'castracao' && !pet.castrado) await db.update('pets', pet.id, { castrado: true }).catch(() => {})
        notify(MSG.MSG14)
      }
      navigation.goBack()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!(await confirm('Excluir registro', `Excluir "${record.titulo}"?`, { confirmText: 'Excluir', destructive: true }))) return
    setSaving(true)
    try {
      await db.remove('health_records', record.id)
      navigation.goBack()
    } catch (err) {
      setFormError(err.message)
      setSaving(false)
    }
  }

  return (
    <Screen edges={['bottom']}>
      {!record ? (
        <Segmented label="Tipo de registro" options={RECORD_TYPES.map((t) => ({ value: t.value, label: t.singular }))} value={tipo} onChange={setTipo} />
      ) : (
        <Text style={{ fontFamily: font.semibold, fontSize: fontSize.sm, color: colors.primary, marginBottom: spacing.md }}>{pet.nome}</Text>
      )}

      <FormError text={formError} />
      <Input label={type.tituloLabel} required={tipo !== 'castracao'} value={titulo} onChangeText={setTitulo} error={errors.titulo} placeholder={type.tituloPlaceholder} maxLength={80} />
      <DateInput label={type.dataLabel} required value={data} onChangeText={setData} error={errors.data} />
      {type.proximaLabel ? (
        <DateInput label={type.proximaLabel} value={proxima} onChangeText={setProxima} error={errors.proxima} hint="Opcional. Aparece na tela inicial como próximo cuidado." />
      ) : null}

      {type.fields.map((f) => (
        <Input
          key={f.key}
          label={f.label}
          value={String(detalhes[f.key] ?? '')}
          onChangeText={(v) => setDetalhes((d) => ({ ...d, [f.key]: v }))}
          error={errors[f.key]}
          placeholder={f.placeholder}
          keyboardType={f.keyboard}
          multiline={f.multiline}
        />
      ))}
      <Input label="Observações" value={obs} onChangeText={setObs} multiline maxLength={500} />

      <Button title={record ? 'Salvar alterações' : 'Salvar registro'} onPress={save} loading={saving} />
      {record ? <Button title="Excluir registro" variant="danger" icon="trash-2" onPress={remove} disabled={saving} style={{ marginTop: spacing.md }} /> : null}
      <View style={{ height: spacing.lg }} />
      <Muted style={{ textAlign: 'center' }}>Os registros não substituem a carteira assinada pelo veterinário.</Muted>
    </Screen>
  )
}

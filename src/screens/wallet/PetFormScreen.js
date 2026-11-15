// UC03: Cadastrar pet / UC04: Consultar e editar dados do pet (RN11 a RN15)
import React, { useLayoutEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Screen from '../../components/Screen'
import { Button, DateInput, FormError, Input, Photo, Segmented, Switch } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../lib/db'
import { pickPhoto, uploadPhoto } from '../../lib/photos'
import { confirm, notify } from '../../lib/confirm'
import { brToIso, isoToBr, todayIso } from '../../lib/format'
import { ESPECIES, SEXOS } from '../../constants/options'
import { MSG } from '../../constants/messages'
import { colors, font, fontSize, spacing } from '../../theme'

export default function PetFormScreen({ navigation, route }) {
  const editing = route.params?.pet || null
  const { user } = useAuth()
  const [form, setForm] = useState({
    nome: editing?.nome || '',
    especie: editing?.especie || '',
    raca: editing?.raca || '',
    sexo: editing?.sexo || '',
    nascimento: isoToBr(editing?.data_nascimento),
    peso: editing?.peso ? String(editing.peso).replace('.', ',') : '',
    castrado: editing?.castrado || false,
  })
  const [photo, setPhoto] = useState(null) // asset novo escolhido
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Dados do pet' : 'Novo pet' })
  }, [navigation, editing])

  function validate() {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Informe o nome do pet.'
    if (!form.especie) e.especie = 'Escolha a espécie.'
    if (form.nascimento) {
      const iso = brToIso(form.nascimento)
      if (!iso) e.nascimento = 'Data inválida.'
      else if (iso > todayIso()) e.nascimento = 'A data de nascimento não pode ser no futuro.'
    }
    if (form.peso) {
      const n = Number(form.peso.replace(',', '.'))
      if (!Number.isFinite(n) || n <= 0 || n >= 200) e.peso = 'Peso inválido. Ex.: 8,5'
    }
    return e
  }

  async function choosePhoto(fromCamera) {
    try {
      const asset = await pickPhoto(fromCamera)
      if (asset) setPhoto(asset)
    } catch (err) {
      notify('Foto', err.message)
    }
  }

  async function save() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return setFormError(MSG.MSG05)
    setFormError('')
    if (editing && !(await confirm('Salvar alterações', MSG.MSG11, { confirmText: 'Salvar' }))) return

    setSaving(true)
    try {
      const foto_url = photo ? await uploadPhoto(photo, user.id) : editing?.foto_url || null
      const row = {
        nome: form.nome.trim(),
        especie: form.especie,
        raca: form.raca.trim() || null,
        sexo: form.sexo || null,
        data_nascimento: form.nascimento ? brToIso(form.nascimento) : null,
        peso: form.peso ? Number(form.peso.replace(',', '.')) : null,
        castrado: form.castrado,
        foto_url,
      }
      if (editing) {
        await db.update('pets', editing.id, row)
        notify(MSG.MSG13)
        navigation.goBack()
      } else {
        const created = await db.insert('pets', row)
        notify(MSG.MSG10)
        navigation.navigate('Tabs', { screen: 'Carteirinha', params: { petId: created.id } })
      }
    } catch (err) {
      // RN15: se falhar, os dados anteriores continuam como estavam
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    const ok = await confirm('Excluir pet', `Excluir ${editing.nome} e todo o histórico de saúde e lembretes? Isso não pode ser desfeito.`, { confirmText: 'Excluir', destructive: true })
    if (!ok) return
    setSaving(true)
    try {
      await db.remove('pets', editing.id)
      navigation.navigate('Tabs', { screen: 'Carteirinha' })
    } catch (err) {
      setFormError(err.message)
      setSaving(false)
    }
  }

  const photoUri = photo ? photo.uri : editing?.foto_url

  return (
    <Screen edges={['bottom']}>
      <View style={styles.photoBox}>
        <Photo uri={photoUri} size={110} rounded={55} icon="camera" />
        <View style={styles.photoActions}>
          <Pressable onPress={() => choosePhoto(false)} style={styles.photoBtn} accessibilityRole="button">
            <Feather name="image" size={16} color={colors.primary} />
            <Text style={styles.photoBtnText}>Galeria</Text>
          </Pressable>
          <Pressable onPress={() => choosePhoto(true)} style={styles.photoBtn} accessibilityRole="button">
            <Feather name="camera" size={16} color={colors.primary} />
            <Text style={styles.photoBtnText}>Câmera</Text>
          </Pressable>
        </View>
      </View>

      <FormError text={formError} />
      <Input label="Nome" required value={form.nome} onChangeText={set('nome')} error={errors.nome} maxLength={60} placeholder="Ex.: Belinha" />
      <Segmented label="Espécie" required options={ESPECIES} value={form.especie} onChange={set('especie')} error={errors.especie} />
      <Input label="Raça" value={form.raca} onChangeText={set('raca')} placeholder="Ex.: SRD, Cocker Spaniel" maxLength={60} />
      <Segmented label="Sexo" options={SEXOS} value={form.sexo} onChange={set('sexo')} />
      <DateInput label="Data de nascimento" value={form.nascimento} onChangeText={set('nascimento')} error={errors.nascimento} hint="Se não souber o dia exato, use uma data aproximada." />
      <Input label="Peso (kg)" value={form.peso} onChangeText={(t) => set('peso')(t.replace(/[^\d,.]/g, ''))} error={errors.peso} keyboardType="decimal-pad" placeholder="Ex.: 8,5" maxLength={6} />
      <Switch label="Castrado(a)" value={form.castrado} onChange={set('castrado')} />

      <Button title={editing ? 'Salvar alterações' : 'Cadastrar pet'} onPress={save} loading={saving} />
      {editing ? <Button title="Excluir pet" variant="danger" icon="trash-2" onPress={remove} disabled={saving} style={{ marginTop: spacing.md }} /> : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  photoBox: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.sm },
  photoActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft },
  photoBtnText: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.primaryDark },
})

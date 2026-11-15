// UC08: Publicar alerta comunitário (RN25 a RN27)
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Screen from '../../components/Screen'
import { Button, FormError, Input, Muted, Photo, Segmented } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../lib/db'
import { pickPhoto, uploadPhoto } from '../../lib/photos'
import { confirm, notify } from '../../lib/confirm'
import { isValidPhone, maskPhone } from '../../lib/format'
import { ALERT_TYPES } from '../../constants/options'
import { MSG } from '../../constants/messages'
import { colors, font, fontSize, radius, spacing } from '../../theme'

export default function AlertFormScreen({ navigation }) {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({ tipo: '', titulo: '', descricao: '', local: '', contato: profile?.telefone || '' })
  const [photo, setPhoto] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  async function choosePhoto(fromCamera) {
    try {
      const asset = await pickPhoto(fromCamera)
      if (asset) setPhoto(asset)
    } catch (err) {
      notify('Foto', err.message)
    }
  }

  async function publish() {
    const e = {}
    if (!form.tipo) e.tipo = 'Escolha o tipo de ocorrência.'
    if (form.titulo.trim().length < 3) e.titulo = 'Escreva um título curto. Ex.: Procura-se Floquinho'
    if (form.descricao.trim().length < 10) e.descricao = 'Descreva o animal: cor, porte, sexo, sinais. (mín. 10 letras)'
    if (form.local.trim().length < 3) e.local = 'Informe onde o animal foi visto.'
    if (form.contato && !isValidPhone(form.contato)) e.contato = 'Telefone incompleto. Use DDD + número.'
    setErrors(e)
    if (Object.keys(e).length) return setFormError(MSG.MSG05)
    setFormError('')
    if (!(await confirm('Publicar alerta', 'O alerta ficará visível para todos os usuários do app. Deseja publicar?', { confirmText: 'Publicar' }))) return

    setSaving(true)
    try {
      const foto_url = photo ? await uploadPhoto(photo, user.id) : null
      await db.insert('alerts', {
        tipo: form.tipo,
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        local: form.local.trim(),
        contato: form.contato || null,
        autor_nome: profile?.nome || null,
        foto_url,
      })
      notify(MSG.MSG20)
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
      <Segmented label="Tipo de ocorrência" required options={ALERT_TYPES} value={form.tipo} onChange={set('tipo')} error={errors.tipo} />

      <Text style={styles.label}>Foto</Text>
      <View style={styles.photoRow}>
        <Photo uri={photo?.uri} size={84} icon="camera" />
        <View style={{ gap: spacing.sm, flex: 1 }}>
          <Pressable onPress={() => choosePhoto(true)} style={styles.photoBtn} accessibilityRole="button">
            <Feather name="camera" size={16} color={colors.primary} />
            <Text style={styles.photoBtnText}>Tirar foto</Text>
          </Pressable>
          <Pressable onPress={() => choosePhoto(false)} style={styles.photoBtn} accessibilityRole="button">
            <Feather name="image" size={16} color={colors.primary} />
            <Text style={styles.photoBtnText}>Escolher da galeria</Text>
          </Pressable>
        </View>
      </View>

      <Input label="Título" required value={form.titulo} onChangeText={set('titulo')} error={errors.titulo} placeholder="Ex.: Procura-se Floquinho" maxLength={80} />
      <Input label="Descrição" required value={form.descricao} onChangeText={set('descricao')} error={errors.descricao} placeholder="Cor, porte, sexo, coleira, comportamento, quando foi visto..." multiline maxLength={600} />
      <Input label="Local" required value={form.local} onChangeText={set('local')} error={errors.local} placeholder="Ex.: Quadra 10 do Setor Leste, Gama" icon="map-pin" maxLength={120} />
      <Input label="Telefone para contato" value={form.contato} onChangeText={(t) => set('contato')(maskPhone(t))} error={errors.contato} keyboardType="phone-pad" icon="phone" />

      <Button title="Publicar alerta" onPress={publish} loading={saving} />
      <Muted style={{ textAlign: 'center', marginTop: spacing.lg }}>Em caso de maus-tratos, denuncie também à Delegacia de Proteção Animal ou ligue 190.</Muted>
    </Screen>
  )
}

const styles = StyleSheet.create({
  label: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: 6 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, height: 38, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  photoBtnText: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.primaryDark },
})

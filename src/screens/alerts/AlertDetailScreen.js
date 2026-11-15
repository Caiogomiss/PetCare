// Detalhe do alerta comunitário (RN28)
import React, { useState } from 'react'
import { Image, Linking, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Screen from '../../components/Screen'
import { Badge, Body, Button, Card, FormError, Muted } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../lib/db'
import { confirm, notify } from '../../lib/confirm'
import { timeAgo } from '../../lib/format'
import { alertType } from '../../constants/options'
import { colors, font, fontSize, radius, spacing } from '../../theme'

export default function AlertDetailScreen({ navigation, route }) {
  const { user } = useAuth()
  const [alert, setAlert] = useState(route.params.alert)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [imgFailed, setImgFailed] = useState(false)
  const t = alertType(alert.tipo)
  const mine = alert.autor_id === user.id

  async function toggleResolved() {
    setBusy(true)
    setError('')
    try {
      const updated = await db.update('alerts', alert.id, { resolvido: !alert.resolvido })
      setAlert(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!(await confirm('Excluir alerta', 'O alerta deixará de aparecer para a comunidade.', { confirmText: 'Excluir', destructive: true }))) return
    setBusy(true)
    try {
      await db.remove('alerts', alert.id)
      navigation.goBack()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  function call() {
    Linking.openURL(`tel:${String(alert.contato).replace(/\D/g, '')}`).catch(() => notify('Contato', alert.contato))
  }

  return (
    <Screen edges={['bottom']} padded={false}>
      {alert.foto_url && !imgFailed ? (
        <Image source={{ uri: alert.foto_url }} style={styles.photo} onError={() => setImgFailed(true)} accessibilityLabel="Foto do animal" />
      ) : (
        <View style={[styles.photo, styles.noPhoto]}>
          <Feather name="camera-off" size={36} color={colors.primary} />
          <Muted>Sem foto</Muted>
        </View>
      )}

      <View style={{ padding: spacing.xl }}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.sm }}>
          <Badge text={t.titulo} color={t.color} bg={t.bg} />
          {alert.resolvido ? <Badge text="Resolvido" /> : null}
        </View>
        <Text style={styles.title}>{alert.titulo}</Text>
        <Muted style={{ marginBottom: spacing.lg }}>
          Publicado {timeAgo(alert.created_at)}
          {alert.autor_nome ? ` por ${alert.autor_nome}` : ''}
        </Muted>

        <Body style={{ marginBottom: spacing.lg }}>{alert.descricao}</Body>

        <Card style={{ gap: spacing.md, marginBottom: spacing.xl }}>
          <Row icon="map-pin" text={alert.local} />
          {alert.contato ? <Row icon="phone" text={alert.contato} /> : null}
        </Card>

        <FormError text={error} />
        {!mine && alert.contato && !alert.resolvido ? <Button title="Ligar para quem publicou" icon="phone" onPress={call} /> : null}
        {mine ? (
          <View style={{ gap: spacing.md }}>
            <Button title={alert.resolvido ? 'Reabrir alerta' : 'Marcar como resolvido'} icon={alert.resolvido ? 'rotate-ccw' : 'check-circle'} onPress={toggleResolved} loading={busy} />
            <Button title="Excluir alerta" icon="trash-2" variant="danger" onPress={remove} disabled={busy} />
          </View>
        ) : null}
      </View>
    </Screen>
  )
}

function Row({ icon, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Feather name={icon} size={18} color={colors.primary} />
      <Text style={{ flex: 1, fontFamily: font.regular, fontSize: fontSize.md, color: colors.text }}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  photo: { width: '100%', aspectRatio: 1.3, backgroundColor: colors.border },
  noPhoto: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primarySoft, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  title: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, marginBottom: 2 },
})

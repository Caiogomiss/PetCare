// UC08: Alertas comunitários (lista)
import React, { useMemo, useState } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Badge, Card, Chips, EmptyState, ErrorState, Fab, Loading, Muted, OfflineBanner, Photo } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useLoad } from '../../hooks/useLoad'
import { db } from '../../lib/db'
import { timeAgo } from '../../lib/format'
import { ALERT_TYPES, alertType } from '../../constants/options'
import { colors, font, fontSize, radius, spacing } from '../../theme'

const FILTERS = [{ value: 'todos', label: 'Todos' }, ...ALERT_TYPES.map((t) => ({ value: t.value, label: t.label })), { value: 'meus', label: 'Meus alertas' }]

const normalize = (t) =>
  String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export default function AlertsScreen({ navigation }) {
  const { user } = useAuth()
  const [filtro, setFiltro] = useState('todos')
  const [query, setQuery] = useState('')
  const { data, error, loading, refreshing, refresh, reload } = useLoad(() => db.list('alerts', { order: 'created_at', asc: false }))

  const list = useMemo(() => {
    const q = normalize(query)
    return (data || [])
      .filter((a) => (filtro === 'meus' ? a.autor_id === user.id : !a.resolvido && (filtro === 'todos' || a.tipo === filtro)))
      .filter((a) => !q || normalize(`${a.titulo} ${a.descricao} ${a.local}`).includes(q))
  }, [data, filtro, query, user.id])

  let empty
  if (loading) empty = <Loading />
  else if (error && !data) empty = <ErrorState text={error} onRetry={reload} />
  else
    empty = (
      <EmptyState
        icon="bell"
        title={filtro === 'meus' ? 'Você ainda não publicou alertas' : 'Nenhum alerta por aqui'}
        text="Viu um animal perdido, abandonado ou em risco? Publique um alerta para a comunidade."
        action="Publicar alerta"
        onAction={() => navigation.navigate('AlertForm')}
      />
    )

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <OfflineBanner />
      <FlatList
        data={loading || (error && !data) ? [] : list}
        keyExtractor={(a) => a.id}
        ListHeaderComponent={
          <View>
            <View style={styles.search}>
              <Feather name="search" size={18} color={colors.textLight} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Buscar por nome, raça ou local" placeholderTextColor={colors.textLight} style={styles.searchInput} accessibilityLabel="Buscar alertas" />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Limpar busca">
                  <Feather name="x" size={18} color={colors.textLight} />
                </Pressable>
              ) : null}
            </View>
            <Chips options={FILTERS} value={filtro} onChange={setFiltro} style={{ paddingVertical: spacing.md }} />
            <View style={styles.divider} />
          </View>
        }
        ListEmptyComponent={empty}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
        renderItem={({ item }) => <AlertCard alert={item} mine={item.autor_id === user.id} onPress={() => navigation.navigate('AlertDetail', { alert: item })} />}
      />
      <Fab label="Publicar alerta" onPress={() => navigation.navigate('AlertForm')} />
    </View>
  )
}

function AlertCard({ alert, mine, onPress }) {
  const t = alertType(alert.tipo)
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={alert.titulo}>
      <Photo uri={alert.foto_url} size={80} icon="camera-off" />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          <Badge text={t.label} color={t.color} bg={t.bg} />
          {alert.resolvido ? <Badge text="Resolvido" /> : null}
          {mine ? <Badge text="Seu alerta" color={colors.textMuted} bg={colors.border} /> : null}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {alert.titulo}
        </Text>
        <Muted numberOfLines={2}>{alert.descricao}</Muted>
        <Muted style={{ fontSize: fontSize.xs, marginTop: 4 }} numberOfLines={1}>
          {alert.local} · {timeAgo(alert.created_at)}
        </Muted>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, height: 48, marginHorizontal: spacing.xl, marginTop: spacing.lg },
  searchInput: { flex: 1, fontFamily: font.regular, fontSize: fontSize.md, color: colors.text, height: '100%', outlineStyle: 'none' },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: { flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.xl, marginBottom: spacing.md, padding: spacing.md, alignItems: 'center' },
  title: { fontFamily: font.semibold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
})

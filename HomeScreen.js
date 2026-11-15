// Tela inicial: atalhos, próximo cuidado e serviço mais próximo.
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Screen from '../components/Screen'
import { Card, ErrorState, Loading, Muted, OfflineBanner, Photo, SectionHeader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useLoad } from '../hooks/useLoad'
import { db } from '../lib/db'
import { getSavedPosition } from '../lib/location'
import { daysFromToday, distanceKm, firstName, formatKm, isoToLong, relativeDay, todayIso } from '../lib/format'
import { placeCategory, recordType } from '../constants/options'
import { colors, font, fontSize, radius, spacing } from '../theme'

const TILES = [
  { key: 'servicos', label: 'Serviços', icon: 'map-pin', bg: colors.tileServicos },
  { key: 'carteirinha', label: 'Carteirinha', icon: 'file-text', bg: colors.tileCarteirinha },
  { key: 'alertas', label: 'Alertas', icon: 'bell', bg: colors.tileAlertas },
  { key: 'ongs', label: 'ONGs', icon: 'heart', bg: colors.tileOngs },
]

async function loadHome() {
  const today = todayIso()
  const [pets, records, reminders, places, position] = await Promise.all([
    db.list('pets', { order: 'nome', asc: true }),
    db.list('health_records'),
    db.list('reminders', { order: 'data', asc: true }),
    db.list('places').catch(() => []),
    getSavedPosition(),
  ])
  const petName = (id) => pets.find((p) => p.id === id)?.nome || 'Pet'

  const upcoming = [
    ...records
      .filter((r) => r.proxima_data && r.proxima_data >= today)
      .map((r) => ({ id: r.id, petId: r.pet_id, data: r.proxima_data, titulo: r.titulo, tipo: recordType(r.tipo).singular, pet: petName(r.pet_id) })),
    ...reminders
      .filter((r) => !r.feito && r.data >= today)
      .map((r) => ({ id: r.id, petId: r.pet_id, data: r.data, titulo: r.titulo, tipo: 'Lembrete', pet: petName(r.pet_id) })),
  ].sort((a, b) => (a.data > b.data ? 1 : -1))

  let nearest = null
  if (position && places.length) {
    nearest = places
      .filter((p) => p.categoria === 'clinica' || !p.data_fim || p.data_fim >= today)
      .map((p) => ({ ...p, km: distanceKm(position, p) }))
      .sort((a, b) => a.km - b.km)[0]
  }
  return { pets, upcoming, nearest, position }
}

export default function HomeScreen({ navigation }) {
  const { profile } = useAuth()
  const [query, setQuery] = useState('')
  const { data, error, loading, refreshing, refresh, reload } = useLoad(loadHome)

  function openTile(key) {
    if (key === 'servicos') navigation.navigate('Servicos')
    if (key === 'carteirinha') navigation.navigate('Carteirinha')
    if (key === 'alertas') navigation.navigate('Alerts')
    if (key === 'ongs') navigation.navigate('Servicos', { categoria: 'ong' })
  }

  function search() {
    navigation.navigate('Servicos', { query: query.trim() })
    setQuery('')
  }

  const next = data?.upcoming?.[0]
  const nextDays = next ? daysFromToday(next.data) : null

  return (
    <>
      <OfflineBanner />
      <Screen refreshing={refreshing} onRefresh={refresh}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello} numberOfLines={2}>
              Olá, {firstName(profile?.nome) || 'tutor'}!
            </Text>
            <Muted>Como estão seus pets hoje?</Muted>
          </View>
          <Pressable onPress={() => navigation.navigate('Perfil')} accessibilityRole="button" accessibilityLabel="Abrir perfil">
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(profile?.nome || '?').trim()[0]?.toUpperCase()}</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.search}>
          <Feather name="search" size={18} color={colors.textLight} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
            placeholder="Buscar clínicas, vacinação, castração..."
            placeholderTextColor={colors.textLight}
            style={styles.searchInput}
            accessibilityLabel="Buscar serviços"
          />
        </View>

        <View style={styles.tiles}>
          {TILES.map((t) => (
            <Pressable key={t.key} onPress={() => openTile(t.key)} style={({ pressed }) => [styles.tile, { backgroundColor: t.bg }, pressed && { opacity: 0.8 }]} accessibilityRole="button">
              <View style={styles.tileIcon}>
                <Feather name={t.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.tileText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Próximo cuidado */}
        {loading && !data ? <Loading /> : null}
        {error && !data ? <ErrorState text={error} onRetry={reload} /> : null}
        {data && !data.pets.length ? (
          <Card style={styles.highlight} onPress={() => navigation.navigate('PetForm')}>
            <View style={styles.highlightIcon}>
              <Feather name="plus" size={22} color={colors.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.highlightLabel}>COMECE POR AQUI</Text>
              <Text style={styles.highlightTitle}>Cadastre seu primeiro pet</Text>
              <Muted>Para registrar vacinas, consultas e lembretes.</Muted>
            </View>
          </Card>
        ) : next ? (
          <Card style={styles.highlight} onPress={() => navigation.navigate('Carteirinha', { petId: next.petId })}>
            <View style={styles.highlightIcon}>
              <Feather name={next.tipo === 'Lembrete' ? 'bell' : 'calendar'} size={22} color={colors.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.highlightLabel}>PRÓXIMO CUIDADO {nextDays <= 7 ? `· ${relativeDay(next.data).toUpperCase()}` : ''}</Text>
              <Text style={styles.highlightTitle} numberOfLines={1}>
                {next.titulo} · {next.pet}
              </Text>
              <Muted>
                {next.tipo} para {isoToLong(next.data)}
              </Muted>
            </View>
          </Card>
        ) : data ? (
          <Card style={styles.highlight}>
            <View style={styles.highlightIcon}>
              <Feather name="check" size={22} color={colors.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.highlightLabel}>TUDO EM DIA</Text>
              <Text style={styles.highlightTitle}>Nenhum cuidado agendado</Text>
              <Muted>Registre a próxima dose ou crie um lembrete.</Muted>
            </View>
          </Card>
        ) : null}

        {data?.upcoming?.length > 1 ? (
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {data.upcoming.slice(1, 4).map((u) => (
              <Pressable key={u.id} onPress={() => navigation.navigate('Carteirinha', { petId: u.petId })} style={styles.upRow} accessibilityRole="button">
                <View style={styles.upDot} />
                <Text style={styles.upText} numberOfLines={1}>
                  {u.titulo} · {u.pet}
                </Text>
                <Muted>{relativeDay(u.data)}</Muted>
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* Perto de você */}
        <SectionHeader title="Perto de você" action="Ver todos" onAction={() => navigation.navigate('Servicos')} />
        {data?.nearest ? (
          <Card onPress={() => navigation.navigate('PlaceDetail', { place: data.nearest, km: data.nearest.km })} style={styles.near}>
            <View style={styles.nearIcon}>
              <Feather name={placeCategory(data.nearest.categoria).icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nearTitle} numberOfLines={1}>
                {data.nearest.nome}
              </Text>
              <Muted>
                A {formatKm(data.nearest.km)} de {data.position.label === 'Sua localização' ? 'você' : data.position.label}
              </Muted>
            </View>
            <View style={styles.arrow}>
              <Feather name="arrow-right" size={18} color={colors.textInverse} />
            </View>
          </Card>
        ) : (
          <Card onPress={() => navigation.navigate('Servicos', { askLocation: true })} style={styles.near}>
            <View style={styles.nearIcon}>
              <Feather name="navigation" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nearTitle}>Encontre serviços perto de você</Text>
              <Muted>Clínicas, campanhas de vacinação e castração.</Muted>
            </View>
          </Card>
        )}

        <SectionHeader title="Orientações" action="Ver todas" onAction={() => navigation.navigate('Guides')} />
        <Card onPress={() => navigation.navigate('Guides')} style={styles.near}>
          <Photo icon="book-open" size={48} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nearTitle}>Cuidados com o seu pet</Text>
            <Muted>Vacinação, castração, alimentação e mais.</Muted>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textLight} />
        </Card>
      </Screen>
    </>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.xl, gap: spacing.md },
  hello: { fontFamily: font.bold, fontSize: 24, color: colors.text },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primarySoft, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.bold, fontSize: 22, color: colors.primary },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, height: 50 },
  searchInput: { flex: 1, fontFamily: font.regular, fontSize: fontSize.md, color: colors.text, height: '100%', outlineStyle: 'none' },
  tiles: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.xl },
  tile: { flex: 1, aspectRatio: 0.88, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: 4 },
  tileIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontFamily: font.semibold, fontSize: 12, color: colors.text },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 1.5, padding: spacing.lg },
  highlightIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  highlightLabel: { fontFamily: font.semibold, fontSize: fontSize.xs, color: colors.primary, letterSpacing: 0.5 },
  highlightTitle: { fontFamily: font.bold, fontSize: fontSize.lg, color: colors.text, marginVertical: 2 },
  upRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, minHeight: 32 },
  upDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  upText: { flex: 1, fontFamily: font.medium, fontSize: fontSize.sm, color: colors.text },
  near: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  nearIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  nearTitle: { fontFamily: font.semibold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  arrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
})

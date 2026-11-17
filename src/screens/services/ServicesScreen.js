// UC07: Localizar serviços e campanhas (RN22 a RN24)
import React, { useEffect, useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import PlacesMap from '../../components/PlacesMap'
import { Badge, Card, Chips, EmptyState, ErrorState, IconButton, Loading, Muted, OfflineBanner } from '../../components/ui'
import { useLoad } from '../../hooks/useLoad'
import { db } from '../../lib/db'
import { REGIONS, getSavedPosition, getUserPosition, saveRegion } from '../../lib/location'
import { distanceKm, formatKm, isoToBr, todayIso } from '../../lib/format'
import { AVISO_DADOS_EXEMPLO, ORG_TYPES, PLACE_CATEGORIES, placeCategory } from '../../constants/options'
import { MSG } from '../../constants/messages'
import { colors, font, fontSize, radius, spacing } from '../../theme'

const FILTERS = [{ value: 'todos', label: 'Todos' }, ...PLACE_CATEGORIES]

const normalize = (t) =>
  String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export default function ServicesScreen({ navigation, route }) {
  const [categoria, setCategoria] = useState('todos')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('lista')
  const [position, setPosition] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')
  const [regionOpen, setRegionOpen] = useState(false)
  const { data: places, error, loading, refreshing, refresh, reload } = useLoad(() => db.list('places', { order: 'nome', asc: true }))

  // Parâmetros vindos da tela inicial (atalho ONGs, busca, pedir localização)
  useEffect(() => {
    const p = route.params || {}
    // Só age quando chega algum parâmetro de verdade. Limpar os parâmetros muda route.params
    // de novo; sem essa checagem o efeito roda em loop e a tela fica branca.
    const hasParams = p.categoria !== undefined || p.query !== undefined || p.askLocation !== undefined
    if (!hasParams) return
    if (p.categoria) setCategoria(p.categoria)
    if (p.query !== undefined) {
      setQuery(p.query)
      setCategoria('todos')
    }
    if (p.askLocation) locate()
    navigation.setParams({ categoria: undefined, query: undefined, askLocation: undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params])

  useEffect(() => {
    getSavedPosition().then((p) => p && setPosition(p))
  }, [])

  async function locate() {
    setLocating(true)
    setLocError('')
    try {
      setPosition(await getUserPosition())
    } catch {
      setLocError(MSG.MSG18)
      setRegionOpen(true)
    } finally {
      setLocating(false)
    }
  }

  async function chooseRegion(region) {
    setPosition(await saveRegion(region))
    setRegionOpen(false)
    setLocError('')
  }

  const results = useMemo(() => {
    if (!places) return []
    const today = todayIso()
    const q = normalize(query)
    return places
      .filter((p) => !p.data_fim || p.data_fim >= today) // campanhas encerradas saem da lista
      .filter((p) => categoria === 'todos' || p.categoria === categoria)
      .filter((p) => !q || normalize(`${p.nome} ${p.descricao} ${p.endereco} ${placeCategory(p.categoria).label}`).includes(q))
      .map((p) => ({ ...p, km: distanceKm(position, p) }))
      .sort((a, b) => (position ? a.km - b.km : a.nome.localeCompare(b.nome)))
  }, [places, categoria, query, position])

  const openPlace = (p) => navigation.navigate('PlaceDetail', { place: p, km: p.km })

  const header = (
    <View>
      <View style={styles.top}>
        <Text style={styles.title}>Serviços</Text>
        <IconButton icon={view === 'lista' ? 'map' : 'list'} label={view === 'lista' ? 'Ver no mapa' : 'Ver em lista'} onPress={() => setView((v) => (v === 'lista' ? 'mapa' : 'lista'))} />
      </View>

      <View style={styles.search}>
        <Feather name="search" size={18} color={colors.textLight} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Buscar por nome ou bairro" placeholderTextColor={colors.textLight} style={styles.searchInput} returnKeyType="search" accessibilityLabel="Buscar serviços" />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Limpar busca">
            <Feather name="x" size={18} color={colors.textLight} />
          </Pressable>
        ) : null}
      </View>

      <Pressable style={styles.locRow} onPress={locate} accessibilityRole="button" disabled={locating}>
        <Feather name="navigation" size={15} color={colors.primary} />
        <Text style={styles.locText} numberOfLines={1}>
          {locating ? 'Buscando sua localização...' : position ? `Perto de: ${position.label}` : 'Usar minha localização'}
        </Text>
        <Pressable onPress={() => setRegionOpen(true)} hitSlop={8} accessibilityRole="button">
          <Text style={styles.locChange}>Trocar região</Text>
        </Pressable>
      </Pressable>
      {locError ? <Muted style={{ paddingHorizontal: spacing.xl, color: colors.warning, marginBottom: spacing.sm }}>{locError}</Muted> : null}

      <Chips options={FILTERS} value={categoria} onChange={setCategoria} style={{ paddingBottom: spacing.md }} />
      {categoria === 'ong' ? (
        <Muted style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.md }}>ONGs e protetores independentes que aceitam ajuda. {AVISO_DADOS_EXEMPLO}</Muted>
      ) : null}
      <View style={styles.divider} />
      {places && results.length ? (
        <Muted style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.sm }}>
          {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
          {position ? ' · mais próximos primeiro' : ''}
        </Muted>
      ) : null}
    </View>
  )

  let body
  if (loading) body = <Loading />
  else if (error && !places) body = <ErrorState text={error} onRetry={reload} />
  else if (!results.length)
    body = <EmptyState icon="map-pin" title={MSG.MSG19} text="Tente outra categoria ou limpe a busca." action={query || categoria !== 'todos' ? 'Limpar filtros' : undefined} onAction={() => { setQuery(''); setCategoria('todos') }} />

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <OfflineBanner />
      {view === 'mapa' && !body ? (
        <View style={{ flex: 1 }}>
          {header}
          <View style={{ paddingHorizontal: spacing.xl, flex: 1, paddingBottom: spacing.lg }}>
            <PlacesMap places={results} position={position} onSelect={openPlace} height="100%" />
          </View>
        </View>
      ) : (
        <FlatList
          data={body ? [] : results}
          keyExtractor={(p) => p.id}
          ListHeaderComponent={header}
          ListEmptyComponent={body}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
          renderItem={({ item }) => <PlaceCard place={item} onPress={() => openPlace(item)} />}
        />
      )}

      <Modal visible={regionOpen} transparent animationType="slide" onRequestClose={() => setRegionOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setRegionOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Escolha sua região</Text>
          {locError ? <Muted style={{ marginBottom: spacing.md }}>{locError}</Muted> : null}
          <FlatList
            data={REGIONS}
            keyExtractor={(r) => r.nome}
            style={{ maxHeight: 380 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => chooseRegion(item)} style={({ pressed }) => [styles.regionRow, pressed && { backgroundColor: colors.primarySoft }]} accessibilityRole="button">
                <Feather name="map-pin" size={16} color={colors.primary} />
                <Text style={styles.regionText}>{item.nome}</Text>
                {position?.label === item.nome ? <Feather name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  )
}

function PlaceCard({ place, onPress }) {
  const cat = placeCategory(place.categoria)
  const org = ORG_TYPES[place.tipo_org]
  const isCampaign = Boolean(place.data_inicio)
  const today = todayIso()
  const happening = isCampaign && place.data_inicio <= today
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={place.nome}>
      <View style={styles.cardIcon}>
        <Feather name={cat.icon} size={24} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {place.nome}
        </Text>
        <Muted numberOfLines={1}>
          {cat.label}
          {place.km != null ? ` · ${formatKm(place.km)}` : ''}
        </Muted>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {isCampaign ? (
            <Badge
              text={happening ? `Até ${isoToBr(place.data_fim)}` : `A partir de ${isoToBr(place.data_inicio)}`}
              color={happening ? colors.primaryDark : colors.info}
              bg={happening ? colors.primarySoft : colors.infoSoft}
            />
          ) : null}
          {org ? <Badge text={org.label} color={org.color} bg={org.bg} /> : null}
          {place.gratuito && !org ? <Badge text="Gratuito" color={colors.warning} bg={colors.warningSoft} /> : null}
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textLight} />
    </Card>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, marginBottom: spacing.lg },
  title: { fontFamily: font.bold, fontSize: fontSize.xxl, color: colors.text },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, height: 48, marginHorizontal: spacing.xl },
  searchInput: { flex: 1, fontFamily: font.regular, fontSize: fontSize.md, color: colors.text, height: '100%', outlineStyle: 'none' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, minHeight: 44 },
  locText: { flex: 1, fontFamily: font.medium, fontSize: fontSize.sm, color: colors.text },
  locChange: { fontFamily: font.semibold, fontSize: fontSize.sm, color: colors.primary },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginBottom: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.xl, marginBottom: spacing.md, padding: spacing.md },
  cardIcon: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: font.semibold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(23,58,86,0.35)' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, paddingBottom: spacing.xxl },
  sheetTitle: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, marginBottom: spacing.sm },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.sm, minHeight: 48 },
  regionText: { flex: 1, fontFamily: font.medium, fontSize: fontSize.md, color: colors.text },
})

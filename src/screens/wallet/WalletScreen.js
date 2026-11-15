// Carteirinha de saúde do pet (UC05: consultar registros)
import React, { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import Screen from '../../components/Screen'
import { Badge, Card, Chips, EmptyState, ErrorState, Fab, Loading, Muted, OfflineBanner, Photo } from '../../components/ui'
import { useLoad } from '../../hooks/useLoad'
import { db } from '../../lib/db'
import { readJson, writeJson } from '../../lib/storage'
import { daysFromToday, isoToBr, petAge, todayIso } from '../../lib/format'
import { ESPECIES, RECORD_TYPES, SEXOS, recordType } from '../../constants/options'
import { colors, font, fontSize, radius, spacing } from '../../theme'

export function petLine(pet) {
  const especie = ESPECIES.find((e) => e.value === pet.especie)?.label
  const sexo = SEXOS.find((s) => s.value === pet.sexo)?.label?.toLowerCase()
  return [pet.raca || especie, sexo].filter(Boolean).join(' · ')
}

async function loadWallet() {
  const [pets, records, reminders, saved] = await Promise.all([
    db.list('pets', { order: 'created_at', asc: true }),
    db.list('health_records', { order: 'data', asc: false }),
    db.list('reminders', { order: 'data', asc: true }),
    readJson('selected-pet', null),
  ])
  return { pets, records, reminders, saved }
}

export default function WalletScreen({ navigation, route }) {
  const { data, error, loading, refreshing, refresh, reload } = useLoad(loadWallet)
  const [petId, setPetId] = useState(null)
  const [tipo, setTipo] = useState('vacina')

  // Pet escolhido: o que veio da tela anterior, o último aberto ou o primeiro da lista
  useEffect(() => {
    if (route.params?.petId) {
      setPetId(route.params.petId)
      navigation.setParams({ petId: undefined })
    }
  }, [route.params?.petId, navigation])

  const pet = useMemo(() => {
    if (!data?.pets?.length) return null
    return data.pets.find((p) => p.id === petId) || data.pets.find((p) => p.id === data.saved) || data.pets[0]
  }, [data, petId])

  useEffect(() => {
    if (pet) writeJson('selected-pet', pet.id).catch(() => {})
  }, [pet])

  if (loading) return <Wrapper><Loading /></Wrapper>
  if (error && !data) return <Wrapper><ErrorState text={error} onRetry={reload} /></Wrapper>
  if (!pet) {
    return (
      <Wrapper>
        <EmptyState icon="file-text" title="Nenhum pet cadastrado" text="Cadastre seu pet para começar a carteirinha de saúde." action="Cadastrar pet" onAction={() => navigation.navigate('PetForm')} />
      </Wrapper>
    )
  }

  const type = recordType(tipo)
  const records = data.records.filter((r) => r.pet_id === pet.id && r.tipo === tipo)
  const pendingReminders = data.reminders.filter((r) => r.pet_id === pet.id && !r.feito && r.data >= todayIso()).length

  return (
    <>
      <OfflineBanner />
      <Screen refreshing={refreshing} onRefresh={refresh} padded={false}>
        {data.pets.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petSwitch}>
            {data.pets.map((p) => (
              <Pressable key={p.id} onPress={() => setPetId(p.id)} style={[styles.petPill, p.id === pet.id && styles.petPillActive]} accessibilityRole="button" accessibilityState={{ selected: p.id === pet.id }}>
                <Photo uri={p.foto_url} size={28} rounded={14} icon="heart" />
                <Text style={[styles.petPillText, p.id === pet.id && { color: colors.primaryDark }]}>{p.nome}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => navigation.navigate('PetForm')} style={styles.petPill} accessibilityRole="button" accessibilityLabel="Cadastrar outro pet">
              <Feather name="plus" size={16} color={colors.primary} />
            </Pressable>
          </ScrollView>
        ) : null}

        <View style={{ paddingHorizontal: spacing.xl, paddingTop: data.pets.length > 1 ? 0 : spacing.lg }}>
          <Pressable onPress={() => navigation.navigate('PetForm', { pet })} style={styles.petCard} accessibilityRole="button" accessibilityLabel={`Editar dados de ${pet.nome}`}>
            <Photo uri={pet.foto_url} size={76} rounded={38} icon="heart" style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.petName} numberOfLines={1}>
                {pet.nome}
              </Text>
              <Text style={styles.petInfo} numberOfLines={1}>
                {petLine(pet)}
              </Text>
              {pet.data_nascimento ? <Text style={styles.petInfo}>{petAge(pet.data_nascimento)} de idade</Text> : null}
            </View>
            <Feather name="edit-2" size={18} color="rgba(255,255,255,0.9)" />
          </Pressable>

          <View style={styles.quick}>
            <QuickAction icon="bell" label="Lembretes" count={pendingReminders} onPress={() => navigation.navigate('Reminders', { pet })} />
            <QuickAction icon="info" label={pet.castrado ? 'Castrado(a)' : 'Não castrado(a)'} onPress={() => navigation.navigate('PetForm', { pet })} />
            {pet.peso ? <QuickAction icon="trending-up" label={`${String(pet.peso).replace('.', ',')} kg`} onPress={() => navigation.navigate('PetForm', { pet })} /> : null}
          </View>
        </View>

        <Chips options={RECORD_TYPES.map((t) => ({ value: t.value, label: t.label }))} value={tipo} onChange={setTipo} style={{ paddingVertical: spacing.sm }} />
        <View style={styles.divider} />

        <View style={{ paddingHorizontal: spacing.xl }}>
          {!records.length ? (
            <EmptyState icon={type.icon} title={`Nenhum registro de ${type.label.toLowerCase()}`} text="Toque no + para adicionar." />
          ) : (
            <View style={styles.timeline}>
              <View style={styles.line} />
              {records.map((r) => (
                <RecordItem key={r.id} record={r} onPress={() => navigation.navigate('RecordForm', { pet, record: r })} />
              ))}
            </View>
          )}
        </View>
      </Screen>
      <Fab label={`Adicionar ${type.singular.toLowerCase()}`} onPress={() => navigation.navigate('RecordForm', { pet, tipo })} />
    </>
  )
}

function Wrapper({ children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {children}
    </SafeAreaView>
  )
}

function QuickAction({ icon, label, count, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.quickItem} accessibilityRole="button">
      <Feather name={icon} size={16} color={colors.primary} />
      <Text style={styles.quickText} numberOfLines={1}>
        {label}
      </Text>
      {count ? (
        <View style={styles.count}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

function RecordItem({ record, onPress }) {
  const next = record.proxima_data
  const diff = next ? daysFromToday(next) : null
  let badge = null
  if (record.tipo === 'vacina') {
    badge = next && diff >= 0 ? null : <Badge text="Aplicada" />
  }
  const late = next && diff < 0 && record.tipo === 'vacina'
  const upcoming = next && diff >= 0
  const label = recordType(record.tipo).proximaLabel
  return (
    <View style={styles.item}>
      <View style={[styles.dot, upcoming && { backgroundColor: '#F2A516' }]} />
      <Card onPress={onPress} style={styles.itemCard} accessibilityLabel={record.titulo}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {record.titulo}
          </Text>
          <Muted>{isoToBr(record.data)}</Muted>
          {upcoming && label ? <Muted style={{ color: colors.warning }}>{label}: {isoToBr(next)}</Muted> : null}
          {late ? <Muted style={{ color: colors.textMuted }}>Próxima dose era em {isoToBr(next)}</Muted> : null}
        </View>
        {upcoming && record.tipo === 'vacina' ? <Badge text="Próxima dose" color={colors.warning} bg={colors.warningSoft} /> : badge}
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  petSwitch: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  petPill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  petPillActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  petPillText: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.text },
  petCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.lg },
  petName: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.textInverse },
  petInfo: { fontFamily: font.regular, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  quick: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg, flexWrap: 'wrap' },
  quickItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, height: 38, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  quickText: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.text },
  count: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  countText: { fontFamily: font.bold, fontSize: 11, color: colors.textInverse },
  divider: { height: 1.5, backgroundColor: colors.primary, marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.lg, opacity: 0.6 },
  timeline: { position: 'relative', paddingLeft: 26 },
  line: { position: 'absolute', left: 5, top: 10, bottom: 10, width: 2, backgroundColor: colors.divider },
  item: { marginBottom: spacing.lg, position: 'relative' },
  dot: { position: 'absolute', left: -26, top: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, marginTop: 10 },
  itemTitle: { fontFamily: font.semibold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
})

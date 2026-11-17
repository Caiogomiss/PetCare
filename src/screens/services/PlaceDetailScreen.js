// Detalhes de um serviço ou campanha (RN24)
import React from 'react'
import { Linking, Platform, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Screen from '../../components/Screen'
import PlacesMap from '../../components/PlacesMap'
import { Badge, Body, Button, Card, Muted } from '../../components/ui'
import { formatKm, isoToBr } from '../../lib/format'
import { notify } from '../../lib/confirm'
import { AVISO_DADOS_EXEMPLO, FORMAS_APOIO, ORG_TYPES, placeCategory } from '../../constants/options'
import { colors, font, fontSize, radius, spacing } from '../../theme'

export default function PlaceDetailScreen({ route }) {
  const { place, km } = route.params
  const cat = placeCategory(place.categoria)
  const isOrg = place.categoria === 'ong'
  const org = ORG_TYPES[place.tipo_org]
  const apoios = (Array.isArray(place.formas_apoio) ? place.formas_apoio : []).filter((k) => FORMAS_APOIO[k])

  async function openMaps() {
    const label = encodeURIComponent(place.nome)
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${place.latitude},${place.longitude}`,
      android: `geo:0,0?q=${place.latitude},${place.longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`,
    })
    try {
      await Linking.openURL(url)
    } catch {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`).catch(() =>
        notify('Não foi possível abrir o mapa.')
      )
    }
  }

  function call() {
    const tel = String(place.telefone).replace(/\D/g, '')
    Linking.openURL(`tel:${tel}`).catch(() => notify('Não foi possível ligar', place.telefone))
  }

  return (
    <Screen edges={[]}>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Feather name={cat.icon} size={28} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{place.nome}</Text>
          <Muted>
            {cat.label}
            {km != null ? ` · ${formatKm(km)}` : ''}
          </Muted>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: spacing.lg }}>
        {org ? <Badge text={org.label} color={org.color} bg={org.bg} /> : null}
        {place.gratuito && !isOrg ? <Badge text="Gratuito" color={colors.warning} bg={colors.warningSoft} /> : null}
        {place.data_inicio ? (
          <Badge
            text={place.data_inicio === place.data_fim ? `Dia ${isoToBr(place.data_inicio)}` : `${isoToBr(place.data_inicio)} a ${isoToBr(place.data_fim)}`}
            color={colors.info}
            bg={colors.infoSoft}
          />
        ) : null}
      </View>

      {place.descricao ? <Body style={{ marginBottom: spacing.lg }}>{place.descricao}</Body> : null}

      <Card style={{ gap: spacing.md, marginBottom: spacing.lg }}>
        {place.endereco ? <InfoRow icon="map-pin" text={place.endereco} /> : null}
        {place.telefone ? <InfoRow icon="phone" text={place.telefone} /> : null}
        {place.horario ? <InfoRow icon="clock" text={place.horario} /> : null}
      </Card>

      {apoios.length ? (
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={styles.section}>Como ajudar</Text>
          <View style={styles.apoios}>
            {apoios.map((k) => (
              <View key={k} style={styles.apoio}>
                <Feather name={FORMAS_APOIO[k].icon} size={15} color={colors.primary} />
                <Text style={styles.apoioText}>{FORMAS_APOIO[k].label}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {place.necessidades ? (
        <Card style={[styles.needs, { marginBottom: spacing.lg }]}>
          <Text style={styles.needsLabel}>DO QUE ESTÃO PRECISANDO</Text>
          <Body>{place.necessidades}</Body>
        </Card>
      ) : null}

      <PlacesMap places={[place]} height={200} />

      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        <Button title="Como chegar" icon="navigation" onPress={openMaps} />
        {place.telefone ? <Button title={isOrg ? 'Ligar para ajudar' : 'Ligar'} icon="phone" variant="outline" onPress={call} /> : null}
      </View>
      {isOrg ? <Muted style={{ textAlign: 'center', marginTop: spacing.xl }}>{AVISO_DADOS_EXEMPLO}</Muted> : null}
    </Screen>
  )
}

function InfoRow({ icon, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Feather name={icon} size={18} color={colors.primary} />
      <Text style={{ flex: 1, fontFamily: font.regular, fontSize: fontSize.md, color: colors.text }}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  icon: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, marginBottom: 2 },
  section: { fontFamily: font.semibold, fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md },
  apoios: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  apoio: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, height: 36, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  apoioText: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.primaryDark },
  needs: { backgroundColor: colors.warningSoft, borderColor: '#F3DE9C', gap: 6 },
  needsLabel: { fontFamily: font.semibold, fontSize: fontSize.xs, color: colors.warning, letterSpacing: 0.5 },
})

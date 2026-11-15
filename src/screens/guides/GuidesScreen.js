// UC09: Consultar orientações sobre cuidados (RN29, RN30)
import React from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Card, EmptyState, ErrorState, Loading, Muted, OfflineBanner } from '../../components/ui'
import { useLoad } from '../../hooks/useLoad'
import { db } from '../../lib/db'
import { colors, font, fontSize, radius, spacing } from '../../theme'

const ICONS = {
  Vacinação: 'shield',
  Castração: 'scissors',
  Alimentação: 'coffee',
  Higiene: 'droplet',
  'Guarda responsável': 'home',
  Adoção: 'heart',
  'Sinais de alerta': 'alert-triangle',
}

export default function GuidesScreen({ navigation }) {
  const { data, error, loading, refreshing, refresh, reload } = useLoad(() => db.list('guides', { order: 'ordem', asc: true }))

  let empty
  if (loading) empty = <Loading />
  else if (error && !data) empty = <ErrorState text={error} onRetry={reload} />
  else empty = <EmptyState icon="book-open" title="Nenhuma orientação disponível" />

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <OfflineBanner />
      <FlatList
        data={loading || (error && !data) ? [] : data}
        keyExtractor={(g) => g.id}
        ListEmptyComponent={empty}
        ListHeaderComponent={<Muted style={{ marginBottom: spacing.lg }}>Informações gerais. Para dúvidas sobre o seu pet, consulte um veterinário.</Muted>}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('GuideDetail', { guide: item })} style={styles.card} accessibilityLabel={item.titulo}>
            <View style={styles.icon}>
              <Feather name={ICONS[item.tema] || 'book-open'} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tema}>{item.tema.toUpperCase()}</Text>
              <Text style={styles.title}>{item.titulo}</Text>
              {item.resumo ? <Muted numberOfLines={2}>{item.resumo}</Muted> : null}
            </View>
            <Feather name="chevron-right" size={20} color={colors.textLight} />
          </Card>
        )}
      />
    </View>
  )
}

export function GuideDetailScreen({ route, navigation }) {
  const { guide } = route.params
  React.useLayoutEffect(() => navigation.setOptions({ title: guide.tema }), [navigation, guide])
  const paragraphs = String(guide.conteudo || '').split(/\n{2,}/).filter(Boolean)
  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: 60 }}
      data={paragraphs}
      keyExtractor={(_, i) => String(i)}
      ListHeaderComponent={
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[styles.title, { fontSize: fontSize.xl }]}>{guide.titulo}</Text>
          {guide.resumo ? <Muted>{guide.resumo}</Muted> : null}
        </View>
      }
      ListEmptyComponent={<EmptyState icon="book-open" title="Conteúdo indisponível" />}
      renderItem={({ item }) => <Text style={styles.paragraph}>{item}</Text>}
    />
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, marginBottom: spacing.md },
  icon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  tema: { fontFamily: font.semibold, fontSize: fontSize.xs, color: colors.primary, letterSpacing: 0.5 },
  title: { fontFamily: font.semibold, fontSize: fontSize.md, color: colors.text, marginVertical: 2 },
  paragraph: { fontFamily: font.regular, fontSize: fontSize.md, color: colors.text, lineHeight: 24, marginBottom: spacing.lg },
})

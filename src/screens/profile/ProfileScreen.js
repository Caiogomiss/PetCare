// Perfil do tutor e lista de pets
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Screen from '../../components/Screen'
import { Button, Card, Muted, OfflineBanner, Photo, SectionHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useLoad } from '../../hooks/useLoad'
import { db } from '../../lib/db'
import { confirm } from '../../lib/confirm'
import { petAge } from '../../lib/format'
import { petLine } from '../wallet/WalletScreen'
import { colors, font, fontSize, radius, spacing } from '../../theme'

export default function ProfileScreen({ navigation }) {
  const { user, profile, signOut, onlineMode } = useAuth()
  const { data: pets, refreshing, refresh } = useLoad(() => db.list('pets', { order: 'created_at', asc: true }))

  async function logout() {
    if (await confirm('Sair', 'Deseja sair da sua conta?', { confirmText: 'Sair' })) signOut()
  }

  return (
    <>
      <OfflineBanner />
      <Screen refreshing={refreshing} onRefresh={refresh}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile?.nome || '?').trim()[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{profile?.nome}</Text>
          <Muted>{user?.email}</Muted>
        </View>

        <Card style={{ padding: 0 }}>
          <MenuItem icon="user" label="Meus dados" onPress={() => navigation.navigate('ProfileEdit')} />
          <MenuItem icon="bell" label="Alertas da comunidade" onPress={() => navigation.navigate('Alerts')} />
          <MenuItem icon="book-open" label="Orientações sobre cuidados" onPress={() => navigation.navigate('Guides')} last />
        </Card>

        <SectionHeader title="Meus pets" action="Adicionar" onAction={() => navigation.navigate('PetForm')} />
        {pets && !pets.length ? (
          <Card onPress={() => navigation.navigate('PetForm')} style={styles.petRow}>
            <Photo icon="plus" size={52} rounded={26} />
            <Text style={styles.petName}>Cadastrar meu primeiro pet</Text>
          </Card>
        ) : null}
        {(pets || []).map((p) => (
          <Card key={p.id} onPress={() => navigation.navigate('Carteirinha', { petId: p.id })} style={styles.petRow} accessibilityLabel={`Abrir carteirinha de ${p.nome}`}>
            <Photo uri={p.foto_url} size={52} rounded={26} icon="heart" />
            <View style={{ flex: 1 }}>
              <Text style={styles.petName}>{p.nome}</Text>
              <Muted numberOfLines={1}>{[petLine(p), petAge(p.data_nascimento)].filter(Boolean).join(' · ')}</Muted>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textLight} />
          </Card>
        ))}

        <Button title="Sair da conta" icon="log-out" variant="outline" onPress={logout} style={{ marginTop: spacing.xl }} />
        <Muted style={{ textAlign: 'center', marginTop: spacing.lg, fontSize: fontSize.xs }}>
          PetCare 1.0 · {onlineMode ? 'dados sincronizados na nuvem' : 'modo local (dados só neste aparelho)'}
        </Muted>
      </Screen>
    </>
  )
}

function MenuItem({ icon, label, onPress, last }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menu, !last && styles.menuBorder, pressed && { backgroundColor: colors.bg }]} accessibilityRole="button">
      <Feather name={icon} size={20} color={colors.primary} />
      <Text style={styles.menuText}>{label}</Text>
      <Feather name="chevron-right" size={20} color={colors.textLight} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primarySoft, borderWidth: 3, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { fontFamily: font.bold, fontSize: 36, color: colors.primary },
  name: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, marginBottom: 2 },
  menu: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, minHeight: 56, borderRadius: radius.lg },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border, borderRadius: 0 },
  menuText: { flex: 1, fontFamily: font.medium, fontSize: fontSize.md, color: colors.text },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  petName: { fontFamily: font.semibold, fontSize: fontSize.md, color: colors.text },
})

// Componentes visuais reutilizados em todas as telas.
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors, font, fontSize, radius, shadow, spacing } from '../theme'
import { subscribeOffline } from '../lib/db'
import { MSG } from '../constants/messages'
import { maskDate } from '../lib/format'

// ---------- Texto ----------
export function Title({ children, style }) {
  return <Text style={[s.title, style]}>{children}</Text>
}
export function Subtitle({ children, style }) {
  return <Text style={[s.subtitle, style]}>{children}</Text>
}
export function Body({ children, style, numberOfLines }) {
  return (
    <Text style={[s.body, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  )
}
export function Muted({ children, style, numberOfLines }) {
  return (
    <Text style={[s.muted, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  )
}

// ---------- Botões ----------
export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style, small }) {
  const isPrimary = variant === 'primary'
  const isDanger = variant === 'danger'
  const fg = isPrimary ? colors.textInverse : isDanger ? colors.danger : colors.primary
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        isPrimary && s.btnPrimary,
        variant === 'outline' && s.btnOutline,
        isDanger && s.btnDanger,
        variant === 'ghost' && s.btnGhost,
        (disabled || loading) && { opacity: 0.55 },
        pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={small ? 15 : 18} color={fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[s.btnText, small && { fontSize: fontSize.sm }, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  )
}

export function IconButton({ icon, onPress, label, color = colors.primary, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.7 }, style]}
    >
      <Feather name={icon} size={20} color={color} />
    </Pressable>
  )
}

export function Fab({ onPress, label, icon = 'plus' }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.fab, pressed && { transform: [{ scale: 0.95 }] }]}
    >
      <Feather name={icon} size={26} color={colors.textInverse} />
    </Pressable>
  )
}

// ---------- Formulário ----------
export function Field({ label, error, hint, required, children }) {
  return (
    <View style={s.field}>
      {label ? (
        <Text style={s.label}>
          {label}
          {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
        </Text>
      ) : null}
      {children}
      {error ? (
        <Text style={s.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={s.hint}>{hint}</Text>
      ) : null}
    </View>
  )
}

export function Input({ label, error, hint, required, style, multiline, icon, right, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <View style={[s.inputWrap, focused && s.inputFocused, error && s.inputError, multiline && { alignItems: 'flex-start' }]}>
        {icon ? <Feather name={icon} size={18} color={colors.textLight} style={{ marginRight: 8, marginTop: multiline ? 12 : 0 }} /> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textLight}
          style={[s.input, multiline && { minHeight: 96, textAlignVertical: 'top', paddingTop: 12 }, style]}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {right}
      </View>
    </Field>
  )
}

export function PasswordInput(props) {
  const [show, setShow] = useState(false)
  return (
    <Input
      {...props}
      secureTextEntry={!show}
      autoCapitalize="none"
      autoCorrect={false}
      right={
        <Pressable onPress={() => setShow((v) => !v)} hitSlop={10} accessibilityLabel={show ? 'Ocultar senha' : 'Mostrar senha'}>
          <Feather name={show ? 'eye-off' : 'eye'} size={18} color={colors.textLight} />
        </Pressable>
      }
    />
  )
}

export function DateInput({ value, onChangeText, ...props }) {
  return (
    <Input
      {...props}
      value={value}
      onChangeText={(t) => onChangeText(maskDate(t))}
      placeholder="DD/MM/AAAA"
      keyboardType="number-pad"
      maxLength={10}
      icon="calendar"
    />
  )
}

// Botões de escolha única (ex.: Cão / Gato / Outro)
export function Segmented({ label, options, value, onChange, error, required }) {
  return (
    <Field label={label} error={error} required={required}>
      <View style={s.segmented}>
        {options.map((o) => {
          const active = o.value === value
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(o.value)}
              style={[s.segment, active && s.segmentActive]}
            >
              <Text style={[s.segmentText, active && s.segmentTextActive]}>{o.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </Field>
  )
}

export function Switch({ label, value, onChange }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={s.check}
    >
      <View style={[s.checkBox, value && s.checkBoxOn]}>{value ? <Feather name="check" size={14} color="#fff" /> : null}</View>
      <Text style={s.body}>{label}</Text>
    </Pressable>
  )
}

// ---------- Chips de filtro ----------
export function Chips({ options, value, onChange, style }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.chips, style]}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[s.chip, active && s.chipActive]}
          >
            <Text style={[s.chipText, active && s.chipTextActive]}>{o.label}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

export function Badge({ text, color = colors.primaryDark, bg = colors.primarySoft }) {
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={[s.badgeText, { color }]}>{text}</Text>
    </View>
  )
}

// ---------- Cartões ----------
export function Card({ children, onPress, style, accessibilityLabel }) {
  if (!onPress) return <View style={[s.card, style]}>{children}</View>
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }, style]}
    >
      {children}
    </Pressable>
  )
}

export function Photo({ uri, size = 64, icon = 'image', rounded = radius.md, style }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [uri])
  if (!uri || failed) {
    return (
      <View style={[{ width: size, height: size, borderRadius: rounded, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, style]}>
        <Feather name={icon} size={size * 0.4} color={colors.primary} />
      </View>
    )
  }
  return <Image source={{ uri }} onError={() => setFailed(true)} style={[{ width: size, height: size, borderRadius: rounded, backgroundColor: colors.border }, style]} />
}

export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={s.link}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

// ---------- Estados ----------
export function Loading({ text = 'Carregando...' }) {
  return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Muted style={{ marginTop: spacing.md }}>{text}</Muted>
    </View>
  )
}

export function EmptyState({ icon = 'inbox', title, text, action, onAction }) {
  return (
    <View style={s.center}>
      <View style={s.emptyIcon}>
        <Feather name={icon} size={30} color={colors.primary} />
      </View>
      <Subtitle style={{ textAlign: 'center' }}>{title}</Subtitle>
      {text ? <Muted style={{ textAlign: 'center', marginTop: 6, maxWidth: 280 }}>{text}</Muted> : null}
      {action ? <Button title={action} onPress={onAction} style={{ marginTop: spacing.lg }} small /> : null}
    </View>
  )
}

export function ErrorState({ text, onRetry }) {
  return (
    <View style={s.center}>
      <View style={[s.emptyIcon, { backgroundColor: colors.dangerSoft }]}>
        <Feather name="wifi-off" size={28} color={colors.danger} />
      </View>
      <Subtitle style={{ textAlign: 'center' }}>{MSG.MSG21}</Subtitle>
      {text ? <Muted style={{ textAlign: 'center', marginTop: 6, maxWidth: 280 }}>{text}</Muted> : null}
      {onRetry ? <Button title="Tentar de novo" variant="outline" onPress={onRetry} style={{ marginTop: spacing.lg }} small /> : null}
    </View>
  )
}

export function FormError({ text }) {
  if (!text) return null
  return (
    <View style={s.formError} accessibilityLiveRegion="assertive">
      <Feather name="alert-circle" size={18} color={colors.danger} />
      <Text style={s.formErrorText}>{text}</Text>
    </View>
  )
}

// Faixa que aparece quando o app está sem conexão
export function OfflineBanner() {
  const [off, setOff] = useState(false)
  useEffect(() => subscribeOffline(setOff), [])
  if (!off) return null
  return (
    <View style={s.offline}>
      <Feather name="wifi-off" size={14} color={colors.warning} />
      <Text style={s.offlineText}>{MSG.OFFLINE_CACHE}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  title: { fontFamily: font.bold, fontSize: fontSize.xxl, color: colors.text },
  subtitle: { fontFamily: font.semibold, fontSize: fontSize.lg, color: colors.text },
  body: { fontFamily: font.regular, fontSize: fontSize.md, color: colors.text, lineHeight: 22 },
  muted: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19 },
  link: { fontFamily: font.semibold, fontSize: fontSize.sm, color: colors.primary },

  btn: { minHeight: 52, borderRadius: radius.md, paddingHorizontal: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnSmall: { minHeight: 40, paddingHorizontal: spacing.lg },
  btnPrimary: { backgroundColor: colors.primary },
  btnOutline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.card },
  btnDanger: { borderWidth: 1.5, borderColor: colors.danger, backgroundColor: colors.card },
  btnGhost: { backgroundColor: 'transparent' },
  btnText: { fontFamily: font.semibold, fontSize: fontSize.md },
  iconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: spacing.xl, bottom: spacing.xl, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadow, elevation: 6 },

  field: { marginBottom: spacing.lg },
  label: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, minHeight: 48, fontFamily: font.regular, fontSize: fontSize.md, color: colors.text, outlineStyle: 'none' },
  error: { fontFamily: font.regular, fontSize: fontSize.xs + 1, color: colors.danger, marginTop: 5 },
  hint: { fontFamily: font.regular, fontSize: fontSize.xs + 1, color: colors.textLight, marginTop: 5 },

  segmented: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  segment: { flexGrow: 1, minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  segmentText: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.textMuted },
  segmentTextActive: { color: colors.primaryDark },

  check: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg, minHeight: 40 },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  checkBoxOn: { backgroundColor: colors.primary, borderColor: colors.primary },

  chips: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: 2 },
  chip: { paddingHorizontal: spacing.lg, height: 38, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.textInverse },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, alignSelf: 'flex-start' },
  badgeText: { fontFamily: font.semibold, fontSize: fontSize.xs },

  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, ...shadow },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md },
  sectionTitle: { fontFamily: font.semibold, fontSize: fontSize.lg, color: colors.text },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, minHeight: 260 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },

  formError: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.dangerSoft, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg },
  formErrorText: { flex: 1, fontFamily: font.medium, fontSize: fontSize.sm, color: colors.danger },

  offline: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.warningSoft, paddingVertical: 6, paddingHorizontal: spacing.lg },
  offlineText: { fontFamily: font.medium, fontSize: fontSize.xs, color: colors.warning, flex: 1 },
})

import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'

// ── PROPS ─────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean
  transactionCount: number
  onDismiss: () => void
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function UploadToast({ visible, transactionCount, onDismiss }: Props) {
  const theme = useTheme()

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <ToastLine accent>{`${transactionCount} transactions imported`}</ToastLine>
      <ToastLine accent>Account numbers masked</ToastLine>
      <ToastLine accent>Raw file discarded</ToastLine>
      <ToastLine accent>Data stored securely on your device</ToastLine>
    </View>
  )
}

// ── INTERNAL ──────────────────────────────────────────────────────────────────

function ToastLine({ children, accent }: { children: string; accent?: boolean }) {
  const theme = useTheme()
  return (
    <View style={styles.line}>
      <Text style={[styles.check, { color: colours.accent }]}>✓ </Text>
      <Text style={[styles.lineText, { color: theme.textPrimary }]}>{children}</Text>
    </View>
  )
}

// ── STYLES ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minWidth: 260,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  check: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  lineText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    flex: 1,
  },
})

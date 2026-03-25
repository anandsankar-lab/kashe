import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import type { ParseSuccess, Tier2AccountType, RouteDetectionResult } from '../../services/ingestion'

// ── PROPS ─────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean
  parseResult: ParseSuccess
  onConfirm: (isJoint: boolean, accountLabel: string, tier2AccountType: Tier2AccountType) => void
  onClose: () => void
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function DataSourceConfirmSheet({
  visible,
  parseResult,
  onConfirm,
  onClose,
}: Props) {
  const theme = useTheme()

  const defaultLabel = `${parseResult.institution} account`
  const [isJoint, setIsJoint] = useState(false)
  const [accountLabel, setAccountLabel] = useState(defaultLabel)

  const routeDetection: RouteDetectionResult = parseResult.routeDetection
  const [selectedTier2, setSelectedTier2] = useState<Tier2AccountType | null>(
    routeDetection.tier2Suggestion
  )

  function handleConfirm() {
    if (!selectedTier2) return
    onConfirm(isJoint, accountLabel.trim() || defaultLabel, selectedTier2)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Confirm import
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8} activeOpacity={0.7}>
              <Text style={[styles.closeButton, { color: theme.textDim }]}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Detected bank */}
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Detected bank
            </Text>
            <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
              {parseResult.institution.replace(/_/g, ' ')}
            </Text>
          </View>

          {/* Transaction count */}
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Transactions found
            </Text>
            <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
              {parseResult.transactions.length}
            </Text>
          </View>

          {/* Import route pill */}
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Import type
            </Text>
            <View style={styles.routePill}>
              <Text style={styles.routePillText}>
                {routeDetection.tier1Route === 'portfolio' ? 'Portfolio import' : 'Spend import'}
              </Text>
            </View>
          </View>

          {/* Account type selector */}
          <View style={styles.sectionRow}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              What type of account is this?
            </Text>
            {routeDetection.confidence === 'unknown' && (
              <Text style={[styles.helperText, { color: theme.textDim }]}>
                We couldn't detect this automatically — please select
              </Text>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              {(routeDetection.tier1Route === 'spend'
                ? ([
                    { key: 'savings_account', label: 'Savings account' },
                    { key: 'current_account', label: 'Current account' },
                    { key: 'credit_card', label: 'Credit card' },
                    { key: 'joint_account', label: 'Joint account' },
                  ] as { key: Tier2AccountType; label: string }[])
                : ([
                    { key: 'brokerage', label: 'Brokerage' },
                    { key: 'mutual_fund_folio', label: 'Mutual funds' },
                    { key: 'retirement', label: 'Retirement (NPS/EPF)' },
                    { key: 'fixed_deposit_account', label: 'Fixed deposit' },
                    { key: 'other_investment', label: 'Other investment' },
                  ] as { key: Tier2AccountType; label: string }[])
              ).map(option => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setSelectedTier2(option.key)}
                  style={[
                    styles.typePill,
                    {
                      backgroundColor: selectedTier2 === option.key ? colours.accent : theme.surface,
                      borderColor: selectedTier2 === option.key ? colours.accent : theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      {
                        color: selectedTier2 === option.key
                          ? colours.textOnAccent
                          : theme.textSecondary,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Account label */}
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Account label
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              value={accountLabel}
              onChangeText={setAccountLabel}
              placeholder={defaultLabel}
              placeholderTextColor={theme.textDim}
            />
          </View>

          {/* Joint toggle */}
          <View style={styles.toggleRow}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Joint account?
            </Text>
            <Switch
              value={isJoint}
              onValueChange={setIsJoint}
              trackColor={{ false: theme.border, true: colours.accent }}
              thumbColor={colours.surface}
            />
          </View>

          {/* CTA */}
          <View style={styles.ctaArea}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: selectedTier2 === null ? theme.border : colours.accent }]}
              onPress={handleConfirm}
              activeOpacity={0.85}
              disabled={selectedTier2 === null}
            >
              <Text style={styles.confirmButtonText}>Confirm import</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.cancelButton}
            >
              <Text style={[styles.cancelText, { color: theme.textDim }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

// ── STYLES ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  closeButton: {
    fontFamily: 'Inter_400Regular',
    fontSize: 22,
    lineHeight: 26,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  infoValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  sectionRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  pillScroll: {
    marginTop: 4,
  },
  typePill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  typePillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  fieldRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  fieldLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  textInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  ctaArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  confirmButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: colours.textOnAccent,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  cancelText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  routePill: {
    backgroundColor: colours.accent,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  routePillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colours.textOnAccent,
  },
})

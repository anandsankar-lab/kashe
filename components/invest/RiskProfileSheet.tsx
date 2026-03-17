import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import { RiskProfileType, RISK_PROFILES } from '../../types/riskProfile'

interface RiskProfileSheetProps {
  visible: boolean
  currentProfile: RiskProfileType | null
  onConfirm: (profile: RiskProfileType) => void
  onClose: () => void
}

const PROFILE_ORDER: RiskProfileType[] = ['conservative', 'balanced', 'growth']

export default function RiskProfileSheet({
  visible,
  currentProfile,
  onConfirm,
  onClose,
}: RiskProfileSheetProps) {
  const theme = useTheme()
  const [selected, setSelected] = useState<RiskProfileType>(
    currentProfile ?? 'balanced'
  )

  useEffect(() => {
    setSelected(currentProfile ?? 'balanced')
  }, [currentProfile])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Your risk profile
          </Text>

          <Text style={[styles.allocationHeader, { color: theme.textDim }]}>
            GROWTH · STABILITY · LOCKED
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {PROFILE_ORDER.map((type) => {
              const profile = RISK_PROFILES[type]
              const isSelected = selected === type

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionCard,
                    isSelected
                      ? {
                          borderWidth: 2,
                          borderColor: colours.accent,
                          backgroundColor: 'rgba(200,240,74,0.08)',
                        }
                      : {
                          borderWidth: 1,
                          borderColor: theme.border,
                          backgroundColor: theme.surface,
                        },
                  ]}
                  onPress={() => setSelected(type)}
                >
                  <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>
                    {profile.label}
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                    {profile.description}
                  </Text>
                  <Text style={[styles.optionAllocation, { color: theme.textDim }]}>
                    {profile.targetAllocation.growth} · {profile.targetAllocation.stability} · {profile.targetAllocation.locked}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => onConfirm(selected)}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  optionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  optionDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  allocationHeader: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 0.8,
    textAlign: 'right',
    marginBottom: 8,
  },
  optionAllocation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  confirmButton: {
    backgroundColor: '#C8F04A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  confirmText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#111110',
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  cancelText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
})

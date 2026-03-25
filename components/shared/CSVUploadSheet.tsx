import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import { ingestFile, detectFileType } from '../../services/ingestion'
import type { ParseSuccess, Tier2AccountType } from '../../services/ingestion'
import DataSourceConfirmSheet from './DataSourceConfirmSheet'
import useSpendStore from '../../store/spendStore'
import usePortfolioStore from '../../store/portfolioStore'
import useHouseholdStore from '../../store/householdStore'
import useAuditStore from '../../store/auditStore'
import buildUserFinancialProfile from '../../services/userProfileService'

// ── PROPS ─────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean
  onClose: () => void
  onUploadComplete: (transactionCount: number) => void
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function CSVUploadSheet({ visible, onClose, onUploadComplete }: Props) {
  const theme = useTheme()

  const [parseResult, setParseResult] = useState<ParseSuccess | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [row1Loading, setRow1Loading] = useState(false)
  const [row2Loading, setRow2Loading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Store access — permitted: this sheet is the service orchestrator for file I/O
  const addTransactions = useSpendStore(s => s.addTransactions)
  const existingTransactions = useSpendStore(s => s.transactions)
  const dataSources = useSpendStore(s => s.dataSources)
  const addDataSource = useSpendStore(s => s.addDataSource)

  const holdings = usePortfolioStore(s => s.holdings)
  const derived = usePortfolioStore(s => s.derived)
  const addHoldings = usePortfolioStore(s => s.addHoldings)
  const addPendingHoldings = usePortfolioStore(s => s.addPendingHoldings)

  const riskProfile = useHouseholdStore(s => s.riskProfile)
  const onboardingComplete = useHouseholdStore(s => s.onboardingComplete)
  const updateFinancialProfile = useHouseholdStore(s => s.updateFinancialProfile)

  const logImport = useAuditStore(s => s.logImport)

  // ── PICK + PARSE ─────────────────────────────────────────────────────────────

  async function handleRowPress(setLoading: (b: boolean) => void) {
    setParseError(null)
    setLoading(true)
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'text/comma-separated-values',
          'text/plain',
          'text/tab-separated-values',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'public.comma-separated-values-text',
          'public.plain-text',
          'com.microsoft.excel.xls',
          'org.openxmlformats.spreadsheetml.sheet',
        ],
        copyToCacheDirectory: false,
      })

      if (pickerResult.canceled) {
        setLoading(false)
        return
      }

      const asset = pickerResult.assets[0]
      const uri = asset.uri
      const filename = asset.name ?? ''
      const isXlsx = /\.(xlsx|xls)$/i.test(filename)
      const content = isXlsx
        ? await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as const })
        : await FileSystem.readAsStringAsync(uri)
      const fileType = detectFileType(filename)
      const parsed = await ingestFile({
        content,
        fileType,
        filename,
        dataSourceId: 'csv-upload',
        profileId: 'user',
        householdId: 'household',
        existingTransactions,
      })

      if (!parsed.success) {
        setParseError(parsed.errorMessage)
        setLoading(false)
        return
      }

      setParseResult(parsed)
      setShowConfirm(true)
    } catch {
      setParseError('Something went wrong reading the file. Please try again.')
    }
    setLoading(false)
  }

  // ── CONFIRM CALLBACK ──────────────────────────────────────────────────────────

  async function handleConfirm(isJoint: boolean, accountLabel: string, tier2AccountType: Tier2AccountType) {
    if (!parseResult) return
    setShowConfirm(false)

    const route = parseResult.routeDetection.tier1Route

    if (route === 'spend') {
      // 1. Add transactions
      addTransactions(parseResult.transactions, 'GLOBAL')

      // 2. Register data source
      addDataSource({
        id: `${parseResult.institution}-${Date.now()}`,
        institution: parseResult.institution,
        accountLabel,
        lastUpdatedDays: 0,
        status: 'FRESH',
        type: 'SPEND',
      })
    } else {
      // Portfolio path
      addHoldings(parseResult.holdings)
      addPendingHoldings(parseResult.pendingHoldings)

      // Register as portfolio data source (type PORTFOLIO)
      addDataSource({
        id: `${parseResult.institution}-${Date.now()}`,
        institution: parseResult.institution,
        accountLabel,
        lastUpdatedDays: 0,
        status: 'FRESH',
        type: 'PORTFOLIO',
      })
    }

    // 3. Rebuild UserFinancialProfile
    try {
      const profile = await buildUserFinancialProfile({
        holdings,
        transactions: route === 'spend'
          ? [...existingTransactions, ...parseResult.transactions]
          : existingTransactions,
        dataSources: dataSources.map(ds => ({ institution: ds.institution })),
        financialPosition: derived.financialPosition,
        riskProfile,
        baseCountry: 'GLOBAL',
        householdType: 'individual',
        managedProfileCount: 0,
        onboardingComplete,
        riskProfileActivelySet: false,
        protectionDesignated: derived.protectionAsset !== null,
        protectionMonthsCovered: derived.protectionMonthsCovered,
        budgetsConfigured: false,
        monthlyTargetSet: false,
        fireIsSetUp: false,
        skippedAgeScreen: false,
        monthlyReviewCount: 0,
        importCountLifetime: 1,
        hasMortgage: false,
        firstSeenDate: new Date().toISOString(),
        firstUploadDate: new Date().toISOString().slice(0, 10),
        existingProfile: null,
      })
      updateFinancialProfile(profile)
    } catch {
      // non-blocking
    }

    // 4. Log to audit store
    logImport({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      profileId: 'user',
      householdId: 'household',
      timestamp: new Date().toISOString(),
      institution: parseResult.auditData.institution,
      transactionCount: parseResult.auditData.transactionCount,
      duplicatesSkipped: parseResult.auditData.duplicatesSkipped,
      probableDuplicatesFound: parseResult.auditData.probableDuplicatesFound,
      layer2Queued: parseResult.auditData.layer2Queued,
      parseConfidence: parseResult.auditData.parseConfidence,
      status: 'success',
    })

    // 5. Notify parent
    const count = route === 'spend'
      ? parseResult.transactions.length
      : parseResult.holdings.length + parseResult.pendingHoldings.length
    onUploadComplete(count)
    onClose()
  }

  function handleConfirmClose() {
    setShowConfirm(false)
    setParseResult(null)
  }

  // ── RENDER ────────────────────────────────────────────────────────────────────

  return (
    <>
      <Modal
        visible={visible && !showConfirm}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.surface }]}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />

            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Add your data
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={8} activeOpacity={0.7}>
                <Text style={[styles.closeButton, { color: theme.textDim }]}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Row 1 — Bank statement */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => handleRowPress(setRow1Loading)}
              activeOpacity={0.7}
              disabled={row1Loading || row2Loading}
            >
              <View style={[styles.iconArea, { backgroundColor: theme.background }]}>
                <Text style={styles.rowIcon}>🏦</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>
                  Upload bank statement
                </Text>
                <Text style={[styles.rowSublabel, { color: theme.textSecondary }]}>
                  CSV, TXT or Excel · ABN Amro, HDFC, ING &amp; more
                </Text>
              </View>
              {row1Loading
                ? <ActivityIndicator size="small" color={theme.textDim} />
                : <Text style={[styles.chevron, { color: theme.textDim }]}>›</Text>
              }
            </TouchableOpacity>

            {/* Row 2 — Portfolio CSV */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => handleRowPress(setRow2Loading)}
              activeOpacity={0.7}
              disabled={row1Loading || row2Loading}
            >
              <View style={[styles.iconArea, { backgroundColor: theme.background }]}>
                <Text style={styles.rowIcon}>📊</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>
                  Upload portfolio CSV
                </Text>
                <Text style={[styles.rowSublabel, { color: theme.textSecondary }]}>
                  CSV or Excel · DeGiro, HDFC Securities &amp; more
                </Text>
              </View>
              {row2Loading
                ? <ActivityIndicator size="small" color={theme.textDim} />
                : <Text style={[styles.chevron, { color: theme.textDim }]}>›</Text>
              }
            </TouchableOpacity>

            {parseError !== null && (
              <Text style={styles.errorText}>{parseError}</Text>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {parseResult !== null && (
        <DataSourceConfirmSheet
          visible={showConfirm}
          parseResult={parseResult}
          onConfirm={handleConfirm}
          onClose={handleConfirmClose}
        />
      )}
    </>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  iconArea: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIcon: {
    fontSize: 18,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  rowSublabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colours.danger,
    marginHorizontal: 20,
    marginTop: 4,
  },
})

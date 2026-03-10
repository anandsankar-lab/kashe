import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  Easing,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';
import CategoryIcon from './CategoryIcon';
import Button from '../ui/Button';
import { SpendCategoryData, CATEGORY_META } from '../../types/spend';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  categories: SpendCategoryData[];
  onSave: (budgets: Record<string, number | null>) => void;
}

export default function SpendBudgetSheet({
  isVisible,
  onClose,
  categories,
  onSave,
}: Props) {
  const theme = useTheme();
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  const filteredCategories = categories.filter(
    (c) => CATEGORY_META.find((m) => m.id === c.id)?.showInBudgetSheet === true
  );

  const [localBudgets, setLocalBudgets] = useState<
    Record<string, number | null>
  >(() =>
    Object.fromEntries(
      filteredCategories.map((c) => [c.id, c.budgetAmount])
    )
  );

  useEffect(() => {
    if (isVisible) {
      Animated.timing(sheetAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sheetAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, sheetAnim]);

  const translateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const borderColor = theme.border;
  const surfaceColor = theme.surface;

  const totalBudgeted = Object.values(localBudgets)
    .filter((v): v is number => v !== null)
    .reduce((a, b) => a + b, 0);

  function updateBudget(id: string, val: string) {
    const parsed = parseFloat(val);
    setLocalBudgets((prev) => ({
      ...prev,
      [id]: val === '' || isNaN(parsed) ? null : parsed,
    }));
  }

  function clearBudget(id: string) {
    setLocalBudgets((prev) => ({ ...prev, [id]: null }));
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        {/* Scrim */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
            Platform.OS === 'web' && ({ outline: 'none' } as object),
          ]}
        />

        {/* Sheet */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: surfaceColor,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: screenHeight * 0.85,
            paddingBottom: 32,
            transform: [{ translateY }],
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              backgroundColor: borderColor,
              marginTop: 12,
              marginBottom: 4,
              alignSelf: 'center',
            }}
          />

          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 4,
            }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 18,
                color: colours.textPrimary,
              }}
            >
              Monthly budgets
            </Text>
          </View>

          {/* Dim note */}
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: colours.textDim,
              paddingHorizontal: 20,
              marginBottom: 16,
            }}
          >
            Set a limit for each category
          </Text>

          {/* Scrollable category list */}
          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredCategories.map((cat) => {
              const value = localBudgets[cat.id];
              const hasValue = value !== null;

              return (
                <View
                  key={cat.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: borderColor,
                  }}
                >
                  {/* Left: icon + name */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <CategoryIcon
                      categoryId={cat.id}
                      size={20}
                      color={colours.textSecondary}
                    />
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 15,
                        color: colours.textPrimary,
                      }}
                    >
                      {cat.name}
                    </Text>
                  </View>

                  {/* Right: currency + input + clear */}
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 15,
                        color: colours.textDim,
                        marginRight: 2,
                      }}
                    >
                      €
                    </Text>
                    <TextInput
                      style={{
                        fontFamily: 'SpaceGrotesk_600SemiBold',
                        fontSize: 15,
                        color: colours.textPrimary,
                        textAlign: 'right',
                        minWidth: 60,
                      }}
                      keyboardType="numeric"
                      placeholder="—"
                      placeholderTextColor={colours.textDim}
                      value={hasValue ? String(value) : ''}
                      onChangeText={(v) => updateBudget(cat.id, v)}
                    />
                    {hasValue && (
                      <TouchableOpacity
                        onPress={() => clearBudget(cat.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={[
                          { marginLeft: 8 },
                          Platform.OS === 'web' && ({ outline: 'none' } as object),
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: 'Inter_400Regular',
                            fontSize: 16,
                            color: colours.textDim,
                          }}
                        >
                          ×
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Total row */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderTopWidth: 1,
                borderTopColor: borderColor,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: colours.textSecondary,
                }}
              >
                Total budgeted
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  fontSize: 14,
                  color: colours.textPrimary,
                }}
              >
                €{totalBudgeted.toLocaleString()}
              </Text>
            </View>

            {/* Actions */}
            <View style={{ paddingHorizontal: 20, gap: 12 }}>
              <Button
                label="Save budgets"
                variant="primary"
                onPress={() => {
                  onSave(localBudgets);
                  onClose();
                }}
              />
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={Platform.OS === 'web' ? ({ outline: 'none' } as object) : undefined}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 15,
                    color: colours.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (dateString: string) => void;
  initialValue?: string;
  title?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  initialValue,
  title = 'Select Date'
}) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [viewMode, setViewMode] = useState<'calendar' | 'year' | 'month'>('calendar');

  useEffect(() => {
    if (visible) {
      setViewMode('calendar');
      if (initialValue) {
        const parsed = new Date(initialValue);
        if (!isNaN(parsed.getTime())) {
          setSelectedDate(parsed);
          setCurrentYear(parsed.getFullYear());
          setCurrentMonth(parsed.getMonth());
          return;
        }
      }
      // default to today
      setSelectedDate(today);
      setCurrentYear(today.getFullYear());
      setCurrentMonth(today.getMonth());
    }
  }, [visible, initialValue]);

  // Calendar math
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate calendar grid
  const days: (number | null)[] = [];
  // Add empty slots for offset
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDaySelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectYear = (year: number) => {
    setCurrentYear(year);
    setViewMode('calendar');
  };

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setViewMode('calendar');
  };

  const handleConfirm = () => {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    onSelect(`${yyyy}-${mm}-${dd}`);
    onClose();
  };

  // Generate years list (e.g. last 40 years to next 5 years)
  const startYear = today.getFullYear() - 35;
  const endYear = today.getFullYear() + 5;
  const years = [];
  for (let y = endYear; y >= startYear; y--) {
    years.push(y);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>

          {/* View Mode Selectors */}
          <View style={styles.selectorRow}>
            <TouchableOpacity onPress={() => setViewMode(viewMode === 'month' ? 'calendar' : 'month')} style={styles.selectorBtn}>
              <Text style={styles.selectorText}>{MONTHS[currentMonth]}</Text>
              <Icon name="chevron-down" size={14} color="#0D9488" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setViewMode(viewMode === 'year' ? 'calendar' : 'year')} style={styles.selectorBtn}>
              <Text style={styles.selectorText}>{currentYear}</Text>
              <Icon name="chevron-down" size={14} color="#0D9488" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <View style={styles.calendarContainer}>
              {/* Month Navigation */}
              <View style={styles.navRow}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrow}>
                  <Icon name="chevron-back" size={20} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.navLabel}>{MONTHS[currentMonth]} {currentYear}</Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navArrow}>
                  <Icon name="chevron-forward" size={20} color="#475569" />
                </TouchableOpacity>
              </View>

              {/* Days of Week Headers */}
              <View style={styles.weekHeaderRow}>
                {DAYS_OF_WEEK.map((d, index) => (
                  <Text key={index} style={styles.weekHeaderCell}>{d}</Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {days.map((day, idx) => {
                  if (day === null) {
                    return <View key={idx} style={styles.dayCell} />;
                  }

                  const isSelected = selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentMonth &&
                    selectedDate.getFullYear() === currentYear;

                  const isToday = today.getDate() === day &&
                    today.getMonth() === currentMonth &&
                    today.getFullYear() === currentYear;

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleDaySelect(day)}
                      style={[
                        styles.dayCell,
                        isSelected && styles.selectedDayCell,
                        isToday && !isSelected && styles.todayCell
                      ]}
                    >
                      <Text style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        isToday && !isSelected && styles.todayText
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Year Selection View */}
          {viewMode === 'year' && (
            <ScrollView style={styles.scrollSelector} contentContainerStyle={styles.scrollSelectorContent}>
              {years.map(y => (
                <TouchableOpacity
                  key={y}
                  onPress={() => handleSelectYear(y)}
                  style={[styles.yearItem, currentYear === y && styles.selectedYearItem]}
                >
                  <Text style={[styles.yearItemText, currentYear === y && styles.selectedYearItemText]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Month Selection View */}
          {viewMode === 'month' && (
            <ScrollView style={styles.scrollSelector} contentContainerStyle={styles.scrollSelectorContent}>
              {MONTHS.map((m, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectMonth(idx)}
                  style={[styles.yearItem, currentMonth === idx && styles.selectedYearItem]}
                >
                  <Text style={[styles.yearItemText, currentMonth === idx && styles.selectedYearItemText]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: Dimensions.get('window').width * 0.88,
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  header: {
    backgroundColor: '#0D9488',
    padding: 20,
  },
  headerTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
  selectorRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  selectorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
  },
  calendarContainer: {
    padding: 16,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navArrow: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekHeaderCell: {
    flex: 1,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  selectedDayCell: {
    backgroundColor: '#0D9488',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  todayText: {
    color: '#0D9488',
  },
  scrollSelector: {
    height: 240,
    backgroundColor: '#FFFFFF',
  },
  scrollSelectorContent: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  yearItem: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  selectedYearItem: {
    backgroundColor: '#F0FDF4',
  },
  yearItemText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
  selectedYearItemText: {
    color: '#0D9488',
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 14,
  },
  confirmBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default DatePickerModal;

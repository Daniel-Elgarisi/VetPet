import React, { useState, useEffect } from 'react';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import { View, StyleSheet } from 'react-native';

LocaleConfig.locales['he'] = {
  monthNames: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
  monthNamesShort: ["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יוני", "יולי", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"],
  dayNames: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  dayNamesShort: ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'",],
  today: "היום"
};
LocaleConfig.defaultLocale = 'he';

const HebrewDatePicker = ({ onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM-DD'));
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');

  const generateDisabledSaturdays = async (month) => {
    const startOfMonth = moment(month).startOf('month');
    const endOfMonth = moment(month).endOf('month');
    let current = startOfMonth.clone();
    let saturdays = {};
    const today = moment().format('YYYY-MM-DD');

    while (current.day(6).isBefore(endOfMonth)) {
      if (current.isSameOrAfter(startOfMonth, 'day')) {
        const isToday = current.format('YYYY-MM-DD') === today;
        saturdays[current.format('YYYY-MM-DD')] = {
          disabled: true,
          disableTouchEvent: true,
          customStyles: {
            text: {
              color: isToday ? '#be815b' : '#d9e1e8',
            },
          },
        };
      }
      current.add(1, 'week');
    }

    return saturdays;
  };

  const precomputeAndSetMarkedDates = async (visibleMonth) => {
    const visibleMonthMoment = moment(visibleMonth);
    const previousMonth = visibleMonthMoment.clone().subtract(1, 'month').format('YYYY-MM-DD');
    const nextMonth = visibleMonthMoment.clone().add(1, 'month').format('YYYY-MM-DD');
    const currentMonthSaturdays = await generateDisabledSaturdays(visibleMonth);
    const previousMonthSaturdays = await generateDisabledSaturdays(previousMonth);
    const nextMonthSaturdays = await generateDisabledSaturdays(nextMonth);

    setMarkedDates({
      ...previousMonthSaturdays,
      ...currentMonthSaturdays,
      ...nextMonthSaturdays,
    });

    if (selectedDate) {
      setMarkedDates((prevMarkedDates) => ({
        ...prevMarkedDates,
        [selectedDate]: {
          ...prevMarkedDates[selectedDate],
          selected: true,
          selectedColor: '#e3b5b8',
        },
      }));
    }
  };

  useEffect(() => {
    precomputeAndSetMarkedDates(currentMonth);
  }, [currentMonth, selectedDate]);

  return (
    <View style={styles.container}>
      <Calendar
        current={currentMonth}
        minDate={moment().format('YYYY-MM-DD')}
        allowSelectionOutOfRange={false}
        enableSwipeMonths={true}
        disableMonthChange={false}
        markingType={'custom'}
        markedDates={markedDates}
        onMonthChange={(month) => {
          setCurrentMonth(moment(month.dateString).format('YYYY-MM-DD'));
        }}
        onDayPress={(day) => {
          const newMarkedDates = {
            ...markedDates,
            [selectedDate]: { ...markedDates[selectedDate], selected: false },
            [day.dateString]: {
              selected: true,
              selectedColor: '#dca3a6',
            },
          };
          setMarkedDates(newMarkedDates);
          setSelectedDate(day.dateString);
          onDateChange(day.dateString);
        }}
        theme={{
          calendarBackground: 'transparent', // Set calendar background to transparent
          textSectionTitleColor: '#7c9ab6',
          textSectionTitleDisabledColor: '#d9e1e8',
          todayTextColor: '#be815b',
          dayTextColor: '#808080',
          arrowColor: '#adc0d1',
          monthTextColor: '#496783',
          textDayFontSize: 14,
          textDayFontFamily: 'FredokaRegular',
          textMonthFontSize: 16,
          textMonthFontFamily: 'FredokaSemibold',
          textDayHeaderFontSize: 14,
          textDayHeaderFontFamily: 'FredokaSemibold',
        }}
        style={{
          marginTop: 20,
          width: '90%',
          alignSelf: 'center'
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    flex: 1,
    height: '100%',
  }
});

export default HebrewDatePicker;

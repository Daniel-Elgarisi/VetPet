import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons, Foundation, MaterialCommunityIcons } from 'react-native-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { fetchDailyVideoCallAppointments } from '../../api/videoCallAppointmentsApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';
import VetVideoCall from './VetVideoCall';

const VideoCallsList = () => {
  const [videoCallAppointments, setVideoCallAppointments] = useState([]);
  const [todayDate, setTodayDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomUrl, setSelectedRoomUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [callFinished, setCallFinished] = useState({});

  const getTodayDateInIsraelTime = () => {
    const israelTime = moment().tz('Asia/Jerusalem').add(3, 'hours');
    return israelTime.format('DD-MM-YYYY');
  };

  const loadCallFinishedState = async () => {
    try {
      const storedState = await AsyncStorage.getItem('callFinished');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        setCallFinished(parsedState);
      }
    } catch (error) {
      console.error('Error loading call finished state:', error);
    }
  };

  const saveCallFinishedState = async (state) => {
    try {
      await AsyncStorage.setItem('callFinished', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving call finished state:', error);
    }
  };

  const loadVideoCallAppointments = async (currentCallFinished) => {
    try {
      const vet_id = await AsyncStorage.getItem('vetId');
      const appointments = await fetchDailyVideoCallAppointments(vet_id);
      const newCallFinished = { ...currentCallFinished };

      appointments.forEach(appointment => {
        if (!(appointment.appointment.id in newCallFinished)) {
          newCallFinished[appointment.appointment.id] = false;
        }
      });

      // Sort the appointments by time
      appointments.sort((a, b) => {
        const timeA = a.appointment.time;
        const timeB = b.appointment.time;
        return timeA.localeCompare(timeB);
      });

      setCallFinished(newCallFinished);
      setVideoCallAppointments(appointments);
      saveCallFinishedState(newCallFinished);
    } catch (error) {
      if (!error.response || error.response.status !== 404) {
        const message = error.response?.data?.message || "אירעה שגיאה בהחזרת תורי שיחת וידאו יומים לוטרינר";
        Alert.alert('שגיאה', message);
      }
      setVideoCallAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        setIsLoading(true);
        await loadCallFinishedState();
        setTodayDate(getTodayDateInIsraelTime());
        setIsLoading(false);
      };
      init();
    }, [])
  );

  useEffect(() => {
    if (!isLoading) {
      loadVideoCallAppointments(callFinished);
    }
  }, [isLoading]);

  const handleAppointmentPress = (appointment) => {
    setSelectedRoomUrl(appointment.appointment.room_url);
    setModalVisible(true);
  };

  const handleCallFinished = (roomName) => {
    const finishedAppointment = videoCallAppointments.find(appointment => appointment.appointment.room_url.endsWith(roomName));
    if (finishedAppointment) {
      const updatedCallFinished = { ...callFinished, [finishedAppointment.appointment.id]: true };
      setCallFinished(updatedCallFinished);
      saveCallFinishedState(updatedCallFinished);
    }
  };

  return (
    <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
      <ScrollView contentContainerStyle={[styles.container, styles.scrollViewContent]}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>שיחות וידיאו יומיות ממטופלים</Text>
          <Text style={styles.subTitle}>תאריך {todayDate}</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color="#8da7bf" />
        ) : (
          <>
            {videoCallAppointments.length > 0 ? (
              videoCallAppointments.map((appointment, index) => (
                <View key={index} style={styles.appointmentContainer}>
                  <View style={[styles.appointmentTimeDetails, callFinished[appointment.appointment.id] ? styles.appointmentTimeDetailsFinished : null]}>
                    <Text style={styles.appointmentTime}>שעת התור</Text>
                    <Text style={styles.appointmentTime}>{appointment.appointment.time}</Text>
                  </View>
                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.appointmentDetailTitle}>שם הבעלים:</Text>
                      <Text style={styles.appointmentDetailInfo}>{appointment.petDetails.owner_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.appointmentDetailTitle}>שם חיית המחמד:</Text>
                      <Text style={styles.appointmentDetailInfo}>{appointment.petDetails.pet_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.appointmentDetailTitle}>חיה מסוג:</Text>
                      <Text style={styles.appointmentDetailInfo}>{appointment.petDetails.pet_type} {appointment.petDetails.breed}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.videoIcon, callFinished[appointment.appointment.id] ? styles.videoIconFinished : null]} onPress={() => handleAppointmentPress(appointment)}>
                    {callFinished[appointment.appointment.id] ? (
                      <MaterialCommunityIcons name="video-check" size={24} color="white" />
                    ) : (
                      <MaterialIcons name="video-call" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.noAppointmentsContainer}>
                <Foundation name="paw" size={18} color="#d0aeb0" />
                <Text style={styles.noAppointmentsText}>לא נמצאו תורים להיום</Text>
                <Foundation name="paw" size={18} color="#d0aeb0" />
              </View>
            )}
          </>
        )}
        {selectedRoomUrl && (
          <VetVideoCall
            roomUrl={selectedRoomUrl}
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onCallFinished={handleCallFinished}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  mainLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
    alignItems: 'stretch',
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  title: {
    color: '#496783',
    fontSize: 23,
    textAlign: 'center',
    fontFamily: 'FredokaBold'
  },
  subTitle: {
    color: 'rgba(73, 103, 131, 0.7)',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'FredokaMedium',
    marginTop: 5
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10
  },
  appointmentContainer: {
    backgroundColor: 'rgba(255, 255, 255,0.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(73, 103, 131, 0.3)',
    marginVertical: 4,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentDetails: {
    flex: 1.4,
    marginRight: 15,
    paddingVertical: 8
  },
  appointmentTimeDetails: {
    backgroundColor: 'rgba(73, 103, 131, 0.5)',
    borderEndEndRadius: 10,
    borderTopEndRadius: 10,
    borderColor: 'rgba(73, 103, 131, 0.3)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 23,
    paddingHorizontal: 15,
  },
  appointmentTimeDetailsFinished: {
    backgroundColor: 'rgba(166, 166, 166, 0.7)',
  },
  appointmentTime: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'FredokaSemibold',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    marginTop: 5
  },
  appointmentDetailInfo: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'FredokaRegular',
    textAlign: 'right',
    marginRight: 5,
  },
  appointmentDetailTitle: {
    color: '#3b5268',
    fontSize: 14,
    fontFamily: 'FredokaMedium',
    textAlign: 'right',
  },
  videoIcon: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(208, 174, 176, 1)',
    padding: 5,
    backgroundColor: 'rgba(208, 174, 176, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0.5, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  videoIconFinished: {
    backgroundColor: 'rgba(166, 166, 166, 0.8)',
    borderColor: 'rgba(166, 166, 166, 1)',
  },
  noAppointmentsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  noAppointmentsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center'
  },
  noAppointmentsText: {
    marginTop: 10,
    color: '#6c8dac',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'FredokaRegular',
    marginHorizontal: 6
  },
});

export default VideoCallsList;

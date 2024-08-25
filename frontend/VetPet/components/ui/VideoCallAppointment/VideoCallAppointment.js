import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons, Foundation, MaterialCommunityIcons, Ionicons } from 'react-native-vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { fetchDailyVideoCallAppointments } from '../../../api/appointmentsApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';
import PetOwnerVideoCall from './PetOwnerVideoCall';

const VideoCallAppointment = ({ goBack }) => {
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
      const serializedPet = await AsyncStorage.getItem('selectedPetId');
      const pet_id = JSON.parse(serializedPet).petId;
      const appointments = await fetchDailyVideoCallAppointments(pet_id);
      appointments.sort((a, b) => {
        const timeA = a.time;
        const timeB = b.time;
        return timeA.localeCompare(timeB);
      });

      const newCallFinished = { ...currentCallFinished };
      appointments.forEach(appointment => {
        if (!(appointment.id in newCallFinished)) {
          newCallFinished[appointment.id] = false;
        }
      });

      setCallFinished(newCallFinished);
      setVideoCallAppointments(appointments);
      saveCallFinishedState(newCallFinished);
    } catch (error) {
      if (!error.response || error.response.status !== 404) {
        const message = error.response?.data?.message || "אירעה שגיאה בהחזרת תורי שיחת וידאו יומים לבעל חיית המחמד";
        Alert.alert('שגיאה', message);
        setVideoCallAppointments([]);
      }
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
    setSelectedRoomUrl(appointment.room_url);
    setModalVisible(true);
  };

  const handleCallFinished = (roomName) => {
    const finishedAppointment = videoCallAppointments.find(appointment => appointment.room_url.endsWith(roomName));
    if (finishedAppointment) {
      const updatedCallFinished = { ...callFinished, [finishedAppointment.id]: true };
      setCallFinished(updatedCallFinished);
      saveCallFinishedState(updatedCallFinished);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, styles.scrollViewContent]}>
      <View style={styles.goBackContainer}>
        <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
          <Text style={styles.goBackText}>חזרה לתפריט</Text>
          <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
        </TouchableOpacity>
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>שיחות וידיאו עם וטרינר</Text>
        <Text style={styles.subTitle}>תאריך {todayDate}</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#8da7bf" />
      ) : (
        <>
          {videoCallAppointments.length > 0 ? (
            videoCallAppointments.map((appointment, index) => (
              <View key={index} style={styles.appointmentContainer}>
                <View style={[styles.appointmentTimeDetails, callFinished[appointment.id] ? styles.appointmentTimeDetailsFinished : null]}>
                  <Text style={styles.appointmentTime}>שעת התור</Text>
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                </View>
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.appointmentDetailTitle}>שם הוטרינר:</Text>
                    <Text style={styles.appointmentDetailInfo}>{appointment.doctor_name}</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.videoIcon, callFinished[appointment.id] ? styles.videoIconFinished : null]} onPress={() => handleAppointmentPress(appointment)}>
                  {callFinished[appointment.id] ? (
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
        <PetOwnerVideoCall
          roomUrl={selectedRoomUrl}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCallFinished={handleCallFinished}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginTop: '5%',
    alignItems: 'stretch',
    paddingHorizontal: 10,
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  goBackContainer: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  goBackText: {
    marginRight: 5,
    color: '#7c9ab6',
    fontFamily: 'FredokaRegular',
  },
  title: {
    marginTop: 10,
    color: '#496783',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'FredokaBold',
  },
  subTitle: {
    color: '#496783',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'FredokaMedium',
    marginTop: 5,
    marginBottom: 10
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
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
    paddingVertical: 3
  },
  appointmentTimeDetails: {
    backgroundColor: 'rgba(73, 103, 131, 0.5)',
    borderEndEndRadius: 10,
    borderTopEndRadius: 10,
    borderColor: 'rgba(73, 103, 131, 0.3)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
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

export default VideoCallAppointment;

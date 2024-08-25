import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome, Feather, Ionicons, Octicons, FontAwesome5 } from '@expo/vector-icons';
import BookNewAppointment from './BookNewAppointment';
import ViewPetProfile from '../components/ui/PetsProfile/ViewPetProfile';
import DisplayPetAppoinments from '../components/ui/DisplayPetAppoinments/DisplayPetAppoinments';
import DisplayPetVaccinations from '../components/ui/PetVaccinations/PetVaccinations';
import DisplayTestResults from '../components/ui/TestResults/TestResults';
import WhatsAppModal from '../components/ui/ChatWithVet/WhatsAppModal';
import PrescriptionsList from '../components/ui/Prescriptions/PrescriptionsList';
import MedicalRecordsList from '../components/ui/MedicalRecords/MedicalRecordsList';
import ReferencesList from '../components/ui/References/ReferencesList';
import VideoCallAppointment from '../components/ui/VideoCallAppointment/VideoCallAppointment';

const healthOptions = [
  { name: 'זימון\nתור חדש', icon: 'calendar-plus-o', screen: 'NewAppointmentScreen', iconSet: 'FontAwesome', component: BookNewAppointment },
  { name: 'הפרופיל\nשלי', icon: 'paw', screen: 'ViewPetProfileScreen', iconSet: 'Ionicons', component: ViewPetProfile },
  { name: 'חיסונים', icon: 'vaccines', screen: 'VaccinationsScreen', iconSet: 'MaterialIcons', component: DisplayPetVaccinations },
  { name: 'התורים שלי', icon: 'calendar-check-o', screen: 'MyAppointmentsScreen', iconSet: 'FontAwesome', component: DisplayPetAppoinments },
  { name: 'סיכומי\nביקור', icon: 'file-text', screen: 'VisitSummariesScreen', iconSet: 'Feather', component: MedicalRecordsList },
  { name: 'תוצאות\nבדיקות', icon: 'test-tube', screen: 'TestResultsScreen', iconSet: 'MaterialCommunityIcons', component: DisplayTestResults },
  { name: 'תרופות\nומרשמים', icon: 'pill', screen: 'MedicinesScreen', iconSet: 'MaterialCommunityIcons', component: PrescriptionsList },
  { name: 'הפניות', icon: 'file-medical-alt', screen: 'MedicalReferrals', iconSet: 'FontAwesome5', component: ReferencesList },
  { name: "צ'אט", icon: 'whatsapp', screen: 'ChatScreen', iconSet: 'FontAwesome' },
  { name: 'שיחת וידיאו\nעם וטרינר', icon: 'photo-camera-front', screen: 'VideoCallScreen', iconSet: 'MaterialIcons', component: VideoCallAppointment },
];

const IconComponents = {
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
  FontAwesome5,
  Feather,
  Ionicons,
  Octicons,
};

const PetHealthManagementPage = ({ goBack }) => {
  const [activeScreen, setActiveScreen] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleChatScreenPress = () => {
    setModalVisible(true);
  };

  const openWhatsApp = () => {
    setModalVisible(false);
    const url = 'https://wa.me/972528287761';
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const renderScreen = () => {
    if (activeScreen) {
      const ScreenComponent = activeScreen.component;
      return <ScreenComponent goBack={() => setActiveScreen(null)} />;
    }

    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.goBackContainer}>
          <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
            <Text style={styles.goBackText}>חזרה לתפריט</Text>
            <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
          </TouchableOpacity>
        </View>
        <View style={styles.menuContainer}>
          {healthOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.circleButton}
              onPress={() => option.screen === 'ChatScreen' ? handleChatScreenPress() : setActiveScreen(option)}
            >
              {React.createElement(IconComponents[option.iconSet], {
                name: option.icon,
                size: 35,
                color: "#e2c7b6"
              })}
              <Text style={styles.optionText}>{option.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.fullScreen}>
      {renderScreen()}
      <WhatsAppModal 
        isVisible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onConfirm={openWhatsApp} 
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  goBackContainer: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
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
    fontFamily: 'FredokaRegular'
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 50,
  },
  circleButton: {
    width: 120,
    height: 120,
    borderRadius: 70,
    borderColor: '#e2c7b6',
    borderWidth: 2,
    backgroundColor: '#fdf8f7',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 19,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionText: {
    marginTop: 8,
    color: '#d3ab92',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'FredokaMedium',
  },
});

export default PetHealthManagementPage;

import React from 'react';
import { View, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { fetchVideoCallParticipantCount } from '../../api/videoCallAppointmentsApi';

const VetVideoCall = ({ roomUrl, visible, onClose, onCallFinished }) => {

  const handleClose = async () => {
    if (onClose) {
      const roomName = roomUrl.split('/').pop();
      const participantCount = await fetchVideoCallParticipantCount(roomName);
      onClose();
      if (participantCount > 1) {
        onCallFinished(roomName);
      }
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.closeButtonContainer}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="videocam" size={22} color="white" />
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: roomUrl }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButtonContainer: {
    flexDirection: 'row-reverse',
    padding: 10,
    paddingTop: 50,
    paddingRight: 10,
  },
  closeButton: {
    backgroundColor: '#cc0000',
    borderRadius: 50,
    padding: 8,
    borderColor: '#660000',
    borderWidth: 2,
  },
});

export default VetVideoCall;

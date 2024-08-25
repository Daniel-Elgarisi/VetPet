import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { EvilIcons } from '@expo/vector-icons';

const WhatsAppModal = ({ isVisible, onClose, onConfirm }) => {
    return (
        <Modal
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <EvilIcons name="close" size={24} color="black" />
                    </TouchableOpacity>
                    <View style={styles.messageContainer}>
                        <Text style={styles.modalMessage}>למעבר ל-WhatsApp על מנת לשוחח עם המוסד הוטרינרי,</Text>
                        <Text style={styles.modalMessage}>יש ללחוץ על האייקון כדי להתחיל.</Text>
                    </View>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={styles.modalButton} onPress={onConfirm}>
                            <Image
                                source={require('../../../assets/images/Whatsapp-Icon.png')}
                                style={styles.headerImage}
                            />
                            <Text style={styles.modalButtonText}>WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    messageContainer: {
        padding: 20
    },
    modalMessage: {
        fontSize: 15,
        marginBottom: 2,
        fontFamily: 'FredokaRegular',
        textAlign: 'center',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    modalButton: {
        padding: 1,
        backgroundColor: 'rgba(92, 129, 163, 0.5)',
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'FredokaMedium',
        marginLeft: -5,
    },
    headerImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
});

export default WhatsAppModal;

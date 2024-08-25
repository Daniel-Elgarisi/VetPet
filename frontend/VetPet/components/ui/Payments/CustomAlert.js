// CustomAlert.js
import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';

const CustomAlert = ({ visible, message }) => {
    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
        >
            <View style={styles.container}>
                <View style={styles.alertBox}>
                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    alertBox: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    message: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
});

export default CustomAlert;

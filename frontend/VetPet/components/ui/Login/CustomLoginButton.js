import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, disabled = false }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[styles.button, disabled ? styles.disabled : styles.enabled]}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#d3ab92',
        backgroundColor: '#f7efed',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        elevation: 3,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 5,
    },
    enabled: {
        backgroundColor: '#f8babc', // Bootstrap primary color for example
    },
    disabled: {
        backgroundColor: '#cccccc', // Light grey indicating the button is disabled
    },
    text: {
        color: '#ffffff',
        fontSize: 15,
        fontFamily: 'FredokaSemibold'
    },
});

export default CustomButton;

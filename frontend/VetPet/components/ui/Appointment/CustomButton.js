import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignSelf: 'center',
        backgroundColor: '#9db3c8',
        paddingVertical: 8,
        width: '40%',
        borderRadius: 15,
        margin: 10,
        alignItems: 'center',
        borderColor: '#7c9ab6',
        borderWidth: 1,
        elevation: 3,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 5,
    },
    text: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'FredokaSemibold',
    },
});

export default CustomButton;

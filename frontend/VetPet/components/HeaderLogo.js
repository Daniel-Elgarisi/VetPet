import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const HeaderLogo = () => {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={require('../assets/images/VetPetHeader.png')}
        style={styles.headerImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8da7bf',
  },
  headerImage: {
    width: 120,
    height: 29,
    resizeMode: 'contain',
    opacity: 0.5
  },
});

export default HeaderLogo;

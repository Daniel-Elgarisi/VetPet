import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CustomLoginButton from "../components/ui/Buttons/CustomLoginButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { config } from '../config/config';
import { StatusBar } from "expo-status-bar";

const LoginScreen = () => {
  const [license, setLicense] = useState("");
  const [idSubmittedSuccessfully, setIdSubmittedSuccessfully] = useState(false);
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [requestCount, setRequestCount] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const navigation = useNavigation();

  const BASE_URL = config.baseURL;

  useFocusEffect(
    React.useCallback(() => {
      setLicense("");
      setIdSubmittedSuccessfully(false);
      setCode("");
      setIsCodeSent(false);
      setIsVisible(false);
      setIsVerifying(false);
      setTimeLeft(10);
      setRequestCount(0);
      setVerificationSuccess(false);
    }, [])
  );

  useEffect(() => {
    let interval;
    if (isCodeSent && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prevTime => prevTime - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      showAlertBasedOnState();
    }
    return () => clearInterval(interval);
  }, [isCodeSent, timeLeft]);

  const showAlertBasedOnState = () => {
    if (requestCount < 2 && !verificationSuccess) {
      Alert.alert("הזמן אזל", "אתה יכול לבקש קוד אימות חדש עכשיו");
    } else if (!verificationSuccess) {
      Alert.alert("חריגה במספר הבקשות", "חרגת מהמספר המרבי של בקשות קוד אימות. אנא הפעל מחדש את האפליקציה.");
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  const performPostRequest = async (urlPath, data, successCallback) => {
    setIsVerifying(true);
    try {
      const response = await axios.post(`${BASE_URL}${urlPath}`, data);
      if (response.status === 200) {
        successCallback(response);
        return response;
      } else {
        Alert.alert("שגיאה", response.data.message || "התרחשה שגיאה לא צפויה.");
      }
    } catch (error) {
      if (error.response) {
        Alert.alert("שגיאה " + error.response.status, error.response.data.message || "אירעה שגיאה בשרת.");
      } else if (error.request) {
        Alert.alert("שגיאה", "הבקשה הוגשה אך לא התקבלה תגובה.");
      } else {
        Alert.alert("שגיאה", "לא יכול להתחבר לשרת.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitId = () => {
    performPostRequest("/auth/verify-vet-id", { license: license }, (response) => {
      setIsCodeSent(true);
      setTimeLeft(20);
      setIdSubmittedSuccessfully(true);
    });
  };

  const handleVerifyCode = async () => {
    if (isVerifying) return;
    performPostRequest("/auth/verify-vet-otp", { license: license, code }, async (response) => {
      const vetId = response.data.vetId;
      try {
        await AsyncStorage.setItem('vetId', vetId.toString());
      } catch (error) {
        console.log('Failed to save vetId:', error);
      }
      setVerificationSuccess(true);
      navigation.navigate("TitlesScreen");
    });
  };


  const handleResendCode = async () => {
    if (requestCount >= 2) {
      Alert.alert("חריגה במספר הבקשות", "חרגת מהמספר המרבי של בקשות קוד אימות. אנא הפעל מחדש את האפליקציה.");
      return;
    }
    await handleSubmitId();
    setRequestCount(currentCount => currentCount + 1);
  };

  const formatTimeLeft = (time) => `${Math.floor(time / 60).toString().padStart(2, "0")}:${(time % 60).toString().padStart(2, "0")}`;


  return (
    <>
      <StatusBar style="dark" />
      <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.gradientBackground}>
        <View style={styles.container}>
          <Image source={require('../assets/images/VetPetLogo.png')} style={styles.image} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={setLicense}
              value={license}
              secureTextEntry={!isVisible}
              placeholder="מספר רישיון"
              textContentType="none"
              editable={!idSubmittedSuccessfully}
              keyboardType="number-pad"
              returnKeyType="done"
            />
            <TouchableOpacity onPress={toggleVisibility} style={styles.icon}>
              <MaterialCommunityIcons name={isVisible ? 'eye-off' : 'eye'} size={22} color="#9db3c8" />
            </TouchableOpacity>
          </View>
          {isCodeSent && !verificationSuccess && (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  onChangeText={setCode}
                  value={code}
                  placeholder="הזן קוד אימות"
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
              </View>
              <Text style={styles.timerText}>{formatTimeLeft(timeLeft)}</Text>
              <View style={styles.buttonsRow}>
                <CustomLoginButton
                  title="שליחה חוזרת"
                  onPress={handleResendCode}
                  disabled={timeLeft > 0 || requestCount > 1}
                />
                <CustomLoginButton
                  title="אימות קוד"
                  onPress={handleVerifyCode}
                  disabled={isVerifying}
                />
              </View>
            </>
          )}
          <View>
            {!isCodeSent && (
              <CustomLoginButton
                title='אישור רישיון'
                onPress={handleSubmitId}
                disabled={isVerifying}
              />
            )}
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginBottom: 8,
    marginTop: 5,
    borderWidth: 2,
    borderRadius: 15,
    borderColor: '#7c9ab6',
    padding: 10,
    backgroundColor: '#dbe6f0',
    position: 'relative',
    height: 40,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    color: '#1b2956',
    textAlign: 'right',
    fontFamily: 'FredokaRegular',
    fontSize: 16
  },
  icon: {
    position: 'absolute',
    left: 10,
  },
  image: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: -10,
  },
  timerText: {
    fontSize: 15,
    marginVertical: 10,
    textAlign: "center",
    color: '#9db3c8',
    fontFamily: 'FredokaRegular'
  },
  limitText: {
    fontSize: 16,
    color: "red",
    marginTop: 20,
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
    marginTop: 0,
  },
});


export default LoginScreen;

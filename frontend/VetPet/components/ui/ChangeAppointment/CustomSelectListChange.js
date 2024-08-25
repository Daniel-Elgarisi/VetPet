import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchAppointmentTypes } from '../../../api/appointmentsApi';

const CustomSelectListChange = ({ onSelect, typeForChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(typeForChange || '');
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const types = await fetchAppointmentTypes();
        if (types)
          setData(types);
        else
          setData([]);
      } catch (error) {
        console.log("Failed to fetch appointment types:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (typeForChange !== selectedItem) {
      setSelectedItem(typeForChange);
    }
  }, [typeForChange]);

  const handleSelect = (item) => {
    setSelectedItem(item.type);
    onSelect(item.type);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selectBox} onPress={() => setIsVisible(true)}>
        <Text style={styles.placeholderText}>{selectedItem}</Text>
        <Ionicons name="chevron-down" size={20} color="grey" />
      </TouchableOpacity>
      <Modal
        visible={isVisible}
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
        animationType="fade"
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={data}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item)} style={styles.item}>
                  <Text style={styles.itemText}>{item.type}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '85%',
    minHeight: 40,
    marginHorizontal: 10,
    alignSelf: 'center'
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.9,
    borderColor: '#e3b5b8',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#edf2f7',
  },
  placeholderText: {
    flex: 1,
    textAlign: 'right',
    color: '#4d4d4d',
    marginRight: 5
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#edf2f7',
    borderRadius: 30,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  itemText: {
    textAlign: 'center',
    color: '#4d4d4d',
  },
});

export default CustomSelectListChange;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Entypo, AntDesign } from '@expo/vector-icons';

const FindingBloodResultComponent = ({ findingResult, findingInfo }) => {
    const { finding_name, max_range, min_range, units_of_measurement } = findingInfo;
    const { value } = findingResult;
    const numericValue = parseFloat(value);
    const numericMinRange = parseFloat(min_range);

    const isSpecialType = max_range === null;
    let displayValue = numericValue;
    let normalValue = '';

    if (isSpecialType) {
        if (numericMinRange === 0) {
            normalValue = 'None';
            displayValue = numericValue === 0 ? 'None' : 'Exist';
        } else if (numericMinRange === -1) {
            normalValue = 'Negative';
            displayValue = numericValue === -1 ? 'Negative' : 'Positive';
        }
    } else {
        const numericMaxRange = parseFloat(max_range);
        const isOutOfRange = numericValue < numericMinRange || numericValue > numericMaxRange;
        const normalizedPosition = ((numericValue - numericMinRange) / (numericMaxRange - numericMinRange)) * 100;
        const findingNameStyle = isOutOfRange ? styles.findingNameOutOfRange : styles.findingName;
        const resultStyle = isOutOfRange ? styles.findingValueOutOfRange : styles.findingValue;
        const containerStyle = isOutOfRange ? styles.findingContainerOutOfRange : styles.findingContainer;

        return (
            <View style={containerStyle}>
                <View style={styles.findingNameContainer}>
                    <Text style={findingNameStyle}>{finding_name}</Text>
                    {isOutOfRange && (<AntDesign name="warning" size={15} color="#cc0000" style={styles.warningIcon} />)}
                </View>
                <View style={styles.axisContainer}>
                    <Text style={resultStyle}>{numericValue}</Text>
                    <View style={styles.axis}>
                        <View style={[styles.normalRange, { left: `${(numericMinRange / numericMaxRange) * 100}%`, width: `${((numericMaxRange - numericMinRange) / numericMaxRange) * 100}%` }]} />
                        {!isOutOfRange && (
                            <View style={[styles.resultMarker, { left: `${normalizedPosition}%` }]}>
                                <Entypo name="triangle-down" size={26} color="#c76b71" />
                            </View>
                        )}
                    </View>
                    <View style={styles.axisLabels}>
                        <Text style={styles.axisLabel}>{numericMinRange}</Text>
                        {units_of_measurement && (<Text style={styles.axisLabel}>{units_of_measurement}</Text>)}
                        <Text style={styles.axisLabel}>{numericMaxRange}</Text>
                    </View>
                </View>
            </View>
        );
    }
    
    let isNormal = normalValue === displayValue ? true : false;
    const containerBackgroundStyle = isNormal ? styles.findingContainer : styles.findingContainerOutOfRange;
    const findingNameStyle = isNormal ? styles.findingName : styles.findingNameOutOfRange;
    
    return (
        <View style={containerBackgroundStyle}>
            <View style={styles.findingNameContainer}>
                <Text style={findingNameStyle}>{finding_name}</Text>
                {!isNormal && (<AntDesign name="warning" size={15} color="#cc0000" style={styles.warningIcon} />)}
            </View>
            <Text style={styles.normalFindingValue}>ערך תקין: {normalValue}</Text>
            <Text style={styles.resultValue}>תוצאה: {displayValue}</Text>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        padding: 10,
        margin: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    findingContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    findingContainerOutOfRange: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f9ecec',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    findingNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    findingName: {
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        color: '#525960',
    },
    findingNameOutOfRange: {
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        color: '#cc0000',
    },
    warningIcon: {
        marginLeft: 3,
    },
    axisContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    axis: {
        position: 'relative',
        width: '85%',
        height: 5,
        backgroundColor: '#7c9ab6',
        marginBottom: 10,
    },
    normalRange: {
        position: 'absolute',
        height: '100%',
    },
    resultMarker: {
        position: 'absolute',
        top: -18,
        transform: [{ translateX: -13 }]  // Adjusting for the center position
    },
    findingValue: {
        fontFamily: 'FredokaRegular',
        color: '#666',
        marginVertical: 12,
        fontSize: 14,
    },
    findingValueOutOfRange: {
        fontFamily: 'FredokaRegular',
        color: '#cc0000',
        marginTop: 12,
        marginBottom: 8,
        fontSize: 14,
    },
    axisLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '85%',
    },
    axisLabel: {
        fontFamily: 'FredokaRegular',
        color: '#9199a1',
        fontSize: 12,
    },
    normalFindingValue: {
        fontSize: 14,
        marginTop: 8,
        marginRight: 10,
        fontFamily: 'FredokaRegular',
        color: '#525960',
        textAlign: 'right'
    },
    resultValue:{
        fontSize: 14,
        marginRight: 10,
        marginTop: 3,
        marginBottom: 5,
        fontFamily: 'FredokaRegular',
        color: '#525960',
        textAlign: 'right'
    },
});

export default FindingBloodResultComponent;
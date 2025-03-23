import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    SafeAreaView,
} from 'react-native';

import { Picker } from '@react-native-picker/picker'; // Make sure to install this library!
import BottomNavBar from '../Navigators/navbar';

const ShoppingListScreen = () => {
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleAddItem = () => {
        if (selectedItem && quantity) {
            console.log(`Added: ${selectedItem} - ${quantity}`);
            // Add to list logic here
            setQuantity('');
            setSelectedItem('');
        }
    };

    const handleViewShoppingList = () => {
        // Navigate to shopping list screen
        console.log('Navigating to Shopping List');
    };

    return (
        <SafeAreaView style={styles.safeview}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity>
                        <Image
                            source={require('../assets/icons/back-arrow.png')}
                            style={styles.backIcon}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Shopping List</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Image */}
                    <Image
                        source={require('../assets/veggies.png')}
                        style={styles.mainImage}
                        resizeMode="cover"
                    />

                    {/* Add Items Box */}
                    <View style={styles.addItemContainer}>
                        <Text style={styles.addItemsTitle}>Add Items</Text>

                        {/* Picker */}
                        <Text style={styles.label}>Item</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedItem}
                                onValueChange={(itemValue) => setSelectedItem(itemValue)}
                                style={styles.picker}
                                dropdownIconColor="#000"
                            >
                                <Picker.Item label="Select The Item" value="" />
                                <Picker.Item label="Tomatoes" value="Tomatoes" />
                                <Picker.Item label="Carrots" value="Carrots" />
                                <Picker.Item label="Onions" value="Onions" />
                            </Picker>
                        </View>

                        {/* Quantity Input */}
                        <Text style={styles.label}>Quantity</Text>
                        <View style={styles.quantityRow}>
                            <TextInput
                                style={styles.quantityInput}
                                placeholder="Enter the Quantity"
                                placeholderTextColor="#999"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                                <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* View Shopping List Button */}
                    <TouchableOpacity
                        style={styles.viewListButton}
                        onPress={handleViewShoppingList}
                    >
                        <Text style={styles.viewListButtonText}>View Shopping List</Text>
                        <Image
                            source={require('../assets/icons/arrow-right.png')}
                            style={styles.arrowRight}
                        />
                    </TouchableOpacity>
                </ScrollView>
                {/* <BottomNavBar /> */}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeview: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: '8%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#A2CB3F',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        color: '#A2CB3F',
        fontWeight: 'bold',
        marginRight: 24, // Offset the arrow space
    },
    content: {
        padding: 20,
    },
    mainImage: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        marginVertical: 20,
    },
    addItemContainer: {
        backgroundColor: '#F6F6F6',
        padding: 20,
        borderRadius: 20,
        elevation: 3,
    },
    addItemsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        color: '#000',
        marginBottom: 5,
        marginTop: 10,
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    picker: {
        height: 50,
        color: '#000',
    },
    quantityRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    quantityInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 10,
        color: '#000',
    },
    addButton: {
        backgroundColor: '#000',
        borderRadius: 30,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    viewListButton: {
        backgroundColor: '#A2CB3F',
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    viewListButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    arrowRight: {
        width: 20,
        height: 20,
        tintColor: '#fff',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#F6F6F6',
        paddingVertical: 10,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 30,
        elevation: 5,
    },
    navButton: {
        flex: 1,
        alignItems: 'center',
    },
    iconWrapper: {
        padding: 10,
        borderRadius: 25,
    },
    iconWrapperActive: {
        padding: 10,
        borderRadius: 25,
        backgroundColor: '#000',
    },
    navIcon: {
        width: 24,
        height: 24,
    },
});


export default ShoppingListScreen;

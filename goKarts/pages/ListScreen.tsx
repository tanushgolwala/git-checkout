import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import BottomNavBar from '../components/navbar';

interface Item {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUri: string;
}

const initialItems: Item[] = [
    {
        id: 1,
        name: 'Carrots',
        price: 50,
        quantity: 1,
        imageUri: 'https://media.istockphoto.com/id/1399548383/vector/carrot-with-leaves-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=JVqIhTEE0m8b26_nZcDoU3VqJVjHyc7P4m0j4Jf0qMs=', // Replace with your image URI
    },
    {
        id: 2,
        name: 'Almonds',
        price: 400,
        quantity: 1,
        imageUri: 'https://media.istockphoto.com/id/1096091716/photo/the-almond-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=-VgkPgLXybF1EIFZPZ7Dt8aj8oymPTGpfzzlDxHDbdI=',
    },
    {
        id: 3,
        name: 'Chips',
        price: 60,
        quantity: 3,
        imageUri: 'https://www.jiomart.com/images/product/original/490000331/lay-s-india-s-magic-masala-potato-chips-40-g-product-images-o490000331-p490000331-0-202410251815.jpg?im=Resize=(420,420)',
    },
    {
        id: 4,
        name: 'Coke',
        price: 40,
        quantity: 1,
        imageUri: 'https://www.ngf.co.za/wp-content/uploads/2023/11/wp-image-32236196528311.png',
    },
];

const ShoppingList = () => {
    const [items, setItems] = useState<Item[]>(initialItems);

    const incrementQuantity = (id: number) => {
        const updatedItems = items.map(item =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setItems(updatedItems);
    };

    const decrementQuantity = (id: number) => {
        const updatedItems = items.map(item =>
            item.id === id && item.quantity > 1
                ? { ...item, quantity: item.quantity - 1 }
                : item
        );
        setItems(updatedItems);
    };

    return (
        <SafeAreaView style={styles.safeview}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity>
                        <Image
                            source={{
                                uri: 'https://cdn-icons-png.flaticon.com/512/93/93634.png',
                            }} // Replace with your back icon
                            style={styles.backIcon}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Shopping List</Text>
                </View>

                {/* Item List */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {items.map(item => (
                        <View key={item.id} style={styles.itemContainer}>
                            <Image
                                source={{ uri: item.imageUri }}
                                style={styles.itemImage}
                                resizeMode="contain"
                            />

                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>₹{item.price}</Text>
                            </View>

                            {/* Quantity Controls */}
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => decrementQuantity(item.id)}
                                >
                                    <Image
                                        source={{
                                            uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828906.png',
                                        }} // Minus icon
                                        style={styles.quantityIcon}
                                    />
                                </TouchableOpacity>

                                <Text style={styles.quantityText}>{item.quantity}</Text>

                                <TouchableOpacity
                                    style={[styles.quantityButton, styles.plusButton]}
                                    onPress={() => incrementQuantity(item.id)}
                                >
                                    <Image
                                        source={{
                                            uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828919.png',
                                        }} // Plus icon
                                        style={styles.quantityIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>


                <BottomNavBar />

            </View>
        </SafeAreaView>
    );
};

export default ShoppingList;

const styles = StyleSheet.create({
    safeview: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: '8%',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    backIcon: {
        width: 24,
        height: 24,
        marginRight: 15,
        tintColor: '#A4C400', // lime color
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#A4C400',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        marginBottom: 15,
        padding: 15,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 15,
        backgroundColor: '#fff',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 15,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eaeaea',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    quantityButton: {
        padding: 5,
    },
    quantityIcon: {
        width: 20,
        height: 20,
        tintColor: '#000',
    },
    plusButton: {
        backgroundColor: '#A4C400',
        borderRadius: 15,
        padding: 5,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        borderRadius: 30,
        paddingVertical: 10,
        marginHorizontal: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    navButton: {
        padding: 10,
        borderRadius: 25,
    },
    activeNavButton: {
        backgroundColor: '#000',
    },
    navIcon: {
        width: 24,
        height: 24,
        tintColor: '#000',
    },
    activeNavIcon: {
        tintColor: '#fff',
    },
});

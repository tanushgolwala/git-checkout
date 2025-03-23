import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Modal,
} from 'react-native';
// import { useNavigation } from '@react-navigation/native';

interface Item {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUri: string;
}

const YourCart = () => {
    // const navigation = useNavigation();

    const [items] = useState<Item[]>([
        {
            id: 1,
            name: 'Carrots',
            price: 50,
            quantity: 1,
            imageUri: 'https://via.placeholder.com/100x80.png?text=Carrots',
        },
        {
            id: 2,
            name: 'Almonds',
            price: 400,
            quantity: 1,
            imageUri: 'https://via.placeholder.com/100x80.png?text=Almonds',
        },
        {
            id: 3,
            name: 'Chips',
            price: 60,
            quantity: 3,
            imageUri: 'https://via.placeholder.com/100x80.png?text=Chips',
        },
        {
            id: 4,
            name: 'Coke',
            price: 40,
            quantity: 1,
            imageUri: 'https://via.placeholder.com/100x80.png?text=Coke',
        },
    ]);

    const orderAmount = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
    const discount = 50;
    const totalAmount = orderAmount - discount;

    // Control the "Order Placed" modal
    const [showOrderModal, setShowOrderModal] = useState(false);

    // Handle checkout
    const handleCheckout = () => {
        setShowOrderModal(true);
    };

    // Close modal & navigate back to HomePage
    const handleModalClose = () => {
        setShowOrderModal(false);
        // navigation.goBack(); // or navigation.navigate("HomePage");
    };

    return (
        <SafeAreaView style={styles.safeview}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => console.log('Navigating back')}>
                        <Image
                            source={{
                                uri: 'https://cdn-icons-png.flaticon.com/512/93/93634.png',
                            }}
                            style={styles.backIcon}
                        />
                    </TouchableOpacity>
                    <Text style={styles.title}>Your Cart</Text>
                </View>

                {/* Items List */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {items.map(item => (
                        <View key={item.id} style={styles.itemCard}>
                            <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>₹{item.price}</Text>
                            </View>
                            <View style={styles.quantityBox}>
                                <Text style={styles.quantityText}>{item.quantity}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Bill Summary */}
                <View style={styles.billSection}>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Order Amount</Text>
                        <Text style={styles.billValue}>₹{orderAmount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Discount</Text>
                        <Text style={styles.billValue}>₹{discount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
                    </View>

                    {/* Checkout Button */}
                    <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                        <Text style={styles.checkoutText}>Checkout</Text>
                        <Image
                            source={{
                                uri: 'https://cdn-icons-png.flaticon.com/512/271/271228.png',
                            }}
                            style={styles.checkoutArrow}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal to confirm order placement */}
            <Modal
                transparent
                visible={showOrderModal}
                animationType="fade"
                onRequestClose={handleModalClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Order Placed!</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleModalClose}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default YourCart;

const styles = StyleSheet.create({
    safeview: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingVertical: '8%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginRight: 10,
    },
    title: {
        fontSize: 20,
        color: '#7FB900',
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    itemCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
    },
    itemImage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        borderRadius: 12,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    itemPrice: {
        fontSize: 16,
        color: '#000',
        marginTop: 4,
    },
    quantityBox: {
        backgroundColor: '#7FB900',
        width: 50,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    billSection: {
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
    },
    billLabel: {
        fontSize: 16,
        color: '#333',
    },
    billValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    checkoutButton: {
        backgroundColor: '#000',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    checkoutText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    checkoutArrow: {
        width: 24,
        height: 24,
        tintColor: '#FFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: 250,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    modalButton: {
        backgroundColor: '#7FB900',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

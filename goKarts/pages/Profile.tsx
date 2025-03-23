import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";

interface Order {
    id: string;
    date: string;
    items: string[];
    total: number;
    storeName?: string;
}

const ProfilePage = (): JSX.Element => {
    const [orders, setOrders] = useState<Order[]>([
        {
            id: "#123456",
            date: "2023-07-20",
            items: ["Milk (2L)", "Bread (Whole Wheat)", "Eggs (Dozen)"],
            total: 425,
            storeName: "Big Basket",
        },
        {
            id: "#123455",
            date: "2023-07-18",
            items: ["Chicken Breast (1kg)", "Tomatoes (500g)", "Pasta (1kg)"],
            total: 223,
            storeName: "Spencer's",
        },
        {
            id: "#123454",
            date: "2023-07-15",
            items: ["Apples (1kg)", "Orange Juice (1L)", "Cereal (500g)"],
            total: 1275,
            storeName: "Nature's Basket",
        },
        {
            id: "#123453",
            date: "2023-07-12",
            items: ["Salmon Fillet (500g)", "Spinach (200g)", "Rice (1kg)"],
            total: 890,
            storeName: "FreshMart",
        },
        {
            id: "#123452",
            date: "2023-07-10",
            items: ["Bananas (1kg)", "Almond Milk (1L)", "Granola (500g)"],
            total: 670,
            storeName: "Reliance Fresh",
        }
    ]);

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity style={styles.orderItem}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{item.id}</Text>
                <Text style={[
                    styles.orderStatus,
                    {color: "#A7D129"}
                ]}>
                    {item.storeName}
                </Text>
            </View>
            <Text style={styles.orderDate}>{new Date(item.date).toDateString()}</Text>
            <Text style={styles.orderItems}>{item.items.join(", ")}</Text>
            <Text style={styles.orderTotal}>Total: Rs. {item.total.toFixed(2)}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <Image
                        source={require("../assets/icons/profile.png")}
                        style={styles.profileImage}
                    />
                    <Text style={styles.userName}>Sameer Palkar</Text>
                    <Text style={styles.userEmail}>sameerpalkar04@gmail.com</Text>
                </View>

                {/* Order History */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Order History</Text>
                    <FlatList
                        data={orders}
                        renderItem={renderOrderItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={styles.ordersList}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingVertical: "8%",
    },
    profileHeader: {
        alignItems: "center",
        padding: 20,
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: "#888",
    },
    sectionContainer: {
        marginHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    ordersList: {
        paddingBottom: 20,
    },
    orderItem: {
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    orderId: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    orderStatus: {
        fontSize: 14,
        fontWeight: "600",
    },
    orderDate: {
        fontSize: 12,
        color: "#888",
        marginBottom: 5,
    },
    orderItems: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    orderTotal: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
});

export default ProfilePage;
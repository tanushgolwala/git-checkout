import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import BottomNavBar from "../components/navbar";
import recentlyViewedData from "../assets/items/data.json";

interface RecentlyViewedItem {
  name: string;
  image: string;
}

const HomePage = (): JSX.Element => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    // Load the recently viewed items from the JSON file
    setRecentlyViewed(recentlyViewedData);
    console.log(recentlyViewedData);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.profileContainer}>
              <Image
                source={require("../assets/icons/profile.png")}
                style={styles.profileImage}
              />
              <View>
                <Text style={styles.greeting}>Hello Sameer</Text>
                <Text style={styles.welcomeMessage}>Welcome to GoKarts</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationIconContainer}>
              <Image
                source={require("../assets/icons/notif.png")}
                style={styles.notificationIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#888"
            />
            <TouchableOpacity style={styles.searchIconContainer}>
              <Image
                source={require("../assets/search.png")}
                style={styles.searchIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Promotional Banner */}
          <View style={styles.bannerContainer}>
            <Image
              source={require("../assets/banner.png")}
              style={styles.bannerImage}
            />
          </View>

          {/* Recently Viewed */}
          <View style={styles.recentlyViewedContainer}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
            <View style={styles.recentlyViewedItems}>
              {recentlyViewed.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.itemImage}
                  />
                  <Text style={styles.itemLabel}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation Bar */}
        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: '8%',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
  },
  welcomeMessage: {
    fontSize: 14,
    color: "#888",
  },
  notificationIconContainer: {
    padding: 10,
  },
  notificationIcon: {
    width: 40,
    height: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchIconContainer: {
    padding: 5,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  bannerContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  bannerImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  recentlyViewedContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recentlyViewedItems: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemContainer: {
    alignItems: "center",
    width: "48%",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 10,
  },
  itemImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomePage;
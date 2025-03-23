import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ImageSourcePropType,
} from "react-native";

interface TabConfig {
  name: string;
  icon: ImageSourcePropType;
}

const BottomNavBar = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<string>("Home");

  const tabs: TabConfig[] = [
    {
      name: "Home",
      icon: require("../assets/navbar/home.png"),
    },
    {
      name: "Lists",
      icon: require("../assets/navbar/lists.png"),
    },
    {
      name: "AI",
      icon: require("../assets/navbar/AI.png"),
    },
    {
      name: "Cart",
      icon: require("../assets/navbar/cart.png"),
    },
  ];

  // Create a ref that stores a dictionary of Animated.Value objects keyed by tab name
  const scales = useRef<Record<string, Animated.Value>>(
    tabs.reduce((acc, tab) => {
      acc[tab.name] = new Animated.Value(tab.name === activeTab ? 1.2 : 1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  useEffect(() => {
    // Animate the active tab scale up
    Animated.spring(scales[activeTab], {
      toValue: 1.2,
      useNativeDriver: true,
    }).start();

    // Reset the scale of other tabs
    tabs.forEach((tab) => {
      if (tab.name !== activeTab) {
        Animated.spring(scales[tab.name], {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [activeTab, scales, tabs]);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.name)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: isActive ? "#000" : "transparent",
                  transform: [{ scale: scales[tab.name] }],
                },
              ]}
            >
              <Image
                source={tab.icon}
                style={[
                  styles.iconImage,
                  { tintColor: isActive ? "#fff" : "#000" },
                ]}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 30,
    margin: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
  },
  iconWrapper: {
    padding: 10,
    borderRadius: 25,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
});

export default BottomNavBar;

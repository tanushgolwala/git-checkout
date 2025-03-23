import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ImageSourcePropType,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";

interface TabConfig {
  name: string;            // Label for internal logic
  icon: ImageSourcePropType;
  routeName: string;       // Corresponding screen in your stack
}

const BottomNavBar = (): JSX.Element => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<string>("Home");

  // Define the tabs and the routes they should navigate to
  const tabs: TabConfig[] = [
    {
      name: "Home",
      routeName: "Home",
      icon: require("../assets/navbar/home.png"),
    },
    {
      name: "Lists",
      routeName: "ListMaker",
      icon: require("../assets/navbar/lists.png"),
    },
    {
      name: "AI",
      routeName: "AIgen",
      icon: require("../assets/navbar/AI.png"),
    },
    {
      name: "Cart",
      routeName: "Cart",
      icon: require("../assets/navbar/cart.png"),
    },
  ];

  // Store an Animated.Value for each tab’s scale
  const scales = useRef<Record<string, Animated.Value>>(
    tabs.reduce((acc, tab) => {
      acc[tab.name] = new Animated.Value(tab.name === activeTab ? 1.2 : 1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  useEffect(() => {
    // Scale up the active tab
    Animated.spring(scales[activeTab], {
      toValue: 1.2,
      useNativeDriver: true,
    }).start();

    // Scale down the other tabs
    tabs.forEach((tab) => {
      if (tab.name !== activeTab) {
        Animated.spring(scales[tab.name], {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [activeTab, scales, tabs]);

  // When a tab is pressed, set it active & navigate to its screen
  const handleTabPress = (tab: TabConfig) => {
    setActiveTab(tab.name);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: tab.routeName }],
      })
    );
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab)}
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
    position: "absolute",
    bottom: 5,
    backgroundColor: "#F2F2F2",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 30,
    margin: 10,
    marginTop: 0,
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

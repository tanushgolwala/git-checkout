import React, { useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, SafeAreaView } from "react-native";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import GetStarted from "./pages/GetStarted";
import HomePage from "./pages/HomePage";
import ShoppingListScreen from "./pages/ListMaker";
import YourCart from "./pages/Cart";
import BottomNavBar from "./Navigators/navbar";
import AIgen from "./pages/AIgen";

const Stack = createNativeStackNavigator();

export default function App() {
  // Track current route to conditionally render nav bar
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [currentRoute, setCurrentRoute] = useState<string>("");

  const handleStateChange = () => {
    const route = navigationRef.current?.getCurrentRoute();
    if (route?.name) {
      setCurrentRoute(route.name);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef} onStateChange={handleStateChange}>
        <Stack.Navigator initialRouteName="Getstart" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Getstart" component={GetStarted} />
          <Stack.Screen name="Home" component={HomePage} />
          <Stack.Screen name="ListMaker" component={ShoppingListScreen} />
          <Stack.Screen name="ListScreen" component={ShoppingListScreen} />
          <Stack.Screen name="Cart" component={YourCart} />
          <Stack.Screen name="AIgen" component={AIgen} />
        </Stack.Navigator>

        {currentRoute !== "Getstart" && <BottomNavBar />}

        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

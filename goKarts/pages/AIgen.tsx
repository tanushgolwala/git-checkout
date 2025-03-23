import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiKey } from "../constant/secrets";
import * as Speech from "expo-speech";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AIgen() {
    const speak = (text: string) => {
        Speech.speak(text);
    }
    const [dishName, setDishName] = useState("");
    const [recipe, setRecipe] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [ingredients, setIngredients] = useState<Array<{ name: string, quantity: string, selected: boolean }>>([]);
    const [shoppingList, setShoppingList] = useState<Array<{ name: string, quantity: string, dish: string }>>([]);

    // Load shopping list from storage on component mount
    useEffect(() => {
        loadShoppingList();
    }, []);

    // Load shopping list from AsyncStorage
    const loadShoppingList = async () => {
        try {
            const savedList = await AsyncStorage.getItem('shoppingList');
            if (savedList) {
                setShoppingList(JSON.parse(savedList));
            }
        } catch (error) {
            console.log("Error loading shopping list:", error);
        }
    };

    // Save shopping list to AsyncStorage
    const saveShoppingList = async (newList: Array<{ name: string, quantity: string, dish: string }>) => {
        try {
            await AsyncStorage.setItem('shoppingList', JSON.stringify(newList));
        } catch (error) {
            console.log("Error saving shopping list:", error);
        }
    };

    const prompt = `I am making this dish. I want you to give me only the ingredients in the following format:
1. Ingredient 1 (Quantity)
2. Ingredient 2 (Quantity)

Do not give any other description, just this format. The quantity must be present in grams or milliliters.
Please note that this is for my shopping list so provide details accordingly.
`;

    const handleGetRecipe = async () => {
        try {
            setIsLoading(true);
            setRecipe("");
            setIngredients([]);

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const requestBody = {
                contents: [
                    {
                        parts: [
                            {
                                text: `Give me a recipe for ${dishName}.\n${prompt}`,
                            },
                        ],
                    },
                ],
            };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch recipe.");
            }

            const data = await response.json();
            const recipeText =
                data?.candidates?.[0]?.content?.parts?.[0]?.text || "No recipe found.";

            // Parse ingredients from the recipe text
            const parsedIngredients = parseIngredients(recipeText);
            setIngredients(parsedIngredients);

            // Speak and log the recipe
            speak(recipeText);
            // console.log("Recipe:", recipeText);

            setRecipe(recipeText);
        } catch (error) {
            console.log("Error:", error);
            setRecipe("An error occurred while fetching the recipe.");
        } finally {
            setIsLoading(false);
        }
    };

    // Parse ingredients from the recipe text
    const parseIngredients = (recipeText: string) => {
        const lines = recipeText.split('\n');
        const ingredientLines = lines.filter(line => /^\d+\./.test(line.trim()));

        return ingredientLines.map(line => {
            // Extract the ingredient name and quantity
            const matched = line.match(/^\d+\.\s+(.*?)\s+\((.*?)\)$/);
            if (matched && matched.length >= 3) {
                return {
                    name: matched[1].trim(),
                    quantity: matched[2].trim(),
                    selected: false
                };
            } else {
                // Fallback if pattern doesn't match exactly
                const parts = line.split('(');
                const name = parts[0].replace(/^\d+\./, '').trim();
                const quantity = parts.length > 1 ? parts[1].replace(')', '').trim() : 'quantity not specified';

                return {
                    name,
                    quantity,
                    selected: false
                };
            }
        });
    };

    // Toggle ingredient selection
    const toggleIngredientSelection = (index: number) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index].selected = !updatedIngredients[index].selected;
        setIngredients(updatedIngredients);
    };

    // Add selected ingredients to shopping list
    const addToShoppingList = async () => {
        const selectedIngredients = ingredients.filter(ing => ing.selected);

        if (selectedIngredients.length === 0) {
            Alert.alert("No Ingredients Selected", "Please select at least one ingredient to add to your shopping list.");
            return;
        }

        const newItems = selectedIngredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            dish: dishName
        }));

        const updatedShoppingList = [...shoppingList, ...newItems];
        setShoppingList(updatedShoppingList);
        await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedShoppingList));
        saveShoppingList(updatedShoppingList);

        console.log("From Async Storage : ", await AsyncStorage.getItem('shoppingList'));

        // Reset selection
        const updatedIngredients = ingredients.map(ing => ({ ...ing, selected: false }));
        setIngredients(updatedIngredients);

        Alert.alert("Success", `Added ${selectedIngredients.length} item(s) to your shopping list.`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AI Shopping List Generator</Text>

            <View style={styles.inputContainer}>
                <Ionicons name="restaurant" size={24} color="#A7D129" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={dishName}
                    onChangeText={setDishName}
                    placeholder="Enter dish name"
                    placeholderTextColor="#6B6B6B"
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleGetRecipe}
                disabled={!dishName}
            >
                <Text style={styles.buttonText}>Generate Shopping List</Text>
                <Ionicons name="arrow-forward" size={20} color="#1E1E1E" />
            </TouchableOpacity>

            {isLoading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#A7D129" />
                    <Text style={styles.loadingText}>Cooking up your recipe...</Text>
                </View>
            )}

            {!isLoading && ingredients.length > 0 && (
                <ScrollView style={styles.recipeContainer}>
                    <View style={styles.recipeHeader}>
                        <Ionicons name="list" size={24} color="#A7D129" />
                        <Text style={styles.recipeTitle}>Ingredients for {dishName}</Text>
                    </View>

                    {ingredients.map((ingredient, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.ingredientItem}
                            onPress={() => toggleIngredientSelection(index)}
                        >
                            <Ionicons
                                name={ingredient.selected ? "checkbox" : "square-outline"}
                                size={24}
                                color="#A7D129"
                            />
                            <Text style={styles.ingredientText}>
                                {ingredient.name} ({ingredient.quantity})
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.addToListButton}
                        onPress={addToShoppingList}
                    >
                        <Ionicons name="cart" size={20} color="#1E1E1E" />
                        <Text style={styles.addToListButtonText}>Add Selected to Shopping List</Text>
                    </TouchableOpacity>

                    {shoppingList.length > 0 && (
                        <View style={styles.shoppingListSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="cart" size={24} color="#A7D129" />
                                <Text style={styles.sectionTitle}>Current Shopping List</Text>
                            </View>
                            {shoppingList.map((item, index) => (
                                <View key={index} style={styles.shoppingListItem}>
                                    <Text style={styles.shoppingItemText}>
                                        • {item.name} ({item.quantity})
                                    </Text>
                                    <Text style={styles.dishLabel}>For: {item.dish}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        padding: 24,
        paddingTop: 50,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        color: "#1E1E1E",
        fontWeight: "bold",
        marginBottom: 30,
        textAlign: "center",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2D2D2D",
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: "#D9D9D9",
        fontSize: 16,
        paddingVertical: 16,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#A7D129",
        borderRadius: 12,
        padding: 18,
        marginBottom: 20,
        gap: 10,
    },
    buttonText: {
        color: "#1E1E1E",
        fontSize: 16,
        fontWeight: "bold",
    },
    loaderContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    loadingText: {
        color: "#D9D9D9",
        marginTop: 16,
        fontSize: 14,
    },
    recipeContainer: {
        backgroundColor: "#2D2D2D",
        borderRadius: 16,
        padding: 20,
    },
    recipeHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    recipeTitle: {
        color: "#A7D129",
        fontSize: 20,
        fontWeight: "bold",
    },
    ingredientItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#3A3A3A",
        gap: 10,
    },
    ingredientText: {
        color: "#D9D9D9",
        fontSize: 16,
        flex: 1,
    },
    addToListButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#A7D129",
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        marginBottom: 20,
        gap: 10,
    },
    addToListButtonText: {
        color: "#1E1E1E",
        fontSize: 16,
        fontWeight: "bold",
    },
    shoppingListSection: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#3A3A3A",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        color: "#A7D129",
        fontSize: 18,
        fontWeight: "bold",
    },
    shoppingListItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#3A3A3A",
    },
    shoppingItemText: {
        color: "#D9D9D9",
        fontSize: 16,
    },
    dishLabel: {
        color: "#909090",
        fontSize: 14,
        marginTop: 4,
        marginLeft: 16,
        fontStyle: "italic",
    },
    recipeLine: {
        color: "#D9D9D9",
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 8,
    },
    sectionHeaderText: {
        color: "#A7D129",
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 10,
        fontSize: 18,
    },
    listItem: {
        marginLeft: 15,
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderLeftColor: "#A7D129",
    },
});
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { apiKey } from "../constant/secrets";
import * as Speech from "expo-speech";

export default function AIgen() {
    const speak = (text: string) => {
        Speech.speak(text);
    }
    const [dishName, setDishName] = useState("");
    const [recipe, setRecipe] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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

            // Speak and log the recipe
            speak(recipeText);
            console.log("Recipe:", recipeText);

            setRecipe(recipeText);
        } catch (error) {
            console.log("Error:", error);
            setRecipe("An error occurred while fetching the recipe.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Enter Dish Name:</Text>
            <TextInput
                style={styles.input}
                value={dishName}
                onChangeText={setDishName}
                placeholder="e.g. Chicken Curry"
            />

            <Button title="Get Recipe" onPress={handleGetRecipe} disabled={!dishName} />

            {isLoading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            )}

            {!isLoading && recipe.length > 0 && (
                <ScrollView style={styles.recipeContainer}>
                    <Text style={styles.recipeText}>{recipe}</Text>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        padding: 8,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 16,
    },
    loaderContainer: {
        marginTop: 16,
        alignItems: "center",
    },
    recipeContainer: {
        marginTop: 24,
        backgroundColor: "#f5f5f5",
        padding: 12,
        borderRadius: 8,
        maxHeight: 300,
    },
    recipeText: {
        fontSize: 14,
        color: "#333",
    },
});

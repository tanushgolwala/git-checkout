import React, { useEffect, useRef, useState } from "react";

import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Text
} from "react-native";

import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";

import * as cocossd from "@tensorflow-models/coco-ssd";

import * as jpeg from "jpeg-js";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

export default function DetectObjectsScreen(): JSX.Element {
    const [isTfReady, setIsTfReady] = useState<boolean>(false);
    const [isModelReady, setIsModelReady] = useState<boolean>(false);
    const [predictions, setPredictions] = useState<any[] | null>(null);
    const [imageToAnalyze, setImageToAnalyze] = useState<any | null>(null);
    const model = useRef<cocossd.ObjectDetection | null>(null);

    useEffect(() => {
        const initializeTfAsync = async (): Promise<void> => {
            await tf.ready();
            setIsTfReady(true);
        };

        const initializeModelAsync = async (): Promise<void> => {
            model.current = await cocossd.load(); // preparing COCO-SSD model
            setIsModelReady(true);
        };

        const getPermissionAsync = async (): Promise<void> => {
            if (Platform.OS !== "web") {
                const {
                    status,
                } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                    alert("Sorry, we need camera roll permissions to make this work!");
                }
            }
        };

        initializeTfAsync();
        initializeModelAsync();
        getPermissionAsync();
    }, []);

    const imageToTensor = (rawImageData: ArrayBuffer): tf.Tensor3D => {
        const { width, height, data } = jpeg.decode(rawImageData, {
            useTArray: true,
        }); // return as Uint8Array

        // Drop the alpha channel info for mobilenet
        const buffer = new Uint8Array(width * height * 3);
        let offset = 0; // offset into original data
        for (let i = 0; i < buffer.length; i += 3) {
            buffer[i] = data[offset];
            buffer[i + 1] = data[offset + 1];
            buffer[i + 2] = data[offset + 2];

            offset += 4;
        }

        return tf.tensor3d(buffer, [height, width, 3]);
    };

    const detectObjectsAsync = async (source: { uri: string }): Promise<void> => {
        try {
            // Instead of using fetch, directly read the file
            const fileUri = source.uri;
            
            // Read the file as base64
            const base64ImageData = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            // Convert base64 to binary
            const rawImageData = tf.util.encodeString(base64ImageData, 'base64').buffer;
            
            const imageTensor = imageToTensor(rawImageData);
            
            if (model.current) {
                const newPredictions = await model.current.detect(imageTensor);
                setPredictions(newPredictions);
                console.log("=== Detect objects predictions: ===");
                console.log(newPredictions);
            } else {
                console.log("Model not loaded yet");
            }
        } catch (error) {
            console.log("Exception Error: ", error);
        }
    };

    const selectImageAsync = async (): Promise<void> => {
        try {
            let response = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Restrict to images only
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!response.canceled) {
                // Process response correctly based on Expo version
                const uri = response.assets?.[0]?.uri || response.uri;
                
                if (!uri) {
                    console.log("No URI found in response");
                    return;
                }

                // Resize image to avoid memory issues
                const manipResponse = await ImageManipulator.manipulateAsync(
                    uri,
                    [{ resize: { width: 900 } }],
                    { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
                );

                const source = { uri: manipResponse.uri };
                setImageToAnalyze(source);
                setPredictions(null);
                
                // Log the URI to verify it exists
                console.log("Image URI to analyze:", manipResponse.uri);
                
                await detectObjectsAsync(source);
            }
        } catch (error) {
            console.log("Error selecting image:", error);
        }
    };

    const borderColors = ["blue", "green", "orange", "pink", "purple"];
    const scalingFactor = 280 / 900; // image display size / actual image size

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.welcomeContainer}>
                    <Text style={styles.headerText}>COCO-SSD Object Detection</Text>

                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingTfContainer}>
                            <Text style={styles.text}>TensorFlow.js ready?</Text>
                            {isTfReady ? (
                                <Text style={styles.text}>✅</Text>
                            ) : (
                                <ActivityIndicator size="small" />
                            )}
                        </View>

                        <View style={styles.loadingModelContainer}>
                            <Text style={styles.text}>COCO-SSD model ready? </Text>
                            {isModelReady ? (
                                <Text style={styles.text}>✅</Text>
                            ) : (
                                <ActivityIndicator size="small" />
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.imageWrapper}
                        onPress={isModelReady ? selectImageAsync : undefined}
                    >
                        {imageToAnalyze && (
                            <View style={{ position: "relative" }}>
                                {isModelReady &&
                                    predictions &&
                                    predictions.map((p, index) => {
                                        return (
                                            <View
                                                key={index}
                                                style={{
                                                    zIndex: 1,
                                                    elevation: 1,
                                                    left: p.bbox[0] * scalingFactor,
                                                    top: p.bbox[1] * scalingFactor,
                                                    width: p.bbox[2] * scalingFactor,
                                                    height: p.bbox[3] * scalingFactor,
                                                    borderWidth: 2,
                                                    borderColor: borderColors[index % 5],
                                                    backgroundColor: "transparent",
                                                    position: "absolute",
                                                }}
                                            />
                                        );
                                    })}

                                <View
                                    style={{
                                        zIndex: 0,
                                        elevation: 0,
                                    }}
                                >
                                    <Image
                                        source={imageToAnalyze}
                                        style={styles.imageContainer}
                                    />
                                </View>
                            </View>
                        )}

                        {isModelReady && !imageToAnalyze && (
                            <Text style={styles.transparentText}>Tap to choose image</Text>
                        )}
                    </TouchableOpacity>
                    <View style={styles.predictionWrapper}>
                        {isModelReady && imageToAnalyze && !predictions && (
                            <Text style={styles.text}>
                                Predictions: Predicting...
                            </Text>
                        )}
                        {isModelReady &&
                            predictions &&
                            predictions.map((p, index) => {
                                return (
                                    <Text
                                        key={index}
                                        style={{ ...styles.text, color: borderColors[index % 5] }}
                                    >
                                        {p.class}: {Math.round(p.score * 100) / 100}
                                    </Text>
                                );
                            })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    welcomeContainer: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    contentContainer: {
        paddingTop: 30,
    },
    headerText: {
        marginTop: 5,
        fontSize: 20,
        fontWeight: "bold",
    },
    loadingContainer: {
        marginTop: 5,
    },
    text: {
        fontSize: 16,
    },
    loadingTfContainer: {
        flexDirection: "row",
        marginTop: 10,
    },
    loadingModelContainer: {
        flexDirection: "row",
        marginTop: 10,
    },
    imageWrapper: {
        width: 300,
        height: 300,
        borderColor: "#66c8cf",
        borderWidth: 3,
        borderStyle: "dashed",
        marginTop: 40,
        marginBottom: 10,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    imageContainer: {
        width: 280,
        height: 280,
    },
    predictionWrapper: {
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
    },
    transparentText: {
        opacity: 0.8,
    },
});
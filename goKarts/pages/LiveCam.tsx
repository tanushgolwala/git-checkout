import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
} from "react-native";

import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";

import * as mobilenet from "@tensorflow-models/mobilenet";

import * as jpeg from "jpeg-js";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

import { fetch } from "@tensorflow/tfjs-react-native";

// Define types for predictions and image source
interface Prediction {
    className: string;
    probability: number;
}

interface ImageSource {
    uri: string;
}

export default function ClassifyImageScreen() {
    const [isTfReady, setIsTfReady] = useState<boolean>(false);
    const [isModelReady, setIsModelReady] = useState<boolean>(false);
    const [predictions, setPredictions] = useState<Prediction[] | null>(null);
    const [imageToAnalyze, setImageToAnalyze] = useState<ImageSource | null>(null);
    const model = useRef<mobilenet.MobileNet | null>(null);

    useEffect(() => {
        const initializeTfAsync = async () => {
            await tf.ready();
            setIsTfReady(true);
        };

        const initializeModelAsync = async () => {
            model.current = await mobilenet.load();
            setIsModelReady(true);
        };

        const getPermissionAsync = async () => {
            if (Platform.OS !== "web") {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        });
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

    const classifyImageAsync = async (source: ImageSource) => {
        try {
            const imageAssetPath = Image.resolveAssetSource(source);
            let rawImageData: ArrayBuffer;
            if (imageAssetPath.uri.startsWith("file://")) {
                const base64data = await FileSystem.readAsStringAsync(imageAssetPath.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                // Convert base64 string to binary data.
                const binaryString = atob(base64data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                rawImageData = bytes.buffer;
            } else {
                const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
                rawImageData = await response.arrayBuffer();
            }
            const imageTensor = imageToTensor(rawImageData);
            const newPredictions = await model.current!.classify(imageTensor);
            setPredictions(newPredictions);
        } catch (error) {
            console.log("Exception Error: ", error);
        }
    };

    const selectImageAsync = async () => {
        try {
            let response = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
            });

            if (!response.canceled) {
                // resize image to avoid out of memory crashes
                const manipResponse = await ImageManipulator.manipulateAsync(
                    response.assets[0].uri,
                    [{ resize: { width: 900 } }],
                    { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
                );

                const source: ImageSource = { uri: manipResponse.uri };
                setImageToAnalyze(source);
                setPredictions(null);
                await classifyImageAsync(source);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.welcomeContainer}>
                    <Text style={styles.headerText}>MobileNet Image Classification</Text>

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
                            <Text style={styles.text}>MobileNet model ready? </Text>
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
                            <Image source={imageToAnalyze} style={styles.imageContainer} />
                        )}

                        {isModelReady && !imageToAnalyze && (
                            <Text style={styles.transparentText}>Tap to choose image</Text>
                        )}
                    </TouchableOpacity>
                    <View style={styles.predictionWrapper}>
                        {isModelReady && imageToAnalyze && (
                            <Text style={styles.text}>
                                Predictions: {predictions ? "" : "Predicting..."}
                            </Text>
                        )}
                        {isModelReady && predictions && predictions.length > 0 && (
                            <>
                                {predictions.map((p, index) => (
                                    <Text key={index} style={styles.text}>
                                        {p.className}: {p.probability}
                                    </Text>
                                ))}
                            </>
                        )}
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
        height: 100,
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
    },
    transparentText: {
        opacity: 0.8,
    },
});
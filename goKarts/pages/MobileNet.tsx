import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
} from "react-native";

// TensorFlow / COCO-SSD
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import * as cocossd from "@tensorflow-models/coco-ssd";

// Image / File tools
import * as jpeg from "jpeg-js";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

// Camera
import { Camera, CameraPictureOptions, CameraView } from "expo-camera";

// Define a type for COCO-SSD predictions
interface DetectionPrediction {
    bbox: number[]; // [x, y, width, height]
    class: string;
    score: number;
}

export default function DetectObjectsScreen(): JSX.Element {
    const [isTfReady, setIsTfReady] = useState<boolean>(false);
    const [isModelReady, setIsModelReady] = useState<boolean>(false);
    const [predictions, setPredictions] = useState<DetectionPrediction[] | null>(
        null
    );
    const [capturedPhoto, setCapturedPhoto] = useState<{
        uri: string;
        base64?: string;
    } | null>(null);

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);

    // The camera and model refs
    const cameraRef = useRef<CameraView>(null);
    const model = useRef<cocossd.ObjectDetection | null>(null);

    // Flags and interval reference for polling
    const [isRealtime, setIsRealtime] = useState<boolean>(false);
    const [isDetecting, setIsDetecting] = useState<boolean>(false);
    const detectionInterval = useRef<NodeJS.Timer | null>(null);

    useEffect(() => {
        const initializeTfAsync = async (): Promise<void> => {
            console.log("Initializing TensorFlow...");
            await tf.ready();
            console.log("TensorFlow is ready!");
            setIsTfReady(true);
        };

        const initializeModelAsync = async (): Promise<void> => {
            console.log("Loading COCO-SSD model...");
            model.current = await cocossd.load();
            console.log("COCO-SSD model is ready!");
            setIsModelReady(true);
        };

        const getCameraPermission = async (): Promise<void> => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(status === "granted");
            if (status !== "granted") {
                alert("Sorry, we need camera permissions to make this work!");
            }
        };

        initializeTfAsync();
        initializeModelAsync();
        getCameraPermission();
    }, []);

    const imageToTensor = (rawImageData: ArrayBuffer): tf.Tensor3D => {
        const { width, height, data } = jpeg.decode(rawImageData, {
            useTArray: true,
        });
        // Drop the alpha channel
        const buffer = new Uint8Array(width * height * 3);
        let offset = 0;
        for (let i = 0; i < buffer.length; i += 3) {
            buffer[i] = data[offset];
            buffer[i + 1] = data[offset + 1];
            buffer[i + 2] = data[offset + 2];
            offset += 4;
        }
        return tf.tensor3d(buffer, [height, width, 3]);
    };

    // Reusable detection method
    const detectObjectsAsync = async (photo: { uri: string; base64?: string }) => {
        try {
            let rawImageData: ArrayBuffer;
            if (photo.base64) {
                // Convert base64 to ArrayBuffer
                const encoded = tf.util.encodeString(photo.base64, "base64") as Uint8Array;
                rawImageData = encoded.buffer as ArrayBuffer;
            } else {
                // If no base64, read file from uri
                const base64ImageData = await FileSystem.readAsStringAsync(photo.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                const encoded = tf.util.encodeString(base64ImageData, "base64") as Uint8Array;
                rawImageData = encoded.buffer as ArrayBuffer;
            }

            const imageTensor = imageToTensor(rawImageData);

            if (model.current) {
                const newPredictions = await model.current.detect(imageTensor);
                setPredictions(newPredictions as DetectionPrediction[]);
                // For debugging
                console.log("===== Detect objects predictions =====");
                console.log(newPredictions);
            }
        } catch (error) {
            console.log("Exception Error: ", error);
        }
    };

    // Capture one frame from camera, resize, detect
    const captureFrame = async () => {
        if (!cameraRef.current) return;

        try {
            // Capture photo with base64 data
            const pictureOptions: CameraPictureOptions = {
                base64: true,
                quality: 0.6, // lower quality to speed up
            };
            const photo = await cameraRef.current.takePictureAsync(pictureOptions);
            // Optionally resize the image
            const manipResponse = await ImageManipulator.manipulateAsync(
                photo?.uri ?? '',
                [{ resize: { width: 640 } }], // smaller resizing for faster inference
                { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );
            const captured = { uri: manipResponse.uri, base64: manipResponse.base64 };
            setCapturedPhoto(captured);
            await detectObjectsAsync(captured);
        } catch (error) {
            console.log("Error capturing frame:", error);
        }
    };

    // Start "real-time" detection by polling
    const startRealtimeDetection = () => {
        if (isRealtime) return;
        setIsRealtime(true);
        detectionInterval.current = setInterval(async () => {
            if (!isDetecting) {
                setIsDetecting(true);
                await captureFrame();
                setIsDetecting(false);
            }
        }, 1500); // capture every 1.5 seconds
    };

    // Stop polling
    const stopRealtimeDetection = () => {
        if (!isRealtime) return;
        setIsRealtime(false);
        if (detectionInterval.current) {
            clearInterval(detectionInterval.current as NodeJS.Timeout);
            detectionInterval.current = null;
        }
    };

    // For bounding boxes
    const borderColors = ["blue", "green", "orange", "pink", "purple"];
    const scalingFactor = 280 / 640; // image display size / resized image width

    return (
        <View style={styles.container}>
            {/* Camera preview */}
            {hasCameraPermission ? (
                <CameraView style={styles.camera} ref={cameraRef} ratio="4:3" />
            ) : (
                <Text>No access to camera</Text>
            )}

            {/* Controls for capturing or toggling real-time detection */}
            <View style={styles.controls}>
                {isTfReady && isModelReady ? (
                    <>
                        {!isRealtime ? (
                            <TouchableOpacity style={styles.captureButton} onPress={startRealtimeDetection}>
                                <Text style={styles.buttonText}>Start Live Detection</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.captureButton} onPress={stopRealtimeDetection}>
                                <Text style={styles.buttonText}>Stop Live Detection</Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <ActivityIndicator size="small" />
                )}
            </View>

            {/* Display last captured frame with bounding boxes */}
            {capturedPhoto && (
                <ScrollView style={styles.resultContainer}>
                    <Text style={styles.headerText}>
                        COCO-SSD Object Detection (Last Captured Frame)
                    </Text>
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: capturedPhoto.uri }} style={styles.imageContainer} />
                        {predictions &&
                            predictions.map((p, index) => (
                                <View
                                    key={index}
                                    style={{
                                        position: "absolute",
                                        left: p.bbox[0] * scalingFactor,
                                        top: p.bbox[1] * scalingFactor,
                                        width: p.bbox[2] * scalingFactor,
                                        height: p.bbox[3] * scalingFactor,
                                        borderWidth: 2,
                                        borderColor: borderColors[index % borderColors.length],
                                        backgroundColor: "transparent",
                                    }}
                                />
                            ))}
                    </View>
                    <View style={styles.predictionWrapper}>
                        {!predictions && (
                            <Text style={styles.text}>Predictions: Predicting...</Text>
                        )}
                        {predictions &&
                            predictions.map((p, index) => (
                                <Text
                                    key={index}
                                    style={{ ...styles.text, color: borderColors[index % borderColors.length] }}
                                >
                                    {p.class}: {Math.round(p.score * 100) / 100}
                                </Text>
                            ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    controls: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    captureButton: {
        padding: 10,
        backgroundColor: "#66c8cf",
        borderRadius: 5,
        marginBottom: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
    resultContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerText: {
        marginTop: 10,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    imageWrapper: {
        width: 300,
        height: 300,
        borderColor: "#66c8cf",
        borderWidth: 3,
        borderStyle: "dashed",
        alignSelf: "center",
        marginTop: 10,
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
        marginVertical: 10,
    },
    text: {
        fontSize: 16,
    },
});
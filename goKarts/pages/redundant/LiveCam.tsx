import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
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
    const [predictions, setPredictions] = useState<DetectionPrediction[] | null>(null);
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
    const detectObjectsAsync = async (base64: string) => {
        try {
            // Convert base64 to ArrayBuffer
            const encoded = tf.util.encodeString(base64, "base64") as Uint8Array;
            const rawImageData = encoded.buffer as ArrayBuffer;
            const imageTensor = imageToTensor(rawImageData);

            if (model.current) {
                const newPredictions = await model.current.detect(imageTensor);
                setPredictions(newPredictions as DetectionPrediction[]);
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
                quality: 0.6, // lower quality for speed
            };
            const photo = await cameraRef.current.takePictureAsync(pictureOptions);
            // Optionally resize the image to speed up inference
            const manipResponse = await ImageManipulator.manipulateAsync(photo?.uri ?? "",
                [{ resize: { width: 640 } }],
                { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );
            // Run detection on the new base64 image
            if (manipResponse.base64) {
                await detectObjectsAsync(manipResponse.base64);
            }
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
    // The "640" below matches your resize width from captureFrame.
    // The camera preview is full screen, so the scaling factor
    // is how 640 px maps onto this device’s actual camera area.
    // You may need to adjust this for your layout or compute it dynamically.
    const scalingFactor = 1.0; // Start with 1.0 if you want no scaling adjustments

    return (
        <View style={styles.container}>
            {/* Full screen camera preview */}
            {hasCameraPermission ? (
                <View style={styles.cameraContainer}>
                    <CameraView style={styles.camera} ref={cameraRef} ratio="4:3"> 
                    </CameraView>
                </View>
            ) : (
                <Text>No access to camera</Text>
            )}

            {/* Controls for toggling live detection */}
            <View style={styles.controls}>
                {isTfReady && isModelReady ? (
                    isRealtime ? (
                        <TouchableOpacity style={styles.captureButton} onPress={stopRealtimeDetection}>
                            <Text style={styles.buttonText}>Stop Live Detection</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.captureButton} onPress={startRealtimeDetection}>
                            <Text style={styles.buttonText}>Start Live Detection</Text>
                        </TouchableOpacity>
                    )
                ) : (
                    <ActivityIndicator size="small" />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    cameraContainer: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
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
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
});
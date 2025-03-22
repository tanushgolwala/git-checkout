import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    Dimensions,
} from "react-native";

import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import * as cocossd from "@tensorflow-models/coco-ssd";

import { Camera } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as jpeg from "jpeg-js";

interface Prediction {
    bbox: number[];
    class: string;
    score: number;
}

export default function LiveCameraDetectionScreen(): JSX.Element {
    const [isTfReady, setIsTfReady] = useState<boolean>(false);
    const [isModelReady, setIsModelReady] = useState<boolean>(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [predictions, setPredictions] = useState<Prediction[] | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const model = useRef<cocossd.ObjectDetection | null>(null);
    const cameraRef = useRef<Camera | null>(null);
    const rafId = useRef<number | null>(null);

    // Initialize TensorFlow and load COCO-SSD model
    useEffect(() => {
        (async () => {
            try {
                await tf.ready();
                setIsTfReady(true);
                console.log("TensorFlow.js ready");

                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === 'granted');

                model.current = await cocossd.load();
                setIsModelReady(true);
                console.log("COCO-SSD model loaded");
            } catch (error) {
                console.log("Setup error:", error);
            }
        })();

        return () => {
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
        };
    }, []);

    const imageToTensor = (rawImageData: ArrayBuffer): tf.Tensor3D => {
        const { width, height, data } = jpeg.decode(rawImageData, {
            useTArray: true,
        }) as jpeg.BufferRet; // Add explicit type assertion here

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

    const detectObjects = async (): Promise<void> => {
        if (!isModelReady || !cameraRef.current || isProcessing) {
            rafId.current = requestAnimationFrame(detectObjects);
            return;
        }

        try {
            setIsProcessing(true);

            const photo = await cameraRef.current.takePictureAsync({
                skipProcessing: true,
                quality: 0.5,
            });

            const resizedPhoto = await manipulateAsync(
                photo.uri,
                [{ resize: { width: 300 } }],
                { format: SaveFormat.JPEG, compress: 0.8 }
            );

            const response = await fetch(resizedPhoto.uri);
            const imageData = await response.arrayBuffer();

            const imageTensor = imageToTensor(imageData);

            if (model.current) {
                const predictions = await model.current.detect(imageTensor);
                setPredictions(predictions);
                console.log("Predictions:", predictions);
            }

            tf.dispose(imageTensor);

        } catch (error) {
            console.log("Detection error:", error);
        } finally {
            setIsProcessing(false);
            rafId.current = requestAnimationFrame(detectObjects);
        }
    };

    const toggleDetection = (): void => {
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        } else {
            detectObjects();
        }
    };

    const renderDetections = (): JSX.Element[] | null => {
        if (!predictions) return null;

        const { width, height } = Dimensions.get('window');
        const cameraHeight = height * 0.7;

        return predictions.map((prediction, index) => {
            const scaleWidth = width / 300;
            const scaleHeight = cameraHeight / (300 * (height / width));

            const x = prediction.bbox[0] * scaleWidth;
            const y = prediction.bbox[1] * scaleHeight;
            const boxWidth = prediction.bbox[2] * scaleWidth;
            const boxHeight = prediction.bbox[3] * scaleHeight;

            return (
                <View
                    key={index}
                    style={{
                        position: 'absolute',
                        borderWidth: 3,
                        borderColor: COLORS[index % COLORS.length],
                        borderRadius: 2,
                        left: x,
                        top: y,
                        width: boxWidth,
                        height: boxHeight,
                        zIndex: 1000,
                    }}
                >
                    <Text style={{
                        backgroundColor: COLORS[index % COLORS.length],
                        color: 'white',
                        fontSize: 12,
                        padding: 2,
                        position: 'absolute',
                        top: -20,
                    }}>
                        {prediction.class} {Math.round(prediction.score * 100)}%
                    </Text>
                </View>
            );
        });
    };

    const COLORS = ['#FF3B30', '#34C759', '#007AFF', '#5856D6', '#FF9500'];

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text>No camera access. Please enable camera permissions.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                    <Text>TensorFlow.js</Text>
                    {isTfReady ? (
                        <Text style={styles.statusReady}>✓</Text>
                    ) : (
                        <ActivityIndicator size="small" />
                    )}
                </View>

                <View style={styles.statusItem}>
                    <Text>COCO-SSD Model</Text>
                    {isModelReady ? (
                        <Text style={styles.statusReady}>✓</Text>
                    ) : (
                        <ActivityIndicator size="small" />
                    )}
                </View>
            </View>

            <View style={styles.cameraContainer}>
                <Camera
                    ref={cameraRef}
                    style={styles.camera}
                    ratio="16:9"
                >
                    {renderDetections()}
                </Camera>
            </View>

            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={[
                        styles.controlButton,
                        (!isModelReady || !isTfReady) && styles.buttonDisabled
                    ]}
                    onPress={toggleDetection}
                    disabled={!isModelReady || !isTfReady}
                >
                    <Text style={styles.buttonText}>
                        {rafId.current ? "Stop Detection" : "Start Detection"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.predictionsContainer}>
                <Text style={styles.predictionsTitle}>
                    {isProcessing ? "Processing..." : "Detections"}
                </Text>
                {predictions && predictions.map((prediction, index) => (
                    <Text key={index} style={[
                        styles.prediction,
                        { color: COLORS[index % COLORS.length] }
                    ]}>
                        {prediction.class}: {Math.round(prediction.score * 100)}%
                    </Text>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: '#f0f0f0',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusReady: {
        color: 'green',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    cameraContainer: {
        height: '70%',
        overflow: 'hidden',
    },
    camera: {
        flex: 1,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    controlButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    predictionsContainer: {
        padding: 10,
        flex: 1,
    },
    predictionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    prediction: {
        fontSize: 14,
        marginBottom: 3,
    },
});

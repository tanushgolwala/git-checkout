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
import * as bodysegmenter from "@tensorflow-models/body-segmentation";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

export default function DetectObjectsScreen(): JSX.Element {
  const [isTfReady, setIsTfReady] = useState<boolean>(false);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<any[] | null>(null);
  const [imageToAnalyze, setImageToAnalyze] = useState<any | null>(null);
  const model = useRef<bodysegmenter.BodySegmenter | null>(null);

  useEffect(() => {
    const initializeTfAsync = async (): Promise<void> => {
      console.log("Initializing TensorFlow...");
      await tf.ready();

      await tf.setBackend("cpu"); // Set to CPU backend to avoid ImageBitmap issues
      console.log("TensorFlow is ready");
      setIsTfReady(true);
    };

    const initializeModelAsync = async (): Promise<void> => {
      console.log("Initializing BodyPix model...");
      model.current = await bodysegmenter.createSegmenter(
        bodysegmenter.SupportedModels.BodyPix
      );
      console.log("BodyPix model is ready");
      setIsModelReady(true);
    };

    const getPermissionAsync = async (): Promise<void> => {
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

  const imageToTensor = async (uri: string): Promise<tf.Tensor3D> => {
    const imageBuffer = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const imageData = new Uint8Array(Buffer.from(imageBuffer, 'base64'));
    const imageBitmap = await createImageBitmap(new Blob([imageData]));
    return tf.browser.fromPixels(imageBitmap); // Decode image using TensorFlow.js
  };

  const detectObjectsAsync = async (source: { uri: string }): Promise<void> => {
    try {
      const fileUri = source.uri;
      const imageTensor = imageToTensor(fileUri); // Directly convert the image into a tensor

      if (model.current) {
        const newPredictions = await model.current.segmentPeople(await imageTensor);
        setPredictions(newPredictions);
        console.log("=== Body segmenter predictions: ===", newPredictions);
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
        const uri = response.assets?.[0]?.uri;

        if (!uri) {
          console.log("No URI found in response");
          return;
        }

        // Resize image to avoid memory issues
        const manipResponse = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 900 } }], // Resize to a manageable size
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );

        const source = { uri: manipResponse.uri };
        setImageToAnalyze(source);
        setPredictions(null);

        console.log("Image URI to analyze:", manipResponse.uri);

        await detectObjectsAsync(source); // Detect objects after selecting and resizing the image
      }
    } catch (error) {
      console.log("Error selecting image:", error);
    }
  };

  const borderColors = ["blue", "green", "orange", "pink", "purple"];
  const scalingFactor = 280 / 900; // image display size / actual image size

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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

                <View style={{ zIndex: 0, elevation: 0 }}>
                  <Image source={imageToAnalyze} style={styles.imageContainer} />
                </View>
              </View>
            )}

            {isModelReady && !imageToAnalyze && (
              <Text style={styles.transparentText}>Tap to choose image</Text>
            )}
          </TouchableOpacity>

          <View style={styles.predictionWrapper}>
            {isModelReady && imageToAnalyze && !predictions && (
              <Text style={styles.text}>Predictions: Predicting...</Text>
            )}
            {isModelReady &&
              predictions &&
              predictions.map((p, index) => {
                return (
                  <Text key={index} style={{ ...styles.text, color: borderColors[index % 5] }}>
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

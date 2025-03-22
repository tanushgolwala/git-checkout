import React, { useEffect, useState } from "react";
import { View, Button, Text, StyleSheet } from "react-native";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";

function CameraView() {
    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();

    const [isPermissionRequested, setIsPermissionRequested] = useState(false);

    useEffect(() => {
        // Automatically request permission on mount (optional)
        const getPermission = async () => {
            const status = await requestPermission();
            setIsPermissionRequested(true);
        };

        if (!hasPermission && !isPermissionRequested) {
            getPermission();
        }
    }, [hasPermission, isPermissionRequested, requestPermission]);

    if (!hasPermission) {
        return (
            <View style={styles.centered}>
                <Text>No camera permission.</Text>
                <Button title="Grant Permission" onPress={requestPermission} />
            </View>
        );
    }

    if (!device) {
        return (
            <View style={styles.centered}>
                <Text>Loading camera...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default CameraView;

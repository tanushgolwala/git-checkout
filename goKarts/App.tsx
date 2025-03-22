import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import DetectObjectsScreen from './pages/DetectScreen';
import LiveCameraDetectionScreen from './pages/LiveCam';
// import CameraView from './pages/Camera';

export default function App() {
  return (
    // <View style={styles.container}>
    <>
      <DetectObjectsScreen />
      {/* <LiveCameraDetectionScreen /> */}
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

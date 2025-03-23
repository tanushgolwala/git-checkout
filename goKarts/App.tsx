import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import DetectObjectsScreen from './pages/DetectScreen';
import LiveCameraDetectionScreen from './pages/LiveCam';
import ClassifyImageScreen from './pages/LiveCam';
import HomePage from './pages/HomePage';
// import CameraView from './pages/Camera';

export default function App() {
  return (
    <>
      <HomePage />
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

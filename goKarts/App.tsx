import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import DetectObjectsScreen from './pages/DetectScreen';
import LiveCameraDetectionScreen from './pages/LiveCam';
import ClassifyImageScreen from './pages/LiveCam';
import HomePage from './pages/HomePage';
import BottomNavBar from './components/navbar';
import ShoppingListScreen from './pages/ListMaker';
import ShoppingList from './pages/ListScreen';
import YourCart from './pages/Cart';
import AIgen from './pages/AIgen';
// import CameraView from './pages/Camera';

export default function App() {
  return (
    <>
      {/* <ShoppingListScreen /> */}
      {/* <ShoppingList /> */}
      {/* <YourCart /> */}
      <AIgen />
      {/* <HomePage /> */}
      {/* <DetectObjectsScreen /> */}
      {/* <LiveCameraDetectionScreen /> */}
      {/* <ClassifyImageScreen /> */}
      {/* <CameraView /> */}
      {/* <BottomNavBar /> */}
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

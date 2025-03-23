import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, Image, StyleSheet, View, Dimensions, TouchableOpacity } from "react-native";

const { height, width } = Dimensions.get("window");

function GetStarted() {
    const navigation = useNavigation();
    const ongetStarted = () => {
        console.log('Button Pressed');
        navigation.navigate('Home');
    }
    return (
        <View style={styles.wrapper}>
            <Image source={require('../assets/Man.png')} style={styles.image} />
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text style={styles.boldtext}>Discover Shopping Like Never Before</Text>
                    <View style={{ height: '15%' }} />
                    <Text style={styles.text}>Discover smart billing checkout, AI recommendation and more</Text>
                    <View style={{ height: '12%' }} />
                    <TouchableOpacity style={styles.button} onPress={ongetStarted}>
                        <View style={styles.buttoncont}>
                            <Text style={styles.buttontext}>Get Started</Text>
                            <Image source={require('../assets/icons/arrow-right.png')} style={{ margin: '2%', marginLeft: '-10%' }} />
                        </View>
                    </TouchableOpacity>

                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        position: 'relative',
    },
    image: {
        position: "absolute",
        width: width,
        height: height,
        resizeMode: "cover",
    },
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: height * 0.5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgb(255, 255, 255)",
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
    },
    text: {
        fontSize: 18,
        textAlign: "center",
        padding: 10,
        fontFamily: 'Inter',
        color: '#676464',
    },
    textContainer: {
        padding: 20,
    },
    boldtext: {
        fontSize: 33,
        fontWeight: "bold",
        color: '#000',
        textAlign: "center",
    },
    button: {
        alignSelf: "center",
        backgroundColor: "#A7D129",
        borderRadius: 50,
        width: width * 0.8,
        alignItems: "center",
        justifyContent: "center",
    },
    buttontext: {
        color: "#fff",
        fontSize: 15,
        padding: 20,
        fontFamily: 'Inter',
        flex: 1,
        textAlign: 'center'
    },
    buttoncont: {
        display: "flex",
        flexDirection: "row",
    }
});

export default GetStarted;

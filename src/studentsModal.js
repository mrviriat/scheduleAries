import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Button, View, Dimensions, Animated, Easing, FlatList, Text, SafeAreaView, Pressable, TextInput } from 'react-native'
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import { FontAwesome } from '@expo/vector-icons';

export default function StudentsModal({ visible, options, duration, onClose, item, index, SetDescriptionForStudent }) {
    let [fontsLoaded] = useFonts({
        Inter_400Regular,
    });
    const { height } = Dimensions.get('screen');
    const startPointY = options?.from === 'top' ? -height : height;
    const transY = useRef(new Animated.Value(startPointY));

    useEffect(() => {
        if (visible) {
            startAnimation(0);
            setDescription(item.desc)
        } else {
            startAnimation(startPointY);
        }
    }, [visible]);

    const startAnimation = (toValue) => {
        Animated.timing(transY.current, {
            toValue,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
        }).start();
    }

    const onPress = () => {
        onClose();
    }

    const generateBackgroundOpacity = () => {
        if (startPointY >= 0) {
            return transY.current.interpolate({
                inputRange: [0, startPointY],
                outputRange: [0.8, 0],
                extrapolate: 'clamp'
            })
        } else {
            return transY.current.interpolate({
                inputRange: [startPointY, 0],
                outputRange: [0, 0.8],
                extrapolate: 'clamp'
            })
        }
    }

    const [Description, setDescription] = useState();
    const [Changeble, setChangeble] = useState("");
    return (
        <>
            <Animated.View pointerEvents='none' style={[styles.outerContainer, { opacity: generateBackgroundOpacity() }]} />
            <Animated.View style={[styles.container, { transform: [{ translateY: transY.current }] }]}>
                <View style={styles.innerContainer}>
                    <View style={{ flex: 3, borderBottomWidth: 1, borderColor: "grey", justifyContent: 'center', alignItems: 'center', }}>
                        <FontAwesome name="user-o" size={responsiveHeight(3.9)} color="black" />
                        <Text style={[styles.text, { alignSelf: 'flex-start', marginLeft: responsiveWidth(1), marginTop: responsiveHeight(3.9) }]}>Имя: {item.name}</Text>
                        <Text ellipsizeMode="head" numberOfLines={1} style={[styles.text, { alignSelf: 'flex-start', marginLeft: responsiveWidth(1) }]}>Причина: {!Description ? "..." : Description}</Text>
                    </View>
                    <View style={{ flex: 6, alignItems: 'center', }}>
                        <TextInput
                            style={{ marginTop: responsiveHeight(1), paddingLeft: responsiveWidth(1), backgroundColor: 'white', width: responsiveWidth(70.6), height: responsiveHeight(5), borderRadius: responsiveHeight(1.8), }}
                            placeholder="Можешь написать свою причину"
                            onChangeText={setChangeble}
                            onSubmitEditing=
                            {() => {
                                setDescription(Changeble);
                                SetDescriptionForStudent(Changeble, index);
                                setTimeout(onPress, 300)
                            }}
                        />
                        <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1) }}>
                            <Pressable onPress={() => {
                                setDescription("Неуважительная");
                                SetDescriptionForStudent("Неуважительная", index);
                                setTimeout(onPress, 300)
                            }}
                                style={{ borderRadius: responsiveHeight(1.8), height: responsiveHeight(5.9), width: responsiveWidth(25.64102564102564), backgroundColor: "#ff2a2a", justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={[styles.text, {color: "white"}]}>Неуваж.</Text>
                            </Pressable>
                            <Pressable onPress={() => {
                                setDescription("Уважительная (больничный лист)");
                                SetDescriptionForStudent("Уважительная (больничный лист)", index);
                                setTimeout(onPress, 300)
                            }}
                                style={{ borderRadius: responsiveHeight(1.8), marginLeft: responsiveWidth(1), height: responsiveHeight(5.9), width: responsiveWidth(43.58974358974359) , backgroundColor: "#5fd253", justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={[styles.text, {color: "white"}]}>Уваж. (справка)</Text>
                            </Pressable>
                        </View>

                        <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1) }}>
                            <Pressable onPress={() => {
                                setDescription("Уважительная (военная кафедра)")
                                SetDescriptionForStudent("Уважительная (военная кафедра)", index);
                                setTimeout(onPress, 300)
                            }}
                                style={{ borderRadius: responsiveHeight(1.8), height: responsiveHeight(5.9), width: responsiveWidth(41.02564102564103), backgroundColor: "#4996ff", justifyContent: 'center', alignItems: 'center', }}>
                                <Text style={[styles.text, {color: "white"}]}>Военн. каф.</Text>
                            </Pressable>
                            <Pressable onPress={() => {
                                setDescription("Уважительная (индивидуальный график)")
                                SetDescriptionForStudent("Уважительная (индивидуальный график)", index);
                                setTimeout(onPress, 300)
                            }} style={{ borderRadius: responsiveHeight(1.8), marginLeft: responsiveWidth(1), height: responsiveHeight(5.9), width: responsiveWidth(28.20512820512821), backgroundColor: "#4996ff", justifyContent: 'center', alignItems: 'center', }}>
                                <Text style={[styles.text, {color: "white"}]}>Инд. гр.</Text>
                            </Pressable>
                        </View>
                        <Pressable onPress={() => {
                            setDescription("Уважительная (заявление на имя декана)")
                            SetDescriptionForStudent("Уважительная (заявление на имя декана)", index);
                            setTimeout(onPress, 300)
                        }} style={{ borderRadius: responsiveHeight(1.8), marginTop: responsiveHeight(1), height: responsiveHeight(5.9), width: responsiveWidth(69.23076923076923) + responsiveWidth(1), backgroundColor: "#5fd253", justifyContent: 'center', alignItems: 'center', }}>
                            <Text style={[styles.text, {color: "white"}]}>Уваж. (заявл. декану)</Text>
                        </Pressable>
                    </View>
                </View>
            </Animated.View>
        </>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2b4369'
    },
    container: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    innerContainer: {
        width: '80%',
        height: responsiveHeight(50),
        backgroundColor: '#D9D9D9',
        borderRadius: responsiveHeight(1.8)
    },
    input: {
        width: 300,
        height: 50,
        borderRadius: 5,
        borderColor: 'grey',
        borderWidth: 1,
        padding: 10,
        marginVertical: 1,
        backgroundColor: '#ffffff90'
    },
    text: {
        fontFamily: 'Inter_400Regular',
        fontSize: responsiveFontSize(2.67)
    },
})
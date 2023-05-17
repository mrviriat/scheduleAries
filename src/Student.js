import { useState, useRef } from 'react';
import { StyleSheet, Dimensions, Text, View, TextInput, FlatList, TouchableOpacity, Platform, StatusBar, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import { useDispatch, useSelector } from "react-redux";

import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    PanGestureHandlerProps,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

const LIST_ITEM_HEIGHT = 70;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRANSLATE_X_THRESHOLD = SCREEN_WIDTH * 0.2;

export default function Student({
    item,
    index,
    studentsList,
    handlePress,
    handleLongPress,
    onDismiss
}) {
    const translateX = useSharedValue(0);
    const panGesture = useAnimatedGestureHandler({
        onActive: (event) => {
            translateX.value = event.translationX;
        },
        onEnd: () => {
            const shouldBeTwo = translateX.value < -TRANSLATE_X_THRESHOLD;
            const shouldBeOne = translateX.value > TRANSLATE_X_THRESHOLD;
            if (shouldBeTwo) {
                runOnJS(onDismiss)(index, 2);
            } else if (shouldBeOne) {
                runOnJS(onDismiss)(index, 1);
            }
            translateX.value = withTiming(0);
        },
    });

    const rStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: translateX.value,
            },
        ],
    }));

    const rIconLeftContainerStyle = useAnimatedStyle(() => {
        const opacity = withTiming(
            translateX.value > TRANSLATE_X_THRESHOLD ? 1 : 0
        );
        return { opacity };
    });

    const rIconRightContainerStyle = useAnimatedStyle(() => {
        const opacity = withTiming(
            translateX.value < -TRANSLATE_X_THRESHOLD ? 1 : 0
        );
        return { opacity };
    });

    return (
        <View style={styles.studentContainer}>
            <Animated.View style={[
                styles.iconContainerLeft,
                rIconLeftContainerStyle,
                { marginTop: index == 0 ? responsiveHeight(1.5) : 0 }
            ]}>
                <MaterialIcons
                    name="looks-one"
                    size={responsiveHeight(7.109) * 0.6}
                    color="black"
                />
            </Animated.View>
            <Animated.View style={[
                styles.iconContainerRight,
                rIconRightContainerStyle,
                { marginTop: index == 0 ? responsiveHeight(1.5) : 0 }
            ]}>
                <MaterialIcons
                    name="looks-two"
                    size={responsiveHeight(7.109) * 0.6}
                    color="black"
                />
            </Animated.View>
            <Animated.View style={rStyle}>
                <TouchableOpacity style={[
                    styles.item,
                    {
                        borderBottomWidth: index != studentsList.length - 1 ? responsiveHeight(0.1185) : 0,
                        borderColor: 'black',
                        borderBottomLeftRadius: index == studentsList.length - 1 ? responsiveHeight(0.5924) : 0,
                        borderBottomRightRadius: index == studentsList.length - 1 ? responsiveHeight(0.5924) : 0,
                        borderTopLeftRadius: index == 0 ? responsiveHeight(0.5924) : 0,
                        borderTopRightRadius: index == 0 ? responsiveHeight(0.5924) : 0,
                        marginBottom: index == studentsList.length - 1 ? responsiveHeight(1.5) : 0,
                        marginTop: index == 0 ? responsiveHeight(1.5) : 0,
                    }
                ]
                }
                    onPress={() => handlePress(item, index)}
                    delayLongPress={500}
                    onLongPress={() => handleLongPress(index)}
                >
                    <Text style={styles.text}>{index + 1}. </Text>
                    <Text style={styles.text}>{item.name} </Text>
                    <Text style={[styles.text, styles.flag]}>{item.flag} </Text>
                    <PanGestureHandler onGestureEvent={panGesture}>
                        <Animated.View style={styles.leftTouch} />
                    </PanGestureHandler>
                    <PanGestureHandler onGestureEvent={panGesture}>
                        <Animated.View style={styles.rightTouch} />
                    </PanGestureHandler>
                </TouchableOpacity>
            </Animated.View >
        </View>
    );
};

const styles = StyleSheet.create({
    studentContainer: {
        width: '100%',
        alignItems: 'center',
    },
    text: {
        fontFamily: 'Inter_400Regular',
        fontSize: responsiveFontSize(2.67),
    },
    flag: {
        position: 'absolute',
        right: '5%',
      },
    item: {
        width: responsiveWidth(92.308), //360
        height: responsiveHeight(7.109), //60
        backgroundColor: '#D9D9D9',
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: responsiveWidth(5.55), //20
    },
    leftTouch: {
        height: responsiveHeight(7.109),
        width: responsiveHeight(10),
        position: 'absolute',
        left: '0%',
        // backgroundColor: 'red'
    },
    rightTouch: {
        height: responsiveHeight(7.109),
        width: responsiveHeight(10),
        position: 'absolute',
        right: '0%',
        // backgroundColor: 'red'
    },
    iconContainerRight: {
        height: responsiveHeight(7.109),
        width: responsiveHeight(7.109),
        // backgroundColor: 'red',
        position: 'absolute',
        right: '5%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerLeft: {
        height: responsiveHeight(7.109),
        width: responsiveHeight(7.109),
        // backgroundColor: 'red',
        position: 'absolute',
        left: '5%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
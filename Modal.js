import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Button, View, Dimensions, Animated, Easing, FlatList, Text, SafeAreaView, Pressable, TextInput } from 'react-native'
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';


export default function Modal({ visible, options, duration, onClose, students, selectedLesson, extra, funcfromschudle, SetDescriptionForStudent }) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });
  const { height } = Dimensions.get('screen');
  const startPointY = options?.from === 'top' ? -height : height;
  const transY = useRef(new Animated.Value(startPointY));

  useEffect(() => {
    if (visible) {
      startAnimation(0);
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

  return (
    <>
      <Animated.View pointerEvents='none' style={[styles.outerContainer, { opacity: generateBackgroundOpacity() }]} />
      <Animated.View style={[styles.container, { transform: [{ translateY: transY.current }] }]}>
        <View style={styles.innerContainer}>
          <Button title='Close Modal' onPress={onPress} />
          <KeyboardAwareFlatList
            data={students}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              item.isHere == true ?
                <Pressable onPress={() => funcfromschudle(false, selectedLesson, index)}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 20, textAlign: "center", }}>{index + 1}. {item.name}</Text>
                </Pressable>
                :
                <Pressable style={{ backgroundColor: '#D9D9D9', alignItems: 'center' }} onPress={() => { funcfromschudle(true, selectedLesson, index); SetDescriptionForStudent("", selectedLesson, index) }}>
                  <Text style={{ color: '#727272', textDecorationLine: 'line-through', fontFamily: 'Inter_400Regular', fontSize: 20, textAlign: "center", }}>{index + 1}. {item.name}</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => SetDescriptionForStudent(text, selectedLesson, index)}
                    value={item.desc}

                  />
                </Pressable>
            )}
            extraData={extra}
          />
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
    backgroundColor: '#2b4369',
  },
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  innerContainer: {

    width: '100%',
    height: '80%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  input: {
    width: 300,
    height: 50,
    borderRadius: 5,
    borderColor: 'grey',
    borderWidth: 1,
    padding: 10,
    marginVertical: 1,
    backgroundColor: '#ffffff90',
    // marginBottom: 20
  },
})
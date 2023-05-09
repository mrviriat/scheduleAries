import React from 'react';
import ScheduleScreen from './ScheduleScreen';
import GroupScreen from './GroupScreen';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';

const StackA = createSharedElementStackNavigator();
const StackB = createSharedElementStackNavigator();

const StackScreenA = () => (
  <StackA.Navigator>
    <StackA.Screen
      name="A"
      component={ScheduleScreen}
      options={{ headerShown: false }}
    />
  </StackA.Navigator>
);

const StackScreenB = () => (
  <StackB.Navigator>
    <StackB.Screen
      name="B"
      component={GroupScreen}
      options={{ headerShown: false }}
    />
  </StackB.Navigator>
);

export { StackScreenA, StackScreenB } 
import React from 'react';
import Schedule_screen from './schedule_screen';
import StudentsList_screen from './studentsList_screen';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';

const StackA = createSharedElementStackNavigator();
const StackB = createSharedElementStackNavigator();

const StackScreenA = () => (
  <StackA.Navigator>
    <StackA.Screen
      name="A"
      component={Schedule_screen}
      options={{ headerShown: false }}
    />
  </StackA.Navigator>
);

const StackScreenB = () => (
  <StackB.Navigator>
    <StackB.Screen
      name="B"
      component={StudentsList_screen}
      options={{ headerShown: false }}
    />
  </StackB.Navigator>
);

export { StackScreenA, StackScreenB } 
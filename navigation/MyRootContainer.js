import React from 'react';
import { Platform } from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import { createStackNavigator, createAppContainer, createBottomTabNavigator, StackNavigator} from 'react-navigation';
import TabBarIcon from '../components/TabBarIcon';

import HomeScreen from '../screens/HomeScreen';
import FoodListScreen from '../screens/FoodListScreen'
import DetailScreen from '../screens/DetailScreen';
import PaymentScreen from '../screens/PaymentScreen'

import FoodCategoryScreen from '../screens/FoodMainScreen';
import MyInfoScreen from '../screens/MyInfoScreen';

const FoodStack = createStackNavigator({
    Food: HomeScreen,
    // FoodList: FoodListScreen
});
FoodStack.navigationOptions = {
    tabBarLabel: 'Home',
    tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-information-circle${focused ? '' : '-outline'}` : 'md-information-circle'}
    />
  ),
};

const MyInfoStack = createStackNavigator({
    MyInfo: MyInfoScreen
});
MyInfoStack.navigationOptions = {
    tabBarLabel: 'MyInfo',
    tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

const MyBottomTabs = createBottomTabNavigator({
    Home: FoodStack,
    MyInfo: MyInfoStack
});

const DetailStack = createStackNavigator({
    Detail: DetailScreen,
    Payment: PaymentScreen,
});

const MyRootStack = createStackNavigator({
    Home: {
        screen: MyBottomTabs,
        navigationOptions: {
            header: null
        },
    },
    Detail: {
        screen: DetailStack,
        navigationOptions: {
            header: null
        },
    },
});

export default createAppContainer(MyRootStack)

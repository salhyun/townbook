import React from 'react';
import { StyleSheet, Text, View, Image, Button, Dimensions, TouchableOpacity } from 'react-native';
import { createStackNavigator, createMaterialTopTabNavigator, createAppContainer} from 'react-navigation';
import Colors from '../constants/Colors'
import FCChineseScreen from '../screens/foodcategory/FCChineseScreen';
import FCChickenScreen from '../screens/foodcategory/FCChickenScreen';
import FCKoreanScreen from '../screens/foodcategory/FCKoreanScreen';
import FCPizzaScreen from '../screens/foodcategory/FCPizzaScreen';
import FCJapaneseScreen from '../screens/foodcategory/FCJapaneseScreen';
import FCEntiretyScreen from '../screens/foodcategory/FCEntiretyScreen';
import FCSingleScreen from '../screens/foodcategory/FCSingleScreen';
import FCFlourScreen from '../screens/foodcategory/FCFlourScreen';
import FCPigJBScreen from '../screens/foodcategory/FCPigJBScreen';

const TopTabStack = createMaterialTopTabNavigator(
    {
        Eniterty: FCEntiretyScreen,
        Single: FCSingleScreen,
        Korean: FCKoreanScreen,
        Flour: FCFlourScreen,
        Japanese: FCJapaneseScreen,
        Chinese: FCChineseScreen,
        Chicken: FCChickenScreen,
        Pizza: FCPizzaScreen,
        PigJB: FCPigJBScreen
    },
    {
        tabBarPosition: 'top',
        swipeEnabled: true,
        animationEnabled: true,
        tabBarOptions: {
            scrollEnabled: true,
            activeTintColor: Colors.tabIconSelected,
            inactiveTintColor: Colors.tabIconDefault,
            style: {
                backgroundColor: '#fff'
            },
            tabStyle: {
                padding: 3,
                width: Dimensions.get('window').width/4
            },
            labelStyle: {
                textAlign: 'center',
            },
            indicatorStyle: {
                borderBottomColor: Colors.tintColor,
                borderBottomWidth: 2,
            }
        }
    }
);
const FCStack = createStackNavigator({
    FoodMenu: {
        screen: TopTabStack,
        navigationOptions: {
            header: null
        },
    }
});

export default createAppContainer(FCStack);

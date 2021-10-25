import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import TabBarIcon from '../components/TabBarIcon';
import FoodMainScreen from '../screens/FoodMainScreen';
import MyInfoScreen from '../screens/MyInfoScreen';
import FoodListScreen from '../screens/FoodListScreen';
import FoodListNavigator from './FoodListNavigator';
import MyOrderScreen from '../screens/MyOrderScreen';
import SerachScreen from '../screens/SearchScreen';
import SearchHeader from '../screens/SearchHeader';
import ModifyMyInfoScreen from '../screens/ModifyMyInfoScreen';
import ModifyInfoItemScreen from '../screens/ModifyInfoItemScreen';

const FoodStack = createStackNavigator({
    FoodMain: FoodMainScreen,
    // FoodMenu: FoodListScreen,
    FoodMenu: {
      screen: FoodListNavigator,
      navigationOptions: {
        title: '푸드리스트',
        headerStyle: {
          elevation: 0//remove header shadow in android
        }
      }
    }
});
FoodStack.navigationOptions = {
    tabBarLabel: '홈',
    tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-home' : 'md-home'}
      // name={Platform.OS === 'ios' ? `ios-information-circle${focused ? '' : '-outline'}` : 'md-information-circle'}
    />
  ),
};

const SearchStack = createStackNavigator({
  Search: {
    screen: SerachScreen,
    // navigationOptions: ({navigation, screenProps}) => {
    //   return {
    //     header: <SearchHeader {...navigation} {...screenProps}/>,
    //   }
    // }
  }
});
SearchStack.navigationOptions = {
  tabBarLabel: '검색',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'}
    />
  ),
}

const MyOrderStack = createStackNavigator({
  MyOrder: MyOrderScreen
});
MyOrderStack.navigationOptions = {
  tabBarLabel: '내 주문',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-list' : 'md-list'}
    />
  ),
}

const MyInfoStack = createStackNavigator({
    MyInfo: MyInfoScreen,
    ModifyMyInfo: {
      screen: ModifyMyInfoScreen,
      navigationOptions: {
        title: '내정보 수정'
      }
    },
    ModifyInfoItem: {
      screen:  ModifyInfoItemScreen,
      // navigationOptions: {
      //   title: '닉네임 수정'
      // }
    }
});
MyInfoStack.navigationOptions = {
  tabBarLabel: '내 정보',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      // name={'info'}
      name={Platform.OS === 'ios' ? `ios-information-circle${focused ? '' : '-outline'}` : 'md-information-circle'}
    />
  ),
};

export default createBottomTabNavigator({
    Home: FoodStack,
    Search: SearchStack,
    MyOrder: MyOrderStack,
    MyInfo: MyInfoStack
});

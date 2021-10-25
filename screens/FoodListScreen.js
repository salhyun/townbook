import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from "react-native-underline-tabbar";
import Colors from '../constants/Colors';

const Page = ({label}) => {
  return (
    <View>
      <Text>{label}</Text>
    </View>
  )
}

export default class FoodListScreen extends React.Component {
    static navigationOptions = {
        title: 'List'
    };
    render() {
        return(
          <View style={{flex: 1}}>
          <ScrollableTabView
            initialPage={3}
            tabBarActiveTextColor={Colors.tintColor}
            renderTabBar={() => <TabBar underlineColor={Colors.tintColor} tabMargin={20} tabBarStyle={{}}/>}>
            <Page tabLabel={{label: "    전 체    "}} label="Page #1"/>
            <Page tabLabel={{label: "    1 인분    "}} label="Page #2"/>
            <Page tabLabel={{label: "    한 식    "}} label="Page #3"/>
            <Page tabLabel={{label: "    분 식    "}} label="Page #4"/>
            <Page tabLabel={{label: "    일 식    "}} label="Page #5"/>
            <Page tabLabel={{label: "    중 식    "}} label="Page #6"/>
            <Page tabLabel={{label: "    치 킨    "}} label="Page #7"/>
            <Page tabLabel={{label: "    피 자    "}} label="Page #8"/>
            <Page tabLabel={{label: "    족발/보쌈    "}} label="Page #9"/>
          </ScrollableTabView>
          </View>
            // <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            // <Text>FoodListScreen</Text>
            // <Button title='go to Detail' onPress={() => this.props.navigation.navigate('Detail')}/>
            // </View>
        );
    }
}

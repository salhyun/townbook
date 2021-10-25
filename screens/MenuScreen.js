import React from 'react';
import { StyleSheet, Text, View, WebView, Button } from 'react-native';

export default class MenuScreen extends React.Component {
  static navigationOptions = {
    title: 'MyInfo'
  };
  render() {
    return(
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>MenuScreen</Text>
      </View>
    );
  }
}

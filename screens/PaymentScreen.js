import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class MyInfoScreen extends React.Component {
  static navigationOptions = {
    title: 'payment'
  };
  render() {
    return(
      <View style={{flex: 1}}>
      <Text>Payment</Text>
      </View>
    );
  }
}

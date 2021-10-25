import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home'
  };
  render() {
    return(
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>HomeScreen</Text>
        <Button title='go to Detail' onPress={() => this.props.navigation.navigate('Detail')}/>
      </View>
    );
  }
}

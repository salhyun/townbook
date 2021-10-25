import React from 'react';
import { Text, View } from 'react-native';

export default class FCPizzaScreen extends React.Component {
    static navigationOptions = {
        title: '피자'
    };
    constructor(props) {
      super(props);
    }
    componentDidMount() {
      console.log('componentDidMount FCPizzaScreen');
    }
    render() {
        return(
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>FCPizzaScreen</Text>
            </View>
        );
    }
}

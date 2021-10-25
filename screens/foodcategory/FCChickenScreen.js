import React from 'react';
import { Text, View } from 'react-native';

export default class FCChickenScreen extends React.Component {
    static navigationOptions = {
        title: '치킨'
    };
    constructor(props) {
      super(props);
    }
    componentDidMount() {
      console.log('componentDidMount FCChickenScreen');
    }
    render() {
        return(
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>FCChickenScreen</Text>
            </View>
        );
    }
}

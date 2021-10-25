import React from 'react';
import { Text, View } from 'react-native';

export default class FCPigJBScreen extends React.Component {
    static navigationOptions = {
        title: '족발/보쌈'
    };
    constructor(props) {
      super(props);
    }
    componentDidMount() {
      console.log('componentDidMount FCPigJBScreen');
    }
    render() {
        return(
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>FCPigJBScreen</Text>
            </View>
        );
    }
}

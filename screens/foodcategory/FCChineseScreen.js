import React from 'react';
import { Text, View } from 'react-native';

export default class FCChineseScreen extends React.Component {
    static navigationOptions = {
        title: '중국집'
    };
    constructor(props) {
      super(props);
    }
    componentDidMount() {
      console.log('componentDidMount FCChineseScreen');
    }
    render() {
        return(
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>FCChineseScreen</Text>
            </View>
        );
    }
}
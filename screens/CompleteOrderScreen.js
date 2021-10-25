import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/firestore';

export default class MyInfoScreen extends React.Component {
  static navigationOptions = {
    title: '주문 완료'
  };
  constructor(props) {
    super(props);

    this.state = {
      loadingOrder: false
    }
  }
  componentDidMount() {
    const orderId = this.props.navigation.getParam('orderId', undefined);
    console.log('orderId = ', orderId);
    if(orderId !== undefined) {
      this.orderId = orderId;
      this.props.navigation.setParams({orderId: undefined});
    }
  }
  myOrderDetail = () => {
    if(this.orderId !== undefined && typeof this.orderId === 'string') {
      this.setState({loadingOrder: true});
      firebase.firestore().collection('orders').doc(this.orderId).get().then(doc => {
        if(doc.exists) {
          this.setState({loadingOrder: false}, () => {
            this.props.navigation.navigate('MyOrderDetail', {order: doc.data()});
          })
        }
      })
    } else {
      console.log('orderId is not string ', this.orderId);
    }
  }
  render() {
    return(
      <View style={{flex: 1}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 20, color: '#424242'}}>주문이 정상적으로 처리되었습니다</Text>
          <Button type='clear' title='주문상세' onPress={this.myOrderDetail} loading={this.state.loadingOrder} disabled={this.state.loadingOrder}/>
        </View>
      </View>
    );
  }
}

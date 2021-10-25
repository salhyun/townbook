import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import update from 'react-addons-update';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Colors from '../constants/Colors'
import MyStyles from '../constants/MyStyles'
import MyUtils from '../utilities/MyUtils'
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class MyOrderDetailScreen extends React.Component {
  static navigationOptions = {
    title: '주문상세'
  };
  constructor(props) {
    super(props);

    this.state = {
      loadingOrder: true,
      order: {}
    }
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        const sentReview = this.props.navigation.getParam('sentReview', undefined);
        if(sentReview !== undefined) {
          this.setState({order: update(this.state.order, {sentReview: {$set: sentReview}})})
          this.props.navigation.setParams({sentReview: undefined});
        }
      }
    )
  }
  componentDidMount() {
    let order = this.props.navigation.getParam('order', undefined);
    if(order !== undefined) {
      firebase.firestore().collection('orders').doc(order.id).get().then(doc => {
        if(doc.exists) {
          order = {id: doc.id, ...doc.data()};
          let totalCount = 0;
          order.basket.forEach(item => {
            totalCount += item.amount;
            let menuPrice = item.menu.price;
            item.options.forEach(option => {
              menuPrice += option.price;
            })
            item.totalPrice = menuPrice * item.amount;
          });
          order.totalCount = totalCount;
          console.log('order =', order)
          this.setState({order: order, loadingOrder: false});
        }
      })
      this.props.navigation.setParams('order', undefined);
    }
  }
  onPressWritingReview = () => {
    this.props.navigation.navigate('WriteReview', {prevRouteName: this.props.navigation.state.routeName, order: this.state.order});
  }

  render() {
    const order = this.state.order;
    let orderSummary = '';
    if(MyUtils.isAvailable(order)) {
      orderSummary = order.basket[0].menu.name;
      if(order.basket.length > 1) {
        orderSummary += ' 외 ' + order.totalCount + '개';
      } else {
        if(order.totalCount > 0) {orderSummary += order.totalCount + '개';}
      }
    }
    const ListView = props => {
      const { title, contents } = props;
      return (
        <View style={{...MyStyles.divider}}>
          <View style={{marginVertical: 10, marginHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{...styles.body, flex: 3, fontSize: 20}}>{title}</Text>
            <Text style={{...styles.body, flex: 7, fontSize: 20}}>{contents}</Text>
          </View>
        </View>
      )
    }
    return(
      <View style={{flex: 1}}>
      {
        this.state.loadingOrder ? <ActivityIndicator style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} size='large' />
        :
        <ScrollView>
          <View style={{marginVertical: 20, marginHorizontal: 20}}>
            <Text style={{fontSize: 26, fontWeight: '500', color: '#585858'}}>{order.storeName}</Text>
            <View style={{flexDirection: 'row', marginTop: 10}}>
              <Text style={{flex: 7, ...styles.summary}}>{orderSummary}</Text>
              <Text style={{flex: 3, ...styles.summary}}>{MyUtils.toLocaleString(order.totalPrice)}원</Text>
            </View>
            <Text style={{...styles.body, marginTop: 7}}>주문일시: {MyUtils.getDateStringKr(order.date.toDate(), true)}</Text>
          </View>
          <View style={{borderBottomWidth: 10, borderBottomColor: '#D8D8D8'}} />
          {
            order.basket.map((basketItem, basketIndex) => {
              return (
                <View key={basketIndex} style={{marginHorizontal: 10, marginTop: 10, ...MyStyles.divider}}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{...styles.body, fontSize: 20}}>{basketItem.menu.name} {basketItem.amount}개</Text>
                    <Text style={{...styles.body, fontSize: 20}}>{MyUtils.toLocaleString(basketItem.totalPrice)}원</Text>
                  </View>
                  <View style={{marginTop: 5, marginBottom: 10}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10}}>
                      <Text style={{...styles.body}}>{basketItem.menu.name}</Text>
                      <Text style={{...styles.body, marginLeft: 10}}>{MyUtils.toLocaleString(basketItem.menu.price)}원</Text>
                    </View>
                  {
                    basketItem.options.map((option, optionIndex) => {
                      return (
                        <View key={optionIndex} style={{marginLeft: 10, marginTop: 2}}>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={{...styles.body}}>{option.name}</Text>
                            <Text style={{...styles.body, marginLeft: 10}}>{MyUtils.toLocaleString(option.price)}원</Text>
                          </View>
                        </View>
                      )
                    })
                  }
                  </View>
                </View>
              )
            })
          }
          <View style={{borderBottomWidth: 10, borderBottomColor: '#D8D8D8'}} />
          <ListView title='주문금액' contents={MyUtils.toLocaleString(order.totalPrice) + '원'} />
          <ListView title='결재금액' contents={MyUtils.toLocaleString(order.totalPrice) + '원'} />
          <ListView title='결재수단' contents={order.paymentMethod} />
          <View style={{borderBottomWidth: 10, borderBottomColor: '#D8D8D8'}} />
          <ListView title='주소' contents={order.address} />
          <ListView title='전화번호' contents={order.address} />
          {
            this.state.order.sentReview ?
            <View style={{marginTop: 20}}>
              <Text style={{fontSize: 24, color: 'dimgray', textAlign: 'center'}}>리뷰완료</Text>
            </View>
            :
            <TouchableOpacity style={{marginTop: 20}} onPress={this.onPressWritingReview}>
              <Text style={{fontSize: 24, color: Colors.tintColor, textAlign: 'center'}}>리뷰쓰기</Text>
            </TouchableOpacity>
          }
        </ScrollView>
      }
      </View>
    );
  }
}
const styles = StyleSheet.create({
  summary: {
    fontSize: 24,
    fontWeight: '500',
    color: '#585858'
  },
  body: {
    fontSize: 16,
    color: '#585858'
  }
});
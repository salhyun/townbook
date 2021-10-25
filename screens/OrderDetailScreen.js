import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Dimensions, Platform, TouchableOpacity, AsyncStorage, ActivityIndicator, Keyboard, Animated, UIManager, findNodeHandle } from 'react-native';
import { ListItem, Divider, Button, Input } from 'react-native-elements';
import * as Icon from '@expo/vector-icons'
import Layout from '../constants/Layout';
import update from 'react-addons-update';
import Colors from '../constants/Colors';
import MyStyles from '../constants/MyStyles'
import * as firebase from 'firebase';
import 'firebase/firestore';
import MyUtils from '../utilities/MyUtils';
import MyImage from '../utilities/MyImage';
import { StackActions } from 'react-navigation';

export default class OrderDetailScreen extends React.Component {
  static navigationOptions = {
    title: '주문 상세'
  };
  constructor(props) {
    super(props);

    this.scrollOffsetY = 0;
    this.state = {
      loadingOrder: true,
      paymentMethod: '',
      user: {},
      order: {},
      keyboardHeight: new Animated.Value(0)
    }
    this.currentUser = firebase.auth().currentUser;
  }
  keyboardShow = (event) => {
    if(this.props.navigation.isFocused()) {//아직 뒤에서 돌고 있는 Screen이 메시지를 받기 때문에 막아줘야함.
      console.log('keyboardWillShow In MyStoreScreen');
      const keyboardHeight = event.endCoordinates.height;
      console.log('keyboardHeight = ' + keyboardHeight);

      UIManager.measure(findNodeHandle(this.scrollview), (x, y, widht, height) => {
        console.log('scrollOffsetY = ' + this.scrollOffsetY);
        console.log('scrollview height = ' + height);
        console.log(this.focusedInput);

        let keyboardTopOffsetY = height - keyboardHeight;
        if((this.focusedInput.y+this.focusedInput.height) > keyboardTopOffsetY) {
          console.log('keyboard covered focusedInput');
          Animated.timing(this.state.keyboardHeight, {toValue: keyboardHeight, duration: 0, delay: 0}).start();
          setTimeout(() => {
            this.scrollview.scrollTo({y: (this.focusedInput.y+this.focusedInput.height) - keyboardTopOffsetY, animated: true})
          }, 100);
        }
      })
    }
  }
  keyboardHide = () => {
    console.log('keyboardWillHide');
    if(this.props.navigation.isFocused()) {//아직 뒤에서 돌고 있는 Screen이 메시지를 받기 때문에 막아줘야함.
      Animated.timing(this.state.keyboardHeight, {toValue: 0, duration: 250, delay: 0}).start();
    }
  }

  componentDidMount() {
    this.keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',//안드로이드 keyboardWillShow 지원안함.
      this.keyboardShow,
    );
    this.keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',//안드로이드 keyboardWillHide 지원안함.
      this.keyboardHide,
    );
    firebase.firestore().collection('users').doc(this.currentUser.uid).get().then(doc => {
      if(doc.exists) {
        this.setState({user: doc.data()}, () => {
          const basket = this.props.navigation.getParam('basket', undefined);
          if(basket !== undefined) {
            console.log('basket =', basket);
            const order = this.createOrder(basket);
            this.setState({order: order}, () => {
              this.setState({loadingOrder: false});
              console.log('order =', order);
            });
          }
        })
      }
    })
    try {
      AsyncStorage.getItem('detailStoreInfo', (err, result) => {
        this.storeInfo = JSON.parse(result);
      })
    } catch(error) {
      alert('AsyncStorage error =', error);
    }
  }
  componentWillUnmount() {
    this.keyboardShowListener.remove();
    this.keyboardHideListener.remove();
  }
  calculateBasketPrice = (basket) => {
    let totalPrice = 0;
    if(Array.isArray(basket)) {
      basket.forEach(item => {
        let itemPrice = item.menu.price;
        item.options.forEach(option => {
          itemPrice += option.price;
        })
        totalPrice += (itemPrice *= item.amount);
      })
    } else {
      let price = basket.menu.price;
      basket.options.forEach(option => {
        price += option.price;
      })
      totalPrice += (price *= basket.amount);
    }
    return totalPrice;
  }
  createOrder = (basket) => {
    const totalPrice = this.calculateBasketPrice(basket);
    console.log('totalPrice =', totalPrice)
    return {
      basket: basket,
      totalPrice: totalPrice,
      address: '',
      from: this.currentUser.uid,
      to: basket[0].storeId,
      storeName: this.storeInfo.name,
      date: new Date(),
      memo: '대충해서 보내지 마라',
      paymentMethod: '',
      orderNumber: '',
      sentRating: false,
      sentReview: false,
      status: 1
    };
  }
  onPressPaymentMethod = (paymentMethod) => {
    console.log('paymentMethod =', paymentMethod);
    this.setState({paymentMethod: paymentMethod});
  }
  onPressTestPayment = () => {
    const orderId = '1PlDUdwxRZqOK5D2gCAv';
    this.props.navigation.dispatch(StackActions.popToTop());
    this.props.navigation.navigate('CompleteOrder', {orderId: orderId});
  }
  onPressPayment =() => {
    console.log('press Payment 결재방법에 따라서 시나리오 달라짐 paymentMethod =', this.state.paymentMethod);
    const paymentMethod = this.state.paymentMethod;
    if(paymentMethod.length > 0) {
      const user = this.state.user;
      this.setState({order: update(this.state.order, {address: {$set: this.state.user.address}, paymentMethod: {$set: paymentMethod}})}, () => {
        console.log('order =', this.state.order);
        firebase.firestore().collection('orders').add(this.state.order).then(docRef => {
          console.log('document written successfully docId =', docRef.id);
          firebase.firestore().collection('orders').doc(docRef.id).update({orderNumber: docRef.id}).then(() => {
            this.sendNotification(docRef.id);
            this.props.navigation.navigate('CompleteOrder', {orderId: docRef.id});
          }).catch(error => {
            console.error('error update document:', error);
          })
        }).catch(error => {
          console.error('error adding document:', error);
        })
      })

    } else {
      alert('결재방법을 선택해 주세요');
    }
  }
  sendNotification = (docId) => {
    const basketCount = this.state.order.basket.length > 1 ? '외 ' + this.state.order.basket.length + '개 주문' : '';
    let message = [{
      'to': this.storeInfo.expoToken,
      'sound': 'default',
      'title': '타운북 주문',
      'body': this.state.order.basket[0].menu.name + basketCount + '합계: ' + MyUtils.toLocaleString(this.state.order.totalPrice) + '원',
      'data': {docId: docId}
    }];
    console.log('sendNotification message = ', message);
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })
  }

  render() {
    const mainFontSize = 20, subFontSize = 18, extraFontSize=15;
    const OutlineTouchView = (props) => {
      const {text, enableColor, disableColor} = props;
      return (
        <TouchableOpacity style={{flex: 1, marginHorizontal: 10}} activeOpacity={0.75} onPress={this.onPressPaymentMethod.bind(this, text)}>
          <Text style={{...styles.outlineText, color: this.state.paymentMethod === text ? enableColor : disableColor, borderColor: this.state.paymentMethod === text ? enableColor : disableColor}}>{text}</Text>
        </TouchableOpacity>
      )
    }
    return(
      <View style={{flex: 1}}>
      {
        this.state.loadingOrder ? <ActivityIndicator size='large' />
        :
        <ScrollView ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
          <View>
            <View style={{...MyStyles.divider, flexDirection: 'row', justifyContent: 'space-between', marginTop: 20}}>
              <Text style={{fontSize: 26, fontWeight: '500', paddingHorizontal: 20}}>주문자 정보</Text>
              <Button type='clear' title='주소변경' />
            </View>
            <View style={{marginHorizontal: 20}}>
              <Text style={{fontSize: 20}}>{this.state.user.address}</Text>
            </View>
            <View style={{marginHorizontal: 10, marginTop: 20}} onLayout={event => this.layoutOrderMemo = event.nativeEvent.layout}>
            <Input label='요청사항' labelStyle={{fontSize: 20, fontWeight: '600', color: 'black'}} inputStyle={{fontSize: 20}} onChangeText={(text) => {this.setState({order: update(this.state.order, {memo: {$set: text}})})}} value={this.state.order.memo} clearButtonMode='while-editing' onFocus={() => this.focusedInput = this.layoutOrderMemo} placeholder='요청사항을 입력하세요'/>
            </View>
          </View>
          <View>
            <View style={{...MyStyles.divider, flexDirection: 'row', justifyContent: 'space-between', marginTop: 30}}>
              <Text style={{fontSize: 26, fontWeight: '500', paddingHorizontal: 20}}>결제 수단</Text>
            </View>
            <View style={{marginHorizontal: 20}}>
              <View style={{flexDirection: 'row', marginTop: 10}}>
                <OutlineTouchView text='신용카드' enableColor='tomato' disableColor='dimgray' />
                <OutlineTouchView text='휴대전화' enableColor='tomato' disableColor='dimgray' />
              </View>
              <View style={{flexDirection: 'row', marginTop: 10}}>
                <OutlineTouchView text='카카오페이' enableColor='tomato' disableColor='dimgray' />
                <OutlineTouchView text='네이버페이' enableColor='tomato' disableColor='dimgray' />
              </View>
            </View>
          </View>
          <View>
            <View style={{...MyStyles.divider, flexDirection: 'row', justifyContent: 'space-between', marginTop: 30}}>
              <Text style={{fontSize: 26, fontWeight: '500', paddingHorizontal: 20}}>주문 내역</Text>
            </View>
            <View style={{marginHorizontal: 20, marginTop: 20}}>
            {
              this.state.order.basket.map((basket, index) => {
                return (
                  <View key={index}>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                      <Text style={{flex: 8, textAlign: 'left', fontWeight: 'bold', fontSize: mainFontSize}}>{basket.menu.name}</Text>
                      <Text style={{flex: 2, textAlign: 'right', alignSelf: 'flex-end', fontSize: subFontSize}}>{basket.amount}개</Text>
                      <Text style={{flex: 6, textAlign: 'right', fontWeight: 'bold', color: 'tomato', fontSize: mainFontSize}}>{MyUtils.toLocaleString(basket.menu.price)}원</Text>
                    </View>
                    {
                      basket.options.map((option, optionIndex) => {
                        return (
                          <View key={optionIndex} style={{flexDirection: 'row', marginLeft: 15, marginBottom: 5}}>
                            <Text style={{flex: 5, textAlign: 'left', alignSelf: 'flex-end', fontSize: subFontSize}}>{option.name}</Text>
                            <Text style={{flex: 3, textAlign: 'right', color: 'tomato', fontSize: mainFontSize}}>{MyUtils.toLocaleString(option.price)}원</Text>
                          </View>
                        )
                      })
                    }
                  </View>
                )
              })
            }
            <Divider style={{height: 1.25, marginBottom: 5}}/>
            <View style={{flexDirection: 'row', marginBottom: 5}}>
              <Text style={{flex: 5, textAlign: 'center', fontWeight: 'bold', fontSize: mainFontSize}}>합계</Text>
              <Text style={{flex: 3, textAlign: 'right', color: 'tomato', fontWeight: 'bold', fontSize: mainFontSize}}>{MyUtils.toLocaleString(this.state.order.totalPrice)}원</Text>
            </View>
            </View>
          </View>
          <Animated.View style={{height:this.state.keyboardHeight}}/>
        </ScrollView>
      }
      {/* <Button type='solid' title='결재하기' containerStyle={{marginBottom: 10, marginHorizontal: 5, borderRadius: 3}} /> */}
        <View style={{position: 'absolute', left: 0, bottom: '1%', width: '96%', backgroundColor: Colors.tintColor, marginLeft: '2%', marginRight: '2%', borderRadius: 5}}>
          <TouchableOpacity style={{flex: 1, paddingVertical: 15}} onPress={this.onPressPayment}>
            <Text style={{flex: 1, textAlign: 'center', fontSize: Layout.defaultFontSize, color: 'white'}}>결재하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  outlineText: {
    textAlign: 'center', fontSize: 20, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 10, borderRadius: 2
  }
});

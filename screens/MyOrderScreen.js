import React from 'react';
import { Text, View, FlatList, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Divider, Overlay, Button } from 'react-native-elements';
import update from 'react-addons-update';
import { Notifications } from 'expo';
import * as Icon from '@expo/vector-icons'
import * as firebase from 'firebase';
import Colors from '../constants/Colors'
import MyUtils from '../utilities/MyUtils';

export default class OrderScreen extends React.Component {
  static navigationOptions = {
      title: '주문내역'
  };

  constructor(props) {
    super(props);

    //기본적으로 날짜 최신순으로 함
    const queryOrders = {
      field: 'date',
      direction: 'desc',
      startAfter: new Date(),
      limit: 12,
      queryCount: 0
    }

    this.state = {
      queryOrders: queryOrders,
      refreshing: false,
      loadingOrders: true,
      isLoggedin: false,
      orders: []
    }
    this.currentUser = firebase.auth().currentUser;
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        if(this.currentUser) {
          const previousUser = this.currentUser;
          this.currentUser = firebase.auth().currentUser;
          if(this.currentUser) {
            if(previousUser.uid !== this.currentUser.uid) {
              this.onRefresh();
            }
            this.setState({isLoggedin: true});
          } else {
            this.setState({isLoggedin: false});
          }
        } else {
          this.currentUser = firebase.auth().currentUser;
          if(this.currentUser) {
            this.onRefresh();
            this.setState({isLoggedin: true});
          } else {
            this.setState({isLoggedin: false});
          }
        }
      }
    )
  }
  componentDidMount() {
    console.log('OrderScreen componentDidMount');
    this.currentUser = firebase.auth().currentUser;
    if(this.currentUser) {
      console.log('currentUser =', this.currentUser.uid);
      this.setState({isLoggedin: true});
    } else {
      console.log('didnt login MyInfoScreen');
      this.setState({isLoggedin: false});
    }
    this.handleOrders(this.state.queryOrders);
  }
  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }
  onRefresh = () => {
    const queryOrders = this.state.queryOrders;
    queryOrders.startAfter = new Date();
    queryOrders.queryCount = 0;
    this.setState({queryOrders: queryOrders, refreshing: true, loadingOrders: true, orders: []}, () => {
      this.handleOrders(this.state.queryOrders);
    })
  }
  handleOrders = queryOrders => {
    if(this.currentUser !== null) {
      firebase.firestore().collection('orders')
      .where('from', '==', this.currentUser.uid)
      .orderBy(queryOrders.field, queryOrders.direction)
      .startAfter(queryOrders.startAfter)
      .limit(queryOrders.limit)
      .get().then((querySnapshot) => {
        if(querySnapshot.size > 0) {
          querySnapshot.forEach(doc => {
            const order = {id: doc.id, ...doc.data()};
            this.setState({orders: update(this.state.orders, {$push: [order]})}, () => {
              console.log('push order date =', MyUtils.getDateString(this.state.orders[this.state.orders.length-1].date.toDate(), true));
            })
          })
          this.updateQueryOrders(this.state.orders[this.state.orders.length-1]);
        } else {
          this.ordersDidLoading();
        }
      }).catch(error => {
        console.log('error getting document =', error);
      })
    }
  }
  updateQueryOrders = (lastDoc) => {
    //데이타 다 받고 난 뒤에 쿼리하는 날짜 업데이트 하고 loading 관련 상태 업데이트 한다.
    this.setState({queryOrders: update(this.state.queryOrders, {startAfter: {$set: lastDoc.date.toDate() }})}, () => {
      console.log('startAfter =', MyUtils.getDateString(this.state.queryOrders.startAfter, true));
      if(this.state.refreshing === true) {
        this.ordersDidLoading();
      }
    })
  }
  ordersDidLoading = () => {
    this.setState({refreshing: false, loadingOrders: false}, () => {
      console.log('ordersDidLoading');
      this.setState(prevState => ({queryOrders: update(prevState.queryOrders, {queryCount: {$set: prevState.queryOrders.queryCount+1}})}))
    });
  }
  onEndReached = () => {
    this.setState({loadingOrders: true}, () => {
      this.handleOrders(this.state.queryOrders);
    })
  }
  onPressOrder = (order) => {
    this.props.navigation.navigate('MyOrderDetail', {order: order});
  }
  render() {
    return(
      <View style={{flex: 1}}>
      {
        !this.state.isLoggedin ?
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 20, color: 'dimgray'}}>로그인후 이용가능합니다</Text>
        </View>
        :
        <FlatList data={this.state.orders} keyExtractor={(item, index) => {return index.toString()}}
          onEndReachedThreshold={1}
          onEndReached={this.onEndReached}
          refreshing={this.state.refreshing}
          onRefresh={this.onRefresh}
          renderItem={({item}) => {
            const OptionsView = (props) => {
              const maxOption = 2;
              let options = "추가옵션: ";
              if(props.options !== undefined) {
                if(props.options.length > maxOption) {
                  options += props.options[0].name;
                  for(let i=1; i<maxOption; i++) {
                    options += ', ' + props.options[i].name;
                  }
                  options += ',...';
                } else {
                  props.options.forEach(option => {
                    if(options.length > 0) options += ", ";
                    options += option.name;
                  })
                }
                return (
                  <Text style={{color: '#9C9C9C'}}>{options}</Text>
                )
              } else {
                return (<View></View>)
              }
            }

            let date = '';
            diff = MyUtils.compareDate(new Date(), item.date.toDate());
            if(diff.days > 7) date = MyUtils.getDateString(item.date.toDate());
            else {
              if(diff.days > 0) date = diff.days + ' 일전';
              else if(diff.hours > 0) date = diff.hours + ' 시간전';
              else if(diff.minutes > 0) date = diff.minutes + ' 분전';
              else date = '지금';
            }

            const StatusView = (props) => {
              const {status} = props;
              if(status === 1) {//incoming order
                return (
                  <Icon.Feather size={35} color='tomato' name='download'/>
                )
              } else if(status === 2) {//cocking
                return (
                  <Icon.Ionicons size={40} color={Colors.success} name={Platform.OS === 'ios' ? 'ios-checkmark-circle-outline' : 'md-checkmark-circle-outline'}/>
                )
              } else {
                return (
                  <Icon.Ionicons size={40} color='red' name={Platform.OS === 'ios' ? 'ios-warning' : 'md-warning'}/>
                )
              }
            }
            return (
              <TouchableOpacity style={{paddingHorizontal: 20}} onPress={this.onPressOrder.bind(this, item)}>
                <View style={{flex: 1, flexDirection: 'row', marginVertical: 10}}>
                  <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                    <StatusView status={item.status} />
                  </View>
                  <View style={{flex: 10, paddingLeft: 15}}>
                    <Text style={{fontSize: 20, fontWeight: '500'}} >{item.storeName}</Text>
                    <Text style={{color: 'dimgray', fontSize: 18, paddingTop: 5}}>{item.basket.length === 1 ? item.basket[0].menu.name : item.basket[0].menu.name + ' 외 ' + (item.basket.length-1) + '개'}</Text>
                  </View>
                  <View style={{flex: 5, flexDirection: 'column', justifyContent: 'space-around', alignItems: 'flex-end'}}>
                    <Text style={{fontSize: 19}}>{MyUtils.toLocaleString(item.totalPrice)}원</Text>
                    <Text style={{fontSize: 14, color: '#9C9C9C'}}>{date}</Text>
                  </View>
                </View>
                <Divider/>
              </TouchableOpacity>
            )
          }}
        />
      }
      </View>
    );
  }
}

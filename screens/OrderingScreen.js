import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Dimensions, Platform, TouchableOpacity, Alert, AsyncStorage } from 'react-native';
import { ListItem, Divider, Button, Badge } from 'react-native-elements';
import * as Icon from '@expo/vector-icons'
import Layout from '../constants/Layout';
import update from 'react-addons-update';
import Colors from '../constants/Colors';
import MyUtils from '../utilities/MyUtils';
import MyImage from '../utilities/MyImage'

const OrderAmount = (props) => {
  const {amount, onPressAmount} = props;
  return (
    <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingRight: 15}}>
      <Text style={{fontSize: Layout.defaultFontSize}}>수량</Text>
      <View style={{width: 130, flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity style={{flex: 2}} onPress={onPressAmount.bind(this, -1)}>
          <View style={{justifyContent: 'center', height: 40, borderWidth: 1, borderColor: 'silver', borderTopLeftRadius: 5, borderBottomLeftRadius: 5, marginRight: -1}}>
            <Icon.AntDesign name='minus' size={18} style={{textAlign: 'center'}}/>
          </View>
        </TouchableOpacity>
        <View style={{justifyContent: 'center', height: 40, flex: 3, borderWidth: 1, borderColor: 'silver', borderLeftColor: 'transparent', borderRightColor: 'transparent'}}>
          <Text style={{fontSize: Layout.defaultFontSize, fontWeight: '500', textAlign: 'center'}}>{amount}</Text>
        </View>
        <TouchableOpacity style={{flex: 2}} onPress={onPressAmount.bind(this, 1)}>
          <View style={{justifyContent: 'center', height: 40, borderWidth: 1, borderColor: 'silver', borderTopRightRadius: 5, borderBottomRightRadius: 5, marginLeft: -1}}>
            <Icon.AntDesign name='plus' size={18} style={{textAlign: 'center'}}/>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const OptionCheckbox = (props) => {
  const {name, price, iconName, iconColor} = props;  
  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Icon.MaterialCommunityIcons name={iconName} size={26} color={iconColor} style={{marginRight: 5}}/>
        <Text style={{fontSize: Layout.defaultFontSize}}>{name}</Text>
      </View>
      <Text style={{fontSize: Layout.defaultFontSize}}>{price > 0 ? '+' + price + '원' : '0원'}</Text>
    </View>
  )
}

const OptionList = (props) => {
  const {optionIndex, lastIndex, menuOption, onPressOption} = props;
  return (
    <View style={{marginTop: 10, marginBottom: 10, marginLeft: 10, marginRight: 10}}>
      <View style={{flexDirection: 'row', alignItems: 'baseline', marginBottom: 10}}>
        <Text style={{fontSize: Layout.defaultFontSize, marginRight: 3}}>{menuOption.name}</Text>
        <Text style={{fontSize: 14, color: 'tomato'}}>({menuOption.desc})</Text>
      </View>
      {
        menuOption.items.map((option, index) => {
          return (
            <TouchableOpacity key={index} activeOpacity={0.8} onPress={onPressOption.bind(this, optionIndex, index)}>
              <OptionCheckbox name={option.name} price={option.price} iconName={option.checked == true ? 'checkbox-marked-outline' : 'checkbox-blank-outline'} iconColor={option.checked == true ? 'tomato' : 'silver'}/>
            </TouchableOpacity>
          )
        })
      }
      {
        (() => {//즉시실행함수
          if(lastIndex == false) {
            return <Divider style={{marginTop: 10}}/>
          }
        })()
      }
    </View>
  )
}

export default class OrderingScreen extends React.Component {
    static navigationOptions = {
        title: '주문하기'
    };
    constructor(props) {
      super(props);

      const menuOptions = [
        {
          name: '디저트 선택',
          desc: '필수 선택',
          multiple: false,
          items: [
            {name: '포테이토', price: 0, checked: true}, {name: '콘 셀러드', price: 0, checked: false}, {name: '양념감자', price: 500, checked: false}
          ]
        },
        {
          name: '토핑추가',
          desc: '추가선택',
          multiple: true,
          items: [
            {name: '토마토 토핑', price: 500, checked: false}, {name: '치즈 토핑', price: 700, checked: false}, {name: '베이컨 토핑', price: 900, checked: false}
          ]
        }
      ];

      this.state = {
        loadingMenu: true,
        menu: {},
        menuOptions: [],
        unitPrice: 0,
        totalPrice: 0,
        totalOptionPrice: 0,
        minimumPrice: 0,
        amount: 1,
        shoppingBasket: [],
        textAddBasket: '장바구니추가'
      };
      console.log(this.state.menuOptions);

      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus', payload => {
          console.log('willFocus OrderingScreen');
          try {
            AsyncStorage.getItem('shoppingBasket', (err, result) => {
              if(result !== null) {
                this.setState({shoppingBasket: JSON.parse(result)});
              }
            })
          } catch(error) {
            alert('AsyncStorage error =', error);
          }
        }
      );
      this.didBlurSubscription = this.props.navigation.addListener(
        'didBlur', payload => {
          console.log('didBlur OrderingScreen');
          const shoppingBasket = this.state.shoppingBasket;
          if(shoppingBasket.length > 0) {
            try {
              AsyncStorage.setItem('shoppingBasket', JSON.stringify(shoppingBasket));
            } catch(error) {
              alert('AsyncStorage error =', error);
            }
          } else {
            console.log('no saving shoppingBasket length =', shoppingBasket.length);
          }
        }
      );
    }
    componentWillUnmount() {
      this.willFocusSubscription.remove();
      this.didBlurSubscription.remove();
    }
    componentDidMount() {
      const menuRef = this.props.navigation.getParam('menuRef', undefined);
      if(menuRef !== undefined) {
        menuRef.get().then(doc => {
          const data = doc.data();
          this.setState({menu: data, unitPrice: data.price});
          doc.ref.collection('options').get().then(querySnapshot => {
            let options = [];
            querySnapshot.forEach(optionDoc => {
              let option = optionDoc.data();
              option.desc = option.multiple ? '추가선택':'필수선택';
              if(option.multiple === false) {
                option.items[0].checked = true;
                for(let i=1; i<option.items.length; i++)
                  option.items[i].checked = false;
              } else {
                option.items.forEach(item => {item.checked = false;})
              }
              options.push(option);
            })
            this.setState({menuOptions: options}, () => {
              if(this.state.loadingMenu) {
                this.setState({loadingMenu: false})
              }
              this.updateTotalPrice();
            })
          })
        })
        this.props.navigation.setParams({menuRef: undefined});
      }
      const storeId = this.props.navigation.getParam('storeId', '');
      if(storeId.length > 0) {
        this.storeId = storeId;
        try {
          AsyncStorage.getItem('detailStoreInfo', (err, result) => {
            const detailStoreInfo = JSON.parse(result);
            console.log('minimumPrice =', detailStoreInfo.minimum);
            this.setState({minimumPrice: detailStoreInfo.minimum});
          })
        } catch(error) {
          alert('AsyncStorage error =', error);
        }
        this.props.navigation.setParams({storeId: ''});
      }
      console.log('componentDidMount OrderingScreen');
    }

    updateTotalPrice = () => {
      this.setState((prevState) => {
        let optionPrice = 0;
        prevState.menuOptions.map((menuOption) => {
          menuOption.items.map((option) => {
            if(option.checked === true) {optionPrice += option.price}
          })
        })
        return {
          totalOptionPrice: optionPrice,
          totalPrice: (prevState.unitPrice + optionPrice) * prevState.amount
        }
      })
      this.setState((prevState) => console.log('totalOptionPrice = ' + prevState.totalOptionPrice + ', totalPrice = ' + prevState.totalPrice))
    }

    onPressAmount = (x) => {
      let amount = this.state.amount+x;
      amount = amount < 1 ? 1 : amount;
      this.setState({
        amount: amount
      })
      this.updateTotalPrice();
    }

    onPressOption = (optionIndex, index) => {
      console.log('onPressOption index = ' + index);

      const menuOption = this.state.menuOptions[optionIndex];
      if(menuOption.multiple == true) {
        this.setState((prevState) => ({
          menuOptions: update (
            this.state.menuOptions, {
              [optionIndex]: {items: {[index]: {checked: {$set: !prevState.menuOptions[optionIndex].items[index].checked}}}}
            }
          )
        }))
      } else {
        let previousChecked = -1;
        for(let i=0; i<menuOption.items.length; i++) {
          if(menuOption.items[i].checked === true) {
            previousChecked = i;
            break;
          }
        }
        if(previousChecked >= 0 && previousChecked !== index) {
          this.setState({
            menuOptions: update (
              this.state.menuOptions, {
                [optionIndex]: {items: {
                  [previousChecked]: {checked: {$set: false}},
                  [index]: {checked: {$set: true}}
                }}
              }
            )
          })
        }
      }
      this.updateTotalPrice();
    }
    onPressOrdering = () => {
      if(this.state.minimumPrice > this.state.totalPrice) {
        Alert.alert('주문', '최소 주문 금액은 ' + this.state.minimumPrice + '원 입니다.');
      } else {
        let basket = [];
        basket.push(this.createBasket());
        this.props.navigation.navigate('OrderDetail', {basket: basket});
      }
    }
    onPressAddCart = () => {
      let diffCount=0;
      this.state.shoppingBasket.forEach(basket => {
        if(basket.storeId !== this.storeId) {
          diffCount++;
        }
      })
      if(diffCount === 0) {
        const basket = this.createBasket();
        this.setState({shoppingBasket: update(this.state.shoppingBasket, {$push: [basket]})}, () => {
          this.setState({textAddBasket: '장바구니추가(' + this.state.shoppingBasket.length + ')'});
        });
      } else {
        alert('다른 가게 주문입니다.');
      }
    }
    createBasket = () => {
      const menuOptions = this.state.menuOptions;
      let checkedItems = [];
      menuOptions.forEach(option => {
        option.items.forEach(item => {
          if(item.checked) {
            checkedItems.push(item);
          }
        })
      })
      return {
        storeId: this.storeId,
        menu: {name: this.state.menu.name, price: this.state.menu.price},
        options: checkedItems,
        amount: this.state.amount
      }
    }
    render() {
      const menu = this.state.menu;
      const menuOptions = this.state.menuOptions;
      const amount = this.state.amount;
      const loadingMenu = this.state.loadingMenu;
      return (
        loadingMenu ? <View></View>
        :
        <View style={{flex: 1}}>
          <ScrollView style={{flex: 1}}>
            <View>
              <MyImage style={{width: '100%', height: 180, marginTop: 10}} resizeMode={'contain'} source={menu.pic} />
              <Text style={{fontSize: 24, fontWeight: '500', textAlign: 'center', marginTop: 10}}>{menu.name}</Text>
              <Text style={{fontSize: 16, color: 'dimgray', textAlign: 'center', marginTop: 5, marginLeft: 20, marginRight: 20}}>{menu.desc}</Text>
            </View>
            <View style={{marginTop: 10}}>
              <ListItem title={'가격'} rightTitle={MyUtils.toLocaleString(this.state.unitPrice) + '원'} rightTitleStyle={{color: 'black', fontWeight: '600'}} topDivider={true} bottomDivider={true}/>
            </View>
            <View style={{marginTop: 10}}>
              {
                menuOptions.map((menuOption, index) => {
                  return (
                    <OptionList key={index} optionIndex={index} lastIndex={index === (menuOptions.length-1) ? true : false} menuOption={menuOption} onPressOption={this.onPressOption}/>
                  )
                })
              }
            </View>
            <Divider/>
            <View style={{marginTop: 10, marginBottom: 10}}>
              <OrderAmount amount={amount} onPressAmount={this.onPressAmount}/>
            </View>
            <Divider/>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingLeft: 15, paddingRight: 15}}>
              <View>
                <Text style={{fontSize: Layout.defaultFontSize, fontWeight: '500'}}>총 주문금액</Text>
              </View>
              <View style={{flexDirection: 'column', alignItems: 'flex-end'}}>
                <Text style={{fontSize: Layout.defaultFontSize, fontWeight: '700', color: this.state.totalPrice < this.state.minimumPrice ? 'dimgray' : 'tomato'}}>{MyUtils.toLocaleString(this.state.totalPrice)}원</Text>
                <Text style={{color: 'dimgray'}}>최소주문금액: {MyUtils.toLocaleString(this.state.minimumPrice)}원</Text>
              </View>
            </View>
            <View style={{height: 100, marginTop: 10}}/>
          </ScrollView>
          <View style={{position: 'absolute', left: 0, bottom: '1%', width: '96%', backgroundColor: Colors.tintColor, marginLeft: '2%', marginRight: '2%', borderRadius: 5}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <TouchableOpacity style={{flex: 1, flexDirection: 'row', justifyContent: 'center', paddingVertical: 15}} onPress={this.onPressAddCart}>
                <Text style={{textAlign: 'center', fontSize: Layout.defaultFontSize, color: 'white'}}>{this.state.textAddBasket}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flex: 1, paddingVertical: 15}} onPress={this.onPressOrdering}>
                <Text style={{flex: 1, textAlign: 'center', fontSize: Layout.defaultFontSize, color: 'white'}}>주문하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
}

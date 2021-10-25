import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Divider } from 'react-native-elements';
import { ListItem } from 'react-native-elements';
import * as Icon from '@expo/vector-icons'
import Colors from '../constants/Colors';
import MyImage from '../utilities/MyImage';
import * as firebase from 'firebase';
import 'firebase/firestore';

const MyProperties = (props) => {
  const { containerStyle, titles, contents, onPressMyProperties} = props;
  return (
    <View style={[{width: '100%', flexDirection: 'row', justifyContent: 'center'}, containerStyle]}>
      <TouchableOpacity onPress={() => onPressMyProperties(0)} activeOpacity={0.75} style={{width: '30%', height: 100, borderColor: Colors.tintOpacity,  borderWidth: 1, marginRight: -1, borderTopLeftRadius: 5, borderBottomLeftRadius: 5}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{textAlign: 'center', fontSize: 14, color: 'dimgray'}}>{titles[0]}</Text>
          <Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginTop: 10}}>{contents[0]}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onPressMyProperties(1)} activeOpacity={0.75} style={{width: '30%', height: 100, borderColor: Colors.tintOpacity,  borderWidth: 1}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{textAlign: 'center', fontSize: 14, color: 'dimgray'}}>{titles[1]}</Text>
          <Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginTop: 10}}>{contents[1]}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onPressMyProperties(2)} activeOpacity={0.75} style={{width: '30%', height: 100, borderColor: Colors.tintOpacity,  borderWidth: 1, marginLeft: -1, borderTopRightRadius: 5, borderBottomRightRadius: 5}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{textAlign: 'center', fontSize: 14, color: 'dimgray'}}>{titles[2]}</Text>
          <Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginTop: 10}}>{contents[2]}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default class MyInfoScreen extends React.Component {
    static navigationOptions = {
        title: '내 정보'
    }
    constructor(props) {
      super(props);

      this.state = {
        currentUser: null
      };

      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        payload => {
          this.setState({currentUser: firebase.auth().currentUser});
        }
      )
    }
    componentDidMount() {
      this.setState({currentUser: firebase.auth().currentUser}, () => {
        console.log('currentUser =', this.state.currentUser)
      });
      console.log('hairlineWidth =', StyleSheet.hairlineWidth);
    }

    onPressMyProperties = (index) => {
      console.log('onPressMyProperties index = ' + index);
    }
    onPressListItem = (index) => {
      console.log('onPressListItem index = ' + index);
    }

    render() {
      const currentUser = this.state.currentUser;
      return(
        <ScrollView style={{flex: 1, width: '100%'}}>
        {
          this.state.currentUser === null ?
          <View>
            <Text style={{marginTop: 15, marginBottom: 15, textAlign: 'center'}}>로그인 하고 다양한 혜택을 맛보세요!</Text>
            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <Button type='outline' title='로그인' style={{width: 120}} onPress={() => {this.props.navigation.navigate('Signin')}}/>
              <Button type='outline' title='회원가입' style={{width: 120}} onPress={() => {this.props.navigation.navigate('Signup')}}/>
            </View>
          </View>
          :
          <TouchableOpacity onPress={() => {this.props.navigation.navigate('ModifyMyInfo')}} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#bcbbc1', paddingHorizontal: 20, paddingVertical: 10}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <MyImage style={{width: 60, height: 60}} resizeMode={'contain'} source={currentUser.photoURL === null ? require('../assets/images/stores/avatar.png') : currentUser.photoURL} />
              <Text style={{fontSize: 28, marginLeft: 10}}>{currentUser.email}</Text>
            </View>
            <Icon.AntDesign name='right' size={16} style={{color: 'dimgray'}}/>
          </TouchableOpacity>
        }
          {/* <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center', marginTop: 15}}>
            <MyProperty title='coupons'/>
            <MyProperty title='points'/>
            <MyProperty title='reviews'/>
          </View> */}
          <MyProperties containerStyle={{marginTop: 40}} titles={['쿠폰', '포인트', '리뷰']} contents={['2장', '100P', '5건']} onPressMyProperties={this.onPressMyProperties}/>
          
          <Divider style={{marginTop: 10, backgroundColor: '#eee', height: 15}}/>
          <ListItem title={'Event'} bottomDivider={true} rightIcon={<Icon.AntDesign name='right' style={{color: 'dimgray'}}/>} onPress={() => this.onPressListItem(0)} />
          <ListItem title={'Notice'} bottomDivider={true} rightIcon={<Icon.AntDesign name='right' style={{color: 'dimgray'}}/>} onPress={() => this.onPressListItem(1)}/>
        </ScrollView>
      );
    }
}

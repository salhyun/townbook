import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements'
import MyUtils from '../utilities/MyUtils';
import * as Icon from '@expo/vector-icons'
import * as firebase from 'firebase';
import 'firebase/firestore';

export default class ModifyMyInfoScreen extends React.Component {
  static navigationOptions = {
    title: '내정보 수정'
  };
  constructor(props) {
    super(props);

    this.scrollOffsetY = 0;
    this.state = {
      nickname: '',
      address: ''
    }
    this.currentUser = firebase.auth().currentUser;

    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        const password = this.props.navigation.getParam('password', '');
        if(password !== '') {
          this.props.navigation.setParams({password: ''});
        }
        const nickname = this.props.navigation.getParam('nickname', '');
        if(nickname !== '') {
          this.setState({nickname: nickname});
          this.props.navigation.setParams({nickname: ''});
        }
        const address = this.props.navigation.getParam('address', undefined);
        if(address !== undefined) {
          this.setState({address: address});
          this.props.navigation.setParams({address: undefined});
        }
      }
    )
  }
  componentDidMount() {
    if(this.currentUser) {
      firebase.firestore().collection('users').doc(this.currentUser.uid).get().then(doc => {
        if(doc.exists) {
          const data = doc.data();
          console.log('data =', data);
          if(data.address !== undefined) {
            this.setState({address: data.address});
          }
        }
      })
    }
  }
  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }
  onPressSignout = () => {
    firebase.auth().signOut().then(() => {
      this.props.navigation.goBack();
    })
    // this.props.navigation.navigate('Signin');
  }

  render() {
    const ItemView = (props) => {
      const {label, content, pressItem} = props;
      return (
        pressItem === undefined ?
        <View style={{...styles.divider, paddingHorizontal: 20, paddingVertical: 10}}>
          <Text style={styles.label}>{label}</Text>
          <Text style={{fontSize: 18}}>{content}</Text>
        </View>
        :
        <TouchableOpacity onPress={pressItem.bind(this)} style={{...styles.divider, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10}}>
          <View style={{flex: 20}}>
            <Text style={styles.label}>{label}</Text>
            <Text style={{fontSize: 18}}>{content}</Text>
          </View>
          <Icon.AntDesign name='right' size={16} style={{flex: 1, color: 'dimgray'}}/>
        </TouchableOpacity>
      )
    }
    return(
      <ScrollView>
        <ItemView label='이메일아이디' content={this.currentUser.email} />
        <ItemView label='비밀번호' content='******' pressItem={() => {this.props.navigation.navigate('ModifyInfoItem', {title: '비밀번호 수정', prevRouteName: this.props.navigation.state.routeName})}} />
        <ItemView label='닉네임' content={this.currentUser.displayName} pressItem={() => {this.props.navigation.navigate('ModifyInfoItem', {title: '닉네임 수정', prevRouteName: this.props.navigation.state.routeName})}} />
        <ItemView label='주소' content={this.state.address} pressItem={() => {this.props.navigation.navigate('ModifyInfoItem', {title: '주소 수정', prevRouteName: this.props.navigation.state.routeName})}} />
        <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, marginRight: 20}}>
          <TouchableOpacity style={{marginRight: 10}} onPress={this.onPressSignout}>
            <Text style={{fontSize: 16, color: 'dimgray'}}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={{fontSize: 16, color: 'dimgray'}}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: '#86939e',
    fontWeight: 'bold',
    marginBottom: 5
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#bcbbc1'
  }
});
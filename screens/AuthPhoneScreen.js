import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Input, Button } from 'react-native-elements';

export default class AuthPhoneScreen extends React.Component {
  static navigationOptions = {
    title: '휴대폰 인증'
  };
  constructor(props) {
    super(props);

    this.state = {
      phoneNumber: '',
      authCode: ''
    }
  }
  componentDidMount() {
    const prevRouteName = this.props.navigation.getParam('prevRouteName', undefined);
    if(prevRouteName !== undefined) {
      this.prevRouteName = prevRouteName;
      this.props.navigation.setParams('prevRouteName', undefined);
    }
  }
  confirmAuthCode = () => {
    this.props.navigation.navigate(this.prevRouteName, {phoneNumber: this.state.phoneNumber});
  }
  render() {
    return(
      <View style={{flex: 1}}>
        <ScrollView>
          <View style={{marginTop: 20, marginHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            <Input onChangeText={(text) => {this.setState({phoneNumber: text})}} value={this.state.phoneNumber} label='휴대폰 번호' clearButtonMode='while-editing' keyboardType='phone-pad' containerStyle={{flex: 7}} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder="'-'없이 입력하세요" />
            <Button type='outline' style={{flex: 3}} style={{alignItems: 'flex-end'}} title='인증번호 받기'/>
          </View>
          <View style={{marginTop: 20, marginHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            <Input onChangeText={(text) => {this.setState({authCode: text})}} value={this.state.authCode} label='인증 번호' clearButtonMode='while-editing' keyboardType='phone-pad' containerStyle={{flex: 7}} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder="인증번호를 입력하세요" />
            <Button type='outline' style={{flex: 3}} style={{alignItems: 'flex-end'}} title='인증하기' onPress={this.confirmAuthCode}/>
          </View>
        </ScrollView>
      </View>
    );
  }
}
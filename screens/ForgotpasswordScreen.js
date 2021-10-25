import React from 'react';
import { StyleSheet, Text, Platform, View, ScrollView, Keyboard, Animated, UIManager, findNodeHandle } from 'react-native';
import { Button, Input, Icon } from 'react-native-elements';
import * as firebase from 'firebase';

export default class MyInfoScreen extends React.Component {
  static navigationOptions = {
      title: '비밀번호 재설정'
  };

  constructor(props) {
    super(props);

    this.scrollOffsetY = 0;
    this.state = {
      keyboardHeight: new Animated.Value(0),
      loadingPasswordReset: false,
      email: ''
    }
  }
  keyboardShow = (event) => {
    if(this.props.navigation.isFocused()) {//아직 뒤에서 돌고 있는 Screen이 메시지를 받기 때문에 막아줘야함.
      const keyboardHeight = event.endCoordinates.height;
      UIManager.measure(findNodeHandle(this.scrollview), (x, y, widht, height) => {
        let keyboardTopOffsetY = height - keyboardHeight;
        if((this.focusedInput.y+this.focusedInput.height) > keyboardTopOffsetY) {
          Animated.timing(this.state.keyboardHeight, {toValue: keyboardHeight, duration: 0, delay: 0}).start();
          setTimeout(() => {
            this.scrollview.scrollTo({y: (this.focusedInput.y+this.focusedInput.height) - keyboardTopOffsetY, animated: true})
          }, 100);
        }
      })
    }
  }
  keyboardHide = () => {
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
  }
  componentWillUnmount() {
    this.keyboardShowListener.remove();
    this.keyboardHideListener.remove();
  }

  onChangeEmail = (text) => {
    this.setState({
      email: text
    })
  }

  sendPasswordReset = () => {
    this.setState({loadingPasswordReset: true}, () => {
      firebase.auth().sendPasswordResetEmail(this.state.email)
      .then(() => {
        console.log('Password reset email sent');
        this.setState({loadingPasswordReset: false});
      }).catch(error => {console.log('Error occurred. Inspect error :', error)})
    })
  }

  render() {
    return(
      <View style={{flex: 1}}>
          <ScrollView ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
            <View style={{marginTop: 10, marginHorizontal: 20}} onLayout={event => this.layoutEmail = event.nativeEvent.layout}>
              <Input onChangeText={(text) => {this.onChangeEmail(text)}} value={this.state.email} leftIcon={{type: 'feather', name: 'user', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' keyboardType='email-address' onFocus={() => this.focusedInput = this.layoutEmail} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder='이메일 아이디를 입력하세요' />
            </View>
            <View style={{marginTop: 20, marginHorizontal: 20}}>
              <Button type='solid' title='재설정 메일 보내기' buttonStyle={{backgroundColor: '#4BB543'}} disabled={this.state.loadingPasswordReset} loading={this.state.loadingPasswordReset} onPress={this.sendPasswordReset} />
            </View>
          </ScrollView>
        </View>
    );
  }
}

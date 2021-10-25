import React from 'react';
import { Text, View, TouchableOpacity, Image, Platform, ScrollView, Keyboard, Animated, UIManager, findNodeHandle } from 'react-native';
import { Button, Input } from 'react-native-elements';
import * as firebase from 'firebase';
import Layout from '../constants/Layout'

const ErrorMessageView = (props) => {
  const {message} = props;
  if(typeof message === 'string' && message.length > 0) {
    return (
      <Text style={{fontSize: Layout.defaultFontSize, color: 'tomato'}}>{message}</Text>
    )
  } else {
    return (
      <View></View>
    )
  }
}

export default class SendEmailVerificationScreen extends React.Component {
  static navigationOptions = {
      title: '이메일 인증 보내기'
  };
  constructor(props) {
    super(props);

    this.scrollOffsetY = 0;
    this.state = {
      keyboardHeight: new Animated.Value(0),
      email: '',
      password: '',
      errorMessage: '',
      loadingSendEmailVerification: false
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
  onPressSendEmailVerification = () => {
    this.setState({loadingSendEmailVerification: true}, () => {
      firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(auth => {
        console.log('success login!!');
        if(auth.user.emailVerified) {
          this.setState({errorMessage: '이미 인증이 되었습니다', loadingSendEmailVerification: false});
        } else {
          console.log(auth.user)
          auth.user.sendEmailVerification().then(() => {
            console.log('sentEmailVerification');
            this.setState({errorMessage: '인증 메일을 보냈습니다', loadingSendEmailVerification: false});
          }).catch(error => {
            console.error("Error sendEmailVerification: ", error);
            this.setState({errorMessage: error, loadingSendEmailVerification: false});
          })
        }
      })
      .catch((error) => {
        console.log('error code = ' + error.code + ', message = ' + error.message);
        this.setState({errorMessage: '잘못된 아이디 혹은 비밀번호 입니다', loadingSendEmailVerification: false});
      });
    })
  }

  render() {
    return(
      <View style={{flex: 1, marginTop: 30}}>
        <ScrollView ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
          <View style={{marginTop: 10, marginHorizontal: 20}} onLayout={event => this.layoutEmail = event.nativeEvent.layout}>
            <Input onChangeText={(text) => {this.onChangeEmail(text)}} value={this.state.email} leftIcon={{type: 'feather', name: 'user', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' keyboardType='email-address' onFocus={() => this.focusedInput = this.layoutEmail} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder='아이디를 입력하세요' />
          </View>
          <View style={{marginTop: 10, marginHorizontal: 20}} onLayout={event => this.layoutPassword = event.nativeEvent.layout}>
            <Input onChangeText={(text) => {this.onChangePassword(text)}} value={this.state.password} secureTextEntry={true} leftIcon={{type: 'feather', name: 'lock', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' onFocus={() => this.focusedInput = this.layoutPassword} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder='비밀번호를 입력하세요' />
          </View>
          <View style={{marginTop: 20, marginHorizontal: 20}}>
            <ErrorMessageView message={this.state.errorMessage} />
          </View>
          <View style={{marginTop: 5, marginHorizontal: 20}}>
            <Button type='solid' title='인증메일 보내기' loading={this.state.loadingSendEmailVerification} disabled={this.state.loadingSendEmailVerification} onPress={this.onPressSendEmailVerification} />
          </View>
          <Animated.View style={{height:this.state.keyboardHeight}}/>
        </ScrollView>
      </View>
    );
  }
}
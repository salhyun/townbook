import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView, Keyboard, Animated, UIManager, findNodeHandle } from 'react-native';
import { Button, Input } from 'react-native-elements';
import * as firebase from 'firebase';
import MyUtils from '../utilities/MyUtils';
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

export default class SignupScreen extends React.Component {
    static navigationOptions = {
        title: '회원가입'
    };

    constructor(props) {
      super(props);

      this.scrollOffsetY = 0;
      this.state = {
        keyboardHeight: new Animated.Value(0),
        email: '',
        password: '',
        confirmPassword: '',
        nickName: '',
        address1: '',
        address2: '',
        phoneNumber: '',
        errorMessages: {email: '', password: '', confirmPassword: '', address: ''},
        signupErrorMessage: '',
        loadingSignup: false,
        createdAccount: false
      }

      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        payload => {
          this.juso = this.props.navigation.getParam('juso', undefined);
          if(this.juso !== undefined) {
            this.setState({address1: this.juso.address1})
            this.props.navigation.setParams({juso: undefined});
          }
          const phoneNumber = this.props.navigation.getParam('phoneNumber', undefined);
          if(phoneNumber !== undefined) {
            this.setState({phoneNumber: phoneNumber});
            this.props.navigation.setParams({phoneNumber: undefined});
          }
        }
      )
    }
    keyboardShow = (event) => {
      if(this.props.navigation.isFocused()) {//아직 뒤에서 돌고 있는 Screen이 메시지를 받기 때문에 막아줘야함.
        const keyboardHeight = event.endCoordinates.height;
        UIManager.measure(findNodeHandle(this.scrollview), (x, y, widht, height) => {
          let keyboardTopOffsetY = height - keyboardHeight;
          console.log('keyboardTopOffsetY =', keyboardTopOffsetY);
          if((this.focusedInput.y+this.focusedInput.height) > keyboardTopOffsetY) {
            Animated.timing(this.state.keyboardHeight, {toValue: keyboardHeight, duration: 0, delay: 0}).start();
            console.log('diff =', (this.focusedInput.y+this.focusedInput.height) - keyboardTopOffsetY);
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
      console.log('componentDidMount end');
    }

    componentWillUnmount() {
      this.keyboardShowListener.remove();
      this.keyboardHideListener.remove();
  
      this.willFocusSubscription.remove();
    }

    onChangeEmail = (text) => {
      this.setState({
        email: text
      })
    }
    onChangePassword = (text) => {
      this.setState({
        password: text
      })
    }
    onChangeConfirmPassword = (text) => {
      this.setState({
        confirmPassword: text
      })
    }

    onPressSignup = () => {
      this.setState({signupErrorMessage: '', loadingSignup: true}, () => {
        let errorCount=0;
        let errorMessages = {email: '', password: '', confirmPassword: ''}
        if(MyUtils.checkEmailStyle(this.state.email) === false) {
          errorMessages.email = '이메일 형식이 아닙니다';
          errorCount++;
        }
        if(this.state.password.length < 6) {
          errorMessages.password = '6자리 이상 이어야 합니다';
          errorCount++;
        }
        if(this.state.password !== this.state.confirmPassword) {
          errorMessages.confirmPassword = '비밀번호가 일치 하지 않습니다';
          errorCount++;
        }
        if(this.state.address1.length <= 0) {
          errorMessages.address = '주소가 필요합니다';
          errorCount++;
        }
        if(errorCount > 0) {
          this.setState({errorMessages: errorMessages, loadingSignup: false});
        } else {
          console.log('into signup');
          firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
          .then(auth => {
            console.log('create User successfully');
            console.log('uid =', auth.user.uid);
            let db = firebase.firestore();
            const juso = this.juso;
            const nickName = this.state.nickName === '' ? this.state.email.split('@')[0] : this.state.nickName;
            const userInfo = {nickName: nickName, city: juso.city, district: juso.district, location: juso.location, geoHashes: juso.geoHashes, phoneNumber: this.state.phoneNumber, address: this.state.address1 + ' ' + this.state.address2, mileage: 0, exp: 0, level: '브론즈'};
            db.collection('users').doc(auth.user.uid).set(userInfo)
            .then(() => {
              console.log("Document successfully written!");
              auth.user.sendEmailVerification().then(() => {
                console.log('sentEmailVerification');
                this.setState({createdAccount: true, loadingSignup: false});
              }).catch(error => {
                console.error("Error sendEmailVerification: ", error);
                this.setState({loadingSignup: false})
              })
              firebase.auth().signOut();
            }).catch((error) => {console.error("Error writing document: ", error); this.setState({loadingSignup: false})})
          })
          .catch((error) => {
            console.log('error code = ' + error.code + ', message = ' + error.message);
            this.setState({signupErrorMessage: '이미 계정이 있습니다.', loadingSignup: false});
          });
        }
      });
    }

    render() {
      const createdAccount = this.state.createdAccount;
      if(createdAccount) {
        return (
          <View style={{flex: 1, marginTop: 20, marginHorizontal: 20}}>
            <Text style={{fontSize: Layout.defaultFontSize}}>축하합니다! 계정이 생성되었습니다.</Text>
            <Text style={{marginTop: 10, fontSize: Layout.defaultFontSize}}>먼저 가입하신 계정을 이메일로 인증해 주세요.</Text>
            <Button type='clear' title='로그인 하기' onPress={() => {this.props.navigation.navigate('Signin')}} />
          </View>
        )
      } else {
        return(
          <View style={{flex: 1}}>
            <ScrollView ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
              <View style={{marginTop: 10, marginHorizontal: 20}} onLayout={event => this.layoutEmail = event.nativeEvent.layout}>
                <Input onChangeText={(text) => {this.onChangeEmail(text)}} value={this.state.email} leftIcon={{type: 'feather', name: 'user', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' keyboardType='email-address' onFocus={() => this.focusedInput = this.layoutEmail} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder='이메일을 입력하세요' errorMessage={this.state.errorMessages.email} />
              </View>
              <View style={{marginTop: 20, marginHorizontal: 20}} onLayout={event => this.layoutPassword = event.nativeEvent.layout}>
                <Input onChangeText={(text) => {this.onChangePassword(text)}} value={this.state.password} secureTextEntry={true} leftIcon={{type: 'feather', name: 'lock', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' onFocus={() => this.focusedInput = this.layoutPassword} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder='비밀번호를 입력하세요' errorMessage={this.state.errorMessages.password} />
                {/* <Text style={{fontSize: 14, color: 'tomato', paddingHorizontal: 10}}>6자리 이상 입력하여야 합니다.</Text> */}
              </View>
              <View style={{marginTop: 10, marginHorizontal: 20}} onLayout={event => this.layoutConfirmPassword = event.nativeEvent.layout}>
                <Input onChangeText={(text) => {this.onChangeConfirmPassword(text)}} value={this.state.confirmPassword} secureTextEntry={true} leftIcon={{type: 'feather', name: 'lock', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' onFocus={() => this.focusedInput = this.layoutConfirmPassword} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder='비밀번호를 확인해주세요' errorMessage={this.state.errorMessages.confirmPassword} />
              </View>
              <View style={{marginTop: 10, marginHorizontal: 20}} onLayout={event => this.layoutNickname = event.nativeEvent.layout}>
                <Input onChangeText={(text) => {this.setState({nickName: text})}} value={this.state.nickName} label='별명' leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' onFocus={() => this.focusedInput = this.layoutNickname} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder='별명을 입력하세요' />
              </View>
              <View style={{marginTop: 25, marginHorizontal: 20}}>
                <Button style={{alignSelf: 'flex-start', paddingLeft: 2}} type='clear' title='주소찾기' onPress={() => {this.props.navigation.navigate('SearchAddress', {prevRouteName: this.props.navigation.state.routeName})}} />
                <Text style={{fontSize: Layout.defaultFontSize, marginLeft: 10}}>{this.state.address1}</Text>
              </View>
              <View style={{marginTop: 0, marginHorizontal: 20}} onLayout={event => this.layoutAddress2 = event.nativeEvent.layout}>
                <Input onChangeText={(text) => {this.setState({address2: text})}} value={this.state.address2} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' onFocus={() => this.focusedInput = this.layoutAddress2} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder='나머지 주소를 입력하세요' errorMessage={this.state.errorMessages.address} />
              </View>
              <View style={{marginTop: 20, marginHorizontal: 20, flexDirection: 'row', alignItems: 'flex-end'}}>
                <Text style={{fontSize: 22, marginRight: 10}}>{this.state.phoneNumber}</Text>
                <Button type='outline' title='휴대폰 인증' onPress={() => {this.props.navigation.navigate('AuthPhone', {prevRouteName: this.props.navigation.state.routeName})}} />
              </View>
              <View style={{marginTop: 30}}>
                <View style={{marginTop: 0, marginHorizontal: 30}}>
                  <ErrorMessageView message={this.state.signupErrorMessage} />
                </View>
                <View style={{marginTop: 5, marginHorizontal: 20}}>
                  <Button type='solid' title='가입하기' buttonStyle={{backgroundColor: '#4BB543'}} disabled={this.state.loadingSignup} loading={this.state.loadingSignup} onPress={this.onPressSignup} />
                </View>
              </View>
              <Animated.View style={{height:this.state.keyboardHeight}}/>
            </ScrollView>
          </View>
        )
      }
    }
}

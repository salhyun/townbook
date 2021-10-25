import React from 'react';
import { Text, View, TouchableOpacity, Image, Platform, ScrollView, Keyboard, Animated, UIManager, findNodeHandle, ActivityIndicator } from 'react-native';
import { Button, Input } from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/firestore';
import MyUtils from '../utilities/MyUtils';
import Layout from '../constants/Layout'
import Colors from '../constants/Colors'

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

export default class SigninScreen extends React.Component {
  constructor(props) {
    super(props);

    this.scrollOffsetY = 0;
    this.state = {
      keyboardHeight: new Animated.Value(0),
      email: '',
      password: '',
      errorMessage: '',
      loadingScreen: true,
      loadingSignin: false
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

    if(firebase.apps.length === 0) {
      firebase.initializeApp({
        apiKey: "##################################",
		authDomain: "##################################",
		databaseURL: "##################################",
		projectId: "##################################",
		storageBucket: "##################################",
		messagingSenderId: "##################################",
		appId: "##################################"
      });
    }
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('login');
        console.log(`email: ${user.email}, uid: ${user.uid}`);
        console.log(user.emailVerified);
        if(user.emailVerified) {
          console.log('onAuthStateChanged emailVerified');
          this.setState({email: user.email}, () => {
            this.props.navigation.navigate('Home');
          })
        } else {
          console.log('doesnt Verificated');
        }
      } else {
        // User is signed out.
        console.log('logout');
      }
      if(this.state.loadingScreen) {
        this.setState({loadingScreen: false});
      }
    });
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
  onChangePassword = (text) => {
    this.setState({
      password: text
    })
  }
  onPressLogin = () => {
    this.setState({errorMessage: '', loadingSignin: true}, () => {
      firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(auth => {
        console.log('success login!!');
        this.setState({loadingSignin: false}, () => {
          if(auth.user.emailVerified) {
            this.props.navigation.navigate('Home');
          } else {
            console.log('doesnt Verificated');
            this.setState({errorMessage: '이메일 인증이 되지 않았습니다'})
          }
        })
      })
      .catch((error) => {
        console.log('error code = ' + error.code + ', message = ' + error.message);
        this.setState({errorMessage: '잘못된 아이디 혹은 비밀번호 입니다', loadingSignin: false});
      });
    });
  }

  render() {
    return(
      this.state.loadingScreen ? <View style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator size='large' /></View>
      :
      <View style={{flex: 1, marginTop: 30}}>
        <ScrollView ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
          <Image style={{height: 150, width: 150, alignSelf: 'center', borderRadius: 75, marginVertical: 20}} source={require('../assets/images/hyunfung.jpg')}/>
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
            <Button type='solid' title='로그인' disabled={this.state.loadingSignin} loading={this.state.loadingSignin} onPress={this.onPressLogin} />
          </View>
          <View style={{marginTop: 10, marginHorizontal: 20}}>
            <Button type='solid' title='회원가입' buttonStyle={{backgroundColor: '#4BB543'}} onPress={() => this.props.navigation.navigate('Signup')} />
          </View>
          <View style={{marginTop: 20, marginHorizontal: 20}}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Forgotpassword')}>
              <Text style={{color: Colors.tintColor, fontSize: Layout.defaultFontSize}}>비밀번호 찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('SendEmailVerification')}>
              <Text style={{color: Colors.tintColor, fontSize: Layout.defaultFontSize}}>인증메일 다시 보내기</Text>
            </TouchableOpacity>
          </View>
          <Animated.View style={{height:this.state.keyboardHeight}}/>
        </ScrollView>
      </View>
    );
  }
}

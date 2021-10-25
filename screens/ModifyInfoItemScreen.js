import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Input, Button } from 'react-native-elements';
import update from 'react-addons-update';
import Layout from '../constants/Layout';
import MyStyles from '../constants/MyStyles';
import * as firebase from 'firebase';
import MyUtils from '../utilities/MyUtils';

export default class ModifyInfoItemScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const { params } = navigation.state;
    let title = '';
    if(params !== undefined) {
      title = params.title;
    }
    return {
      title: title,
      headerRight: <Button type='clear' title='저장' disabled={params === undefined ? true : false} loading={(params.loading !== undefined && params.loading) ? true : false} onPress={params !== undefined && params.confirmItem !== undefined ? params.confirmItem.bind(this) : () => {}} />
    }
  };
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      nickname: '',
      address1: '',
      address2: '',
      juso: {},
      errorMessages: {address1: '', currentPassword: '', newPassword: '', confirmPassword: ''},
    }

    this.currentUser = firebase.auth().currentUser;
    this.props.navigation.setParams({
      confirmItem: this.confirmItem,
      loading: false
    })
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        const juso = this.props.navigation.getParam('juso', undefined);
        if(juso !== undefined) {
          this.setState({address1: juso.address1});
          this.setState({juso: juso});
          this.props.navigation.setParams('juso', undefined);
        }
      }
    )
  }
  componentDidMount() {
    this.prevRouteName = this.props.navigation.getParam('prevRouteName', null);
    this.setState({title: this.props.navigation.getParam('title', '')}, () => {
      const title = this.state.title;
      if(title === '비밀번호 수정') {
      } else if(title === '닉네임 수정') {
        this.setState({nickname: this.currentUser.displayName})
      } else if(title === '주소 수정') {
      }
    });
  }

  reauthenticate = async(currentPassword) => {
    let result = false;
    if(this.currentUser) {
      const credential = firebase.auth.EmailAuthProvider.credential(this.currentUser.email, currentPassword);
      this.currentUser.reauthenticateWithCredential(credential).then(() => {
      }).catch(error => {console.log('catch error =', error);})
    }
    console.log('reauthenticate result =', result);
    return result;
  }
  confirmItem = () => {
    const title = this.state.title;
    if(title === '비밀번호 수정') {
      if(this.currentUser) {
        let errorCount=0;
        let errorMessages = {address1: '', currentPassword: '', newPassword: '', confirmPassword: ''};
        this.setState({errorMessages: errorMessages}, () => {
          this.props.navigation.setParams({loading: true});
          const credential = firebase.auth.EmailAuthProvider.credential(this.currentUser.email, this.state.currentPassword);
          this.currentUser.reauthenticateWithCredential(credential).then(() => {
            if(this.state.newPassword.length < 6) {
              errorMessages.newPassword = '6자리 이상이어야 합니다.';
              errorCount++;
            }
            if(this.state.newPassword !== this.state.confirmPassword) {
              errorMessages.confirmPassword = '비밀번호가 일치 하지 않습니다';
              errorCount++;
            }
            if(errorCount > 0) {
              this.setState({errorMessages: errorMessages});
              this.props.navigation.setParams({loading: false});
            } else {
              this.currentUser.updatePassword(this.state.newPassword).then(() => {
                this.props.navigation.setParams({loading: false});
                this.props.navigation.navigate(this.prevRouteName, {password: 'success'});
              })
            }
          }).catch(error => {
            console.log('catch error =', error);
            this.setState({errorMessages: update(this.state.errorMessages, {currentPassword: {$set: '비밀번호가 일치 하지 않습니다'}})})
            this.props.navigation.setParams({loading: false});
          })
        })
      }
    } else if(title === '닉네임 수정') {
      if(this.currentUser) {
        this.props.navigation.setParams({loading: true});
        this.currentUser.updateProfile({displayName: this.state.nickname}).then(() => {
          console.log('updated nickname =', this.currentUser.displayName);
          this.props.navigation.setParams({loading: false});
          this.props.navigation.navigate(this.prevRouteName, {nickname: this.currentUser.displayName});
        })
      }
    } else if(title === '주소 수정') {
      if(MyUtils.isAvailable(this.state.juso)) {
        this.props.navigation.setParams({loading: true});
        let juso = this.state.juso;
        juso.address = this.state.address1 + ' ' + this.state.address2;
        juso.location = new firebase.firestore.GeoPoint(juso.location[1], juso.location[0]);
        delete juso.address1;
        firebase.firestore().collection('users').doc(this.currentUser.uid).set(juso).then(() => {
          console.log("Document successfully written!");
          this.props.navigation.setParams({loading: false});
          this.props.navigation.navigate(this.prevRouteName, {address: juso.address});
        }).catch((error) => {
          console.error("Error writing document: ", error);
          this.props.navigation.setParams({loading: false});
        })
      }
    }
  }

  render() {
    const title = this.state.title;
    return (
      <ScrollView>
      {
        title === '비밀번호 수정' ?
        <View style={{marginHorizontal: 20, marginVertical: 20}}>
          <Text style={{...MyStyles.label, marginHorizontal: 10}}>비밀번호</Text>
          <Input onChangeText={(text) => {this.setState({currentPassword: text})}} value={this.state.currentPassword} secureTextEntry={true} clearButtonMode='while-editing' placeholder='현재 비밀번호를 입력해주세요' errorMessage={this.state.errorMessages.currentPassword}/>
          <Input onChangeText={(text) => {this.setState({newPassword: text})}} value={this.state.newPassword} secureTextEntry={true} clearButtonMode='while-editing' placeholder='새 비밀번호를 입력해주세요' errorMessage={this.state.errorMessages.newPassword}/>
          <Input onChangeText={(text) => {this.setState({confirmPassword: text})}} value={this.state.confirmPassword} secureTextEntry={true} clearButtonMode='while-editing' placeholder='한번 더 입력해주세요' errorMessage={this.state.errorMessages.confirmPassword}/>
        </View>
        :null
      }
      {
        title === '닉네임 수정' ?
        <View style={{marginHorizontal: 20, marginVertical: 20}}>
          <Input label='닉네임' onChangeText={(text) => {this.setState({nickname: text})}} value={this.state.nickname} placeholder='닉네임을 입력해주세요'/>
        </View>
        :null
      }
      {
        title === '주소 수정' ?
        <View style={{marginHorizontal: 20, marginVertical: 20}}>
          <Button style={{alignSelf: 'flex-start'}} type='clear' title='주소찾기' onPress={() => {this.props.navigation.navigate('SearchAddress', {prevRouteName: this.props.navigation.state.routeName})}} />
          <Text style={{...MyStyles.label, marginHorizontal: 10}}>주소</Text>
          <Text style={{fontSize: Layout.defaultFontSize, marginHorizontal: 10, marginBottom: 15}}>{this.state.address1}</Text>
          <Input onChangeText={(text) => {this.setState({address2: text})}} value={this.state.address2} placeholder='나머지 주소를 입력해주세요'/>
        </View>
        :null
      }
      </ScrollView>
    );
  }
}

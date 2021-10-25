import React from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Keyboard, Animated, UIManager, findNodeHandle, Image, ImageEditor } from 'react-native';
import { Rating, AirbnbRating, Input, Button } from 'react-native-elements';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import update from 'react-addons-update';
import * as firebase from 'firebase';
import 'firebase/firestore';
import MyImage from '../utilities/MyImage';
import MyUtils from '../utilities/MyUtils';

export default class WriteReviewScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const { params } = navigation.state;
    const HeaderRight = () => {
      if(params !== undefined && params.loadingSubmit !== undefined && params.onPressSubmit !== undefined) {
        return (
          <Button type='clear' title='제출' disabled={params.loadingSubmit} loading={params.loadingSubmit} onPress={params.onPressSubmit}/>
        )
      } else {return null}
    }
    return {
      title: '리뷰쓰기',
      headerRight: <HeaderRight/>
    }
  };
  constructor(props) {
    super(props);

    const images = [
      {source: require('../assets/images/add-circle-green-512.png')}
    ]

    this.maxImages = 2;
    this.state = {
      loading: true,
      keyboardHeight: new Animated.Value(0),
      contents: '',
      rating: 3,
      images: images,
    };

    this.props.navigation.setParams({
      onPressSubmit: this.submit,
      loadingSubmit: false,
    });
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
  permissionCameraRoll = async() => {
    const permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    if (permission.status !== 'granted') {
      const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (newPermission.status === 'granted') {
        //its granted.
      }
    } else {
    }
  }
  componentDidMount() {
    this.permissionCameraRoll();    
    this.keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',//안드로이드 keyboardWillShow 지원안함.
      this.keyboardShow,
    );
    this.keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',//안드로이드 keyboardWillHide 지원안함.
      this.keyboardHide,
    );

    const order = this.props.navigation.getParam('order', undefined);
    if(order !== undefined) {
      this.order = order;
      this.setState({loading: false});
      this.props.navigation.setParams({order: undefined});
    }
    const prevRouteName = this.props.navigation.getParam('prevRouteName', undefined);
    if(prevRouteName !== undefined) {
      this.prevRouteName = prevRouteName;
      this.props.navigation.setParams('prevRouteName', undefined);
    }
  }
  componentWillUnmount() {
    this.keyboardShowListener.remove();
    this.keyboardHideListener.remove();
  }
  uploadImageAsync = async(uri, folder, filename) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        resolve(xhr.response);
      }
      xhr.onerror = (e) => {
        console.log(e);
        reject(new TypeError('network request failed'));
      }
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    })
    const ref = firebase.storage().ref(folder).child(filename);
    const snapshot = await ref.put(blob);
    blob.close();
    const downloadURL = await new Promise((resolve, reject) => {
      snapshot.ref.getDownloadURL().then(downloadURL => {
        console.log('File available at ' + downloadURL);
        resolve(downloadURL)
      })
    })
    return downloadURL;
  }
  resizeImage = async(uri, maxSize) => {
    console.log('start resizeTwo');
    let resizedUri = await new Promise((resolve, reject) => {
      Image.getSize(uri, (width, height) => {
        ImageEditor.cropImage(
          uri, {
            offset: {x: 0, y: 0},
            size: {width: width, height: height},
            displaySize: {width: maxSize, height: maxSize},
            resizeMode: 'contain'
          },
          (resultUri) => {
            console.log('croped image uri =', resultUri);
            resolve(resultUri);
          },
          (error) => {
            console.log('croped image error =', error);
          }
        );
      })
    })
    console.log('resizedUri =', resizedUri);
    console.log('END resizeTwo');
    return resizedUri;
  }
  addImage = async(index) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.cancelled) {
      console.log(`result.uri = ${result.uri}`);
      const picked = this.state.images[index];
      this.setState({images: update(this.state.images, {[index]: {source: {$set: result.uri}}})}, () => {
        if(typeof picked.source === 'number' && index < this.maxImages) {
          this.setState({images: update(this.state.images, {$push: [picked]})});
        }
      })
    } else {
      console.log('result canceled');
    }
  }
  ratingCompleted = (rating) => {
    this.setState({rating: rating});
  }
  submit = () => {
    this.props.navigation.setParams({loadingSubmit: true});
    const review = {
      contents: this.state.contents,
      orderNumber: this.order.orderNumber,
      date: new Date(),
      rating: this.state.rating,
      from: this.order.from,
      to: this.order.to,
      images: []
    };
    firebase.firestore().collection('reviews').add(review).then(async(docRef) => {
      console.log("review written with ID: ", docRef.id);
      let count=0;
      await MyUtils.parallelSync(this.state.images, async(image) => {
        if(typeof image.source === 'string') {
          const resizedUri = await this.resizeImage(image.source, 512);
          const thumbnailUri = await this.resizeImage(image.source, 200);
          const fileName = docRef.id + '_' + count++;
          console.log('fileName =', fileName);
          const imageURL = await this.uploadImageAsync(resizedUri, 'images/reviews', fileName);
          const thumbURL = await this.uploadImageAsync(thumbnailUri, 'images/reviews', 'thumb_' + fileName);
          await firebase.firestore().collection('reviews').doc(docRef.id).update({images: firebase.firestore.FieldValue.arrayUnion({imageURL: imageURL, thumbURL: thumbURL})})
          .then(() => {
            console.log('image array updated successfully');
          });
        }
      })
      console.log('review updated successfully');
      this.props.navigation.setParams({loadingSubmit: false});
      if(this.prevRouteName !== undefined) {
        this.props.navigation.navigate(this.prevRouteName, {sentReview: true});
      } else {
        this.props.navigation.goBack();
      }
    }).catch(error => {
      console.error("Error adding review : ", error);
    })
  }

  render() {
    return(
      <View style={{flex: 1}}>
      {
        this.state.loading ? <ActivityIndicator style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} size='large' />
        :
        <ScrollView ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
          <View style={{marginTop: 10, marginHorizontal: 10}}>
            <AirbnbRating reviews={["최악", "나쁨", "보통", "좋아", "쌋다브로"]} size={26} onFinishRating={this.ratingCompleted} />
          </View>
          <View style={{marginTop: 10, marginHorizontal: 10}}>
            <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: 'dimgray', borderRadius: 5, marginTop: 2}} onLayout={event => this.layoutReviewContents = event.nativeEvent.layout}>
              <Input onChangeText={(text) => {this.setState({contents: text})}} value={this.state.contents} clearButtonMode='while-editing' inputContainerStyle={{padding: 5, borderBottomWidth: 0}} onFocus={() => this.focusedInput = this.layoutReviewContents} multiline={true} placeholder='리뷰를 입력하세요'/>
            </View>
          </View>
          <FlatList data={this.state.images} keyExtractor={(item, index) => {return index.toString()}} horizontal={true} style={{marginHorizontal: 5}}
            renderItem={({item, index}) => {
              const imageStyle = typeof item.source === 'number' ? {width: 60, height: 60} : {width: 120, height: 120};
              const opacity = typeof item.source === 'number' ? 0.25 : 1.0;
              return (
                <TouchableOpacity style={{width: 120, height: 120, margin: 5, justifyContent: 'center', alignItems: 'center'}} onPress={this.addImage.bind(this, index)}>
                  <MyImage style={imageStyle} resizeMode='contain' opacity={opacity} source={item.source} />
                </TouchableOpacity>
              )
            }}
          />
          <Animated.View style={{height:this.state.keyboardHeight}}/>
        </ScrollView>
      }
      </View>
    );
  }
}

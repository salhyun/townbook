import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Button, Dimensions, TouchableOpacity, AsyncStorage } from 'react-native';
import Carousel from 'react-native-looped-carousel';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import update from 'react-addons-update';

import * as firebase from 'firebase';
import 'firebase/firestore';

const {width, height} = Dimensions.get('window');

export default class FoodMainScreen extends React.Component {
    static navigationOptions = {
        title: 'Food'
    };
    constructor(props) {
        super(props);
        this.state = {
            size: {width, height},
            promotions: [
                {id: 0, color: '#f00', name: 'page1', img_url: '/', img_path: require('../assets/images/daldal01.png')},
                {id: 1, color: '#0f0', name: 'page2', img_url: '/', img_path: require('../assets/images/daldal02.png')},
                {id: 2, color: '#00f', name: 'page3', img_url: '/', img_path: require('../assets/images/daldal03.png')},
                {id: 3, color: '#888', name: 'page4', img_url: '/', img_path: require('../assets/images/daldal04.png')},
            ],
            foodCategories: [
                {id: 0, path: require('../assets/images/food_categories/food_category01.png')},
                {id: 1, path: require('../assets/images/food_categories/food_category02.png')},
                {id: 2, path: require('../assets/images/food_categories/food_category03.png')},
                {id: 3, path: require('../assets/images/food_categories/food_category04.png')},
                {id: 4, path: require('../assets/images/food_categories/food_category05.png')},
                {id: 5, path: require('../assets/images/food_categories/food_category06.png')},
                {id: 6, path: require('../assets/images/food_categories/food_category07.png')},
                {id: 7, path: require('../assets/images/food_categories/food_category08.png')},
                {id: 8, path: require('../assets/images/food_categories/food_category09.png')}
            ],
            resourceLoaded: true,
        }

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

        this._onPressCategory = this._onPressCategory.bind(this);
    }

    _onLayoutDidChange = e => {
        const layout = e.nativeEvent.layout;
        console.log('called _onLayoutDidChange');
        this.setState({
            size: {
                width: layout.width,
                height: layout.height/3,
            }
        });
    }

    _handlePageUpdate = (index, newName, imageUrl) => {
        this.setState({
            promotions: update(
                this.state.promotions, {
                    [index]: {
                        name: {$set: newName},
                        img_url: {$set: imageUrl}
                    }
                }
            )
        });
    }
    _updatePromotions = (host) => {
        fetch(host + '/food/readPromotions', {method: 'POST',})
        .then((response) => response.json())
        .then((responseJson) => {
            console.log('json result POST = ' + responseJson.result);
            console.log(responseJson.promotions);
            this.state.promotions.forEach((page, index) => {
                let promotion = responseJson.promotions[index];
                let name = promotion.name;
                let imageUrl = host + promotion.pic.url;
                this._handlePageUpdate(index, name, imageUrl);
                console.log(imageUrl);
                // console.log('[' + index + ']' + 'ImageUrl = ' + responseJson.promotions[index]);
            });
            console.log('##################');
            this.state.promotions.forEach((page, index) => {
                console.log('page color = ' + page.color + ', name = ' + page.name + ', img_url = ' + page.img_url);
            });
        })
        .catch((error) => {console.log(error);});
    }
    _onPressCategory(index) {
        console.log('onPress Category index = ' + index);
        let foodcategories = ['Eniterty', 'Single', 'Korean',  'Flour','Japanese',  'Chinese',  'Chicken',  'Pizza',  'PigJB'];
        this.props.navigation.navigate(foodcategories[index]);
        // this.props.navigation.navigate('FoodMenu');
    }

    getLocationAsync = async () => {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.LOCATION);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.LOCATION);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get Permission Location');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      console.log('current location =', location);
    }
    watchPositionAsync = async () => {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.LOCATION);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.LOCATION);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get Permission Location');
        return;
      }
      this.watchPositionSubscription = Location.watchPositionAsync({enableHighAccuracy: true}, location => {
        try {
          AsyncStorage.setItem('watchPosition', JSON.stringify({lat: location.coords.latitude, long: location.coords.longitude}));
        } catch (error) {console.log('AsyncStorage error =', error);}
      })
    }
    componentDidMount() {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          console.log('login');
          console.log(`email: ${user.email}, uid: ${user.uid}`);
          console.log(user.emailVerified);
          if(user.emailVerified) {
            console.log('user emailVerified');
          } else {
            console.log('doesnt Verificated');
          }
        } else {
          // User is signed out.
          console.log('logout');
        }
      });
      this.watchPositionAsync();

      // let db = firebase.firestore();
      // db.collection('stores').get().then(querySnapshot => {
      //   querySnapshot.forEach(doc => {
      //     if(doc.exists) {
      //       console.log(doc.data());
      //     }
      //   })
      // })
      // this._updatePromotions('http://0.0.0.0:3000');
    }
    componentWillUnmount() {
      if(this.watchPositionSubscription !== undefined) {
        this.watchPositionSubscription.remove();
      }
    }

    render() {
        const resourceLoaded = this.state.resourceLoaded;
        const promotions = this.state.promotions;
        const foodCategories = this.state.foodCategories;
        const categorySize = this.state.size.width/4;
        if(resourceLoaded == true) {
            return(
              <View style={{flex: 1}}>
                <ScrollView onLayout={this._onLayoutDidChange}>
                  {/* <Carousel
                    delay={2000}
                    style={this.state.size}
                    bullets={true}
                    currentPage={1}>
                    {promotions.map((promotion, index) => {
                        return (
                            <View key={index} style={[{backgroundColor: promotion.color}, this.state.size]}>
                              <Image style={{flex: 1, width: undefined, height: undefined}} source={promotion.img_path}/>
                            </View>
                        );
                    })}
                  </Carousel> */}
                  <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 25, marginLeft: 25, marginRight: 25}}>
                  {
                    foodCategories.map((category, index) => {
                      return (
                          <TouchableOpacity key={index} onPress={() => this._onPressCategory(index)}>
                              <Image style={{width: categorySize, height: categorySize, margin: 5, resizeMode: 'contain'}} source={category.path}/>
                          </TouchableOpacity>
                      )
                    })
                  }
                  </View>
                  <View style={{marginTop: 40}}>
                    <Text style={{textAlign: 'center', color: 'dimgray', fontSize: 18}} >(주)타운북</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10}}>
                      <TouchableOpacity>
                        <Text style={{color: 'dimgray', fontSize: 14}}>이용약관</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text style={{color: 'dimgray', fontSize: 14}}>개인정보처리방침</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text style={{color: 'dimgray', fontSize: 14}}>회원등급정책</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text style={{color: 'dimgray', fontSize: 14}}>사업자정보확인</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{marginTop: 10, marginBottom: 10, marginHorizontal: 15}}>
                      <Text style={{fontSize: 12, color: 'dimgray', textAlign: 'center'}}>(주)타운북은 통신판매중개자로서, 상품/거래정보 및 거래와 관련하여 통신판매 당사자의 고의 또는 과실로 소비자에게 발생하는 손해에 대해 책임을 지지 않습니다. 상품거래에 대한 정확한 정보는 해당 판매자에게 직접 확인 바랍니다.</Text>
                      <Text style={{fontSize: 12, color: 'dimgray', textAlign: 'center'}}>Copyright townbook. All Rights Reserved.</Text>
                    </View>
                  </View>
                </ScrollView>
              </View>
            );
        } else {
            return(
                <View style={{flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'}}><Text style={{color: 'black'}}>Loading...</Text></View>
            );
        }
    }
}

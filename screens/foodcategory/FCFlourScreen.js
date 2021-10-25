import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage, FlatList } from 'react-native';
import update from 'react-addons-update';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Geohash from 'latlon-geohash';
import Location from '../../utilities/Location'
import MyImage from '../../utilities/MyImage'

export default class FCFlourScreen extends React.Component {
  static navigationOptions = {
      title: '분식'
  };
  constructor(props) {
    super(props);

    this.state = {
      stores: [],
      resourceLoaded: true
    }

    this.currentUser = firebase.auth().currentUser;
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        AsyncStorage.getItem('watchPosition', (err, result) => {
          // console.log('FCKoreanScreen AsyncStorage result =', JSON.parse(result));
          const watchPosition = JSON.parse(result);
          this.location = new firebase.firestore.GeoPoint(watchPosition.lat, watchPosition.long);
          if(this.currentUser) {
            firebase.firestore().collection('users').doc(this.currentUser.uid).get().then(doc => {
              if(doc.exists) {
                if(doc.data() !== undefined) {
                  this.location = doc.data().location;
                  console.log('currentUser this.location =', this.location);
                }
              }
            })
          }
          if(this.state.stores.length <= 0) {
            this.qLocations(this.location, 1);
          }
        })
      }
    )
  }
  qLocations = async(location, radius, precision=5) => {
    let stores = [];
    const boundary = Location.getBoundary(location._lat, location._long, radius);
    const hash = Geohash.encode(location._lat, location._long, precision);
    console.log('hash =', hash);
    console.log(`boundary lat(${boundary.sw._lat} - ${boundary.ne._lat}`);
    console.log(`boundary long(${boundary.sw._long} - ${boundary.ne._long}`);
    await firebase.firestore().collection('tStores')
    .where('geoHashes', 'array-contains', hash)
    .where('location', '>', boundary.sw)
    .where('location', '<', boundary.ne)
    .get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data = doc.data();
        // console.log(`${doc.id} = ${doc.data().name} (${doc.data().location._lat}, ${doc.data().location._long}) geoHash=${doc.data().geoHash}`);
        // if(data.location._lat > boundary.sw._lat && data.location._lat < boundary.ne._lat) {
        //   stores.push(data);
        // }
        if(data.location._long > boundary.sw._long && data.location._long < boundary.ne._long) {
          stores.push(data);
          this.setState({stores: update(this.state.stores, {$push: [{docId: doc.id, ...data}]})})
          // console.log(`${doc.id}= ${doc.data().name}`);
        }
      })
    })
    console.log('finished qLocations');
    stores.forEach(store => {
      // console.log(`${store.name} (${store.location._lat}, ${store.location._long}) geoHash=${store.geoHash}`);
    })
  }
  componentDidMount() {
    console.log('componentDidMount FCFlourScreen');
  }
  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }
  onPressStore = (docId) => {
    console.log('docId =', docId);
    this.props.navigation.navigate('Detail', {storeId: docId});
  }
  
  render() {
    const resourceLoaded = this.state.resourceLoaded;
    const stores = this.state.stores;
    return(
      <View style={{flex: 1}}>
        <View style={{marginTop: 10, borderBottomColor: 'transparent', borderBottomWidth: 1}}/>
        <FlatList
          data={stores}
          keyExtractor={(item) => item.name}
          onEndReachedThreshold={1}
          renderItem={({item}) => {
            return (
              <TouchableOpacity onPress={() => this.onPressStore(item.docId)}>
                <View style={{flex: 1, flexDirection: "row", height: 80, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}>
                  <MyImage style={{flex: 1, width: 80, height: 80}} source={item.thumbTitlePic}/>
                  <View style={{flex: 3, marginLeft: 24}}>
                    <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
                      <Text style={styles.title}>{item.name}</Text>
                      <View style={{flexDirection: "row", marginTop: 8}}>
                        <Ionicons style={{alignSelf: 'center'}} name="ios-star" size={14} color="tomato" />
                        <Text style={styles.desc}>{item.totalRating}</Text>
                        <Entypo style={{alignSelf: 'center'}} name={'dot-single'} size={14} color='lightgray'/>
                        <Text style={styles.desc}>리뷰: {item.reviewCount}</Text>
                        <Entypo style={{alignSelf: 'center'}} name={'dot-single'} size={14} color='lightgray'/>
                        <Text style={styles.desc}>사장님댓글: {item.ownerReplyCount}</Text>
                      </View>
                      <View style={{marginTop: 4}}>
                        <Text style={styles.desc}>{item.desc}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{borderBottomColor: 'lightgray', borderBottomWidth: 1}}/>
              </TouchableOpacity>
            )
          }}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    color: 'black'
  },
  desc: {
    fontSize: 14,
    color: 'dimgray'
  }
});

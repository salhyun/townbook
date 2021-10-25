import React from 'react';
import { Text, View, AsyncStorage } from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Geohash from 'latlon-geohash';
import Location from '../../utilities/Location';
import MyUtils from '../../utilities/MyUtils';

export default class FCKoreanScreen extends React.Component {
    static navigationOptions = {
        title: '한식'
    };
    constructor(props) {
      super(props);

      this.currentUser = firebase.auth().currentUser;

      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        payload => {
          if(this.currentUser) {
            firebase.firestore().collection('users').doc(this.currentUser.uid).get().then(doc => {
              if(doc.exists) {
                this.location = doc.data().location;
                console.log('this.location =', this.location);
              }
            })
          } else {
            AsyncStorage.getItem('watchPosition', (err, result) => {
              // console.log('FCKoreanScreen AsyncStorage result =', JSON.parse(result));
              const watchPosition = JSON.parse(result);
              this.location = new firebase.firestore.GeoPoint(watchPosition.lat, watchPosition.long);
              console.log('this.location =', this.location);
            })
          }
        }
      )
    }
    componentDidMount() {
      console.log('componentDidMount FCKoreanScreen');
      const locations = [
        {name: '언더월드', lat: 35.858314, long: 128.562509},
        {name: '대우오락실', lat: 35.857959, long: 128.562653},
        {name: '하중도', lat: 35.89935, long: 128.558038},
        {name: '대명동계대', lat: 35.854181, long: 128.581644},
        {name: '반월당역', lat: 35.865501, long: 128.593485},
        {name: '나의유년기', lat: 35.856334, long: 128.559764},
        {name: '크리스탈호텔', lat: 35.861875, long: 128.573454},
        {name: '영선초교', lat: 35.852902, long: 128.595706},
        {name: '두류공원', lat: 35.848056, long: 128.55825},
        {name: '우리집', lat: 35.862703, long: 128.578335},
        {name: '신흥국민학교', lat: 35.856387, long: 128.557061},
        {name: '범어네거리', lat: 35.859064, long: 128.626195}
      ];
      const addLocations = [
        {name: '엘로꼬 창원', lat: 35.222172, long: 128.676451},
        {name: '대구국립과학관', lat: 35.686603, long: 128.465624},
        {name: '대구대 스탁벅스', lat: 35.832985, long: 128.758021}
      ]

      const precision = 5;
      // const hash = Geohash.encode(35.862703, 128.578335, precision);
      // const neighbours = Geohash.neighbours(hash);
      // console.log('neighbours =', neighbours);
      // let ne = Geohash.decode(neighbours.ne);
      // let sw = Geohash.decode(neighbours.sw);
      // ne = new firebase.firestore.GeoPoint(ne.lat, ne.lon);
      // sw = new firebase.firestore.GeoPoint(sw.lat, sw.lon);
      // const distance = Location.getDistanceFromLatLonInKm(ne, sw);
      // console.log('neighbours distance =', distance)

      // firebase.firestore().collection('qLocations').get().then(querySnapshot => {
      //   querySnapshot.forEach(doc => {
      //     const data = doc.data();
      //     // firebase.firestore().collection('qLocations').doc(doc.id).update({neighbourHashes: firebase.firestore.FieldValue.delete()})
      //     // const nb = Geohash.neighbours(data.geoHash);
      //     // const geoHashes = [nb.n, nb.s, nb.e, nb.w, nb.ne, nb.se, nb.sw, nb.nw, data.geoHash];
      //     // firebase.firestore().collection('qLocations').doc(doc.id).update({geoHashes: geoHashes});
      //   })
      // })
      
      // addLocations.forEach(location => {
      //   const hash = Geohash.encode(location.lat, location.long, precision);
      //   const qloc = {name: location.name, location: new firebase.firestore.GeoPoint(location.lat, location.long), geoHash: hash};
      //   firebase.firestore().collection('qLocations').add(qloc);
      // })
    }
    componentWillUnmount() {
      this.willFocusSubscription.remove();
    }

    tPerformance = async() => {
      let t1, t2;
      // t1 = Date.now();
      // const docIds = [];
      // await firebase.firestore().collection('qLocations').get().then(querySnapshot => {
      //   querySnapshot.forEach(doc => {
      //     docIds.push(doc.id);
      //   })
      // })
      // t2 = Date.now();
      // docIds.forEach(id => {
      //   console.log(`'${id}',`);
      // })
      // console.log('read qLocations docIds took ' + (t2-t1) + ' milliseconds');
      const docIds = [
        '22OHknPzzB0Tm5ndlb9L',
        '4oonEgAMIdJ9zg1iZmAI',
        '93MtlRyMBjODDx4X9khk',
        '9EkfcX282QJsYYCeuz6a',
        'HPwjPotYnGbuzlwCTOBG',
        'SIHsee7XCNvf2padSgsZ',
        'SakN7WaDqNxghUn400W5',
        'adNGe6GD48ueOHbMFGMk',
        'dPY44FodBqXiyCw4gNCY',
        'dT3IQRhmpUk2vNH9Daor',
        'iMuet31t7WISd1CacIZs',
        'lNdeBXtljiuC5Zi0Dr3P',
        'mbg4X32ia0KQkUKl4eLq',
        'o8gun0VUiA8238zn1pGe',
        'r4dwxDQB7jYJi8ATRRTH',
      ];

      t1 = Date.now();
      await firebase.firestore().collection('qLocations').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          console.log('name =', data.name)
        })
      })
      // await MyUtils.parallelSync(docIds, async(id) => {
      //   await firebase.firestore().collection('qLocations').doc(id).get().then(doc => {
      //     const data = doc.data();
      //     console.log('name =', data.name)
      //   })
      // })
      t2 = Date.now();
      console.log('just read qLocations took ' + (t2-t1) + ' milliseconds');
      // 사이즈가 좀 크더라도 역시 한꺼번에 받는것이 낫다.
    }

    render() {
        return(
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>FCKoreanScreen</Text>
            </View>
        );
    }
}

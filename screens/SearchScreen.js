import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import SearchHeader from './SearchHeader';
import update from 'react-addons-update';
import * as firebase from 'firebase';
import 'firebase/firestore';

export default class SerachScreen extends React.Component {
    static navigationOptions = ({navigation}) => {
      const { params = {} } = navigation.state;
      console.log(params);
      let headerTitle = (
      <SearchHeader submitSearch={params.submitSearch}/>
      );
      return { headerTitle }
    };
    constructor(props) {
      super(props);
      this.state = {
        keyword: 'heart',
        stores: []
      }
      this.props.navigation.setParams({
        submitSearch: this.submitSearch
      })
    }
    submitSearch = (keyword) => {
      console.log('called submitSearch = ' + keyword);

      firebase.firestore().collection('stores')
      .orderBy('name', 'asc')
      .startAt(keyword)
      .endAt(keyword+"\uf8ff")
      .get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.setState({stores: update(this.state.stores, {$push: [{docId: doc.id, ...doc.data()}]})})
        })
      })
    }
    onPressStore = (store) => {
      console.log('docId =', store.docId);
      this.props.navigation.navigate('Detail', {storeId: store.docId, thumbPic: store.thumbTitlePic});
    }

    render() {
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
              <TouchableOpacity onPress={() => this.onPressStore(item)}>
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
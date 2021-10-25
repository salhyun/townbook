import React from 'react';
import { Text, View, Image, TouchableOpacity, Dimensions, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

const {width, height} = Dimensions.get('window');

export default class FCSingleScreen extends React.Component {
    static navigationOptions = {
        title: '1인분'
    };
    constructor(props) {
        super(props);
        this.state = {
            size: {width, height},
            stores: [
                {id: 0, name: 'MyRestaurant0', desc: 'my desc0', rating: 5, comment_count: 10, reply_count: 7},
                {id: 1, name: 'MyRestaurant1', desc: 'my desc1', rating: 5, comment_count: 10, reply_count: 7},
                {id: 2, name: 'MyRestaurant2', desc: 'my desc2', rating: 5, comment_count: 10, reply_count: 7},
                {id: 3, name: 'MyRestaurant3', desc: 'my desc3', rating: 5, comment_count: 10, reply_count: 7},
            ],
            resourceLoaded: true
        }

        this._onPressStore = this._onPressStore.bind(this);
        
        this.props.navigation.addListener(
          'willFocus', payload => {
            console.log('willFocus 1인분');
            this._addStores();
          }
        );
        this.props.navigation.addListener(
          'didBlur', payload => {
            console.log('didBlur 1인분');
          }
        );
    }

    _addStores = () => {
      const stores = this.state.stores;
      let index = stores[stores.length-1].id+1;
      let store = {id: index, name: 'MyRestaurant' + index, desc: 'my desc' + index, rating: 5, comment_count: 10, reply_count: 7};
      this.setState(prevState => ({
        stores: [...prevState.stores, store]
      }))
    }

    _onPressStore(index) {
        console.log('onPress store index = ' + index);
        this.props.navigation.navigate('Detail');
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
                          <TouchableOpacity onPress={() => this._onPressStore(item.id)}>
                            <View style={{flex: 1, flexDirection: "row", height: 80, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}>
                              <Image style={{flex: 1, width: 80, height: 80}} source={require('../../assets/images/stores/dominos_pizza_logo.jpg')}/>
                              <View style={{flex: 3, marginLeft: 24}}>
                                <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
                                  <Text style={styles.title}>{item.name}</Text>
                                  <View style={{flexDirection: "row", marginTop: 8}}>
                                    <Ionicons style={{alignSelf: 'center'}} name="ios-star" size={14} color="tomato" />
                                    <Text style={styles.desc}>3.4</Text>
                                    <Entypo style={{alignSelf: 'center'}} name={'dot-single'} size={14} color='lightgray'/>
                                    <Text style={styles.desc}>리뷰: 32</Text>
                                    <Entypo style={{alignSelf: 'center'}} name={'dot-single'} size={14} color='lightgray'/>
                                    <Text style={styles.desc}>사장님댓글: 8</Text>
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

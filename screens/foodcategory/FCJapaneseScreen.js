import React from 'react';
import { Text, View, Image, TouchableOpacity, AsyncStorage, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

export default class FCJapaneseScreen extends React.Component {
  static navigationOptions = {
    title: '쟈패니시'
  };
  constructor(props) {
    super(props);
    this.state = {
        stores: [],
        resourceLoaded: true
    }
    this._onPressStore = this._onPressStore.bind(this);
    
    this.props.navigation.addListener(
      'willFocus', payload => {
        console.log('willFocus 1인분');
      }
    );
    this.props.navigation.addListener(
      'didBlur', payload => {
        console.log('didBlur 1인분');
      }
    );
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

import React from 'react';
import { Text, View, Animated, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import MyImage from '../utilities/MyImage'

export default class ExpendableList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layoutHeight: props.expended ? null : 0
    }
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.expended) {
      this.setState(() => {
        return {
          layoutHeight: null
        }
      });
    } else {
      this.setState(() => {
        return {
          layoutHeight: 0
        }
      });
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if(this.state.layoutHeight !== nextState.layoutHeight) {
      return true;
    }
    return false;
  }
  onClickItem = (itemName) => {
    // Alert.alert(itemName);
  }

  referenceCallFromParent() {
    console.log('referenceCallFromParent');
    console.log(this.rootLayout);
  }

  render() {
    const { onClickCategory, selectMenu, expended, categoryName, categoryId, items } = this.props;
    return (
      <View style={{marginBottom: 10}} onLayout={(e) => {this.rootLayout = e.nativeEvent.layout}}>
        <TouchableOpacity activeOpacity={0.8} onPress={onClickCategory}>
          <View style={{paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, backgroundColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <Text style={{fontSize: 18, fontWeight: '500'}}>{categoryName}</Text>
            <SimpleLineIcons name={expended ? 'arrow-up' : 'arrow-down'}/>
          </View>
        </TouchableOpacity>
        <View style={{height: this.state.layoutHeight, overflow: 'hidden'}}>
          {
            items.map((item, key) => {
              return (
                //<TouchableOpacity key={key} onPress={this.onClickItem.bind(this, item.name)}>
                <TouchableOpacity key={key} onPress={selectMenu.bind(this, categoryId, item.menuRef)}>
                <View style={{height: 100, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 15, paddingRight: 15, paddingTop: 10}}>
                  <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
                    <Text style={{fontSize: 20, fontWeight: '400'}}>{item.name}</Text>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{width: 150, marginTop: 5, color: 'dimgray'}}>{item.desc}</Text>
                    <Text style={{fontSize: 18, color: '#444', fontWeight: '400', marginTop: 5}}>{item.price}원</Text>
                  </View>
                  <MyImage style={{width: 80, height: 80}} source={item.thumb}/>
                </View>
                <View style={{width: '100%', height: 1, backgroundColor: 'lightgray'}}/>
              </TouchableOpacity>
              )
            })
          }
        </View>
      </View>
    )
  }
}
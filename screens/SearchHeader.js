import React from 'react';
import { Platform, Text, View, Image, Animated, TouchableHighlight, StyleSheet } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Constants } from 'expo-constants'

export default class SearchHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: ''
    }
    // this.props.navigation.setParams({
    //   keyword: this.state.keyword
    // });
  }
  updateSearch = search => {
    this.setState({
      keyword: search
    });    
  }
  onEndEditing = search => {
    console.log('onEndEditing!! keyword = ' + this.state.keyword);
    this.props.submitSearch(this.state.keyword);
  }
  
  render() {
    const {keyword} = this.state;

    // console.log('statusBarHeight: ' + Constants.statusBarHeight);
    return(
      <View style={{backgroundColor: '#000', width: '100%'}}>
        <SearchBar
          containerStyle={{flex: 1, backgroundColor: 'white'}}
          inputContainerStyle={{backgroundColor: 'lightgray'}}
          inputStyle={{backgroundColor: 'lightgray'}}
          platform={Platform.OS === 'ios' ? 'ios' : 'android'}
          placeholder='검색어를 입력하세요'
          onChangeText={this.updateSearch}
          onEndEditing={this.onEndEditing}
          value={keyword}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});
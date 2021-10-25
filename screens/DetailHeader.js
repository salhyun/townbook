import React from 'react';
import { StyleSheet, Text, View, Image, Animated, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo';
import { ButtonGroup, Icon, Button, Rating } from 'react-native-elements';
import Colors from '../constants/Colors';

const Segmented3Buttons = (props) => {
  const { containerStyle, buttonStyle, buttonHeight, selectedIndex, titles, onPressButton} = props;
  return (
    <View style={[{width: '100%', flexDirection: 'row', justifyContent: 'center'}, containerStyle]}>
      <TouchableOpacity onPress={() => onPressButton(0)} activeOpacity={0.25} style={{width: '30%', height: buttonHeight, backgroundColor: selectedIndex === 0 ? Colors.tintColor : 'transparent', borderColor: Colors.tintOpacity,  borderWidth: 1, marginRight: -1, borderTopLeftRadius: 5, borderBottomLeftRadius: 5}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={[buttonStyle, {textAlign: 'center', color: selectedIndex === 0 ? 'white' : 'dimgray'}]}>{titles[0]}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onPressButton(1)} activeOpacity={0.25} style={{width: '30%', height: buttonHeight, backgroundColor: selectedIndex === 1 ? Colors.tintColor : 'transparent', borderColor: Colors.tintOpacity,  borderWidth: 1}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={[buttonStyle, {textAlign: 'center', color: selectedIndex === 1 ? 'white' : 'dimgray'}]}>{titles[1]}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onPressButton(2)} activeOpacity={0.25} style={{width: '30%', height: buttonHeight, backgroundColor: selectedIndex === 2 ? Colors.tintColor : 'transparent', borderColor: Colors.tintOpacity,  borderWidth: 1, marginLeft: -1, borderTopRightRadius: 5, borderBottomRightRadius: 5}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={[buttonStyle, {textAlign: 'center', color: selectedIndex === 2 ? 'white' : 'dimgray'}]}>{titles[2]}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const RatingStore = (props) => {
  const rating = Math.round(props.rating*10)/10;
  return (
    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
      <Rating imageSize={16} readonly startingValue={rating}/>
      <Text style={{marginLeft: 5, fontSize: 16, color: 'dimgray'}}>{rating <= 0 ? '평가없음' : rating.toString()}</Text>
    </View>
  )
}

export default class DetailHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTabIndex: 0,
    }
  }
  handleIndexChange = (index) => {
    this.setState({
      ...this.state,
      selectedTabIndex: index,
    });
    console.log('selectedTabIndex = ' + index + ' in DetailHeader');
    this.props.setParams({
      selectedTabIndex: index
    });
  }
  render() {
    const {params} = this.props.state;
    let changingHeight = 200, tabHeight=250, imageOpacity=1, shadowOpacity=0.8, borderWidth=0.5, ratingStore=0, storeName='unknown';
    if(params !== undefined) {
      if(params.changingHeight !== undefined) changingHeight = params.changingHeight;
      if(params.tabHeight !== undefined) tabHeight = params.tabHeight;
      if(params.imageOpacity !== undefined) imageOpacity = params.imageOpacity;
      if(params.shadowOpacity !== undefined) shadowOpacity = params.shadowOpacity;
      if(params.borderWidth !== undefined) borderWidth = params.borderWidth;
      if(params.storeName !== undefined) storeName = params.storeName;
      if(params.ratingStore !== undefined) ratingStore = params.ratingStore;
      if(params.titlePic !== undefined) titlePic = params.titlePic;
    }
    const borderStyle = Platform.OS === 'ios' ? {shadowOpacity: shadowOpacity, ...styles.iosStyle} : {borderWidth: borderWidth, ...styles.androidStyle};

    return(
      <Animated.View style={{
        height: changingHeight,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#fff',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
      }}>
      {
        params.titlePic === undefined ? <View></View>
        :
        <Animated.Image style={{position: 'absolute', width: '100%', height: '99%', opacity: imageOpacity }} source={{uri: titlePic}}/>
      }
        <Animated.View style={{width: '100%', height: tabHeight, flexDirection: 'column-reverse', alignItems: 'center'}}>
          <Animated.View style={{flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '80%', height: 100, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: '#fff', ...borderStyle}}>
            <Animated.Text style={{fontSize: 28, fontWeight: 'bold', marginTop: 3}}>{storeName}</Animated.Text>
            <RatingStore rating={ratingStore}/>
            <Segmented3Buttons containerStyle={{marginTop: 5, marginBottom: 10}} buttonStyle={{fontSize: 14}} buttonHeight={28} selectedIndex={this.state.selectedTabIndex} titles={['메뉴', '리뷰', '정보']} onPressButton={this.handleIndexChange}/>
          </Animated.View>
        </Animated.View>
        <View style={{position: 'absolute', left: 0, top: 20}}>
          <Button type='clear' icon={<Icon name='close' size={30} color='black'/>} onPress={() => this.props.goBack(null)}/>
        </View>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  iosStyle: {
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowRadius: 2
  },
  androidStyle: {
    borderColor: 'dimgray'
  }
})
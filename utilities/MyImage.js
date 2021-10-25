import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements'

export default MyImage = (props) => {
  const { style, resizeMode, source, opacity=1.0 } = props;
  const asset = typeof source === 'number' ? true : false;
  if(asset) {
    return (
      <Image style={{...style}} resizeMode={resizeMode} source={source} opacity={opacity} PlaceholderContent={<ActivityIndicator/>}/>
    )
  } else {
    return (
      <Image style={{...style}} resizeMode={resizeMode} source={{uri: source}} opacity={opacity} PlaceholderContent={<ActivityIndicator/>} />
      // <View style={{...style}}>
      //   {/* <Image style={{position: 'absolute', left: 0, right: 0, width: '100%', height: '100%'}} resizeMode={resizeMode} source={require('../assets/images/loading.gif')} /> */}
      //   {/* <Image style={{width: '100%', height: '100%'}} resizeMode={resizeMode} source={{uri: source, cache: 'force-cache'}} /> */}
      //   <Image style={{...imageStyle, width: '100%', height: '100%'}} resizeMode={resizeMode} source={{uri: source}} PlaceholderContent={<ActivityIndicator/>} />
      // </View>
    )
  }  
}
import React from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, StatusBar, Platform } from 'react-native';
import Constants from 'expo-constants';
import Layout from '../constants/Layout'
import * as Icon from '@expo/vector-icons'
import Carousel from 'react-native-looped-carousel';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Button } from 'react-native-elements';

export default class ImageViewPagerScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('statusBarHeight =', Constants.statusBarHeight);
    this.statusBarHeight = Constants.statusBarHeight;

    const { width, height } = Layout.window;
    this.state = {
      size: {width, height},
      initialPage: 0,
      images: []
    }
  }
  componentDidMount() {
    const index = this.props.navigation.getParam('index', undefined);
    if(index !== undefined) {
      this.setState({initialPage: index}, () => {
        const images = this.props.navigation.getParam('images', undefined);
        if(images !== undefined) {
          this.setState({images: images});
          this.props.navigation.setParams({images: undefined});
        }
      });
      this.props.navigation.setParams({index: undefined});
    }
  }

  render() {
    const images = this.state.images;
    return(
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <StatusBar barStyle = "light-content" hidden = {false} backgroundColor = "#00BCD4" translucent = {true} networkActivityIndicatorVisible = {true} />
        <View style={{height: this.statusBarHeight, backgroundColor: 'black'}} />
        <TouchableOpacity style={{backgroundColor: 'black', alignSelf: 'flex-start', margin: 10}} onPress={() => {this.props.navigation.goBack()}}>
          <Icon.AntDesign name='close' size={28} color='white' />
        </TouchableOpacity>
      {
        images.length <= 0 ? null
        :
        <Carousel autoplay={false} style={this.state.size} currentPage={this.state.initialPage}
          arrows
          leftArrowText={'<'}
          leftArrowStyle={{color: 'white', fontSize: 28, fontWeight: 'bold', margin: 10, opacity: 0.65}}
          rightArrowText={'>'}
          rightArrowStyle={{color: 'white', fontSize: 28, fontWeight: 'bold', margin: 10, opacity: 0.65}}>
        {
          images.map((image, index) => {
            return (
              <View key={index} style={[{backgroundColor: 'black'}, this.state.size]}>
                <Image style={{flex: 1, width: undefined, height: undefined}} resizeMode='contain' source={{uri: image.imageURL}} PlaceholderContent={<ActivityIndicator/>}/>
              </View>
            )
          })
        }
        </Carousel>
      }
      </View>
    );
  }
}
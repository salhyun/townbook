import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, FlatList } from 'react-native';
import { Button, Input, SearchBar, Divider } from 'react-native-elements';
import update from 'react-addons-update';
import * as Icon from '@expo/vector-icons'
import Layout from '../constants/Layout';
import Geohash from 'latlon-geohash';
import proj4 from 'proj4';

export default class SearchAddressScreen extends React.Component {
  static navigationOptions = {
      title: '도로명 주소 찾기'
  };

  constructor(props) {
    super(props);

    this.state = {
      keyword: '',
      totalCount: "0",
      addresses: []
    }
    this.currentPage = 1;
    this.countPerPage = 12;
  }

  componentDidMount() {
    const routeName = this.props.navigation.getParam('prevRouteName', '');
    if(routeName.length > 0) {
      this.prevRouteName = routeName;
      this.props.navigation.setParams({prevRouteName: ''});
    }

    const item = {admCd: '1144012700', rnMgtSn: '114403113012', udrtYn: '0', buldMnnm: '301', buldSlno: '0'};
    this.getLocationFromAddress(item, 'U01TX0FVVEgyMDE5MDgwNzE3MzQzOTEwODkzNDg=');
    const wgs84 = this.UTMKtoWGS84([945959.0381341814, 1953851.7348996028]);
    console.log('wgs84 =', wgs84);
  }
  UTMKtoWGS84 = (point) => {
    const firstProjection = "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"; //from
    const secondProjection = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
    return proj4(firstProjection, secondProjection, point);
  }
  getLocationFromAddress = async(item, apikey) => {
    let host = 'http://www.juso.go.kr/addrlink/addrCoordApi.do?';
    host += 'confmKey=' + apikey;
    host += '&admCd=' + item.admCd;
    host += '&rnMgtSn=' + item.rnMgtSn;
    host += '&udrtYn=' + item.udrtYn;
    host += '&buldMnnm=' + item.buldMnnm;
    host += '&buldSlno=' + item.buldSlno;
    host += '&resultType=json';
    console.log(host);
    return await fetch(host).then(response => response.json())
    .then(responseJson => {
      if(responseJson.results !== undefined) {
        console.log('getLocationFromAddress results =', responseJson.results);
        // location = [responseJson.results.juso[0].entX, responseJson.results.juso[0].entY];
        return [parseFloat(responseJson.results.juso[0].entX) , parseFloat(responseJson.results.juso[0].entY)];
      }
    }).catch(error => {console.error('getLocationFromAddress error =', error);})
  }

  searchAddress = (currentPage, countPerPage, apikey) => {
    //http://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=1&countPerPage=10&keyword=달구벌대로1960&confmKey=U01TX0FVVEgyMDE5MDcxODE2NTkyOTEwODg5NTY=
    let host = 'http://www.juso.go.kr/addrlink/addrLinkApi.do?';
    host += 'currentPage=' + currentPage + '&countPerPage=' + countPerPage + '&';
    host += 'confmKey=' + apikey + '&';
    host += 'resultType=json&';
    host += 'keyword=' + this.state.keyword;
    console.log(host);
    fetch(host).then(response => response.json())
    .then(responseJson => {
      if(responseJson.results !== undefined) {
        const totalCount = responseJson.results.common.totalCount;
        if(totalCount > 0) {
          responseJson.results.juso.forEach(element => {
            const address = {zipNo: element.zipNo, roadAddr: element.roadAddr, jibunAddr: element.jibunAddr, siNm: element.siNm, sggNm: element.sggNm, admCd: element.admCd, rnMgtSn: element.rnMgtSn, udrtYn: element.udrtYn, buldMnnm: element.buldMnnm, buldSlno: element.buldSlno};
            this.setState({addresses: update(this.state.addresses, {$push: [address]})})
          });
        }
      }
    })
    .catch(error => {console.error('onPressSearch error =', error);})
  }
  reachedEndScroll = () => {
    console.log('reached end of scroll');
    ++this.currentPage;
    this.searchAddress(this.currentPage, this.countPerPage, 'U01TX0FVVEgyMDE5MDcxODE2NTkyOTEwODg5NTY=');
  }
  updateKeyword = keyword => {
    this.setState({keyword: keyword})
  }
  onEndEditing = event => {
    this.currentPage = 1;
    this.setState({addresses: []})
    this.searchAddress(this.currentPage, this.countPerPage, 'U01TX0FVVEgyMDE5MDcxODE2NTkyOTEwODg5NTY=');
  }
  onPressAddress = async(item) => {
    console.log(item);
    if(this.prevRouteName !== undefined) {
      let location = await this.getLocationFromAddress(item, 'U01TX0FVVEgyMDE5MDgwNzE3MzQzOTEwODkzNDg=');
      location = this.UTMKtoWGS84(location);
      const hash = Geohash.encode(location[1], location[0], 5);
      let nb = Geohash.neighbours(hash);
      const geoHashes = [nb.n, nb.s, nb.e, nb.w, nb.ne, nb.se, nb.sw, nb.nw, hash];
      const juso = {address1: item.roadAddr, city: item.siNm, district: item.sggNm, location: location, geoHashes: geoHashes};
      this.props.navigation.navigate(this.prevRouteName, {juso: juso});
    }
  }

  render() {
    return(
      <View style={{flex: 1}}>
        <View style={{marginTop: 10}}>
          <SearchBar
            containerStyle={{backgroundColor: 'white'}}
            platform={Platform.OS === 'ios' ? 'ios' : 'android'}
            onChangeText={this.updateKeyword}
            onEndEditing={this.onEndEditing}
            value={this.state.keyword} placeholder='주소를 입력하세요'/>
        </View>
        <Divider/>
        <View>
          <FlatList data={this.state.addresses} keyExtractor={(item, index) => {return index.toString()}} onEndReachedThreshold={1} onEndReached={this.reachedEndScroll}
            renderItem={({item}) => {
              return (
                <View>
                  <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16}} onPress={this.onPressAddress.bind(this, item)}>
                    <View>
                      <Text style={{fontSize: Layout.defaultFontSize}}>{item.roadAddr}</Text>
                      <Text style={{fontSize: 15, color: 'dimgray', marginTop: 2}}>지번: {item.jibunAddr}</Text>
                    </View>
                    <Icon.AntDesign name='right' style={{color: 'dimgray'}}/>
                  </TouchableOpacity>
                  <Divider/>
                </View>
              )
          }}/>
        </View>
      </View>
    );
  }
}

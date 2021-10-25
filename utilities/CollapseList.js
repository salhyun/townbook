import React from 'react';
import { Text, View, Animated, TouchableHighlight, StyleSheet } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';

export default class CollapseList extends React.Component {
  attributes = {
    height: new Animated.Value(),
    expended: false,
    mininumHeight: 0,
    contentHeight: 0
  }
  constructor(props) {
    super(props);
    this.initialize = this.initialize.bind(this);
    this.toggle = this.toggle.bind(this);
    this.attributes.expended = props.expended;
  }
  
  initialize(e) {
    if(this.attributes.contentHeight <= this.attributes.mininumHeight) {
      this.attributes.contentHeight = e.nativeEvent.layout.height;
      this.attributes.height.setValue(this.attributes.expended ? this.attributes.contentHeight : this.attributes.mininumHeight);
      console.log('initialize attribute');
      console.log(this.attributes.height);
    }
  }
  toggle() {
    Animated.timing(this.attributes.height, {
      toValue: this.attributes.expended ? this.attributes.mininumHeight : this.attributes.contentHeight,
      duration: 300,
    }).start();
    this.attributes.expended = !this.attributes.expended;
    console.log('toggle expended = ' + this.attributes.expended);
  }

  render() {
    return (
      <View style={styles.collapseContainer}>
        <View style={{width: '100%', backgroundColor: 'lightgray'}}>
          <TouchableHighlight underlayColor='transparent' onPress={this.toggle}>
            <View style={styles.collapseTitle}>
              <Text style={{fontSize: 18}}>{this.props.title}</Text>
              <SimpleLineIcons name='arrow-down'/>
            </View>
          </TouchableHighlight>
        </View>
        <Animated.View style={{height: this.attributes.height}} onLayout={this.initialize}>
          {this.props.children}
        </Animated.View>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  collapseContainer: {
    flex: 1,
  },
  collapseTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10, marginRight: 10,
  },
});

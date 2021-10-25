import React from 'react';
import { Text, View, Image, Animated, LayoutAnimation, Platform, UIManager, ScrollView, AsyncStorage, ActivityIndicator, TouchableOpacity } from 'react-native';
import update from 'react-addons-update';
import ExpendableList from '../utilities/ExpendableList';
import { Rating, Divider } from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Layout from '../constants/Layout'
import MyUtils from '../utilities/MyUtils'


const RatingStore = (props) => {
  const {rating} = props;
  return (
    <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-start'}}>
      <Rating imageSize={14} readonly startingValue={rating}/>
      <Text style={{marginLeft: 5, fontSize: 14, color: 'dimgray'}}>{rating}</Text>
    </View>
  )
}
const MenuView = (props) => {
  const {children, index} = props;
  if(index == 0) {
    return (
      <View style={{flex: 1}}>
        {children}
      </View>
    )
  } else {
    return null;    
  }
}
const ReviewView = (props) => {
  const {children, index} = props;
  if(index == 1) {
    return (
      <View style={{flex: 1}}>
        {children}
      </View>
    )
  } else {
    return null;    
  }
}
const InfoView = (props) => {
  const {children, index} = props;
  if(index == 2) {
    return (
      <View style={{flex: 1}}>
        {children}
      </View>
    )
  } else {
    return null;    
  }
}

const StoreItemView = (props) => {
  const { title, content } = props;
  return (
    <View style={{flexDirection: 'row', paddingTop: 20, alignItems: 'flex-end'}}>
      <View style={{flex: 2}}>
      {
        title.split('\n').map((line, index) => {
          return (<Text key={index} style={{color: 'dimgray', fontSize: 16}}>{line}</Text>)
        })
      }
      </View>
      <View style={{flex: 5}}>
        <Text style={{fontSize: 16}}>{content}</Text>
      </View>
    </View>
  )
}

export default class DetailScreen extends React.Component {
    constructor(props) {
      super(props);
      if(Platform.OS === 'android') {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }

      const menus = [
        {
          expended: true,
          categoryName: 'Mobility',
          items: [
            {id: 1, name: 'Mi', price: '5,000원'}, {id: 2, name: 'ReadMe', price: '5,000원'}, {id: 3, name: 'Infinix', price: '5,000원'}, {id: 4, name: 'Oppa', price: '5,000원'}
          ]
        },
        {
          expended: true,
          categoryName: 'Laptops',
          items: [
            {id: 5, name: 'Dell', price: '5,000원'}, {id: 6, name: 'Mac', price: '5,000원'}, {id: 7, name: 'ASUS', price: '5,000원'}, {id: 8, name: 'ASRock', price: '5,000원'}
          ]
        },
        {
          expended: true,
          categoryName: '밥류',
          items: [
            {id: 9, name: '뽁음밥', price: '5,000원'}, {id: 10, name: '짬뽕밥', price: '5,000원'}, {id: 11, name: '야끼밥', price: '5,000원'}, {id: 12, name: '잡채밥', price: '5,000원'}
          ]
        },
      ];

      const reviews = [
        {
          id: 1, userName: 'wkhoml', avatar: 'address', rating: '3.5', comment: 'This is comment. 잘먹었냐? 맛있냐? 배부르냐? 좋냐? 또 먹을래? '
        },
      ]

      for(let i=2; i<7; i++) {
        let comment = {id: i, userName: 'wkhoml_' + i, avatar: 'address', rating: '3.5', comment: 'This is comment. 잘먹었냐? 맛있냐? 좋냐?'};
        reviews.push(comment);
      }

      this.queryReviews = {
        field: 'date',
        direction: 'desc',
        startAfter: new Date(),
        limit: 12,
        queryCount: 0
      };

      this.state = {
        // scrollY: new Animated.Value(0),
        loadingStore: true,
        loadingMenus: true,
        loadingReviews: true,
        refreshingReviews: true,
        dummies: [{id: 0, name: 'motalCombat-0'}],
        categories: [],
        reviews: [],
        storeInfo: {}
      }
      this.state.reviews.forEach((item) => {
        console.log('itemName = ' + item.userName);
      })

      // console.log('Categories start!!');
      // const array = [...this.state.categories];
      // array.map((category, index) => {
      //   console.log('[' + index + ']' + 'categoryName = ' + category.categoryName + ', expended = ' + category.expended);
      // })
      // console.log('categoryName = ' + array[1]['categoryName']);

      const headerLength = 65;//70; 112;
      this.scrollY = new Animated.Value(0);
      this.scrollY.addListener(value => {
        this.scrollYValue = value.value;
      })
      this.changingHeight = this.scrollY.interpolate({
        inputRange: [0, headerLength],
        outputRange: [200, 200-headerLength],
        extrapolate: 'clamp'
      });
      this.tabHeight = this.scrollY.interpolate({
        inputRange: [0, headerLength],
        outputRange: [ Platform.OS === 'ios' ? 250 : 220, 200-headerLength-5],
        extrapolate: 'clamp'
      });
      this.imageOpacity = this.scrollY.interpolate({
        inputRange: [0, headerLength/2, headerLength*0.75, headerLength],
        outputRange: [1, 0.75, 0.5, 0],
        extrapolate: 'clamp'
      });
      this.shadowOpacity = this.scrollY.interpolate({
        inputRange: [0, headerLength],
        outputRange: [0.8, 0],
        extrapolate: 'clamp'
      });
      this.borderWidth = this.scrollY.interpolate({
        inputRange: [0, headerLength],
        outputRange: [0.5, 0],
        extrapolate: 'clamp'
      });
      this.props.navigation.setParams({
        changingHeight: this.changingHeight,
        tabHeight: this.tabHeight,
        imageOpacity: this.imageOpacity,
        shadowOpacity: this.shadowOpacity,
        borderWidth: this.borderWidth,
        storeName: 'PizzaHut',
        ratingStore: 0
      });

      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        payload => {
          const storeId = this.props.navigation.getParam('storeId', '');
          if(storeId.length > 0) {
            this.storeId = storeId;
            console.log('DetailScreen storeId =', this.storeId)
            const storeRef = firebase.firestore().collection('stores').doc(this.storeId);
            storeRef.get().then(doc => {
              if(doc.exists) {
                const data = doc.data();
                this.props.navigation.setParams({storeName: data.name, ratingStore: data.ratingCount > 0 ? data.totalRating/data.ratingCount : 0, titlePic: data.titlePic});
                // this.handleStoreInfo(data);
                this.setState({storeInfo: data, loadingStore: false}, () => {
                  console.log('Detail storeInfo =', this.state.storeInfo);
                  this.handleReviews(this.queryReviews);
                  try {
                    AsyncStorage.setItem('detailStoreInfo', JSON.stringify(this.state.storeInfo));
                  } catch (error) {console.error('AsyncStorage error =', error);}
                });
              }
            })
            storeRef.collection('menuCategories').get().then(categorySnapshot => {
              categorySnapshot.forEach(categoryDoc => {
                const data = categoryDoc.data();
                let category = {id: data.id, expended: true, categoryName: data.name, items: []};
                categoryDoc.ref.collection('menus').get().then(menuSnapshot => {
                  menuSnapshot.forEach(menuDoc => {
                    let data = menuDoc.data();
                    data.menuRef = menuDoc.ref;
                    category.items.push(data);
                  })
                  this.setState({categories: update(this.state.categories, {$push: [category]})}, () => {
                    if(this.state.loadingMenus === true) {
                      this.setState({loadingMenus: false})
                    }
                  })
                })
              })
            })
            this.props.navigation.setParams({storeId: ''});
          }
        }
      )
    }
    componentWillMount() {
      this.addDummies();
    }
    componentDidMount() {
    }
    componentWillUnmount() {
      this.willFocusSubscription.remove();
    }
    handleReviews = (queryReviews) => {
      firebase.firestore().collection('reviews')
      .where('to', '==', this.storeId)
      .orderBy(queryReviews.field, queryReviews.direction)
      .startAfter(queryReviews.startAfter)
      .limit(queryReviews.limit)
      .get().then(querySnapshot => {
        if(querySnapshot.size > 0) {
          let count=0;
          querySnapshot.forEach((reviewDoc) => {
            const reviewData = reviewDoc.data();
            firebase.firestore().collection('users').doc(reviewData.from).get().then(userDoc => {
              if(userDoc.exists) {
                const userData = userDoc.data();
                const review = {
                  userName: userData.nickName,
                  userAvatar: {uri: userData.avatar},
                  date: reviewData.date,
                  rating: reviewData.rating,
                  contents: reviewData.contents,
                  images: reviewData.images
                };
                console.log('review =', review)
                const reviews = [];
                for(let i=0; i<6; i++) {
                  reviews.push(review);
                }
                this.setState({reviews: update(this.state.reviews, {$push: [review]})}, () => {
                  if(++count === querySnapshot.size) {
                    this.updateQueryReviews(this.state.reviews[this.state.reviews.length-1]);
                  }
                })
              }
            })
          })
        } else {
          this.reviewsDidLoading();
        }
      }).catch(error => {
        console.log('error getting document =', error);
      })
    }
    updateQueryReviews = (lastDoc) => {
      //데이타 다 받고 난 뒤에 쿼리하는 날짜 업데이트 하고 loading 관련 상태 업데이트 한다.
      this.queryReviews.startAfter = lastDoc.date.toDate();
      if(this.state.refreshingReviews === true) {
        this.reviewsDidLoading();
      }
    }
    reviewsDidLoading = () => {
      this.setState({refreshingReviews: false, loadingReviews: false}, () => {
        console.log('reviewsDidLoading');
      });
    }
    onEndReachedReviews = () => {
      console.log('onEndReachedReviews');
      this.setState({loadingReviews: true}, () => {
        this.handleReviews(this.queryReviews);
      })
    }
    onRefreshReviews = () => {
      console.log('onRefreshReviews');
      this.queryReviews.startAfter = new Date();
      this.queryReviews.queryCount = 0;
      this.setState({refreshingReviews: true, loadingReviews: true, reviews: []}, () => {
        this.handleReviews(this.queryReviews);
      });
    }

    addDummies = () => {
      const dummies = this.state.dummies;
      let index = dummies[dummies.length-1].id+1;
      for(let i=index; i<10; i++) {
        let dummy = {id: i, name: 'motalCombat-' + i};
        this.setState(prevState => ({
          dummies: [...prevState.dummies, dummy]
        }))
      }
    }

    updateLayout = (index) => {
      console.log('updateLayout');
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const categories = [...this.state.categories];
      categories[index]['expended'] = !categories[index]['expended'];
      this.setState(() => {
        return {
          categories: categories
        }
      });
      // console.log(this.child.rootLayout);
      // console.log(this.scrollY);
      // this.child.referenceCallFromParent();
      // this.scroll.scrollTo({y: (this.child.rootLayout.y < this.contentHeight) ? this.child.rootLayout.y : this.contentHeight, animated: true});
    }

    selectMenu = (categoryId, menuRef) => {
      this.props.navigation.navigate('Ordering', {menuRef: menuRef, storeId: this.storeId});
    }
    handleScrollEnd = () => {
      if(this.state.reviews.length > 0 && this.scrollYValue > 0) {
        const copyReview = this.state.reviews[this.state.reviews.length-1];
        this.setState({reviews: update(this.state.reviews, {$push: [copyReview]})}, () => {
          console.log('add copyReview scrollY =', this.scrollYValue);
        });
      }
    }
    pressImages = (images, index) => {
      this.props.navigation.navigate('ImageViewPager', {images: images, index: index});
    }

    render() {
      const dummies = this.state.dummies;
      const storeInfo = this.state.storeInfo;
      const loadingStore = this.state.loadingStore;
      let selectedTabIndex = 0;
      const {params} = this.props.navigation.state;
      if(params !== undefined && params.selectedTabIndex !== undefined) {
        console.log('selectedTabIndex = ' + params.selectedTabIndex + ' in render by DetailScreen');
        selectedTabIndex = params.selectedTabIndex;
      }
      return(
        <View style={{flex: 1}}>
          <ScrollView
            ref={(c) => {this.scroll = c}}
            style={{flex: 1, backgroundColor: '#fff'}}
            onContentSizeChange={(contentHeight) => {this.contentHeight = contentHeight}}
            scrollEventThrottle={16}
            onScroll={Animated.event([{nativeEvent: {contentOffset: {y: this.scrollY}}}])}
            onMomentumScrollEnd={this.handleScrollEnd}
            >
            <View style={{height: 250}}/>
            <MenuView index={selectedTabIndex}>
            {
              this.state.loadingMenus ? <ActivityIndicator style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} size='large' />
              :
              <View>
              {
                this.state.categories.map((category, index) => {
                  return (
                    //<Text key={index}>{category.categoryName}</Text>
                    <ExpendableList onRef={ref => (this.child = ref)} key={index} onClickCategory={this.updateLayout.bind(this, index)} selectMenu={this.selectMenu} expended={category.expended} categoryName={category.categoryName} categoryId={category.id} items={category.items}/>
                  )
                })
              }
              </View>
            }
            </MenuView>
            <ReviewView index={selectedTabIndex}>
            {
              this.state.loadingReviews ? <ActivityIndicator style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} size='large' />
              :
              <View style={{flex: 1}}>
                {
                  this.state.reviews.map((item, reviewIndex) => {
                    return (
                      <View key={reviewIndex} style={{flex: 1, paddingTop: 7, paddingLeft: 10, paddingRight: 10}}>
                        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', marginBottom: 7}}>
                          <View style={{flex: 1, flexDirection: 'row'}}>
                            <Image style={{width: 40, height: 40}} resizeMode='contain' source={item.userAvatar} PlaceholderContent={<ActivityIndicator/>}/>
                            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', marginLeft: 4}}>
                              <View style={{flex: 1, flexDirection: 'row', alignItems: 'baseline'}}>
                                <Text style={{fontSize: 16, fontWeight: '400'}}>{item.userName}님</Text>
                                <Text style={{marginLeft: 5, color: 'dimgray'}}>{MyUtils.getDateString(item.date.toDate())}</Text>
                              </View>
                              <RatingStore rating={parseFloat(item.rating)}/>
                            </View>
                          </View>
                          {
                            item.images.length <= 0 ? null
                            :
                            <View style={{flexDirection: 'row', marginVertical: 5}}>
                            {
                              item.images.map((image, imageIndex) => {
                                return (
                                  <TouchableOpacity key={imageIndex} style={{marginHorizontal: 1}} onPress={this.pressImages.bind(this, item.images, imageIndex)}>
                                    <Image style={{width: Layout.window.width/3, height: 80}} resizeMode='cover' source={{uri: image.thumbURL}} PlaceholderContent={<ActivityIndicator/>}/>
                                  </TouchableOpacity>
                                )
                              })
                            }
                            </View>
                          }
                          <Text style={{fontSize: 15, color: 'dimgray', marginTop: 5}}>{item.contents}</Text>
                        </View>
                        <View style={{borderBottomColor: 'lightgray', borderBottomWidth: 1}}/>
                      </View>
                    )
                  })
                }
              </View>
            }
            </ReviewView>
            <InfoView index={selectedTabIndex}>
            {
              this.state.loadingStore ? <View></View>
              :
              <View>
                <View style={{paddingHorizontal: 16}}>
                  <Text style={{fontSize: 18, fontWeight: '400', marginBottom: 5}}>업체정보</Text>
                  <Divider/>
                  <StoreItemView title='카테고리' content={this.state.storeInfo.category}/>
                  <StoreItemView title='영업시간' content={MyUtils.getNoonTime(this.state.storeInfo.openTime) + ' - ' + MyUtils.getNoonTime(this.state.storeInfo.closeTime)}/>
                  <StoreItemView title='전화번호' content={this.state.storeInfo.phoneNumber}/>
                  <StoreItemView title='주소' content={this.state.storeInfo.address1 + ' ' + this.state.storeInfo.address2}/>
                  <StoreItemView title='설명' content={this.state.storeInfo.desc}/>
                </View>
                <View style={{paddingHorizontal: 16, marginTop: 30}}>
                  <Text style={{fontSize: 18, fontWeight: '400', marginBottom: 5}}>결재정보</Text>
                  <Divider/>
                  <StoreItemView title='최소금액' content={MyUtils.toLocaleString(this.state.storeInfo.minimum) + '원'}/>
                  <StoreItemView title='결재수단' content={this.state.storeInfo.payment}/>
                </View>
              </View>
            }
            </InfoView>
          </ScrollView>
        </View>
      );
    }
}

import React from 'react';
import { createStackNavigator, createAppContainer} from 'react-navigation';

import BottomTabNavigator from '../navigation/BottomTabNavigator'
import PaymentNavigator from '../navigation/PaymentNavigator';
import SignupScreen from '../screens/SignupScreen';
import ForgotpasswordScreen from '../screens/ForgotpasswordScreen'
import SigninScreen from '../screens/SigninScreen';
import SearchAddressScreen from '../screens/SearchAddressScreen';
import SendEmailVerificationScreen from '../screens/SendEmailVerificationScreen';
import AuthPhoneScreen from '../screens/AuthPhoneScreen';
import CompleteOrderScreen from '../screens/CompleteOrderScreen'
import MyOrderDetailScreen from '../screens/MyOrderDetailScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import ImageViewPagerScreen from '../screens/ImageViewPagerScreen';

const MainStack = createStackNavigator({
  Home: {
    screen: BottomTabNavigator,
    navigationOptions: {
        header: null
    }
  },    
  Payment: {
    screen: PaymentNavigator,
    navigationOptions: {
        header: null
    }
  },
});
const RootStack = createStackNavigator(
  {
    MainStack: {
      screen: MainStack,
      navigationOptions: {
        header: null
      }
    },
    Signin: {
      screen: SigninScreen,
    },
    Signup: {
      screen: SignupScreen
    },
    Forgotpassword: {
      screen: ForgotpasswordScreen
    },
    SearchAddress: {
      screen: SearchAddressScreen
    },
    SendEmailVerification: {
      screen: SendEmailVerificationScreen
    },
    AuthPhone: {
      screen: AuthPhoneScreen
    },
    MyOrderDetail: {
      screen: MyOrderDetailScreen
    },
    CompleteOrder: {
      screen: CompleteOrderScreen
    },
    WriteReview: {
      screen: WriteReviewScreen
    },
    ImageViewPager: {
      screen: ImageViewPagerScreen,
      navigationOptions: {
        header: null
      }
    }
  },
  {
    mode: 'modal',
    // headerMode: 'none'
  }
);

export default createAppContainer(RootStack)

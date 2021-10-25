import React from 'react';
import { createStackNavigator, StackNavigator} from 'react-navigation';

import DetailScreen from '../screens/DetailScreen';
import PaymentScreen from '../screens/PaymentScreen'
import DetailHeader from '../screens/DetailHeader';
import OrderingScreen from '../screens/OrderingScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';

export default createStackNavigator({
    // Detail: DetailScreen,
    Detail: {
      screen: DetailScreen,
      navigationOptions: ({navigation, screenProps}) => {
        return {
          header: <DetailHeader {...navigation} {...screenProps}/>,
        }
      }
    },
    Ordering: OrderingScreen,
    OrderDetail: OrderDetailScreen,
    Payment: PaymentScreen,
});

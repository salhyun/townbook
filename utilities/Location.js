import Geohash from 'latlon-geohash';
import Vector2 from './Vector2'
import * as firebase from 'firebase';

export default {
  getDistanceFromLatLonInKm: (location1, location2) => {
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(location2._lat-location1._lat);  // deg2rad below
    var dLon = deg2rad(location2._long-location1._long);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(location1._lat)) * Math.cos(deg2rad(location2._lat)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
  },
  getBoundary: (lat, long, dist, precision=5) => {
     //0.01 => 2.02410474527064
    //0.02 => 4.048209454966239
    //0.03 => 6.072314093511747
    //0.04 => 8.09641862533334
    dist *= 0.004940455785880248;//0.01/2.02410474527064

    const hash = Geohash.encode(lat, long, precision);
    const bounds = Geohash.bounds(hash);
    const slopeNE = new Vector2(bounds.ne.lat-bounds.sw.lat, bounds.ne.lon-bounds.sw.lon).normalize();
    const slopeSW = new Vector2(-slopeNE.x, -slopeNE.y);
    const location = new Vector2(lat, long);
    const ne = location.add(slopeNE.multiply(dist));
    const sw = location.add(slopeSW.multiply(dist));
    // return {ne: {lat: floor6(ne.x), long: floor6(ne.y)}, sw: {lat: floor6(sw.x), long: floor6(sw.y)}};
    return {ne: new firebase.firestore.GeoPoint(ne.x, ne.y), sw: new firebase.firestore.GeoPoint(sw.x, sw.y)};
  }
}
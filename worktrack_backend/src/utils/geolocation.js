const { OFFICE_COORDS, OFFICE_RADIUS_METERS } = require('../config/constants');

const EARTH_RADIUS_METERS = 6371000;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine distance between two lat/lng points, in meters.
 */
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Verify a check-in coordinate is within the allowed radius of
 * the Ikorodu Local Government Secretariat.
 */
function verifyOfficeLocation(lat, lng) {
  if (lat === undefined || lat === null || lng === undefined || lng === null) {
    return { verified: false, distance: null, reason: 'no_coordinates' };
  }

  const distance = haversineDistanceMeters(
    lat,
    lng,
    OFFICE_COORDS.latitude,
    OFFICE_COORDS.longitude
  );

  return {
    verified: distance <= OFFICE_RADIUS_METERS,
    distance: Math.round(distance * 100) / 100,
    reason: distance <= OFFICE_RADIUS_METERS ? 'within_radius' : 'outside_radius',
  };
}

module.exports = { haversineDistanceMeters, verifyOfficeLocation };

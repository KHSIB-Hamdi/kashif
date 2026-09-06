import axios from 'axios';
import * as settings from '../../settings';
export const SET_ALERT_COUNT = 'SET_ALERT_COUNT';
export const SET_ALERTS = 'SET_ALERTS';

export const setAlertCount = (count) => ({
  type: SET_ALERT_COUNT,
  payload: count,
});

export const setAlerts = (alerts) => ({
  type: SET_ALERTS,
  payload: alerts,
});

export const fetchAlerts = () => async (dispatch) => {
  try {
    const response = await axios.get(`${settings.API_SERVER}/api/alerts/`); 
    dispatch(setAlerts(response.data));
    dispatch(setAlertCount(response.data.length));
  } catch (error) {
    console.error('Error fetching alerts:', error);
  }
};
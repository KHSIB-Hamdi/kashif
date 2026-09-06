import { SET_ALERT_COUNT } from './alertActions';
import { SET_ALERTS } from './alertActions';

const initialState = {
  alertCount: 0,
  alerts:[]
};

const alertReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ALERT_COUNT:
      return {
        ...state,
        alertCount: action.payload,
      };
      case SET_ALERTS:
        return {
          ...state,
          alerts: action.payload,
        };
    default:
      return state;
      
  }
};

export default alertReducer;
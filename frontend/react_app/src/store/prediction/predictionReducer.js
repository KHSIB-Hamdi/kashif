import {
    PREDICTION_REQUEST,
    PREDICTION_SUCCESS,
    PREDICTION_FAILURE,
  } from './predictionActions';


  const initialState = {
    loading: false,
    result: null,
    error: null,
  };
  
  const predictionReducer = (state = initialState, action) => {
    switch (action.type) {
      case PREDICTION_REQUEST:
        return { ...state, loading: true, error: null };
  
      case PREDICTION_SUCCESS:
        return { ...state, loading: false, result: action.payload };
  
      case PREDICTION_FAILURE:
        return { ...state, loading: false, error: action.payload };
  
      default:
        return state;
    }
  };

export default predictionReducer;
import axios from 'axios';
import * as settings from '../../settings';

// Action Types
export const PREDICTION_REQUEST = 'PREDICTION_REQUEST';
export const PREDICTION_SUCCESS = 'PREDICTION_SUCCESS';
export const PREDICTION_FAILURE = 'PREDICTION_FAILURE';


export const predictTransaction = (transaction, modelName) => async (dispatch) => {
    try {
      dispatch({ type: PREDICTION_REQUEST });
  
      // NOTE: the backend does not currently implement POST /api/predict --
      // only the Random Forest ETL pipeline exists. See docs/AUDIT.md (C6).
      const response = await axios.post(
        `${settings.API_SERVER}/api/predict?model=${modelName}`, transaction, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      dispatch({
        type: PREDICTION_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: PREDICTION_FAILURE,
        payload: error.message,
      });
    }
  };
import axios from 'axios';
import * as settings from '../../settings';

export const FETCH_COMMENTS_SUCCESS = 'FETCH_COMMENTS_SUCCESS';
export const FETCH_COMMENT_SUCCESS = 'FETCH_COMMENT_SUCCESS';
export const ADD_COMMENT_SUCCESS = 'ADD_COMMENT_SUCCESS';
export const UPDATE_COMMENT_SUCCESS = 'UPDATE_COMMENT_SUCCESS';
export const DELETE_COMMENT_SUCCESS = 'DELETE_COMMENT_SUCCESS';



export const fetchComments = () => async (dispatch) => {
  const endpoint = `${settings.API_SERVER}/api/comments/`;

  try {
    const response = await axios.get(endpoint);
    

    dispatch({
      type: FETCH_COMMENTS_SUCCESS,
      payload: response.data,
    });
    
  } catch (error) {
    console.error('Error in fetchComments:', error);  // Log the error if it occurs
  }
};

export const fetchComment = (id) => {
    return dispatch => {
      axios.get(`${settings.API_SERVER}/api/comments/${id}/`)
        .then(res => {
          dispatch({ type: FETCH_COMMENT_SUCCESS, payload: res.data });
        })
        .catch(err => console.error(err));
    }
}

export const addComment = (comment) => {
    return dispatch => {
      axios.post(`${settings.API_SERVER}/api/comments/`, comment)
        .then(res => {
          dispatch({ type: ADD_COMMENT_SUCCESS, payload: res.data });
        })
        .catch(err => console.error(err));
    }
}

export const updateComment = (comment, id) => {
    return dispatch => {
      axios.put(`${settings.API_SERVER}/api/comments/update/${id}/`, Comment)
        .then(res => {
          dispatch({ type: UPDATE_COMMENT_SUCCESS, payload: res.data });
        })
        .catch(err => console.error(err));
    }
}

export const deleteComment = (id) => {
    return dispatch => {
      axios.delete(`${settings.API_SERVER}/api/comments/delete/${id}/`)
        .then(() => {
          dispatch({ type: DELETE_COMMENT_SUCCESS, payload: id });
        })
        .catch(err => console.error(err));
    }
}
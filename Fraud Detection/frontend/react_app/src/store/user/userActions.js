import axios from 'axios';
import * as settings from '../../settings';

export const FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS';
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const ADD_USER_SUCCESS = 'ADD_USER_SUCCESS';
export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS';
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS';

export const fetchUsers = () => {
    return dispatch => {
      axios.get(`${settings.API_SERVER}/api/auth/users/`)
        .then(res => {
          dispatch({ type: FETCH_USERS_SUCCESS, payload: res.data });
        })
        .catch(err => console.error(err));
    }
}

export const fetchUser = (id) => {
    return dispatch => {
      axios.get(`${settings.API_SERVER}/api/auth/users/${id}/`)
        .then(res => {
          dispatch({ type: FETCH_USER_SUCCESS, payload: res.data });
        })
        .catch(err => console.error(err));
    }
}

export const addUser = (user) => {
    return dispatch => {
      axios.post(`${settings.API_SERVER}/api/auth/users/`, user)
        .then(res => {
          dispatch({ type: ADD_USER_SUCCESS, payload: res.data });
        })
        .catch(err => console.error(err));
    }
}

export const updateUSER = (user, id) => {
    return dispatch => {
      axios.put(`${settings.API_SERVER}/api/auth/users/update/${id}/`, user)
        .then(res => {
          dispatch({ type: UPDATE_USER_SUCCESS, payload: res.data });
        })
        .catch(err => console.error(err));
    }
}

export const deleteUser = (id) => {
    return dispatch => {
      axios.delete(`${settings.API_SERVER}/api/auth/users/delete/${id}/`)
        .then(() => {
          dispatch({ type: DELETE_USER_SUCCESS, payload: id });
        })
        .catch(err => console.error(err));
    }
}
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import {thunk} from 'redux-thunk';
import authReducer from './store/auth/authReducer';
import Loader from "./Layouts/loader/Loader";
import "./assets/scss/style.scss";
import transactionReducer from './store/transaction/transactionReducer';
import alertReducer from './store/alert/alertReducer';
import userReducer from './store/user/userReducer';
import predictionReducer from './store/prediction/predictionReducer';
import commentReducer from './store/comment/commentReducer';
import { WebSocketProvider } from './WebSocketContext';

const reducer = combineReducers({ auth: authReducer, transaction: transactionReducer, user:userReducer, alert: alertReducer,  prediction: predictionReducer, comment: commentReducer }); // Using Combine Reducers here although only one reducer is present.
const composeEnhanced = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose // The first one is to make the chrome dev extension work
const store = createStore(reducer, composeEnhanced(applyMiddleware(thunk))); // We are using thunk, because it allows delaying the dispatch actions
// Thunk wraps the dispatch actions into custom functions which are available with the mapDispatchToProps
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Suspense fallback={<Loader />}>
    <Provider store={store}>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </Provider>
  </Suspense>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

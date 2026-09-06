import React, {Suspense} from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";

import Login from "./views/auth/Login";

import PasswordUpdate from "./views/auth/PasswordUpdate";
import Home from "./views/Home";
import About from "./views/About";
import Users from "./views/user/Users";
import Transactions from "./views/transaction/Transactions";
import AddTransaction from "./views/transaction/AddTransaction";
import UpdateTransaction from "./views/transaction/UpdateTransaction";
import PowerBI from "./views/analytics/PowerBI";
import Journal from "./views/Journal";
import FullLayout from "./Layouts/FullLayout";
import ModelSelection from "./views/transaction/ModelSelection";
import Chat from "./views/Chat";


function PrivateRoute({ children, isAuthenticated }) {
    let location = useLocation();
    return isAuthenticated ? (
      children
    ) : (
      <Navigate to="/login/" state={{ from: location }} />
    );
  }

  function Urls(props) {
    const isAuthenticated = props.isAuthenticated
    
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/login/" element={<Login {...props} />} />
                    <Route 
                        path="/" 
                        element={
                            isAuthenticated ? (
                                <Navigate to="/home" />
                            ) : (
                                <Navigate to="/login/" />
                            )
                        } 
                    />
                    <Route 
                        path="/update_password" 
                        element={
                            <PrivateRoute isAuthenticated={isAuthenticated}>
                                <PasswordUpdate {...props} />
                            </PrivateRoute>
                        } 
                    />
                    
                    <Route path="/" element={<FullLayout {...props}/>}>
                        <Route 
                            path="/home" 
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <Home {...props}/>
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/users" 
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <Users {...props}/>
                                </PrivateRoute>
                            } 
                        />
                        
                        <Route 
                            path="/transactions" 
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <Transactions {...props}/>
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/add-transaction" 
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <AddTransaction {...props}/>
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/update-transaction/:id" 
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <UpdateTransaction {...props}/>
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/powerbi" 
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <PowerBI {...props}/>
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/doc" 
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <Journal {...props}/>
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/chat" 
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <Chat {...props}/>
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/about" 
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <About />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/select-model" 
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <ModelSelection />
                                </PrivateRoute>
                            } 
                        />
                        


                        
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default Urls;
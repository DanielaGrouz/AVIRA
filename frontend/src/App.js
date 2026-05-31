import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Login from './pages/auth/Login';
import EventHomePage from './pages/events/EventHomePage';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import {AuthProvider, useAuth} from "./hooks/useAuth";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import EventDetailsPage from "./pages/events/EventDetailsPage";
import AppRoutes from "./AppRoutesConfig";
import CreateEventPage from "./pages/events/CreateEventPage";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFoundPage from "./pages/NotFoundPage";
import GuestRSVP from "./pages/events/GuestRSVP";

function AppContent() {
    const {isAuthenticated} = useAuth();
    const makeProtected = (element) => {
        return isAuthenticated ? element : <Navigate to={AppRoutes.LOGIN} replace/>;
    };

    return (
        <div>
            {isAuthenticated && <Navbar/>}
            <main>
                <Routes>
                    {/* User Routes */}
                    <Route path={AppRoutes.LOGIN} element={<Login/>}/>
                    <Route path={AppRoutes.SIGNUP} element={<Signup/>}/>
                    <Route path={AppRoutes.FORGOT_PASSWORD} element={<ForgotPassword/>}/>
                    <Route path={AppRoutes.VERIFY_EMAIL} element={<VerifyEmail/>}/>
                    <Route path={AppRoutes.RESET_PASSWORD} element={<ResetPassword/>}/>

                    <Route path={AppRoutes.RSVP} element={<GuestRSVP />} />

                    {/* Events Routes */}
                    <Route path={AppRoutes.HOME} element={makeProtected(<EventHomePage/>)}/>
                    <Route path={AppRoutes.EVENT_DETAILS} element={isAuthenticated ? <EventDetailsPage/> : <Navigate to={AppRoutes.LOGIN}/>}/>
                    <Route path={AppRoutes.CREATE_EVENT} element={isAuthenticated ? <CreateEventPage/> : <Navigate to={AppRoutes.LOGIN}/>}/>

                    <Route path={AppRoutes.SETTINGS} element={isAuthenticated ? <Settings/> : <Navigate to={AppRoutes.LOGIN}/>}/>

                    <Route path={AppRoutes.NOT_FOUND} element={<NotFoundPage/>}/>

                    <Route path="*" element={<Navigate to={AppRoutes.NOT_FOUND} replace />} />
                </Routes>
            </main>
            {/*{isAuthenticated && <Footer/>}*/}
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent/>
            </Router>
        </AuthProvider>
    );
}


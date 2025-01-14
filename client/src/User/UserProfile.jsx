import React from 'react';
import UserSideNav from '../Components/user_sidenav/UserSideNav';
import Profile from '../Components/Profile';

const UserProfile = () => {
    return (
        <div>
            <UserSideNav />
            <div>
                <Profile />
            </div>
        </div>
    );
};

export default UserProfile;

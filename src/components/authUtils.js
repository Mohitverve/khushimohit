    // src/ .js
    import { onAuthStateChanged } from 'firebase/auth';
    import { auth } from '../components/firebaseConfig'; // Make sure to adjust the path to your firebaseConfig file
    
    export const checkCred = (setUser, navigate) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, set the user state
          setUser(user);
        } else {
          // User is signed out, redirect to login page
          setUser(null);
          navigate('/login');
        }
      });
    };
    
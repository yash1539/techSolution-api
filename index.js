const express = require('express');
const admin = require('firebase-admin');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Initialize Firestore
admin.initializeApp({
  // Add your Firebase configuration options here
});

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
const authenticateAndAddUser = (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, (err) => {
      if (err) {
        // Handle authentication error
        return res.redirect('/login'); // Redirect to login page or any appropriate error page
      }
      // If authentication is successful, the user data will be available in the `req.user` object
  
      // Store user data in Firestore
      const { id, displayName, emails } = req.user;
      const userRef = admin.firestore().collection('users').doc(id);
      userRef
        .set({
          name: displayName,
          email: emails[0].value,
          // Add any other relevant user information from the profile
        })
        .then(() => {
          // Forward the request to the home page or any other desired route
          return res.redirect('/home');
        })
        .catch((error) => {
          // Handle Firestore error
          console.error('Error storing user data in Firestore:', error);
          return res.redirect('/login'); // Redirect to login page or any appropriate error page
        });
    });
  };
app.use('/addUser',authenticateAndAddUser);
// // Define Google OAuth strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: 'YOUR_CLIENT_ID',
//       clientSecret: 'YOUR_CLIENT_SECRET',
//       callbackURL: '/auth/google/callback',
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Use the profile information or access token to create/update user in Firestore
//       // Here, you can add the user information to the Firestore database
//       // For simplicity, we'll assume the user document is stored under the "users" collection

//       const userRef = admin.firestore().collection('users').doc(profile.id);

//       userRef.set({
//         name: profile.displayName,
//         email: profile.emails[0].value,
//         // Add any other relevant user information from the profile
//       })
//       .then(() => done(null, profile))
//       .catch((error) => done(error));
//     }
//   )
// );

// // Routes
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
//   (req, res) => {
//     // Redirect or respond with a success message after successful authentication
//     res.redirect('/success');
//   }
// );

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

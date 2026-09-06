// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import prisma from '../../../lib/prisma.js';

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID || '',
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
//       callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
//       passReqToCallback: true, // Request object pawar jonno
//     },
//     async (req, accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails?.[0]?.value;

//         if (!email) {
//           return done(new Error('No email found from Google profile'), false);
//         }

//         // Pass kora State parameter (role) extract
//         const selectedRole = (req.query.state as string) || 'PATIENT';

//         let user = await prisma.user.findUnique({
//           where: { email },
//         });

//         // User first-time login korle new user create hobe role samet
//         if (!user) {
//           user = await prisma.user.create({
//             data: {
//               email,
//               fullName: profile.displayName || 'Google User',
//               password: '', // Social login-e password lage na
//               role: selectedRole as any,
//               googleId: profile.id,
//             },
//           });
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error as Error, false);
//       }
//     }
//   )
// );

// export default passport;
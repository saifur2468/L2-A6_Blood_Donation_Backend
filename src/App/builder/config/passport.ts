import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../../../lib/prisma.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL ,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false);

        
        let selectedRole = 'PATIENT';
        if (req.query.state) {
          try {
            const parsedState = JSON.parse(req.query.state as string);
            if (parsedState.role) selectedRole = parsedState.role;
          } catch (err) {
           
          }
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          
          user = await prisma.user.create({
            data: {
              email,
              fullName: profile.displayName || 'Google User',
              profilePhoto: profile.photos?.[0]?.value || '',
              googleId: profile.id,
              role: selectedRole as any, 
              password: '',
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);
export default passport;
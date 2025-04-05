import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // Replace with your secret
    });
  }

  // This func i think call to database/cache get accessToken existing or not
  // If valid, return user data
  // If not valid, throw error
  // Maybe we will recover the accessToken of a certain user when discovering that user has abnormal behavior
  async validate(payload: any) {
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
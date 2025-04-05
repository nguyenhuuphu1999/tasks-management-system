import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { LoggerService } from 'src/common/logger/logger.service';
import { UserRepository } from 'src/users/user.repository';
import { TIME_EXPIRE } from 'src/constants/constants';

@Injectable()
export class AuthService {
  public constructor(
    private usersRepository: UserRepository,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) { }

  public async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { email, password, username } = registerDto;

    const existingUser = await this.usersRepository.findOne(undefined, { where: { email } });
    if (existingUser) {
      this.logger.error({}, 'Email already in use');
      throw new UnauthorizedException('Email already in use');
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.usersRepository.insert(undefined, {
        username,
        email,
        password: hashedPassword,
      });

      this.logger.log({}, `User ${user.id} registered successfully`);

      const userData = await this.usersRepository.findOne(undefined, { where: { id: user.id } });
      if (!userData) {
        this.logger.error({}, 'User not found after registration');
        throw new UnauthorizedException('User not found after registration');
      }

      // Optionally, you can send a welcome email or perform other actions here
      return this.handleToken(userData);
    } catch (error) {
      this.logger.error({}, 'Error saving user to database', error);
      throw new InternalServerErrorException('Error registering user');
    }
  }

  public async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log({}, 'Processing login request...');
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne(undefined, { where: { email } });
    if (!user) {
      this.logger.error({}, 'User not found');
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.error({}, 'Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      return this.handleToken(user);
    } catch (error) {
      this.logger.error({}, 'Error generating JWT token');
      throw new InternalServerErrorException('Error logging in user');
    }
  }

  // I think we can add caching for accessToken and refreshToken in redis to improve performance when check user existing
  private async handleToken(user: User): Promise<LoginResponseDto> {
    this.logger.log({ correlationId: user.id }, 'Generating tokens...');
    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: TIME_EXPIRE.ACCESS_TOKEN });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: TIME_EXPIRE.REFRESH_TOKEN });
     
    await this.usersRepository.update(undefined, { where: { id: user.id } }, { refreshToken, accessToken });
    return {
      accessToken,
      refreshToken,
      email: user.email,
      userName: user.username,
      id: user.id,
    };
  }

  public async validateUser(userId: string): Promise<User> {
    this.logger.log({ correlationId: userId }, 'Validating user...');
    const user = await this.usersRepository.findOne(undefined, { where: { id: userId }, select: { id: true, username: true, email: true, role: true } });
    if (!user) {
      this.logger.error({ correlationId: userId }, 'Validate user - user not found');
      throw new UnauthorizedException('User not found');
    }

    this.logger.log({ correlationId: userId }, 'User validated successfully');
    return user;
  }

}
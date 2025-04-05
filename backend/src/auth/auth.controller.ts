import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from 'src/users/user.decorator';
import { User as UserEntity } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  public constructor(private authService: AuthService) {}

  @ApiResponse({
    status: 201,
    description: 'Register successful',
    type: ResponseDto<LoginResponseDto>,
  })
  @Post('register')
  public async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return await this.authService.register(registerDto);
  }

  @ApiResponse({
    status: 201,
    description: 'Login successful',
    type: ResponseDto<LoginResponseDto>,
  })
  @Post('login')
  public async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async me(@User() user): Promise<UserEntity> {
    return await this.authService.validateUser(user.id);
  }
}
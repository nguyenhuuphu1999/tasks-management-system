import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: "user1@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ example: "123456" })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  public password: string;
}

export class LoginResponseDto { 
  public accessToken: string;
  public refreshToken: string;
  public userName: string;
  public email: string;
  public id: string;
}
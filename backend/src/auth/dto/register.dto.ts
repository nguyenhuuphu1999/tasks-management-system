import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoginResponseDto } from './login.dto';

export class RegisterDto {
  @IsString()
  @ApiProperty({ example: 'HenryNguyen' })
  @IsNotEmpty()
  public username: string;

  @ApiProperty({example: "user1@gmail.com"})
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({example: "123456"})
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  public password: string;
}

export class RegisterResponseDto extends LoginResponseDto {}
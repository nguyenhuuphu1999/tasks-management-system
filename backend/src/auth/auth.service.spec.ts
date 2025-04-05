import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '..//users/user.decorator';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  // Mock Repository (for User entity)
  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  // Mock JwtService
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService, // Provide the mock instead of the real service
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository, // Mock the User repository
        },
        {
          provide: JwtService,
          useValue: mockJwtService, // Mock JwtService
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a user', async () => {
    const registerDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };
    const user = { id: '1', ...registerDto, role: 'user' };

    mockAuthService.register.mockResolvedValue(user);

    const result = await controller.register(registerDto);
    expect(result).toEqual(user);
    expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
  });

  it('should login a user', async () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const loginResponse = { accessToken: 'mockToken' };

    mockAuthService.login.mockResolvedValue(loginResponse);

    const result = await controller.login(loginDto);
    expect(result).toEqual(loginResponse);
    expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
  });
});
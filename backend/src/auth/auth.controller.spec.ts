// src/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService, // Provide the mock AuthService
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
    const mockUser = { id: '1', ...registerDto, role: 'user' };

    mockAuthService.register.mockResolvedValue(mockUser);

    const result = await controller.register(registerDto);
    expect(result).toEqual(mockUser);
    expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
  });

  it('should login a user', async () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const mockResponse = { accessToken: 'mockJwtToken' };

    mockAuthService.login.mockResolvedValue(mockResponse);

    const result = await controller.login(loginDto);
    expect(result).toEqual(mockResponse);
    expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
  });
});
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class UsersService {
    public constructor(
        private usersRepository: UserRepository,
        private logger: LoggerService,
    ) { }

    public async findAll(): Promise<User[]> {
        this.logger.log({}, 'Fetching all users...');
        return this.usersRepository.queries(undefined, {});
    }

    public async findOne(id: string): Promise<User> {
        this.logger.log({correlationId: id}, `Fetching user with ID: ${id}`);
        const user = await this.usersRepository.findOne(undefined,{ where: { id } });
        if (!user) {
            this.logger.error({correlationId: id}, 'User not found');
            throw new BadRequestException('User not found');
        }
        return user;
    }
}
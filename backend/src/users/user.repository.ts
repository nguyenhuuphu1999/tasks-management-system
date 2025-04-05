import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './user.entity';
import { BasePostgresRepository } from 'src/common/repository/abstract-repository';

@Injectable()
export class UserRepository extends  BasePostgresRepository<User> {
    public constructor(
            @InjectEntityManager()
            protected readonly entityManager: EntityManager,
        ) {
            super(entityManager, User);
        }
}
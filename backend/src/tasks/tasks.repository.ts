import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BasePostgresRepository } from 'src/common/repository/abstract-repository';
import { EntityManager } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksRepository extends BasePostgresRepository<Task> {
    public constructor(
        @InjectEntityManager()
        protected readonly entityManager: EntityManager,
    ) {
        super(entityManager, Task);
    }
}
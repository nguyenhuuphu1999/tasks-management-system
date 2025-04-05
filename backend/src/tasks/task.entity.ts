import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { TASK_STATUS } from './task-status.enum';
import { BaseEntity } from 'src/common/base-entity/base-entity';

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public title: string;

  @Column()
  public description: string;

  @Column({ type: 'enum', enum: TASK_STATUS, default: TASK_STATUS.TODO })
  public status: TASK_STATUS;

  @Column()
  public dueDate: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  public user: User;

  @Column()
  public userId: string;
}
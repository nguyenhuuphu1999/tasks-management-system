import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ROLE } from './role.enum';
import { Task } from '../tasks/task.entity';
import { BaseEntity } from 'src/common/base-entity/base-entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public username: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public password: string;

  @Column({ type: 'enum', enum: ROLE, default: ROLE.USER })
  public role: ROLE;

  @OneToMany(() => Task, (task) => task.user)
  public tasks: Task[];

  @Column({ nullable: true })
  public refreshToken?: string;

  @Column({ nullable: true })
  public accessToken?: string;
}
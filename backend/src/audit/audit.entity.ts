import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audits')
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: true })
  public userId: string;

  @Column({ nullable: true })
  public username: string;

  @Column()
  public method: string;

  @Column()
  public url: string;

  @Column({ type: 'jsonb', nullable: true })
  public requestBody: any;

  @Column()
  public statusCode: number;

  @Column({ nullable: true })
  public ipAddress: string;

  @Column({nullable: true})
  public correlationId?: string;

  @CreateDateColumn()
  public createdAt: Date;
}
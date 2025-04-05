import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BasePostgresRepository } from './abstract-repository';
import { BaseEntity } from '../base-entity/base-entity';

export abstract class CommonSqlService<
  E extends BaseEntity,
> extends BasePostgresRepository<E> {
  public abstract readonly manager: EntityManager;
  public abstract readonly entity: E;

  public sqlFindOne = async (
    rootManager: EntityManager = this.manager,
    findOptions: FindOneOptions<E>,
  ): Promise<E | undefined> => {
    const result = await rootManager
      .getRepository<E>(this.entity.constructor)
      .findOne(findOptions);
    return result === null ? undefined : result;
  };

  public sqlQuery = async (
    rootManager: EntityManager = this.manager,
    findOptions: FindManyOptions<E>,
  ): Promise<E[]> => {
    return await rootManager
      .getRepository<E>(this.entity.constructor)
      .find(findOptions);
  };

  public sqlInsert = async (
    rootManager: EntityManager = this.manager,
    dataCreate: QueryDeepPartialEntity<E>,
  ): Promise<Partial<E>> => {
    return await this.mergeTransaction(rootManager, async (manager) => {
      const repository = manager.getRepository(this.entity.constructor);
      const insertResult = await repository.insert(dataCreate);
      return { id: insertResult.identifiers[0].id } as unknown as Partial<E>;
    });
  };

  public sqlInsertMultiple = async (
    rootManager: EntityManager = this.manager,
    dataCreate: Array<Partial<E>>,
  ): Promise<Array<Partial<E>>> => {
    return await this.mergeTransaction(rootManager, async (manager) => {
      const repository = manager.getRepository(this.entity.constructor);
      const insertResult = await repository.insert(dataCreate);
      return insertResult.identifiers.map(
        (i: any) => ({ id: i.id } as unknown as Partial<E>),
      );
    });
  };

  public sqlSoftDelete = async (
    rootManager: EntityManager = this.manager,
    findOptions: FindOptions<E>,
  ): Promise<boolean> => {
    return await this.mergeTransaction(rootManager, async (manager) => {
      const repository = manager.getRepository(this.entity.constructor);
      const updateResult = await repository.update(findOptions, {
        deleted: true,
      });
      return updateResult.affected ? updateResult.affected > 0 : false;
    });
  };
}

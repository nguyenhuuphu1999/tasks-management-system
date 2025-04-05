import { DeepPartial, EntityManager, EntityTarget, FindManyOptions, FindOneOptions, FindOptions, FindOptionsOrder, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import { AbstractSQLService } from "./base-sql-service";
import { ResponsePaging } from "./response";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export abstract class BasePostgresRepository<T extends ObjectLiteral> extends AbstractSQLService {
  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityClass: EntityTarget<T>,
  ) {
    super();
  }

  public async findOne(
    rootManager: EntityManager = this.entityManager,
    findCondition: FindOneOptions<T>,
  ): Promise<T | null> {
    return await rootManager.getRepository(this.entityClass).findOne({
      ...findCondition,
      where: {
        ...findCondition.where,
        deleted: false,
      } as FindOptionsWhere<T>,
    });
  }

  public async queries(
    rootManager: EntityManager = this.entityManager,
    findCondition: FindManyOptions<T>,
  ): Promise<T[]> {
    return await rootManager.getRepository(this.entityClass).find({
      ...findCondition,
      where: {
        ...findCondition.where,
        deleted: false,
      } as FindOptionsWhere<T>,
    });
  }

  public async insert(
    rootManager: EntityManager = this.entityManager,
    dataCreate: QueryDeepPartialEntity<T>,
  ): Promise<{id: string}> {
    return await this.mergeTransaction(rootManager, async (manager) => {
      const insertResult = await manager
        .getRepository(this.entityClass)
        .insert(dataCreate);
      return {
        id: String(insertResult.identifiers[0].id),
      }
    });
  }

  public async update(
    rootManager: EntityManager = this.entityManager,
    findCondition: FindManyOptions<T>,
    dataUpdate: QueryDeepPartialEntity<T>,
  ): Promise<boolean> {
    return await this.mergeTransaction(rootManager, async (manager) => {
      const updateResult = await manager.getRepository(this.entityClass).update(
        {
          ...findCondition.where,
          deleted: false,
        } as FindOptionsWhere<T>,
        dataUpdate,
      );
      return updateResult.affected ? updateResult.affected > 0 : false;
    });
  }


  public async getPaging(
    rootManager: EntityManager = this.entityManager,
    filter: FindOptionsWhere<T> = {},
    page: number = 1,
    limit: number = 10,
    order?: FindOptionsOrder<T>,
    select?: Partial<Record<keyof T, boolean>>,
  ): Promise<ResponsePaging<T>> {
    return await this.mergeTransaction(rootManager, async (manager) => {
      const skip = (Number(page) - 1) * Number(limit);
      const queryBuilder = manager.createQueryBuilder(this.entityClass, 'entity');

      // Apply filter
      const conditions: string[] = [];
      const parameters: any = {};

      for (const [key, value] of Object.entries(filter)) {
        if (typeof value === 'object' && value && '$ilike' in value) {
          conditions.push(`entity.${key} ILIKE :${key}`);
          parameters[key] = value.$ilike;
        } else {
          conditions.push(`entity.${key} = :${key}`);
          parameters[key] = value;
        }
      }

      conditions.push('entity.deleted = :deleted');
      parameters.deleted = false;

      if (conditions.length > 0) {
        queryBuilder.where(conditions.join(' AND '), parameters);
      }

      // Apply order
      if (order) {
        for (const [key, value] of Object.entries(order)) {
          queryBuilder.orderBy(`entity.${key}`, value as 'ASC' | 'DESC');
        }
      } else {
        queryBuilder.orderBy('entity.createdAt', 'DESC');
      }

      // Apply pagination
      queryBuilder.skip(skip).take(Number(limit));

      // Apply select
      if (select) {
        const selectFields = Object.keys(select)
          .filter((key) => select[key])
          .map((field) => `entity.${field}`);
        queryBuilder.select(selectFields);
      }

      // Execute query
      const [data, totalData] = await Promise.all([
        queryBuilder.getMany(),
        queryBuilder.getCount(),
      ]);

      const totalPage = Math.ceil(totalData / Number(limit));

      return {
        dataPaging: data,
        perPage: Number(limit),
        totalData,
        totalPage,
        currentPage: Number(page),
      };
    });
  }
}
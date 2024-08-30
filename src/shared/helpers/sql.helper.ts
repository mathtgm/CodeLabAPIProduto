import { Between, ILike } from 'typeorm';
import { IFindAllFilter } from '../interfaces/find-all-filter.interface';

export const handleFilter = (filter: IFindAllFilter | IFindAllFilter[]) => {
  if (!filter) {
    return {};
  }

  const filters = Array.isArray(filter) ? filter : [filter];

  const whereClause = {};

  for (const f of filters) {

      if(!isNaN(+f.value)) {

        Object.assign(whereClause, {
          [f.column]: Number(f.value),
        });

        continue;

      }

      if (typeof f.value === 'string') {
        Object.assign(whereClause, {
          [f.column]: ILike(`%${f.value}%`),
        });

        continue;
      }

      Object.assign(whereClause, {
        [f.column]: f.value,
      });

  }

  return whereClause;
};


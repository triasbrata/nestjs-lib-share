import { Aggregate } from 'mongoose';

export function pagination(
  aggregate: Aggregate<any[]>,
  options?: { limit: number; page: number },
) {
  if (!options) {
    options = { limit: 15, page: 1 };
  }
  const { limit, page } = options;
  const validatePage = page - 1 < 1 ? 0 : page - 1;
  const skip = validatePage * limit;
  return aggregate
    .facet({
      metaData: [{ $count: 'total' }],
      data: [{ $skip: skip }, { $limit: limit }],
    })
    .project({ data: 1, total: { $arrayElemAt: ['$metaData.total', 0] } })
    .addFields({ perPage: limit })
    .exec();
}

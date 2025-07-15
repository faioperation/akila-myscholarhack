import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { manualApplicationSearchableFields } from "./manualApplication.constant.js";

const create = async (prisma, data) => {
  return await prisma.manualApplication.create({
    data,
    include: {
      user: true,
      essay: true,
    },
  });
};

const getAll = async (prisma, query, filter = {}) => {
  const builder = new QueryBuilder(query)
    .search(manualApplicationSearchableFields)
    .filter()
    .sort("-createdAt")
    .fields()
    .paginate();

  const prismaQuery = builder.build();
  prismaQuery.where = { ...prismaQuery.where, ...filter };

  const data = await prisma.manualApplication.findMany({
    ...prismaQuery,
    include: {
      user: true,
      essay: true,
    },
  });

  const total = await prisma.manualApplication.count({
    where: prismaQuery.where,
  });

  return {
    data,
    meta: builder.getMeta(total),
  };
};

const getById = async (prisma, where) => {
  return await prisma.manualApplication.findFirst({
    where: typeof where === "string" ? { id: where } : where,
    include: {
      user: true,
      essay: true,
    },
  });
};

const update = async (prisma, where, data) => {
  const targetWhere = typeof where === "string" ? { id: where } : where;
  
  return await prisma.manualApplication.update({
    where: targetWhere,
    data,
    include: {
      user: true,
      essay: true,
    },
  });
};

const remove = async (prisma, where) => {
  const targetWhere = typeof where === "string" ? { id: where } : where;
  return await prisma.manualApplication.delete({
    where: targetWhere,
  });
};

export const ManualApplicationService = {
  create,
  getAll,
  getById,
  update,
  remove,
};

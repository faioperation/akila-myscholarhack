import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { studentInstructionSearchableFields } from "./studentInstruction.constant.js";

const SINGLETON_ID = "global-instruction";

const create = async (prisma, data) => {
  const { userId, ...updateData } = data;
  return await prisma.studentInstruction.upsert({
    where: { id: SINGLETON_ID },
    update: { ...updateData, userId },
    create: { ...data, id: SINGLETON_ID },
  });
};

const getSingle = async (prisma) => {
  return await prisma.studentInstruction.findUnique({
    where: { id: SINGLETON_ID },
  });
};

export const StudentInstructionService = {
  create,
  getSingle,
};

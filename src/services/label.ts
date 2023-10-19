import { prisma } from "../prisma";

export async function getLabels() {
  return prisma.label.findMany();
}

export async function getLabelByName(labelName: string | null) {
  if (!labelName) return null;
  return prisma.label.findFirst({
    where: {
      name: labelName,
    },
  });
}

export async function getLabelById(labelId: number) {
  return prisma.label.findUnique({
    where: {
      id: labelId,
    },
  });
}

import { prisma } from '../../config/db';

export async function findAllTags() {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  return tags.map(t => t.name);
}

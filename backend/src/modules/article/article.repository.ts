import { prisma } from '../../config/db';
import { ArticleQuery, CreateArticleInput, UpdateArticleInput } from './article.type';

const articleInclude = (currentUserId?: number) => ({
  author: {
    select: {
      username: true,
      bio: true,
      image: true,
      followers: currentUserId ? { where: { followerId: currentUserId } } : false,
    },
  },
  tags: { include: { tag: { select: { name: true } } } },
  favoritedBy: currentUserId ? { where: { userId: currentUserId } } : false,
  _count: { select: { favoritedBy: true } },
});

export function formatArticle(article: any, currentUserId?: number) {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    isDraft: article.isDraft,
    status: article.isDraft ? 'draft' : 'published',
    tagList: article.tags.map((tag: any) => tag.tag.name).sort(),
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    favorited: !article.isDraft && currentUserId ? (article.favoritedBy?.length ?? 0) > 0 : false,
    favoritesCount: article._count.favoritedBy,
    author: {
      username: article.author.username,
      bio: article.author.bio,
      image: article.author.image,
      following: currentUserId ? (article.author.followers?.length ?? 0) > 0 : false,
    },
  };
}

function makeSlug(title: string) {
  return `${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
}

function normalizeTitle(title?: string) {
  return title?.trim() || 'Untitled draft';
}

function uniqueTagList(tagList?: string[]) {
  if (!tagList?.length) {
    return [];
  }

  return Array.from(new Set(tagList.map((tag) => tag.trim()).filter(Boolean)));
}

function buildOrderBy(sort: ArticleQuery['sort']) {
  if (sort === 'oldest') {
    return [{ createdAt: 'asc' as const }];
  }

  if (sort === 'popular') {
    return [
      { favoritedBy: { _count: 'desc' as const } },
      { createdAt: 'desc' as const },
    ];
  }

  return [{ createdAt: 'desc' as const }];
}

async function canManageDrafts(author: string | undefined, currentUserId?: number) {
  if (!author || !currentUserId) {
    return false;
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { username: true },
  });

  return currentUser?.username === author;
}

export async function findArticles(query: ArticleQuery, currentUserId?: number) {
  const where: any = {};

  if (query.tag) {
    where.tags = { some: { tag: { name: query.tag } } };
  }

  if (query.author) {
    where.author = { username: query.author };
  }

  if (query.favorited) {
    where.favoritedBy = { some: { user: { username: query.favorited } } };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { description: { contains: query.search } },
      { body: { contains: query.search } },
    ];
  }

  const allowDraftAccess = await canManageDrafts(query.author, currentUserId);
  const status = query.status ?? 'published';

  if (status === 'draft') {
    if (!allowDraftAccess) {
      return { articles: [], articlesCount: 0 };
    }

    where.isDraft = true;
  } else if (status === 'all') {
    if (!allowDraftAccess) {
      where.isDraft = false;
    }
  } else {
    where.isDraft = false;
  }

  const [articles, articlesCount] = await Promise.all([
    prisma.article.findMany({
      where,
      include: articleInclude(currentUserId) as any,
      orderBy: buildOrderBy(query.sort),
      take: query.limit ?? 20,
      skip: query.offset ?? 0,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles: articles.map((article) => formatArticle(article, currentUserId)),
    articlesCount,
  };
}

export async function findFeedArticles(
  userId: number,
  query: Pick<ArticleQuery, 'limit' | 'offset' | 'search' | 'sort'>
) {
  const where: any = {
    isDraft: false,
    author: { followers: { some: { followerId: userId } } },
  };

  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { description: { contains: query.search } },
      { body: { contains: query.search } },
    ];
  }

  const [articles, articlesCount] = await Promise.all([
    prisma.article.findMany({
      where,
      include: articleInclude(userId) as any,
      orderBy: buildOrderBy(query.sort),
      take: query.limit ?? 20,
      skip: query.offset ?? 0,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles: articles.map((article) => formatArticle(article, userId)),
    articlesCount,
  };
}

export async function findArticleBySlug(slug: string, currentUserId?: number) {
  return prisma.article.findUnique({
    where: { slug },
    include: articleInclude(currentUserId) as any,
  });
}

export async function createArticle(authorId: number, data: CreateArticleInput) {
  const tagList = uniqueTagList(data.tagList);

  return prisma.article.create({
    data: {
      slug: makeSlug(normalizeTitle(data.title)),
      title: normalizeTitle(data.title),
      description: data.description?.trim() || '',
      body: data.body?.trim() || '',
      isDraft: data.isDraft ?? false,
      authorId,
      tags: tagList.length
        ? {
            create: tagList.map((name) => ({
              tag: { connectOrCreate: { where: { name }, create: { name } } },
            })),
          }
        : undefined,
    },
    include: articleInclude(authorId) as any,
  });
}

export async function updateArticle(slug: string, data: UpdateArticleInput) {
  const updateData: any = {};

  if (data.title !== undefined) {
    updateData.title = normalizeTitle(data.title);
    updateData.slug = makeSlug(updateData.title);
  }

  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || '';
  }

  if (data.body !== undefined) {
    updateData.body = data.body?.trim() || '';
  }

  if (data.isDraft !== undefined) {
    updateData.isDraft = data.isDraft;
  }

  if (data.tagList !== undefined) {
    const tagList = uniqueTagList(data.tagList);
    updateData.tags = {
      deleteMany: {},
      ...(tagList.length
        ? {
            create: tagList.map((name) => ({
              tag: { connectOrCreate: { where: { name }, create: { name } } },
            })),
          }
        : {}),
    };
  }

  return prisma.article.update({
    where: { slug },
    data: updateData,
    include: articleInclude() as any,
  });
}

export async function deleteArticle(slug: string) {
  return prisma.article.delete({ where: { slug } });
}

export async function favoriteArticle(userId: number, articleId: number) {
  await prisma.favorite.upsert({
    where: { userId_articleId: { userId, articleId } },
    create: { userId, articleId },
    update: {},
  });
}

export async function unfavoriteArticle(userId: number, articleId: number) {
  await prisma.favorite.deleteMany({ where: { userId, articleId } });
}

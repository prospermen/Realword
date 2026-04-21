import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { apiRequest, authHeader, getBaseUrl, readJson, resetDatabase } from './helpers';

const uploadsDir = path.resolve(__dirname, '..', 'public', 'uploads');

type AuthResponse = {
  user: {
    email: string;
    username: string;
    bio: string | null;
    image: string | null;
    token: string;
  };
};

type ArticleResponse = {
  article: {
    slug: string;
    title: string;
    description: string;
    body: string;
    isDraft: boolean;
    status: 'draft' | 'published';
    tagList: string[];
    favorited: boolean;
    favoritesCount: number;
    author: {
      username: string;
      following: boolean;
    };
  };
};

type ArticlesResponse = {
  articles: Array<ArticleResponse['article']>;
  articlesCount: number;
};

type CommentResponse = {
  comment: {
    id: number;
    body: string;
    author: {
      username: string;
    };
  };
};

type CommentsResponse = {
  comments: Array<CommentResponse['comment']>;
};

type ProfileResponse = {
  profile: {
    username: string;
    following: boolean;
  };
};

type ErrorResponse = {
  errors: {
    body: string[];
  };
};

type UploadResponse = {
  url: string;
};

async function testAuthLifecycle() {
  await resetDatabase();

  const registerResponse = await apiRequest('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      user: {
        username: 'alice',
        email: 'alice@example.com',
        password: 'password123',
      },
    }),
  });

  assert.equal(registerResponse.status, 201);
  const registered = await readJson<AuthResponse>(registerResponse);
  assert.equal(registered.user.username, 'alice');
  assert.ok(registered.user.token);

  const loginResponse = await apiRequest('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({
      user: {
        email: 'alice@example.com',
        password: 'password123',
      },
    }),
  });

  assert.equal(loginResponse.status, 200);
  const loggedIn = await readJson<AuthResponse>(loginResponse);
  assert.equal(loggedIn.user.email, 'alice@example.com');

  const currentUserResponse = await apiRequest('/api/user', {
    headers: authHeader(loggedIn.user.token),
  });

  assert.equal(currentUserResponse.status, 200);
  const currentUser = await readJson<AuthResponse>(currentUserResponse);
  assert.equal(currentUser.user.username, 'alice');

  const updateResponse = await apiRequest('/api/user', {
    method: 'PUT',
    headers: authHeader(loggedIn.user.token),
    body: JSON.stringify({
      user: {
        bio: 'Writes integration tests now.',
      },
    }),
  });

  assert.equal(updateResponse.status, 200);
  const updated = await readJson<AuthResponse>(updateResponse);
  assert.equal(updated.user.bio, 'Writes integration tests now.');

  const invalidPasswordChange = await apiRequest('/api/user', {
    method: 'PUT',
    headers: authHeader(loggedIn.user.token),
    body: JSON.stringify({
      user: {
        currentPassword: 'wrong-password',
        password: 'new-password-123',
      },
    }),
  });

  assert.equal(invalidPasswordChange.status, 422);

  const validPasswordChange = await apiRequest('/api/user', {
    method: 'PUT',
    headers: authHeader(loggedIn.user.token),
    body: JSON.stringify({
      user: {
        currentPassword: 'password123',
        password: 'new-password-123',
      },
    }),
  });

  assert.equal(validPasswordChange.status, 200);

  const reloginResponse = await apiRequest('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({
      user: {
        email: 'alice@example.com',
        password: 'new-password-123',
      },
    }),
  });

  assert.equal(reloginResponse.status, 200);
}

async function testArticleLifecycle() {
  await resetDatabase();

  const author = await registerUser('author', 'author@example.com');
  const reader = await registerUser('reader', 'reader@example.com');

  const createResponse = await apiRequest('/api/articles', {
    method: 'POST',
    headers: authHeader(author.token),
    body: JSON.stringify({
      article: {
        title: 'First Post',
        description: 'Opening post',
        body: 'Hello from the test suite.',
        tagList: ['testing', 'realworld'],
      },
    }),
  });

  assert.equal(createResponse.status, 201);
  const created = await readJson<ArticleResponse>(createResponse);
  assert.equal(created.article.title, 'First Post');
  assert.deepEqual(created.article.tagList, ['realworld', 'testing']);
  assert.equal(created.article.status, 'published');

  const listResponse = await apiRequest('/api/articles?limit=10&offset=0');
  assert.equal(listResponse.status, 200);
  const listed = await readJson<ArticlesResponse>(listResponse);
  assert.equal(listed.articlesCount, 1);
  assert.equal(listed.articles[0].slug, created.article.slug);

  const tagsResponse = await apiRequest('/api/tags');
  assert.equal(tagsResponse.status, 200);
  const tagsPayload = await readJson<{ tags: string[] }>(tagsResponse);
  assert.deepEqual(tagsPayload.tags.sort(), ['realworld', 'testing']);

  const draftResponse = await apiRequest('/api/articles', {
    method: 'POST',
    headers: authHeader(author.token),
    body: JSON.stringify({
      article: {
        title: '',
        description: '',
        body: '',
        isDraft: true,
      },
    }),
  });

  assert.equal(draftResponse.status, 201);
  const draft = await readJson<ArticleResponse>(draftResponse);
  assert.equal(draft.article.isDraft, true);
  assert.equal(draft.article.status, 'draft');

  const publicDraftListResponse = await apiRequest('/api/articles?author=author&status=draft');
  assert.equal(publicDraftListResponse.status, 200);
  const publicDraftList = await readJson<ArticlesResponse>(publicDraftListResponse);
  assert.equal(publicDraftList.articlesCount, 0);

  const ownDraftListResponse = await apiRequest('/api/articles?author=author&status=draft', {
    headers: authHeader(author.token),
  });
  assert.equal(ownDraftListResponse.status, 200);
  const ownDraftList = await readJson<ArticlesResponse>(ownDraftListResponse);
  assert.equal(ownDraftList.articlesCount, 1);

  const searchResponse = await apiRequest('/api/articles?search=Hello');
  assert.equal(searchResponse.status, 200);
  const searched = await readJson<ArticlesResponse>(searchResponse);
  assert.equal(searched.articlesCount, 1);

  const popularBeforeFavoriteResponse = await apiRequest('/api/articles?sort=popular');
  assert.equal(popularBeforeFavoriteResponse.status, 200);

  const updateResponse = await apiRequest(`/api/articles/${created.article.slug}`, {
    method: 'PUT',
    headers: authHeader(author.token),
    body: JSON.stringify({
      article: {
        title: 'Updated Post',
        description: 'Updated description',
      },
    }),
  });

  assert.equal(updateResponse.status, 200);
  const updated = await readJson<ArticleResponse>(updateResponse);
  assert.equal(updated.article.title, 'Updated Post');
  assert.notEqual(updated.article.slug, created.article.slug);

  const favoriteResponse = await apiRequest(`/api/articles/${updated.article.slug}/favorite`, {
    method: 'POST',
    headers: authHeader(reader.token),
  });

  assert.equal(favoriteResponse.status, 200);
  const favorited = await readJson<ArticleResponse>(favoriteResponse);
  assert.equal(favorited.article.favorited, true);
  assert.equal(favorited.article.favoritesCount, 1);

  const popularAfterFavoriteResponse = await apiRequest('/api/articles?sort=popular');
  assert.equal(popularAfterFavoriteResponse.status, 200);
  const popularAfterFavorite = await readJson<ArticlesResponse>(popularAfterFavoriteResponse);
  assert.equal(popularAfterFavorite.articles[0].slug, updated.article.slug);

  const draftDetailForReader = await apiRequest(`/api/articles/${draft.article.slug}`, {
    headers: authHeader(reader.token),
  });
  assert.equal(draftDetailForReader.status, 404);

  const publishDraftResponse = await apiRequest(`/api/articles/${draft.article.slug}`, {
    method: 'PUT',
    headers: authHeader(author.token),
    body: JSON.stringify({
      article: {
        title: 'Published Draft',
        description: 'Now visible to everyone',
        body: 'The draft has been published.',
        isDraft: false,
      },
    }),
  });

  assert.equal(publishDraftResponse.status, 200);
  const publishedDraft = await readJson<ArticleResponse>(publishDraftResponse);
  assert.equal(publishedDraft.article.isDraft, false);
  assert.equal(publishedDraft.article.status, 'published');

  const unfavoriteResponse = await apiRequest(`/api/articles/${updated.article.slug}/favorite`, {
    method: 'DELETE',
    headers: authHeader(reader.token),
  });

  assert.equal(unfavoriteResponse.status, 200);
  const unfavorited = await readJson<ArticleResponse>(unfavoriteResponse);
  assert.equal(unfavorited.article.favorited, false);
  assert.equal(unfavorited.article.favoritesCount, 0);

  const deleteResponse = await apiRequest(`/api/articles/${updated.article.slug}`, {
    method: 'DELETE',
    headers: authHeader(author.token),
  });

  assert.equal(deleteResponse.status, 204);

  const missingResponse = await apiRequest(`/api/articles/${updated.article.slug}`);
  assert.equal(missingResponse.status, 404);
}

async function testCommentLifecycle() {
  await resetDatabase();

  const author = await registerUser('comment-author', 'comment-author@example.com');
  const commenter = await registerUser('commenter', 'commenter@example.com');
  const article = await createArticle(author.token, 'Comment Target');

  const createCommentResponse = await apiRequest(`/api/articles/${article.slug}/comments`, {
    method: 'POST',
    headers: authHeader(commenter.token),
    body: JSON.stringify({
      comment: {
        body: 'This article now has a comment.',
      },
    }),
  });

  assert.equal(createCommentResponse.status, 201);
  const createdComment = await readJson<CommentResponse>(createCommentResponse);
  assert.equal(createdComment.comment.author.username, 'commenter');

  const listCommentsResponse = await apiRequest(`/api/articles/${article.slug}/comments`);
  assert.equal(listCommentsResponse.status, 200);
  const listedComments = await readJson<CommentsResponse>(listCommentsResponse);
  assert.equal(listedComments.comments.length, 1);
  assert.equal(listedComments.comments[0].body, 'This article now has a comment.');

  const deleteCommentResponse = await apiRequest(
    `/api/articles/${article.slug}/comments/${createdComment.comment.id}`,
    {
      method: 'DELETE',
      headers: authHeader(commenter.token),
    }
  );

  assert.equal(deleteCommentResponse.status, 204);
}

async function testProfileLifecycle() {
  await resetDatabase();

  const author = await registerUser('profile-author', 'profile-author@example.com');
  const follower = await registerUser('follower', 'follower@example.com');
  const article = await createArticle(author.token, 'Feed Article');

  const followResponse = await apiRequest('/api/profiles/profile-author/follow', {
    method: 'POST',
    headers: authHeader(follower.token),
  });

  assert.equal(followResponse.status, 200);
  const followedProfile = await readJson<ProfileResponse>(followResponse);
  assert.equal(followedProfile.profile.following, true);

  const feedResponse = await apiRequest('/api/articles/feed', {
    headers: authHeader(follower.token),
  });

  assert.equal(feedResponse.status, 200);
  const feed = await readJson<ArticlesResponse>(feedResponse);
  assert.equal(feed.articlesCount, 1);
  assert.equal(feed.articles[0].slug, article.slug);

  const profileResponse = await apiRequest('/api/profiles/profile-author', {
    headers: authHeader(follower.token),
  });

  assert.equal(profileResponse.status, 200);
  const profile = await readJson<ProfileResponse>(profileResponse);
  assert.equal(profile.profile.following, true);

  const unfollowResponse = await apiRequest('/api/profiles/profile-author/follow', {
    method: 'DELETE',
    headers: authHeader(follower.token),
  });

  assert.equal(unfollowResponse.status, 200);
  const unfollowedProfile = await readJson<ProfileResponse>(unfollowResponse);
  assert.equal(unfollowedProfile.profile.following, false);
}

async function testAvatarUploadLifecycle() {
  await resetDatabase();

  const user = await registerUser('avatar-user', 'avatar-user@example.com');

  const invalidUploadForm = new FormData();
  invalidUploadForm.append(
    'avatar',
    new Blob(['plain text'], { type: 'text/plain' }),
    'avatar.txt'
  );

  const invalidUploadResponse = await apiRequest('/api/user/avatar', {
    method: 'POST',
    headers: authHeader(user.token),
    body: invalidUploadForm,
  });

  assert.equal(invalidUploadResponse.status, 422);
  const invalidUploadPayload = await readJson<ErrorResponse>(invalidUploadResponse);
  assert.deepEqual(invalidUploadPayload.errors.body, ['Only PNG and JPG images are allowed.']);

  const validUploadForm = new FormData();
  validUploadForm.append(
    'avatar',
    new Blob(
      [
        Uint8Array.from([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
          0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
          0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
          0x00, 0x03, 0x01, 0x01, 0x00, 0xc9, 0xfe, 0x92, 0xef, 0x00, 0x00, 0x00,
          0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
        ]),
      ],
      { type: 'image/png' }
    ),
    'avatar.png'
  );

  const validUploadResponse = await apiRequest('/api/user/avatar', {
    method: 'POST',
    headers: authHeader(user.token),
    body: validUploadForm,
  });

  assert.equal(validUploadResponse.status, 200);
  const uploadPayload = await readJson<UploadResponse>(validUploadResponse);
  const uploadUrl = new URL(uploadPayload.url);
  const baseUrl = new URL(getBaseUrl());

  assert.equal(uploadUrl.origin, baseUrl.origin);
  assert.match(uploadUrl.pathname, /^\/uploads\/.+$/);

  const uploadedAssetResponse = await fetch(uploadPayload.url);

  try {
    assert.equal(uploadedAssetResponse.status, 200);
    assert.match(uploadedAssetResponse.headers.get('content-type') ?? '', /^image\/png\b/);
  } finally {
    const uploadedFilePath = path.resolve(uploadsDir, path.basename(uploadUrl.pathname));
    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  }
}

async function registerUser(username: string, email: string) {
  const response = await apiRequest('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      user: {
        username,
        email,
        password: 'password123',
      },
    }),
  });

  assert.equal(response.status, 201);
  const payload = await readJson<AuthResponse>(response);
  return payload.user;
}

async function createArticle(token: string, title: string) {
  const response = await apiRequest('/api/articles', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({
      article: {
        title,
        description: `${title} description`,
        body: `${title} body`,
        tagList: ['integration'],
      },
    }),
  });

  assert.equal(response.status, 201);
  const payload = await readJson<ArticleResponse>(response);
  return payload.article;
}

export async function runTests() {
  const scenarios: Array<[string, () => Promise<void>]> = [
    ['auth lifecycle', testAuthLifecycle],
    ['article lifecycle', testArticleLifecycle],
    ['comment lifecycle', testCommentLifecycle],
    ['profile lifecycle', testProfileLifecycle],
    ['avatar upload lifecycle', testAvatarUploadLifecycle],
  ];

  for (const [name, scenario] of scenarios) {
    await scenario();
    console.log(`PASS ${name}`);
  }
}

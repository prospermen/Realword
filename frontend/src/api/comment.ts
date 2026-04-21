import client from './client';
import type { CommentListResponse, SingleCommentResponse } from '../types/comment';
import { parseApiErrorMessage } from '../utils/error';

export interface CreateCommentPayload {
  body: string;
}

export interface DeleteCommentParams {
  slug: string;
  commentId: number;
}

function getCommentPath(slug: string) {
  return `/articles/${slug}/comments`;
}

function getCommentErrorMessage(error: unknown, fallback: string) {
  return parseApiErrorMessage(error, fallback);
}

async function requestPublishComment(slug: string, payload: CreateCommentPayload) {
  try {
    const { data } = await client.post<SingleCommentResponse>(getCommentPath(slug), {
      comment: payload,
    });
    return data;
  } catch (error) {
    throw new Error(getCommentErrorMessage(error, 'Failed to publish comment'));
  }
}

async function requestDeleteComment({ slug, commentId }: DeleteCommentParams) {
  try {
    await client.delete(`${getCommentPath(slug)}/${commentId}`);
  } catch (error) {
    throw new Error(getCommentErrorMessage(error, 'Failed to delete comment'));
  }
}

export const commentApi = {
  // Core: get comments for an article.
  async getArticleComments(slug: string) {
    try {
      const { data } = await client.get<CommentListResponse>(getCommentPath(slug));
      return data;
    } catch (error) {
      throw new Error(getCommentErrorMessage(error, 'Failed to load comments'));
    }
  },

  // Core: publish a comment.
  async publishComment(slug: string, body: string) {
    return requestPublishComment(slug, { body });
  },

  // Core: delete a comment.
  async deleteComment(params: DeleteCommentParams) {
    await requestDeleteComment(params);
  },
};

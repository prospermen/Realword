import client from './client';

export interface TagListResponse {
  tags: string[];
}

export const tagApi = {
  async getTags() {
    const { data } = await client.get<TagListResponse>('/tags');
    return data;
  },
};

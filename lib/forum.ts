import { databases, client, config, Query, ID } from './appwrite';
import type { ForumPost, ForumComment } from './appwrite';

// Type guard helper
const asForumPost = (doc: any): ForumPost => doc as unknown as ForumPost;
const asForumComment = (doc: any): ForumComment => doc as unknown as ForumComment;

export class ForumService {
  // ==================== POST OPERATIONS ====================
  
  /**
   * Create a new forum post
   */
  static async createPost(postData: {
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    tags?: string[];
    category?: string;
  }): Promise<ForumPost> {
    try {
      const post = await databases.createDocument(
        config.databaseId,
        config.collections.forumPosts,
        ID.unique(),
        {
          title: postData.title,
          content: postData.content,
          authorId: postData.authorId,
          authorName: postData.authorName,
          tags: postData.tags || [],
          category: postData.category || 'General',
          viewCount: 0,
          commentCount: 0,
          isPinned: false,
          isClosed: false,
        }
      );
      return asForumPost(post);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Get all posts with optional filters
   */
  static async getPosts(options?: {
    category?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ForumPost[]> {
    try {
      const queries: any[] = [
        Query.orderDesc('$createdAt'),
        Query.limit(options?.limit || 50),
      ];

      if (options?.offset) {
        queries.push(Query.offset(options.offset));
      }

      if (options?.category) {
        queries.push(Query.equal('category', options.category));
      }

      if (options?.authorId) {
        queries.push(Query.equal('authorId', options.authorId));
      }

      const response = await databases.listDocuments(
        config.databaseId,
        config.collections.forumPosts,
        queries
      );

      return response.documents.map(asForumPost);
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  /**
   * Get a single post by ID
   */
  static async getPost(postId: string): Promise<ForumPost> {
    try {
      const post = await databases.getDocument(
        config.databaseId,
        config.collections.forumPosts,
        postId
      );
      return asForumPost(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  /**
   * Update a post
   */
  static async updatePost(
    postId: string,
    updates: Partial<Omit<ForumPost, '$id' | '$createdAt' | '$updatedAt'>>
  ): Promise<ForumPost> {
    try {
      const post = await databases.updateDocument(
        config.databaseId,
        config.collections.forumPosts,
        postId,
        updates
      );
      return asForumPost(post);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  /**
   * Delete a post
   */
  static async deletePost(postId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        config.databaseId,
        config.collections.forumPosts,
        postId
      );
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  /**
   * Increment post view count
   */
  static async incrementViewCount(postId: string): Promise<void> {
    try {
      const post = await this.getPost(postId);
      await this.updatePost(postId, {
        viewCount: post.viewCount + 1,
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  /**
   * Search posts by title or content
   */
  static async searchPosts(searchTerm: string): Promise<ForumPost[]> {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.collections.forumPosts,
        [
          Query.search('title', searchTerm),
          Query.orderDesc('$createdAt'),
        ]
      );
      return response.documents.map(asForumPost);
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  // ==================== COMMENT OPERATIONS ====================

  /**
   * Create a new comment
   */
  static async createComment(commentData: {
    postId: string;
    content: string;
    authorId: string;
    authorName: string;
    parentCommentId?: string;
  }): Promise<ForumComment> {
    try {
      const comment = await databases.createDocument(
        config.databaseId,
        config.collections.forumComments,
        ID.unique(),
        commentData
      );

      // Increment comment count on the post
      const post = await this.getPost(commentData.postId);
      await this.updatePost(commentData.postId, {
        commentCount: post.commentCount + 1,
      });

      return asForumComment(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Get comments for a post
   */
  static async getComments(postId: string): Promise<ForumComment[]> {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.collections.forumComments,
        [
          Query.equal('postId', postId),
          Query.orderAsc('$createdAt'),
          Query.limit(100),
        ]
      );
      return response.documents.map(asForumComment);
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  static async updateComment(
    commentId: string,
    content: string
  ): Promise<ForumComment> {
    try {
      const comment = await databases.updateDocument(
        config.databaseId,
        config.collections.forumComments,
        commentId,
        { content }
      );
      return asForumComment(comment);
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string, postId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        config.databaseId,
        config.collections.forumComments,
        commentId
      );

      // Decrement comment count on the post
      const post = await this.getPost(postId);
      await this.updatePost(postId, {
        commentCount: Math.max(0, post.commentCount - 1),
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  /**
   * Subscribe to new posts in real-time
   */
  static subscribeToNewPosts(callback: (post: ForumPost) => void) {
    return client.subscribe(
      `databases.${config.databaseId}.collections.${config.collections.forumPosts}.documents`,
      (response) => {
        if (
          response.events.includes(
            `databases.${config.databaseId}.collections.${config.collections.forumPosts}.documents.*.create`
          )
        ) {
          callback(response.payload as ForumPost);
        }
      }
    );
  }

  /**
   * Subscribe to post updates in real-time
   */
  static subscribeToPostUpdates(postId: string, callback: (post: ForumPost) => void) {
    return client.subscribe(
      `databases.${config.databaseId}.collections.${config.collections.forumPosts}.documents.${postId}`,
      (response) => {
        if (
          response.events.includes(
            `databases.${config.databaseId}.collections.${config.collections.forumPosts}.documents.${postId}.update`
          )
        ) {
          callback(response.payload as ForumPost);
        }
      }
    );
  }

  /**
   * Subscribe to new comments for a post in real-time
   */
  static subscribeToComments(postId: string, callback: (comment: ForumComment) => void) {
    return client.subscribe(
      `databases.${config.databaseId}.collections.${config.collections.forumComments}.documents`,
      (response) => {
        if (
          response.events.includes(
            `databases.${config.databaseId}.collections.${config.collections.forumComments}.documents.*.create`
          )
        ) {
          const comment = response.payload as ForumComment;
          if (comment.postId === postId) {
            callback(comment);
          }
        }
      }
    );
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get forum categories
   */
  static getCategories() {
    return [
      'General',
      'Interview Experiences',
      'Company Reviews',
      'Placement Tips',
      'Technical Doubts',
      'Resume Review',
      'Job Opportunities',
      'Other',
    ];
  }

  /**
   * Get popular tags
   */
  static async getPopularTags(limit: number = 10): Promise<string[]> {
    try {
      const posts = await this.getPosts({ limit: 100 });
      const tagCounts: { [key: string]: number } = {};

      posts.forEach((post) => {
        post.tags?.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag]) => tag);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      return [];
    }
  }
}

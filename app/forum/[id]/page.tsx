'use client';

import React, { useEffect, useState } from 'react';
import { ForumService } from '@/lib/forum';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import type { ForumPost, ForumComment } from '@/lib/appwrite';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Eye, 
  MessageSquare, 
  Pin, 
  Lock, 
  Send,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PostPage() {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadPostAndComments();
      incrementViewCount();

      // Subscribe to post updates
      const unsubscribePost = ForumService.subscribeToPostUpdates(
        id as string,
        (updatedPost) => {
          setPost(updatedPost);
        }
      );

      // Subscribe to new comments in real-time
      const unsubscribeComments = ForumService.subscribeToComments(
        id as string,
        (newComment) => {
          setComments((prev) => [...prev, newComment]);
        }
      );

      return () => {
        if (unsubscribePost && typeof unsubscribePost === 'function') {
          unsubscribePost();
        }
        if (unsubscribeComments && typeof unsubscribeComments === 'function') {
          unsubscribeComments();
        }
      };
    }
  }, [id]);

  const loadPostAndComments = async () => {
    try {
      setLoading(true);
      const [postData, commentsData] = await Promise.all([
        ForumService.getPost(id as string),
        ForumService.getComments(id as string),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await ForumService.incrementViewCount(id as string);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      setError('You must be logged in to comment');
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (post?.isClosed) {
      setError('This post is closed for comments');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await ForumService.createComment({
        postId: id as string,
        content: newComment.trim(),
        authorId: user.$id,
        authorName: user.name || user.email,
      });

      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await ForumService.deletePost(id as string);
      router.push('/forum');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await ForumService.deleteComment(commentId, id as string);
      setComments(comments.filter((c) => c.$id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Loading post...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Post not found</AlertDescription>
        </Alert>
        <Link href="/forum">
          <Button className="mt-4">Back to Forum</Button>
        </Link>
      </div>
    );
  }

  const isAuthor = user && post.authorId === user.$id;
  
  const getDashboardLink = () => {
    if (isAdmin) return "/admin/dashboard";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={getDashboardLink()}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/forum">
                <Button variant="ghost" size="sm">
                  Forum
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Placement Portal</h1>
                  <p className="text-sm text-gray-600">Forum Discussion</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount}</span>
                <MessageSquare className="w-4 h-4 ml-2" />
                <span>{post.commentCount}</span>
              </div>
              {isAuthor && (
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeletePost}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto p-6 max-w-5xl">

      {/* Post Content */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-2 mb-3">
            {post.isPinned && <Pin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />}
            {post.isClosed && <Lock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />}
            <h1 className="text-3xl font-bold flex-1">{post.title}</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline">{post.category}</Badge>
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
            <span className="text-sm text-gray-500 ml-auto">
              Posted by {post.authorName} •{' '}
              {formatDistanceToNow(new Date(post.$createdAt), { addSuffix: true })}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{post.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">
            Comments ({comments.length})
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          {isAuthenticated && !post.isClosed ? (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Textarea
                placeholder="Write your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                disabled={submitting}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting || !newComment.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          ) : post.isClosed ? (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>This post is closed for comments</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>
                You must be{' '}
                <Link href="/login" className="text-blue-500 underline">
                  logged in
                </Link>{' '}
                to comment
              </AlertDescription>
            </Alert>
          )}

          {/* Comments List */}
          {comments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                {comments.map((comment) => {
                  const isCommentAuthor = user && comment.authorId === user.$id;
                  
                  return (
                    <div key={comment.$id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold flex-shrink-0">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{comment.authorName}</span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comment.$createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {isCommentAuthor && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto h-6 px-2"
                              onClick={() => handleDeleteComment(comment.$id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
}

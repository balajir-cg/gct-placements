'use client';

import React, { useEffect, useState } from 'react';
import { ForumService } from '@/lib/forum';
import { useAuth } from '@/contexts/AuthContext';
import type { ForumPost } from '@/lib/appwrite';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Eye, Pin, Lock, Plus, Search, TrendingUp, ArrowLeft, GraduationCap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ForumPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [popularTags, setPopularTags] = useState<string[]>([]);
  
  const categories = ForumService.getCategories();

  useEffect(() => {
    loadPosts();
    loadPopularTags();
    
    // Subscribe to new posts in real-time
    const unsubscribe = ForumService.subscribeToNewPosts((newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await ForumService.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularTags = async () => {
    try {
      const tags = await ForumService.getPopularTags(8);
      setPopularTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      filterPosts();
      return;
    }
    
    try {
      setLoading(true);
      const results = await ForumService.searchPosts(searchTerm);
      setFilteredPosts(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Placement Portal</h1>
                  <p className="text-sm text-gray-600">Discussion Forum</p>
                </div>
              </div>
            </div>
            {isAuthenticated && (
              <Link href="/forum/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-7xl">{/* Page Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">💬 Discussion Forum</h1>
        <p className="text-gray-600">
          Share experiences, ask questions, and connect with fellow students
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Popular Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Loading posts...</p>
              </CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No posts found</p>
                {isAuthenticated && (
                  <Link href="/forum/new">
                    <Button>Create the first post</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Link key={post.$id} href={`/forum/${post.$id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Stats */}
                        <div className="flex flex-col items-center gap-2 text-sm text-gray-600 min-w-[60px]">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.viewCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.commentCount}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            {post.isPinned && (
                              <Pin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                            )}
                            {post.isClosed && (
                              <Lock className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                            )}
                            <h3 className="text-xl font-semibold hover:text-blue-600 flex-1">
                              {post.title}
                            </h3>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {post.content}
                          </p>

                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline">{post.category}</Badge>
                            {post.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                #{tag}
                              </Badge>
                            ))}
                            <span className="text-sm text-gray-500 ml-auto">
                              By {post.authorName} •{' '}
                              {formatDistanceToNow(new Date(post.$createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      </div>
    </div>
  );
}

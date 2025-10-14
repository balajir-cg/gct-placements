# 💬 Forum Feature - Setup & Usage Guide

## 📋 Overview

The Forum feature allows students to create posts, discuss topics, share interview experiences, ask questions, and interact with each other in real-time using **Appwrite** as the backend.

## ✨ Features

### Core Features
- ✅ **Create Posts** - Students can create discussion posts with titles, content, categories, and tags
- ✅ **Real-time Updates** - New posts and comments appear instantly using Appwrite's Realtime API
- ✅ **Comments System** - Students can comment on posts with nested reply support
- ✅ **Categories** - Organized topics (Interview Experiences, Company Reviews, Technical Doubts, etc.)
- ✅ **Tags** - Add relevant tags to posts for easy discovery
- ✅ **Search** - Search posts by title and content
- ✅ **View & Comment Counts** - Track engagement metrics
- ✅ **Pin Posts** - Admins can pin important posts
- ✅ **Close Posts** - Admins can close posts to prevent new comments
- ✅ **Edit & Delete** - Authors can edit/delete their own posts and comments

### Categories Available
1. General
2. Interview Experiences
3. Company Reviews
4. Placement Tips
5. Technical Doubts
6. Resume Review
7. Job Opportunities
8. Other

---

## 🚀 Setup Instructions

### Step 1: Run the Setup Script

This will create the required Appwrite collections (`forum_posts` and `forum_comments`):

```bash
# Make sure you have APPWRITE_API_KEY in your .env.local
node scripts/setup-forum-collections.js
```

**What this creates:**
- `forum_posts` collection with attributes (title, content, authorId, tags, category, etc.)
- `forum_comments` collection with attributes (postId, content, authorId, etc.)
- Indexes for better query performance
- Proper permissions (read: any, create/update/delete: users)

### Step 2: Update Environment Variables

Add these to your `.env.local` (they're already set if collections are named as default):

```env
NEXT_PUBLIC_APPWRITE_FORUM_POSTS_COLLECTION_ID=forum_posts
NEXT_PUBLIC_APPWRITE_FORUM_COMMENTS_COLLECTION_ID=forum_comments
```

### Step 3: Access the Forum

Navigate to:
```
http://localhost:3000/forum
```

---

## 📁 File Structure

```
app/forum/
├── page.tsx                 # Forum listing page (all posts)
├── new/
│   └── page.tsx            # Create new post page
└── [id]/
    └── page.tsx            # Individual post view with comments

lib/
├── forum.ts                 # Forum service with CRUD operations
└── appwrite.ts             # Updated with forum collections

scripts/
└── setup-forum-collections.js  # Database setup script
```

---

## 🔧 API Reference

### ForumService Methods

#### Post Operations

```typescript
// Create a new post
await ForumService.createPost({
  title: string,
  content: string,
  authorId: string,
  authorName: string,
  tags?: string[],
  category?: string
});

// Get all posts (with optional filters)
await ForumService.getPosts({
  category?: string,
  authorId?: string,
  limit?: number,
  offset?: number
});

// Get single post
await ForumService.getPost(postId: string);

// Update post
await ForumService.updatePost(postId: string, updates: Partial<ForumPost>);

// Delete post
await ForumService.deletePost(postId: string);

// Search posts
await ForumService.searchPosts(searchTerm: string);

// Increment view count
await ForumService.incrementViewCount(postId: string);
```

#### Comment Operations

```typescript
// Create comment
await ForumService.createComment({
  postId: string,
  content: string,
  authorId: string,
  authorName: string,
  parentCommentId?: string  // For nested replies
});

// Get comments for a post
await ForumService.getComments(postId: string);

// Update comment
await ForumService.updateComment(commentId: string, content: string);

// Delete comment
await ForumService.deleteComment(commentId: string, postId: string);
```

#### Real-time Subscriptions

```typescript
// Subscribe to new posts
const unsubscribe = ForumService.subscribeToNewPosts((newPost) => {
  console.log('New post created:', newPost);
});

// Subscribe to post updates
const unsubscribe = ForumService.subscribeToPostUpdates(postId, (updatedPost) => {
  console.log('Post updated:', updatedPost);
});

// Subscribe to new comments
const unsubscribe = ForumService.subscribeToComments(postId, (newComment) => {
  console.log('New comment:', newComment);
});

// Cleanup
unsubscribe();
```

---

## 🎨 UI Components Used

- `Card`, `CardHeader`, `CardContent`, `CardTitle` - Layout
- `Button` - Actions
- `Input`, `Textarea` - Form inputs
- `Select` - Category dropdown
- `Badge` - Tags and categories
- `Alert` - Error/info messages
- `Separator` - Visual dividers
- Lucide Icons - Eye, MessageSquare, Pin, Lock, Search, etc.

---

## 🔒 Permissions

### Posts Collection
- **Read**: `any` (everyone can see posts)
- **Create**: `users` (authenticated users)
- **Update**: `users` (only author can edit)
- **Delete**: `users` (only author can delete)

### Comments Collection
- **Read**: `any` (everyone can see comments)
- **Create**: `users` (authenticated users)
- **Update**: `users` (only author can edit)
- **Delete**: `users` (only author can delete)

---

## 📊 Data Models

### ForumPost
```typescript
{
  $id: string
  title: string                // Max 255 chars
  content: string              // Max 10,000 chars
  authorId: string
  authorName: string
  tags?: string[]              // Max 5 tags
  category: string             // Default: 'General'
  viewCount: number            // Default: 0
  commentCount: number         // Default: 0
  isPinned: boolean            // Default: false
  isClosed: boolean            // Default: false
  $createdAt: string
  $updatedAt: string
}
```

### ForumComment
```typescript
{
  $id: string
  postId: string               // Reference to parent post
  content: string              // Max 5,000 chars
  authorId: string
  authorName: string
  parentCommentId?: string     // For nested replies
  $createdAt: string
  $updatedAt: string
}
```

---

## 🎯 Usage Examples

### Creating a Post

1. Navigate to `/forum`
2. Click "New Post" button
3. Fill in:
   - Title (required)
   - Category (required)
   - Content (required)
   - Tags (optional, up to 5)
4. Click "Publish Post"

### Commenting on a Post

1. Open a post by clicking on it
2. Scroll to the comment section
3. Type your comment
4. Click "Post Comment"
5. Comment appears instantly for all users (real-time)

### Searching Posts

1. Use the search bar at the top of forum page
2. Type keywords from title or content
3. Press Enter or click Search icon
4. Results are filtered in real-time

---

## ⚡ Real-time Features

The forum uses **Appwrite's Realtime API** to provide instant updates:

1. **New Posts**: Appear instantly on the forum listing page
2. **New Comments**: Show up immediately on post detail pages
3. **Post Updates**: Changes to post data reflect in real-time
4. **View Counts**: Updated dynamically

No page refresh needed!

---

## 🔍 Admin Features (Coming Soon)

- Pin/Unpin posts
- Close/Open posts
- Delete any post/comment
- Edit any post
- Moderate content

---

## 🐛 Troubleshooting

### Error: "Collection not found"
- Run the setup script: `node scripts/setup-forum-collections.js`
- Check that environment variables are set correctly

### Error: "Unauthorized"
- Make sure user is logged in
- Check Appwrite permissions in the dashboard

### Real-time not working
- Check Appwrite project has Realtime API enabled
- Verify WebSocket connection in browser dev tools
- Check console for subscription errors

---

## 📈 Future Enhancements

- [ ] Nested comment replies
- [ ] Like/upvote system
- [ ] User reputation points
- [ ] Post bookmarking
- [ ] Email notifications
- [ ] Rich text editor (Markdown/WYSIWYG)
- [ ] File attachments
- [ ] User profiles with post history
- [ ] Report abuse functionality
- [ ] Moderator dashboard

---

## 🤝 Contributing

To add new features:

1. Update `lib/forum.ts` with new service methods
2. Add required attributes to Appwrite collections
3. Update TypeScript interfaces in `lib/appwrite.ts`
4. Create/update UI components in `app/forum/`
5. Test real-time functionality

---

## 📝 License

This forum feature is part of the GCT Placements application.

---

## 💡 Tips

- Use descriptive titles for better searchability
- Choose the right category for your post
- Add relevant tags to increase visibility
- Be respectful and constructive
- Search before posting to avoid duplicates

**Happy Discussing! 🎉**

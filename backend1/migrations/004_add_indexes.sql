CREATE INDEX IF NOT EXISTS idx_posts_userId ON Posts(userId);
CREATE INDEX IF NOT EXISTS idx_comments_postId ON Comments(postId);
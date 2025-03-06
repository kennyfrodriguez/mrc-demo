import React, { useState } from 'react';
import { Grid, Card, List, ListItem, ListItemText, Typography } from '@mui/material';

const categories = [
  { id: 1, name: 'General Discussion' },
  { id: 2, name: 'Technical Support' },
  { id: 3, name: 'Suggestions' },
  { id: 4, name: 'Announcements' }
];

const posts = {
  1: [
    { id: 1, title: 'Welcome to the forum!', content: '...' },
    { id: 2, title: 'Forum rules', content: '...' }
  ],
  2: [
    { id: 3, title: 'How to reset password', content: '...' },
    { id: 4, title: 'Server maintenance', content: '...' }
  ],
  // ... other category posts
};

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedPost(null);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  return (
    <Grid container spacing={3} style={{ padding: '20px' }}>
      {/* Left Panel - Categories */}
      <Grid item xs={12} md={4}>
        <Typography variant="h5" gutterBottom>Categories</Typography>
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={12} key={category.id}>
              <Card 
                onClick={() => handleCategoryClick(category.id)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  backgroundColor: selectedCategory === category.id ? '#f0f0f0' : '#fff'
                }}
              >
                <Typography variant="h6">{category.name}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Right Panel - Posts */}
      <Grid item xs={12} md={8}>
        <Typography variant="h5" gutterBottom>Posts</Typography>
        <List>
          {posts[selectedCategory]?.map((post) => (
            <ListItem 
              button 
              key={post.id}
              onClick={() => handlePostClick(post)}
              selected={selectedPost?.id === post.id}
            >
              <ListItemText primary={post.title} />
            </ListItem>
          ))}
        </List>

        {/* Post Content */}
        {selectedPost && (
          <Card style={{ marginTop: '20px', padding: '16px' }}>
            <Typography variant="h6" gutterBottom>{selectedPost.title}</Typography>
            <Typography>{selectedPost.content}</Typography>
          </Card>
        )}
      </Grid>
    </Grid>
  );
} 
"use client";

import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, ListItem } from "@/components/ui/list";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, User, Flag, Clock, ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ChangelogEntry {
  date: string;
  change: string;
}

interface Post {
  id: number;
  title: string;
  category: string;
  content: string;
  priority: string;
  status: string;
  createdBy: string;
  createdAt: string;
  comments: number;
  changelog: ChangelogEntry[];
}

// Updated categories with colors
const categories = [
  { id: 1, name: 'Complaints', color: 'bg-red-100 text-red-800' },
  { id: 2, name: 'DDS', color: 'bg-blue-100 text-blue-800' },
  { id: 3, name: 'EIP', color: 'bg-green-100 text-green-800' },
  { id: 4, name: 'MH', color: 'bg-purple-100 text-purple-800' },
  { id: 5, name: 'OTHER', color: 'bg-gray-100 text-gray-800' },
  { id: 6, name: 'SPED', color: 'bg-yellow-100 text-yellow-800' },
  { id: 7, name: 'Trips', color: 'bg-indigo-100 text-indigo-800' }
];

// Enhanced posts with more details
const posts: Post[] = [
  { 
    id: 1, 
    title: 'Welcome to the Forum', 
    category: 'Complaints', 
    content: 'This forum is designed to help you navigate through various issues and find solutions quickly. Please follow our community guidelines when posting.',
    priority: 'High',
    status: 'Open',
    createdBy: 'Admin',
    createdAt: '2024-03-01',
    comments: 5,
    changelog: [
      { date: '2024-03-02', change: 'Updated guidelines section' },
      { date: '2024-03-01', change: 'Initial post created' }
    ]
  },
  { 
    id: 2, 
    title: 'System Update Notification', 
    category: 'DDS', 
    content: 'We will be performing system maintenance on March 15th. The system will be unavailable from 2:00 AM to 4:00 AM EST.',
    priority: 'Medium',
    status: 'Scheduled',
    createdBy: 'System',
    createdAt: '2024-03-05',
    comments: 2,
    changelog: [
      { date: '2024-03-05', change: 'Initial announcement' }
    ]
  },
  { 
    id: 3, 
    title: 'New Feature: Enhanced Reporting', 
    category: 'EIP', 
    content: 'We have added new reporting capabilities to help you analyze data more effectively.',
    priority: 'Low',
    status: 'Completed',
    createdBy: 'Product Team',
    createdAt: '2024-02-28',
    comments: 8,
    changelog: [
      { date: '2024-03-03', change: 'Added documentation links' },
      { date: '2024-02-28', change: 'Feature announcement' }
    ]
  },
];

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1 pt-16">
          <AppSidebar />
          <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto md:ml-64">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
              {/* Left Panel - Categories */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div 
                      onClick={() => setSelectedCategory('All')}
                      className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
                        selectedCategory === 'All' ? 'bg-accent font-medium' : 'hover:bg-accent/50'
                      }`}
                    >
                      All Posts
                    </div>
                    <Separator />
                    {categories.map((category) => (
                      <div 
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
                          selectedCategory === category.name ? 'bg-accent font-medium' : 'hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{category.name}</span>
                          <Badge className={category.color} variant="outline">
                            {posts.filter(post => post.category === category.name).length}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Posts */}
              <div>
                {!selectedPost ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold">
                        {selectedCategory === 'All' ? 'All Posts' : selectedCategory}
                      </h1>
                      <Button>New Post</Button>
                    </div>
                    <div className="space-y-4">
                      {filteredPosts.map((post) => (
                        <Card 
                          key={post.id} 
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedPost(post)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-xl">{post.title}</CardTitle>
                              <Badge className={getCategoryColor(post.category)}>
                                {post.category}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground line-clamp-2 mb-4">{post.content}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <Badge variant="outline" className={getPriorityColor(post.priority)}>
                                {post.priority}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(post.status)}>
                                {post.status}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.createdBy}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {post.createdAt}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {post.comments}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <Button 
                      variant="ghost" 
                      className="gap-2"
                      onClick={() => setSelectedPost(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Posts
                    </Button>
                    
                    <Card>
                      <CardHeader>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={getCategoryColor(selectedPost.category)}>
                            {selectedPost.category}
                          </Badge>
                          <Badge className={getPriorityColor(selectedPost.priority)}>
                            {selectedPost.priority}
                          </Badge>
                          <Badge className={getStatusColor(selectedPost.status)}>
                            {selectedPost.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl">{selectedPost.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {selectedPost.createdBy}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {selectedPost.createdAt}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-accent/30 p-4 rounded-lg">
                          <p className="text-foreground">{selectedPost.content}</p>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Comments ({selectedPost.comments})
                          </h3>
                          <div className="space-y-4">
                            <Card className="bg-muted/50">
                              <CardContent className="pt-4">
                                <div className="flex justify-between">
                                  <div className="font-medium">John Doe</div>
                                  <div className="text-sm text-muted-foreground">2024-03-04</div>
                                </div>
                                <p className="mt-2">This is very helpful information. Thank you!</p>
                              </CardContent>
                            </Card>
                            <Button className="gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Add Comment
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Changelog
                          </h3>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                {selectedPost.changelog.map((log: ChangelogEntry, index: number) => (
                                  <div key={index} className="flex items-start gap-3 pb-3">
                                    <div className="bg-accent/50 text-accent-foreground px-2 py-1 rounded text-sm whitespace-nowrap">
                                      {log.date}
                                    </div>
                                    <div>{log.change}</div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
} 
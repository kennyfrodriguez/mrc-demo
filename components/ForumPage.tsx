"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForumPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Forum</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Welcome to the Forum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is a clean forum page. You can add your own content and structure here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
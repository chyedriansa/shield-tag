"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label'; 
import { Textarea } from '@/components/ui/textarea'; 
import { BookText, UserCircle, Shield, PlusCircle, Edit, Trash2, XCircle, CheckCircle } from 'lucide-react'; 

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]); 
  const [dashboardMessage, setDashboardMessage] = useState<string | null>(null);

  // Functional state for form handling
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null); 
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isFormError, setIsFormError] = useState(false);

  const router = useRouter();

  // Fetch articles from the API
  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/dashboard/articles', { 
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          router.push('/');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch articles');
      }

      const data = await response.json();
      setArticles(data.articles); 
      setDashboardMessage(data.message);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError(err.message || 'Gagal memuat artikel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormAuthor('');
    setFormMessage(null);
    setIsFormError(false);
    setIsCreating(false);
    setIsEditing(null);
  };

  // Handle form submission for creating or editing articles
  const handleSubmitArticle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormLoading(true);
    setFormMessage(null);
    setIsFormError(false);

    const token = localStorage.getItem('token');
    if (!token) {
      setFormMessage('Unauthorized: Please login again.');
      setIsFormError(true);
      setFormLoading(false);
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `http://localhost:5000/api/dashboard/articles/${isEditing}`
      : 'http://localhost:5000/api/dashboard/articles';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          author: formAuthor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      setFormMessage(data.message || (isEditing ? 'Article updated!' : 'Article created!'));
      setIsFormError(false);
      resetForm(); 
      fetchArticles();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setFormMessage(err.message || 'An error occurred.');
      setIsFormError(true);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (article: Article) => {
    setIsEditing(article.id);
    setFormTitle(article.title);
    setFormContent(article.content);
    setFormAuthor(article.author);
    setIsCreating(false); 
    setFormMessage(null);
    setIsFormError(false);
  };

  // Handle delete button click
  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Unauthorized: Please login again.');
      router.push('/');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/dashboard/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Deletion failed');
      }

      alert('Article deleted successfully!');
      fetchArticles(); 
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete article.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 to-indigo-900 text-white">
        <p>Memuat data dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-800 to-indigo-900 text-red-400">
        <p>Error: {error}</p>
        <Button onClick={handleLogout} className="mt-4 bg-red-600 hover:bg-red-700">Logout</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 text-white p-8 flex flex-col items-center">
      <Card className="w-full max-w-4xl bg-gray-900 text-white shadow-lg border border-purple-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Shield className="w-8 h-8"/> Dashboard Pengguna
          </CardTitle>
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          {dashboardMessage && (
            <p className="mb-6 text-lg text-gray-300">{dashboardMessage}</p>
          )}

          {/* Form Add/Edit Article */}
          <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-indigo-700 shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">
              {isCreating ? 'Tambah Artikel Baru' : (isEditing ? `Edit Artikel: ${formTitle.substring(0, 30)}...` : 'Kelola Artikel')}
            </h2>
            {(isCreating || isEditing) && (
              <form onSubmit={handleSubmitArticle} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Judul</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="content" className="text-gray-300">Konten</Label>
                  <Textarea
                    id="content"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    required
                    className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="author" className="text-gray-300">Penulis</Label>
                  <Input
                    id="author"
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    required
                    className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                {formMessage && (
                  <p className={`text-sm ${isFormError ? 'text-red-400' : 'text-green-400'}`}>
                    {formMessage}
                  </p>
                )}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    {formLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      isEditing ? <CheckCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />
                    )}
                    {isEditing ? 'Update Artikel' : 'Buat Artikel'}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Batal
                  </Button>
                </div>
              </form>
            )}
            {!isCreating && !isEditing && (
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Tambah Artikel Baru
              </Button>
            )}
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-purple-400">Daftar Artikel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.length === 0 ? (
              <p className="text-gray-400">Tidak ada artikel tersedia. Coba tambahkan yang baru!</p>
            ) : (
              articles.map((article) => (
                <Card key={article.id} className="bg-gray-800 border border-indigo-700 text-white shadow-md transition-transform transform hover:scale-105 flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-teal-300 flex items-center gap-2">
                      <BookText className="w-5 h-5"/> {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-300 mb-3 line-clamp-3">{article.content}</p>
                    <div className="flex items-center text-sm text-gray-400">
                      <UserCircle className="w-4 h-4 mr-1"/> Oleh: {article.author}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Diterbitkan: {new Date(article.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">Terakhir Diperbarui: {new Date(article.updatedAt).toLocaleDateString()}</p>
                  </CardContent>
                  <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                    <Button
                      onClick={() => handleEdit(article)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1 flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(article.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
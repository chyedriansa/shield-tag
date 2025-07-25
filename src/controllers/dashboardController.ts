import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 


interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const getAllArticles = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(403).json({ message: 'User ID not found in token.' });
  }

  try {
    let articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (articles.length === 0) {
      const dummyArticlesData = [
        { title: 'Keamanan API untuk Pemula', content: '', author: 'Pengembang A' },
        { title: 'Pengenalan Prisma ORM', content: '', author: 'Pengembang B' },
        { title: 'Membangun API dengan Express.js', content: '', author: 'Pengembang A' },
        { title: 'Pentingnya Environment Variables', content: '', author: 'Pengembang C' },
      ];

      await prisma.article.createMany({
        data: dummyArticlesData,
      });
      articles = await prisma.article.findMany({
        orderBy: { createdAt: 'desc' },
      });
      console.log('Dummy articles created and inserted into database.');
    }

    res.status(200).json({
      message: `Selamat datang, pengguna ${req.userId}! Ini adalah data dashboard Anda`,
      articles: articles,
    });
  } catch (error) {
    console.error('Error fetching/creating dashboard data:', error);
    res.status(500).json({ message: 'Server error when accessing dashboard data.' });
  }
};

// 2. CREATE ARTICLE
export const createArticle = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(403).json({ message: 'User ID not found in token.' });
  }

  const { title, content, author } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({ message: 'Title, content, and author are required' });
  }

  try {
    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        author,
      },
    });
    res.status(201).json({ message: 'Article created successfully', article: newArticle });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Server error when creating article' });
  }
};

// 3. READ SINGLE ARTICLE BY ID
export const getArticleById = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(403).json({ message: 'User ID not found in token.' });
  }

  const { id } = req.params; 

  try {
    const article = await prisma.article.findUnique({
      where: { id: id },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(200).json({ article: article });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Server error when fetching article' });
  }
};

// 4. UPDATE ARTICLE
export const updateArticle = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(403).json({ message: 'User ID not found in token.' });
  }

  const { id } = req.params;
  const { title, content, author } = req.body;

  if (!title && !content && !author) { 
    return res.status(400).json({ message: 'At least one field (title, content, or author) is required for update' });
  }

  try {
    const updatedArticle = await prisma.article.update({
      where: { id: id },
      data: {
        title: title || undefined, 
        content: content || undefined,
        author: author || undefined,
      },
    });
    res.status(200).json({ message: 'Article updated successfully', article: updatedArticle });
  } catch (error: any) {
    if (error.code === 'P2025') { 
      return res.status(404).json({ message: 'Article not found for update' });
    }
    console.error('Error updating article:', error);
    res.status(500).json({ message: 'Server error when updating article' });
  }
};

// 5. DELETE ARTICLE
export const deleteArticle = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(403).json({ message: 'User ID not found in token.' });
  }

  const { id } = req.params;

  try {
    await prisma.article.delete({
      where: { id: id },
    });
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') { 
      return res.status(404).json({ message: 'Article not found for deletion' });
    }
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Server error when deleting article' });
  }
};
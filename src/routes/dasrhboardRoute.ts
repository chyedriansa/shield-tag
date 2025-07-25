import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
    getAllArticles,
    createArticle,
    getArticleById,
    updateArticle,
    deleteArticle,
} from '../controllers/dashboardController';

const router = Router();

router.get('/articles', authenticateToken, getAllArticles); // READ 
router.post('/articles', authenticateToken, createArticle); // CREATE
router.get('/articles/:id', authenticateToken, getArticleById); // READ ONE
router.put('/articles/:id', authenticateToken, updateArticle); // UPDATE
router.delete('/articles/:id', authenticateToken, deleteArticle); // DELETE

export default router;
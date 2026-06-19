import { Router } from 'express';
import { getAlbums, createAlbum, getPhotos, addPhoto } from '../controllers/gallery.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAlbums);
router.post('/', createAlbum);
router.get('/:album_id/photos', getPhotos);
router.post('/:album_id/photos', addPhoto);

export default router;

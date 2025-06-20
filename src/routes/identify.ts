import { Router } from 'express';
import { ContactService } from '../services/contactService';
import { IdentifyController } from '../controllers/identifyController';

const router = Router();
const contactService = new ContactService();
const identifyController = new IdentifyController(contactService);

router.post('/', (req, res) => identifyController.identify(req, res));

export default router;
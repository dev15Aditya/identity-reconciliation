import { Request, Response } from 'express';
import { ContactService } from '../services/contactService';
import { ContactInput } from '../types/Contacts';
import { isValidPhoneNumber } from '../util/phoneValidator';
import { isValidEmail } from '../util/emailValidator';

export class IdentifyController {
    private contactService: ContactService;

    constructor(contactService: ContactService) {
        this.contactService = contactService;
    }

    public async identify(req: Request, res: Response): Promise<void> {
        try {
            const { email, phoneNumber }: ContactInput = req.body;

            this.validateInput(email, phoneNumber);

            const response = await this.contactService.identifyContact(
                email || null,
                phoneNumber || null
            );

            res.status(200).json(response);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private validateInput(email?: string, phoneNumber?: string): void {
        if (!email && !phoneNumber) {
            throw new Error('At least one of email or phoneNumber must be provided');
        }

        if (email && !isValidEmail(email)) {
            throw new Error('Invalid email format');
        }

        if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
            throw new Error('Invalid phone number format');
        }
    }

    private handleError(error: unknown, res: Response): void {
        console.error('Error in identifyContact:', error);

        const statusCode = error instanceof Error && error.message.includes('must be provided')
            ? 400
            : 500;

        res.status(statusCode).json({
            error: statusCode === 400 ? 'Bad request' : 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
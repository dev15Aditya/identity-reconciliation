// src/services/contactService.ts
import { PrismaClient } from '@prisma/client';
import { ContactResponse, ContactInput, ContactRecord } from '../types/Contacts';

const prisma = new PrismaClient();

export class ContactService {
    public async identifyContact(
        email: string | null,
        phoneNumber: string | null
    ): Promise<ContactResponse> {
        if (!email && !phoneNumber) {
            throw new Error('Either email or phoneNumber must be provided');
        }

        const existingContacts = await this.findContactsByEmailOrPhone(email, phoneNumber);

        if (existingContacts.length === 0) {
            const newContact = await this.createContact(email, phoneNumber, null, 'primary');
            return this.buildResponse([newContact]);
        }

        const primaryContacts = this.getPrimaryContacts(existingContacts);

        if (primaryContacts.length === 1) {
            const primaryContact = primaryContacts[0];

            if (this.needsNewSecondaryContact(existingContacts, email, phoneNumber)) {
                await this.createContact(email, phoneNumber, primaryContact.id, 'secondary');
            }

            const allLinkedContacts = await this.getAllLinkedContacts(primaryContact.id);
            return this.buildResponse(allLinkedContacts);
        }

        if (primaryContacts.length > 1) {
            const mergedPrimary = await this.mergePrimaryContacts(primaryContacts);
            const allLinkedContacts = await this.getAllLinkedContacts(mergedPrimary.id);

            if (this.needsNewSecondaryContact(allLinkedContacts, email, phoneNumber)) {
                await this.createContact(email, phoneNumber, mergedPrimary.id, 'secondary');
            }

            const finalLinkedContacts = await this.getAllLinkedContacts(mergedPrimary.id);
            return this.buildResponse(finalLinkedContacts);
        }

        throw new Error('Unexpected state in contact identification');
    }

    private async findContactsByEmailOrPhone(
        email: string | null,
        phoneNumber: string | null
    ): Promise<ContactRecord[]> {
        return prisma.contact.findMany({
            where: {
                OR: [
                    ...(email ? [{ email }] : []),
                    ...(phoneNumber ? [{ phoneNumber }] : [])
                ],
                deletedAt: null
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    private async createContact(
        email: string | null,
        phoneNumber: string | null,
        linkedId: number | null,
        linkPrecedence: 'primary' | 'secondary'
    ): Promise<ContactRecord> {
        return prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkedId,
                linkPrecedence
            }
        });
    }

    private getPrimaryContacts(contacts: ContactRecord[]): ContactRecord[] {
        const primaryIds = new Set<number>();

        contacts.forEach(contact => {
            if (contact.linkPrecedence === 'primary') {
                primaryIds.add(contact.id);
            } else if (contact.linkedId) {
                primaryIds.add(contact.linkedId);
            }
        });

        return contacts.filter(contact =>
            primaryIds.has(contact.id) && contact.linkPrecedence === 'primary'
        );
    }

    private needsNewSecondaryContact(
        existingContacts: ContactRecord[],
        email: string | null,
        phoneNumber: string | null
    ): boolean {
        const existingEmails = new Set(
            existingContacts.map(c => c.email).filter(Boolean)
        );
        const existingPhones = new Set(
            existingContacts.map(c => c.phoneNumber).filter(Boolean)
        );

        const hasNewEmail = email && !existingEmails.has(email);
        const hasNewPhone = phoneNumber && !existingPhones.has(phoneNumber);

        return (hasNewEmail || hasNewPhone) ? true : false;
    }

    private async mergePrimaryContacts(
        primaryContacts: ContactRecord[]
    ): Promise<ContactRecord> {
        primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        const oldestPrimary = primaryContacts[0];
        const contactsToMakeSecondary = primaryContacts.slice(1);

        await prisma.contact.updateMany({
            where: {
                id: { in: contactsToMakeSecondary.map(c => c.id) }
            },
            data: {
                linkPrecedence: 'secondary',
                linkedId: oldestPrimary.id,
                updatedAt: new Date()
            }
        });

        return oldestPrimary;
    }

    private async getAllLinkedContacts(primaryId: number): Promise<ContactRecord[]> {
        return prisma.contact.findMany({
            where: {
                OR: [
                    { id: primaryId },
                    { linkedId: primaryId }
                ],
                deletedAt: null
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    private buildResponse(contacts: ContactRecord[]): ContactResponse {
        const primaryContact = contacts.find(c => c.linkPrecedence === 'primary');

        if (!primaryContact) {
            throw new Error('No primary contact found');
        }

        const emails = Array.from(new Set(
            contacts.map(c => c.email).filter(Boolean) as string[]
        ));

        const phoneNumbers = Array.from(new Set(
            contacts.map(c => c.phoneNumber).filter(Boolean) as string[]
        ));

        const secondaryContactIds = contacts
            .filter(c => c.linkPrecedence === 'secondary')
            .map(c => c.id);

        return {
            contact: {
                primaryContactId: primaryContact.id,
                emails,
                phoneNumbers,
                secondaryContactIds
            }
        };
    }
}
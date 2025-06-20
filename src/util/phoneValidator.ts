export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const phoneRegex = /^[\d\-\+\(\)\s]+$/;
    return phoneRegex.test(phoneNumber) && phoneNumber.replace(/\D/g, '').length >= 6;
}

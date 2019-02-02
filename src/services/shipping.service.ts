import { Error, Response, emptyKeys, processErrors } from './response.service';
import { ShippingInterface, Shipping } from '../model';

export async function sanitizeShipping(body): Promise<Response> {
    const keys: Array<string> = ['firstName', 'lastName', 'country', 'postalCode', 'address1', 'city', 'region'];
    const errors: Array<Error> = emptyKeys(body, keys);

    return processErrors(errors);
}

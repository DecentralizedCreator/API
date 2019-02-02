import { ShippingInterface, Shipping } from '../model';
import { Response, ResponseTemplate, code } from '../services/response.service';
import { sanitizeShipping } from '../services/shipping.service';

export async function CreateShipping(req, res, next) {
    let routeResponse: Response = ResponseTemplate();
    try {
        routeResponse = await sanitizeShipping(req.body);

        if (routeResponse.code !== 200 && routeResponse.code !== 201) {
            return res.status(routeResponse.code).send(routeResponse);
        }

        const shippingObject: ShippingInterface = {
            userId: req.session.user._id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            country: req.body.country,
            postalCode: req.body.postalCode,
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            region: req.body.region,
            dateUpdated: Number(new Date()),
        };

        await Shipping.findOneAndUpdate(
            { userId: shippingObject.userId },
            shippingObject,
            { upsert: true }
        );

        routeResponse.code = 201;
        routeResponse.message = 'Shipping successfully updated';
        routeResponse.response = shippingObject;
    } catch (error) {
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function GetShipping(req, res, next) {
    const routeResponse: Response = ResponseTemplate();
    try {
        routeResponse.response = await Shipping.findOne({ userId: req.session.user._id });
    } catch (error) {
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

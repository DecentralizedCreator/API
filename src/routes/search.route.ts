import { ProfileInterface, Profile, UserInterface, User } from '../model';
import { Response, ResponseTemplate, code } from '../services/response.service';

export async function SearchProfiles(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        if (req.body.chris) {
            const Chris: UserInterface = await User.findOne({ email: 'hello@chriscates.ca' });
            routeResponse.response = await Profile.find({ user: Chris['_id'] }).sort({ dateUpdated: -1 });
        } else {
            const $search = req.body.query || '';
            const page = req.body.page || 0;
            const limit = 10;
            const skip = page * limit;

            const query = {
                published: true
            };

            if (req.body.category) {
                query['categories'] = req.body.category;
            }

            if (req.body.nsfw) {
                query['nsfw'] = req.body.nsfw || false;
            }

            if (req.body.censored) {
                query['censored'] = req.body.censored || false;
            }

            if ($search) {
                query['$search'] = {
                    $text: { $search }
                };
            };

            routeResponse.response = await Profile.find(query).sort({ dateUpdated: -1 }).skip(skip).limit(limit);
        }
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

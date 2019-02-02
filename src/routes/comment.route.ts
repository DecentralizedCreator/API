import { Profile, Comment, CommentInterface } from '../model';
import { Response, ResponseTemplate, code } from '../services/response.service';

export async function GetComments(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        routeResponse.response = await Comment.find({ profileId: req.params.profileId }).populate('user').sort({ dateUpdated: -1 });
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function PostComment(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const newCommentObject: CommentInterface = {
            user: req.session.user._id,
            profileId: req.params.profileId,
            comment: req.body.comment,
            dateUpdated: Number(new Date()),
        };

        const newComment = new Comment(newCommentObject);
        await newComment.save();

        routeResponse.code = 201;
        routeResponse.message = 'Comment successfully created';
        routeResponse.response = newComment;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

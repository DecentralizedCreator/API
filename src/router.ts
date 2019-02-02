import { upload } from './config';
import { Loaded, RouteCollection, LoggedIn } from './services/route.service';

import { ServerInfo, Session, Logout, CryptoInfo } from './routes/server.route';

import {
    UserRegister,
    UserLogin,

    UserUpdateEmail,
    UserUpdateUsername,
    UserUpdatePassword,
    UserUpdatePhoto,

} from './routes/user.route';

import {
    UserEmailCheck,
    UsernameCheck,
    User2FA,
    User2FAValidate,
    VerifyEmail,
    RegenerateEmailCode,
} from './routes/user.manage.route';

import {
    SearchProfiles
} from './routes/search.route';

import { CreateShipping, GetShipping } from './routes/shipping.route';

import {
    GenerateProfile,
    GetProfileList,
    DeleteProfile,
    GetProfile,
    GetProfileByUrl,
    UpdateProfileUrl,
    UpdateProfileHeading,
    UpdateProfileMeta,
    UpdateProfileLinks,
    UpdateProfileDescription,
    UpdateProfileGoals,
    UpdateProfileBanner,
    UpdateProfilePhoto,
    UpdateProfileCategories,
    PublishProfile,
} from './routes/profile.route';

import {
    GetTiers,
    GetTiersByProfileId,
    UpdateTier,
    UpdateTierPhoto,
    ShiftTier,
    DeleteTier,
    PublishTier,
} from './routes/tier.route';

import {
    GetEthWallet,
    GetAddressByUser,
    ValidateEthWithdraw,
    EthWithdraw,
} from './routes/wallet.route';

import {
    GetComments,
    PostComment,
} from './routes/comment.route';

import {
    CreateSubscription,
    CreateMetamaskSubscriptionPreCheck,
    CreateMetamaskSubscription,
    GetSubscriptions,
    ProfileSubscribers,
    RevokeSubscription,
    ReinstateSubscription,
    UpdateSubscriptionExpiry,
    GetSubscriberShipping,
} from './routes/subscriber.route';

export const ServerRoutes = [
    { type: 'GET', path: '/', component: ServerInfo },
    { type: 'GET', path: '/crypto', component: CryptoInfo },
    { type: 'GET', path: '/session', component: Session },
    { type: 'GET', path: '/logout', component: Logout },
    { type: 'POST', path: '/register', component: UserRegister },
    { type: 'POST', path: '/login', component: UserLogin },
    { type: 'POST', path: '/check/email', component: UserEmailCheck },
    { type: 'POST', path: '/check/username', component: UsernameCheck },
];

export const UserRoutes = [
    { type: 'PATCH', path: '/user/email', component: UserUpdateEmail },
    { type: 'POST', path: '/user/email/verify', component: VerifyEmail },
    { type: 'POST', path: '/user/email/verify/emailCode', component: RegenerateEmailCode },
    { type: 'PATCH', path: '/user/username', component: UserUpdateUsername },
    { type: 'PATCH', path: '/user/password', component: UserUpdatePassword },
    { type: 'POST', path: '/user/shipping', component: CreateShipping },
    { type: 'GET', path: '/user/shipping', component: GetShipping },
    { type: 'POST', path: '/user/photo', component: UserUpdatePhoto, middleware: upload.single('photo') },
    { type: 'POST', path: '/user/2fa', component: User2FA },
    { type: 'POST', path: '/user/2fa/validate', component: User2FAValidate },
];

export const ProfileRoutes = [
    { type: 'POST', path: '/profile/new', component: GenerateProfile },
    { type: 'GET', path: '/profile/list', component: GetProfileList },
    { type: 'DELETE', path: '/profile/delete/:profileId', component: DeleteProfile },
    { type: 'GET', path: '/profile/id/:profileId', component: GetProfile },
    { type: 'PATCH', path: '/profile/url', component: UpdateProfileUrl },
    { type: 'PATCH', path: '/profile/heading', component: UpdateProfileHeading },
    { type: 'PATCH', path: '/profile/meta', component: UpdateProfileMeta },
    { type: 'PATCH', path: '/profile/links', component: UpdateProfileLinks },
    { type: 'PATCH', path: '/profile/description', component: UpdateProfileDescription },
    { type: 'PATCH', path: '/profile/goals', component: UpdateProfileGoals },
    { type: 'POST', path: '/profile/:profileId/banner', component: UpdateProfileBanner, middleware: upload.single('banner') },
    { type: 'POST', path: '/profile/:profileId/photo', component: UpdateProfilePhoto, middleware: upload.single('photo') },
    { type: 'POST', path: '/profile/categories', component: UpdateProfileCategories },
    { type: 'PATCH', path: '/profile/publish', component: PublishProfile },
];

export const TierRoutes = [
    { type: 'GET', path: '/profile/:profileId/tier', component: GetTiers },
    { type: 'GET', path: '/profile/tier/user/:profileId', component: GetTiersByProfileId },
    { type: 'POST', path: '/profile/:profileId/tier', component: UpdateTier },
    { type: 'POST', path: '/profile/:profileId/tier/photo/:index', component: UpdateTierPhoto, middleware: upload.single('photo') },
    { type: 'PATCH', path: '/profile/:profileId/tier/shift', component: ShiftTier },
    { type: 'PATCH', path: '/profile/:profileId/tier/publish', component: PublishTier },
    { type: 'DELETE', path: '/profile/:profileId/tier/del/:index', component: DeleteTier },
];

export const WalletRoutes = [
    { type: 'GET', path: '/wallet/eth', component: GetEthWallet },
    { type: 'POST', path: '/wallet/eth/withdraw/validate', component: ValidateEthWithdraw },
    { type: 'POST', path: '/wallet/eth/withdraw', component: EthWithdraw },
];

export const PageRoutes = [
    { type: 'GET', path: '/profile/url/:profileUrl', component: GetProfileByUrl },
    { type: 'GET', path: '/profile/wallet/:tierId', component: GetAddressByUser },
    { type: 'GET', path: '/profile/comment/:profileId', component: GetComments },
    { type: 'POST', path: '/profile/comment/:profileId', component: PostComment },
];

export const SubscribeRoutes = [
    { type: 'POST', path: '/subscribe', component: CreateSubscription },
    { type: 'POST', path: '/subscribe/metamask/check', component: CreateMetamaskSubscriptionPreCheck },
    { type: 'POST', path: '/subscribe/metamask', component: CreateMetamaskSubscription },
    { type: 'GET', path: '/subscriptions', component: GetSubscriptions },
    { type: 'GET', path: '/profile/subscriptions/:profileId', component: ProfileSubscribers },
    { type: 'PATCH', path: '/subscription/:subscriptionId/revoke', component: RevokeSubscription },
    { type: 'PATCH', path: '/subscription/:subscriptionId/reinstate', component: ReinstateSubscription },
    { type: 'POST', path: '/subscription/:subscriptionId/expiry', component: UpdateSubscriptionExpiry },
];

export const PublicSubscribeRoutes = [
    { type: 'GET', path: '/subscriber/shipping/:userId', component: GetSubscriberShipping },
];

export const SearchRoutes = [
    { type: 'POST', path: '/search', component: SearchProfiles },
];

export function InitRoutes(app) {
    RouteCollection(app, 'Base server', ServerRoutes);
    RouteCollection(app, 'User', UserRoutes, LoggedIn);
    RouteCollection(app, 'Profile', ProfileRoutes, LoggedIn);
    RouteCollection(app, 'Tier', TierRoutes, LoggedIn);
    RouteCollection(app, 'Wallet', WalletRoutes, LoggedIn);
    RouteCollection(app, 'Public Profile Page', PageRoutes);
    RouteCollection(app, 'Subscribe', SubscribeRoutes);
    RouteCollection(app, 'Public Subscribe', PublicSubscribeRoutes);
    RouteCollection(app, 'Search', SearchRoutes);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNewsletterMetadata = exports.makeNewsLetterSocket = void 0;
const Utils_1 = require("../Utils");
const WABinary_1 = require("../WABinary");
const groups_1 = require("./groups");
var QueryId;
(function (QueryId) {
    QueryId["METADATA"] = "6620195908089573";
    QueryId["GETSUBSCRIBED"] = "6388546374527196";
    QueryId["CREATE"] = "6996806640408138";
    QueryId["UNMUTE"] = "7337137176362961";
    QueryId["MUTE"] = "25151904754424642";
    QueryId["FOLLOW"] = "7871414976211147";
    QueryId["UNFOLLOW"] = "7238632346214362";
    QueryId["UPDATE"] = "7150902998257522";
})(QueryId || (QueryId = {}));
const makeNewsLetterSocket = (config) => {
    const sock = (0, groups_1.makeGroupsSocket)(config);
    const { query } = sock;
    const newsletterQuery = async (variables, queryId) => (query({
        tag: 'iq',
        attrs: {
            type: 'get',
            xmlns: 'w:mex',
            to: WABinary_1.S_WHATSAPP_NET,
        },
        content: [{
                tag: 'query',
                attrs: {
                    'query_id': queryId
                },
                content: JSON.stringify({ variables })
            }]
    }));
    /**
     *
     * @param code https://whatsapp.com/channel/key
     */
    const getNewsletterInfo = async (key) => {
        var _a;
        const result = await newsletterQuery({
            input: {
                key,
                type: 'INVITE'
            },
            'fetch_viewer_metadata': false,
            'fetch_full_image': true,
            'fetch_creation_time': true,
        }, QueryId.METADATA);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        if (!json.data) {
            throw new Error('Error while fetch newsletter info ' + json);
        }
        return (0, exports.extractNewsletterMetadata)((_a = json.data) === null || _a === void 0 ? void 0 : _a.xwa2_newsletter);
    };
    const getSubscribedNewsletters = async () => {
        const result = await newsletterQuery(undefined, QueryId.GETSUBSCRIBED);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        if (!json.data) {
            throw new Error('Error while fetch subscribed newsletters ' + json);
        }
        return json.data.xwa2_newsletter_subscribed.map((v) => (0, exports.extractNewsletterMetadata)(v));
    };
    const createNewsLetter = async (name, desc, picture) => {
        var _a;
        const result = await newsletterQuery({
            input: {
                name,
                description: desc !== null && desc !== void 0 ? desc : null,
                picture: picture ? (await (0, Utils_1.generateProfilePicture)(picture)).img.toString('base64') : null
            }
        }, QueryId.CREATE);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        if (!json.data) {
            throw new Error('Error while create newsletter ' + json);
        }
        return (0, exports.extractNewsletterMetadata)((_a = json.data) === null || _a === void 0 ? void 0 : _a.xwa2_newsletter_create);
    };
    const toggleMuteNewsletter = async (jid, mute) => {
        let queryId = QueryId.UNMUTE;
        if (mute) {
            queryId = QueryId.MUTE;
        }
        const result = await newsletterQuery({
            'newsletter_id': jid
        }, queryId);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        return json;
    };
    const followNewsletter = async (jid) => {
        const result = await newsletterQuery({
            'newsletter_id': jid
        }, QueryId.FOLLOW);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        return json;
    };
    const unFollowNewsletter = async (jid) => {
        const result = await newsletterQuery({
            'newsletter_id': jid
        }, QueryId.UNFOLLOW);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        return json;
    };
    const updateNewsletterName = async (jid, name) => {
        var _a;
        const result = await newsletterQuery({
            'newsletter_id': jid,
            updates: {
                name,
                description: undefined,
                picture: undefined,
                settings: null
            }
        }, QueryId.UPDATE);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        if (!json.data) {
            throw new Error('Error while update newsletter ' + json);
        }
        return (0, exports.extractNewsletterMetadata)((_a = json.data) === null || _a === void 0 ? void 0 : _a.xwa2_newsletter_update);
    };
    const updateNewsletterDesc = async (jid, description) => {
        var _a;
        const result = await newsletterQuery({
            'newsletter_id': jid,
            updates: {
                name: undefined,
                description,
                picture: undefined,
                settings: null
            }
        }, QueryId.UPDATE);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        if (!json.data) {
            throw new Error('Error while update newsletter ' + json);
        }
        return (0, exports.extractNewsletterMetadata)((_a = json.data) === null || _a === void 0 ? void 0 : _a.xwa2_newsletter_update);
    };
    const updateNewsletterPicture = async (jid, picture) => {
        var _a;
        const result = await newsletterQuery({
            'newsletter_id': jid,
            updates: {
                name: undefined,
                description: undefined,
                picture: (await (0, Utils_1.generateProfilePicture)(picture)).img.toString('base64'),
                settings: null
            }
        }, QueryId.UPDATE);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        if (!json.data) {
            throw new Error('Error while update newsletter ' + json);
        }
        return (0, exports.extractNewsletterMetadata)((_a = json.data) === null || _a === void 0 ? void 0 : _a.xwa2_newsletter_update);
    };
    const removeNewsletterPicture = async (jid) => {
        var _a;
        const result = await newsletterQuery({
            'newsletter_id': jid,
            updates: {
                name: undefined,
                description: undefined,
                picture: '',
                settings: null
            }
        }, QueryId.UPDATE);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        if (!json.data) {
            throw new Error('Error while update newsletter ' + json);
        }
        return (0, exports.extractNewsletterMetadata)((_a = json.data) === null || _a === void 0 ? void 0 : _a.xwa2_newsletter_update);
    };
    const updateNewsletterReactionSetting = async (jid, value) => {
        var _a;
        const result = await newsletterQuery({
            'newsletter_id': jid,
            updates: {
                name: undefined,
                description: undefined,
                picture: undefined,
                settings: {
                    'reaction_codes': { value }
                }
            }
        }, QueryId.UPDATE);
        const node = (0, WABinary_1.getBinaryNodeChildString)(result, 'result');
        const json = JSON.parse(node);
        if (!json.data) {
            throw new Error('Error while update newsletter ' + json);
        }
        return (0, exports.extractNewsletterMetadata)((_a = json.data) === null || _a === void 0 ? void 0 : _a.xwa2_newsletter_update);
    };
    return {
        ...sock,
        getNewsletterInfo,
        createNewsLetter,
        getSubscribedNewsletters,
        toggleMuteNewsletter,
        followNewsletter,
        unFollowNewsletter,
        updateNewsletterName,
        updateNewsletterDesc,
        updateNewsletterPicture,
        updateNewsletterReactionSetting,
        removeNewsletterPicture
    };
};
exports.makeNewsLetterSocket = makeNewsLetterSocket;
const extractNewsletterMetadata = (data) => {
    var _a, _b, _c, _d;
    return {
        id: data.id,
        state: data.state,
        creationTime: +data.thread_metadata.creation_time,
        inviteCode: data.thread_metadata.invite,
        name: data.thread_metadata.name.text,
        desc: data.thread_metadata.description.text,
        subscriberCount: +data.thread_metadata.subscribers_count,
        verification: data.thread_metadata.verification,
        picture: (_a = data.thread_metadata.picture) === null || _a === void 0 ? void 0 : _a.direct_path,
        preview: data.thread_metadata.preview.direct_path,
        settings: {
            reaction: (_b = data.thread_metadata.settings) === null || _b === void 0 ? void 0 : _b.reaction_codes.value
        },
        mute: (_c = data.viewer_metadata) === null || _c === void 0 ? void 0 : _c.mute,
        role: (_d = data.viewer_metadata) === null || _d === void 0 ? void 0 : _d.role
    };
};
exports.extractNewsletterMetadata = extractNewsletterMetadata;

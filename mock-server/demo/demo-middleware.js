// eslint-disable-next-line no-undef
module.exports = (req, res) => {

    const send = res.send;

    const uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    switch (req.method) {
        case 'POST':
            req.body.id = uuidv4();

            // modify response
            res.header('Content-Type', 'text/plain');

            res.send = function(chunk) {
                if (res.statusCode === 201) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    chunk = JSON.stringify(JSON.parse(chunk).id);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    chunk = JSON.stringify({});
                }

                send.apply(this, arguments);
            };

            break;
        //         if (req.url.startsWith('/verify')) {
        //             // modify request
        //             req.method = 'GET';
        //             req.url = `/accounts_${domain}`;
        //             req.query = req.body;
        //             delete req.body;
        //
        //             // modify response
        //             res.header('Content-Type', 'text/plain');
        //
        //             const send = res.send;
        //             res.send = function(chunk) {
        //                 switch (domain) {
        //                     case 'td':
        //                         if (JSON.parse(chunk).length > 0) {
        //                             chunk = JSON.stringify(JSON.parse(chunk)[0].id);
        //                         } else {
        //                             res.status(401);
        //                         }
        //
        //                         break;
        //                     default:
        //                         break;
        //                 }
        //
        //                 send.apply(this, arguments);
        //             };
        //         } else if (req.url.startsWith('/links')) {
        //             // modify request
        //             req.body.id = req.body.userIds;
        //             delete req.body.userIds;
        //
        //             // modify response
        //             res.header('Content-Type', 'text/plain');
        //
        //             const send = res.send;
        //             res.send = function(chunk) {
        //                 switch (domain) {
        //                     case 'td':
        //                         if (res.statusCode !== 500) {
        //                             chunk = JSON.stringify({
        //                                 linkId: JSON.parse(chunk).id
        //                             });
        //                         } else {
        //                             chunk = JSON.stringify({});
        //                         }
        //
        //                         break;
        //                     default:
        //                         break;
        //                 }
        //
        //                 send.apply(this, arguments);
        //             };
        //         } else if (req.originalUrl.includes('forgot-password')) {
        //             // modify request
        //             req.method = 'GET';
        //         } else if (req.url.startsWith('/auth0/authorize')) {
        //             // modify request
        //             req.method = 'GET';
        //             req.url = `/auth0`;
        //             delete req.body;
        //
        //             // modify response
        //             const send = res.send;
        //             res.send = function(chunk) {
        //                 // res.status(401);
        //                 chunk = JSON.stringify(JSON.parse(chunk)[0].token);
        //
        //                 send.apply(this, arguments);
        //             };
        //         }
        //
        //         break;
        //     case 'GET':
        //         // modify response
        //         // eslint-disable-next-line no-case-declarations
        //         const send = res.send;
        //         res.send = function(chunk) {
        //             // const response = JSON.parse(chunk);
        //             res.status(412);
        //             // if (
        //             //     typeof response === 'object' &&
        //             //     response.constructor === Array &&
        //             //     response.length === 1
        //             // ) {
        //             //     chunk = response[0];
        //             // }
        //
        //             send.apply(this, arguments);
        //         };
        //         break;
        case 'DELETE':
            // modify response
            res.header('Content-Type', 'text/plain');

            res.send = function(chunk) {
                if (res.statusCode === 200) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    chunk = JSON.stringify('');
                }
                send.apply(this, arguments);
            };
            break;
        default:
            break;
    }
};

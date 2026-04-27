const logger = (req, res, next) => {
    const now = new Date().toISOString('he-IL');
    console.log(`[${now}] ${req.method} request to: ${req.url}`);

    res.on('finish', () => {
        console.log(`Response Status: ${res.statusCode}`);
        if (Object.keys(req.body).length > 0) {
            console.log('Request Body:', JSON.stringify(req.body, null, 2));
        }
    });

    next();
};

module.exports = logger;
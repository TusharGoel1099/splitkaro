module.exports = (req, res, next) => {
    const notFound = (details) => res.status(404).json({ message: 'Resource not found', details });
    const badRequest = (details) => res.status(400).json({ message: details })
    const success = (details) => res.status(200).json({ message: 'Records fetched successfully', details });
    const created = (details) => res.status(201).json({ message: 'Record created successfully', details });
    const serverError = () => {
        const defaultMessage = [
            {
                name: 'unexpected-server-error',
                messages: ['Please contact server administrator for troubleshooting'],
            },
        ];

        return res.status(500).json({
            msg: 'unexpected-internal-server-error',
            details: defaultMessage,
        });
    };
    const gh = {
        success,
        notFound,
        serverError, badRequest, created

    }
    Object.assign(res, gh)
    return next()
}
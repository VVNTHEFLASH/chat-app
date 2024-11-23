"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const next_1 = __importDefault(require("next"));
const dev = process.env.NODE_ENV !== 'production';
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;
app.prepare().then(() => {
    const server = (0, express_1.default)();
    // Example of a custom API route
    server.get('/api/hello', (req, res) => {
        res.json({ message: 'Hello from Express!' });
    });
    // Fallback to Next.js routing
    server.all('*', (req, res) => {
        return handle(req, res);
    });
    server.listen(PORT, (err) => {
        if (err)
            throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        console.log("DEBUG: Access Denied. No token provided.");
        return res.status(401).json({ message: "Access Denied" });
    }

    try {
        let tokenStr = token;
        if (token.startsWith("Bearer ")) {
            tokenStr = token.slice(7, token.length).trimLeft();
        }

        if (!process.env.JWT_SECRET) {
            console.error("DEBUG: JWT_SECRET is missing.");
            return res.status(500).json({ message: "Server Error: Configuration missing" });
        }
        const verified = jwt.verify(tokenStr, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.error("DEBUG: Token verification failed:", err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token Expired" });
        }
        res.status(400).json({ message: "Invalid Token" });
    }
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "admin") {
            next();
        } else {
            res.status(403).json({ message: "Access Denied: Admin only" });
        }
    });
};

export const verifyOrganiser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "organiser" || req.user.role === "admin") {
            next();
        } else {
            res.status(403).json({ message: "Access Denied: Organiser only" });
        }
    });
};

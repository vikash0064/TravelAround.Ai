// import jwt from "jsonwebtoken"; // Removed JWT
// import model for detailed checks if necessary, but session is trusted store.

export const verifyToken = (req, res, next) => {
    // Session middleware runs before this.
    // We expect req.session.user to be populated if logged in.

    if (req.session && req.session.user) {
        // Map session user to req.user for compatibility with existing controllers
        req.user = req.session.user;
        next();
    } else {
        console.log("DEBUG: Access Denied. No session or user not authenticated.");
        return res.status(401).json({ message: "Access Denied. Please log in." });
    }
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            res.status(403).json({ message: "Access Denied: Admin only" });
        }
    });
};

export const verifyOrganiser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && (req.user.role === "organiser" || req.user.role === "admin")) {
            next();
        } else {
            res.status(403).json({ message: "Access Denied: Organiser only" });
        }
    });
};

# 🚀 How to Configure Render Environment Variables

Since `.env` files are private and **ignored by Git** (they don't get uploaded to GitHub for security), you need to manually set your secrets on the Render website.

## ✅ Steps to Add JWT_SECRET (and others)

1.  **Open Render Dashboard**: Go to [https://dashboard.render.com/](https://dashboard.render.com/)
2.  **Select Your Service**: Click on your project/service name in the list.
3.  **Go to Environment**: In the left sidebar menu, click on **"Environment"**.
4.  **Add Variable**: Click the **"Add Environment Variable"** button.
5.  **Enter Details**:

    | Key | Value | Note |
    | :--- | :--- | :--- |
    | `JWT_SECRET` | `your_jwt_secret_key_change_this_later` | **REQUIRED** to fix the warning/login |
    | `MONGO_URI` | `mongodb+srv://...` | **REQUIRED** (Do not use localhost!) |
    | `VITE_GOOGLE_PLACES_API_KEY` | (Copy from `client/.env.local`) | Required for Maps/Places |

6.  **Save**: Click **"Save Changes"**.
7.  **Done!**: Render will automatically restart your server with the new settings.

---

## ❓ Why can't I just push `.env`?
Your `.gitignore` file prevents `.env` from being uploaded to GitHub. This is a safety feature so your secrets aren't exposed publicly.

import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xl font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-black/30 active:scale-[0.98]",
  {
    variants: {
      variant: {
        /* 🔥 Primary Gradient Button */
        default:
          "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200/50 hover:from-blue-700 hover:to-purple-700",

        /* ❗ Danger */
        destructive:
          "bg-linear-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-md shadow-red-100",

        /* ✨ Navbar / Secondary Button */
        outline:
          "border-2 border-blue-600/20 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-600 transition-all duration-300",

        /* Soft gray */
        secondary:
          "bg-blue-50 text-blue-700 hover:bg-blue-100/80",

        /* Minimal */
        ghost:
          "text-gray-600 hover:bg-gray-100 hover:text-blue-600",

        /* Link */
        link:
          "text-blue-600 underline-offset-4 hover:underline",
      },

      size: {
        default: "h-11 px-8",
        sm: "h-9 px-4",
        lg: "h-11 px-8 text-base",
        icon: "size-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
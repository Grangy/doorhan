
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "node_modules/@premieroctet/next-admin/dist/**/*.{js,ts,jsx,tsx}",
    "./nextAdminOptions.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {},
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require("@premieroctet/next-admin/preset")],
};
  
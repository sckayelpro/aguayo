// aguayo/packages/tailwind-config/postcss.config.js
/** @type {import('postcss').AcceptedPlugin} */
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [tailwindcss(), autoprefixer()],
};
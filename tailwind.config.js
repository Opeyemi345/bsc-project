/** @type {import('tailwindcss').Config} */
import withMT from '@material-tailwind/react/utils/withMT'
export default withMT({
  content: [
    "./client/index.html",
    "./client/src/**/*.{html,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
})


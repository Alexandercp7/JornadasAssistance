export default function (config) {
  return {
    ...config,
    plugins: {
      "@tailwindcss/postcss": {},
    },
  };
}
export default () => ({
    jwtKey: process.env.JWT_KEY,
    port: process.env.PORT || 3000,
})

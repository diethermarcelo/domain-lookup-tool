const ENV = {
    WHOISAPI_URL: "WHOISAPI_URL",
    APP_NAME: "APP_NAME",
    PORT: "PORT"
}

const getEnv = (env: string) => {
    let defaultEnv; 

    switch (env) {
        case ENV.PORT:
            defaultEnv = process.env[ENV.PORT] ?? 3000 
        default:
            defaultEnv = process.env[env];
            break;
    }
    
    return defaultEnv;
}

export { ENV, getEnv }

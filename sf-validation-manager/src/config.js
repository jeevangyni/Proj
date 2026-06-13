const isProduction = window.location.hostname !== "localhost";

export const SF_CONFIG = {
  clientId: process.env.REACT_APP_SF_CLIENT_ID,
  redirectUri: isProduction
    ? "https://sf-validation-manager-2860559ac495.herokuapp.com/oauth/callback"
    : "http://localhost:3000/oauth/callback",
  loginUrl: "https://login.salesforce.com",
};
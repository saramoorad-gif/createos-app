// DocuSign integration
// Set these env vars after creating a DocuSign developer account

export const DOCUSIGN_INTEGRATION_KEY = (process.env.DOCUSIGN_INTEGRATION_KEY || "").trim();
export const DOCUSIGN_SECRET_KEY = (process.env.DOCUSIGN_SECRET_KEY || "").trim();
export const DOCUSIGN_REDIRECT_URI = "https://createsuite.co/api/auth/docusign/callback";
export const DOCUSIGN_AUTH_SERVER = (process.env.DOCUSIGN_AUTH_SERVER || "https://account-d.docusign.com").trim(); // -d for demo, remove for production

export function getDocuSignAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    scope: "signature",
    client_id: DOCUSIGN_INTEGRATION_KEY,
    redirect_uri: DOCUSIGN_REDIRECT_URI,
    state,
  });
  return `${DOCUSIGN_AUTH_SERVER}/oauth/auth?${params}`;
}

export async function exchangeDocuSignCode(code: string) {
  const basicAuth = Buffer.from(`${DOCUSIGN_INTEGRATION_KEY}:${DOCUSIGN_SECRET_KEY}`).toString("base64");

  const res = await fetch(`${DOCUSIGN_AUTH_SERVER}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: DOCUSIGN_REDIRECT_URI,
    }),
  });
  return res.json();
}

export function isDocuSignConfigured(): boolean {
  return Boolean(DOCUSIGN_INTEGRATION_KEY && DOCUSIGN_SECRET_KEY);
}

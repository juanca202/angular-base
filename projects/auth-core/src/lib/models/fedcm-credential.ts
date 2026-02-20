export interface FedcmCredentialRequestOptions extends CredentialRequestOptions {
  identity: {
    providers: {
      configURL: string;
      clientId: string;
      fields: string[];
      params: any;
      nonce: string;
    }[];
    mode: string;
  };
}

export interface FedcmCredential {
  token: string;
  // ... other properties if any
}

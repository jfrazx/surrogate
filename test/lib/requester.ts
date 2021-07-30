import querystring from 'querystring';
import { memoize } from 'lodash';
import {
  NextParameters,
  NextAsyncPre,
  SurrogateContext,
  SurrogateAsyncPre,
  SurrogateDelegate,
} from '../../src';

@SurrogateDelegate({ useContext: SurrogateContext.Surrogate })
export class Requester {
  private readonly configurationCache = memoize(
    async (payerId: string, type = '285', subtypeId = 'TB'): Promise<any> => {
      const response = await this.call(
        `${this.configuration.host}/configurations?${querystring.stringify({
          payerId,
          type,
          subtypeId,
        })}`,
        {
          method: 'GET',
        },
      );

      return response.json();
    },
    (payerId, type, subtypeId) => [payerId, type, subtypeId].join('|'),
  );

  private tokenPromise: Promise<void> | null = null;
  private readonly expiredThreshold = 5000;
  private readonly configuration = {
    host: `https://www.example.com`,
    credentials: {
      client_id: 'client_id',
      client_secret: 'client_secret',
    },
  };
  token?: any;

  shouldRenewToken() {
    if (!this.token) {
      throw new Error('I cannot renew a token because i have no token');
    }

    return Date.now() + this.expiredThreshold >= this.token.expiresOn;
  }

  @SurrogateAsyncPre<Requester>({
    handler(this: Requester, { next }: NextParameters<Requester>) {
      next.next({ bail: true, bailWith: this.tokenPromise });
    },
    options: {
      runConditions(this: Requester) {
        return this.tokenPromise !== null;
      },
    },
  })
  @NextAsyncPre<Requester>({
    action: ['call', 'getConfiguration'],
    options: {
      runConditions: ({ instance }) => !instance.tokenExists || instance.shouldRenewToken(),
      useNext: false,
      noArgs: true,
    },
  })
  getToken() {
    return (this.tokenPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await this.tokenResponse;

        if (response.status === 429) {
          return reject(response);
        } else if (response.status !== 200) {
          return reject(response);
        }

        this.token = await response.json();
        this.token.expiresOn = this.token.expires_in * 1000 + Date.now();

        resolve();
      } catch (error) {
        reject(error);
      } finally {
        this.tokenPromise = null;
      }
    }));
  }

  private get tokenResponse() {
    return this.fetch(`${this.configuration.host}/token`, {
      headers: { accept: 'application/json' },
      body: this.params,
      method: 'post',
    });
  }

  private get params() {
    return new URLSearchParams({
      scope: 'scope',
      grant_type: 'client_credentials',
      client_id: this.configuration.credentials.client_id,
      client_secret: this.configuration.credentials.client_secret,
    });
  }

  get tokenExists() {
    return !!this.token;
  }

  async call(url: string, requestOptions: RequestInit): Promise<Response> {
    try {
      return this.rateLimitedCall(url, this.setToken(requestOptions));
    } catch (error) {
      throw error;
    }
  }

  private rateLimitedCall(url: string, requestOptions: RequestInit): Promise<Response> {
    return rateLimiter(async () => this.fetch(url, requestOptions));
  }

  private setToken(requestOptions: RequestInit) {
    return {
      headers: {
        Authorization: `Bearer ${this.token.access_token}`,
      },
      ...requestOptions,
    };
  }

  protected async fetch(url: string, requestOptions: RequestInit): Promise<Response> {
    return fetch(url, requestOptions);
  }

  getConfiguration(payerId: string, type = '270', subtypeId = 'HS') {
    return this.configurationCache(payerId, type, subtypeId);
  }
}

const rateLimiter = async (fn: () => Promise<Response>): Promise<Response> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fn().then(resolve).catch(reject);
    }, 1000);
  });
};

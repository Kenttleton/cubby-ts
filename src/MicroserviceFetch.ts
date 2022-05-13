import type { ClientRequest } from 'http';
import http from 'http';
import https from 'https';
import { URL } from 'url';

class MicroserviceFetch {
  url: URL;
  headers: Record<string, string> | undefined;
  body: string | undefined;
  method: string;

  private setFromURL(url: string): void {
    this.url = new URL(url);
  }

  private request = async <T>(): Promise<Error | T> => {
    let response: Error | T = {} as Error | T;
    if (this.url.protocol === 'https:') {
      const options: https.RequestOptions = {
        hostname: this.url.hostname,
        port: this.url.port || '443',
        path: this.url.pathname,
        protocol: this.url.protocol,
        headers: this.headers,
        method: this.method
      };
      response = await this.httpsRequest<T>(options);
      return response;
    }

    const options: http.RequestOptions = {
      hostname: this.url.hostname,
      port: this.url.port || '80',
      path: this.url.pathname,
      protocol: this.url.protocol,
      headers: this.headers,
      method: this.method
    };
    response = await this.httpRequest<T>(options);
    return response;
  };

  private httpRequest = async <T>(options: http.RequestOptions): Promise<Error | T> => {
    let response: Error | T = {} as Error | T;
    const req: ClientRequest = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk as string;
      });
      res.on('end', () => {
        try {
          response = JSON.parse(data) as T;
        } catch (e) {
          response = e as Error;
        }
      });
    });
    req.on('error', (e) => {
      return e as Error;
    });
    if (this.body) {
      req.write(this.body);
    }
    req.end();
    return response;
  };

  private httpsRequest = async <T>(options: https.RequestOptions): Promise<Error | T> => {
    let response: Error | T = {} as Error | T;
    const req: ClientRequest = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk as string;
      });
      res.on('end', () => {
        try {
          response = JSON.parse(data) as T;
        } catch (e) {
          response = e as Error;
        }
      });
    });
    req.on('error', (e) => {
      return e as Error;
    });
    if (this.body) {
      req.write(this.body);
    }
    req.end();
    return response;
  };

  public get = async <T>(url: string, headers?: Record<string, string> | undefined, body?: unknown | undefined): Promise<Error | T> => {
    this.headers = headers;
    this.setFromURL(url);
    this.method = 'GET';
    this.body = body ? JSON.stringify(body) : undefined;
    const response = await this.request<T>();
    return response;
  };

  public post = async <T>(url: string, headers?: Record<string, string> | undefined, body?: unknown | undefined): Promise<Error | T> => {
    this.headers = headers;
    this.setFromURL(url);
    this.method = 'POST';
    this.body = body ? JSON.stringify(body) : undefined;
    const response = await this.request<T>();
    return response;
  };

  public put = async <T>(url: string, headers?: Record<string, string> | undefined, body?: unknown | undefined): Promise<Error | T> => {
    this.headers = headers;
    this.setFromURL(url);
    this.method = 'PUT';
    this.body = body ? JSON.stringify(body) : undefined;
    const response = await this.request<T>();
    return response;
  };

  public delete = async <T>(url: string, headers?: Record<string, string> | undefined, body?: unknown | undefined): Promise<Error | T> => {
    this.headers = headers;
    this.setFromURL(url);
    this.method = 'DELETE';
    this.body = body ? JSON.stringify(body) : undefined;
    const response = await this.request<T>();
    return response;
  };
}

const microserviceFetch = new MicroserviceFetch();
export default microserviceFetch;

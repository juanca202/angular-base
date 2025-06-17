import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private http = inject(HttpClient);

  public delete(resourcePath: string, id: string): Observable<any> {
    const url = `${this.getApiPath(resourcePath)}${resourcePath}/${id}`;
    return this.http.delete(url);
  }
  public find(
    resourcePath: string,
    params?: any,
    options?: any
  ): Observable<any> {
    const url = `${this.getApiPath(resourcePath)}${resourcePath}`;
    return this.http.get(url, { ...{ params }, ...options });
  }
  public get(
    resourcePath: string,
    id?: string,
    params?: any,
    options?: any
  ): Observable<any> {
    let url: string;
    if (id) {
      url = `${this.getApiPath(resourcePath)}${resourcePath}/${id}`;
    } else {
      return this.find(
        `${this.getApiPath(resourcePath)}${resourcePath}`,
        params,
        options
      );
    }
    return this.http.get(url, { ...{ params }, ...options });
  }
  public patch(
    resourcePath: string,
    id: string,
    data: any,
    options?: any
  ): Observable<any> {
    const url = `${this.getApiPath(resourcePath)}${resourcePath}${id ? '/' : ''}${id || ''}`;
    return this.http.patch(url, data, options);
  }
  public post(resourcePath: string, data: any, options?: any): Observable<any> {
    const url = `${this.getApiPath(resourcePath)}${resourcePath}`;
    return this.http.post<any>(url, data, options);
  }
  public put(resourcePath: string, id: any, data: any): Observable<any> {
    const url = `${this.getApiPath(resourcePath)}${resourcePath}${id ? '/' : ''}${id || ''}`;
    return this.http.put(url, data);
  }
  private getApiPath(resourcePath: string): string {
    return this.isAbsoluteUrl(resourcePath)
      ? ''
      : `${environment.restEndpoint}/`;
  }
  private isAbsoluteUrl(resourcePath: string): boolean {
    //const expression = /[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&//=]*)?/gi;
    const expression = /^(https?:\/\/)/i;
    const regex = new RegExp(expression);
    return regex.test(resourcePath);
  }
}

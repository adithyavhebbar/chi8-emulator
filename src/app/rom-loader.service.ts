import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RomLoaderService {

  constructor(private http: HttpClient) { }

  public getRom(fileName: string) {
    return this.http.get(`assets/${fileName}`, {
      responseType: 'arraybuffer'
    })
  }
}

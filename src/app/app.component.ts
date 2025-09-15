import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'event-datasheet-app';
  storageKey:any

  constructor() {
    this.storageKey==Math.random()
  }



}

import { Component } from '@angular/core';
import { BoardingComponent } from './boarding/boarding.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Bus Boarding Sequence Generator';
}

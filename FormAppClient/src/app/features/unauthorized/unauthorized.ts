import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Unauthorized {

}

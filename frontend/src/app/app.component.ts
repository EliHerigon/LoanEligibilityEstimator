import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

// Root component for the application
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
}

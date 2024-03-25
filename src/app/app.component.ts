import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Chip8 } from './core/Chip8';
import { RomLoaderService } from './rom-loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'chip8-emulator';

  private chip8: Chip8;
  constructor(private romLoaderService: RomLoaderService) {
  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.chip8 = new Chip8(this.romLoaderService);
  }
}

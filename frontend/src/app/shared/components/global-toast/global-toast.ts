import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-global-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-toast.html',
  styleUrl: './global-toast.scss'
})
export class GlobalToastComponent {
  public toastService = inject(ToastService);
}
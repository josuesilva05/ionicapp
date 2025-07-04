import { Component, OnInit, inject } from '@angular/core';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { mail, lockClosed, eye, eyeOff, arrowForward } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { browserLocalPersistence, browserSessionPersistence, setPersistence } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  showPassword = false;
  isLoading = false;
  rememberMe = false;

  formData = {
    email: '',
    password: ''
  };

  constructor(private router: Router) {
    // Adicionar ícones necessários
    addIcons({
      mail,
      lockClosed,
      eye,
      eyeOff,
      arrowForward
    });
  }

  ngOnInit() {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (!this.formData.email || !this.formData.password) {
      this.showToast('Por favor, preencha todos os campos', 'warning');
      return;
    }

    // Definir persistência antes do login
    try {
      const auth = this.authService.getAuthInstance();
      if (this.rememberMe) {
        await setPersistence(auth, browserLocalPersistence);
      } else {
        await setPersistence(auth, browserSessionPersistence);
      }
    } catch (e) {
      this.showToast('Erro ao definir persistência de sessão', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Entrando...',
      translucent: true
    });
    await loading.present();

    try {
      this.isLoading = true;
      await this.authService.login(this.formData.email, this.formData.password);
      await loading.dismiss();
      this.showToast('Login realizado com sucesso!', 'success');
      this.router.navigate(['/']);
    } catch (error: any) {
      await loading.dismiss();
      this.showToast(error, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithGoogle() {
    // Definir persistência antes do login social
    try {
      const auth = this.authService.getAuthInstance();
      if (this.rememberMe) {
        await setPersistence(auth, browserLocalPersistence);
      } else {
        await setPersistence(auth, browserSessionPersistence);
      }
    } catch (e) {
      this.showToast('Erro ao definir persistência de sessão', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Conectando com Google...',
      translucent: true
    });
    await loading.present();

    try {
      await this.authService.loginWithGoogle();
      await loading.dismiss();
      this.showToast('Login realizado com sucesso!', 'success');
      this.router.navigate(['/']);
    } catch (error: any) {
      await loading.dismiss();
      this.showToast(error, 'danger');
    }
  }

  goToSignup() {
    this.router.navigate(['/criar-conta']);
  }

  forgotPassword() {
    this.router.navigate(['/esqueceu-senha']);
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}

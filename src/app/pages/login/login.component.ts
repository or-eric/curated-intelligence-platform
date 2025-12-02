import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    email = '';
    loading = false;
    message = '';

    constructor(private supabase: SupabaseService) { }

    async handleLogin() {
        try {
            this.loading = true;
            const { error } = await this.supabase.signIn(this.email);
            if (error) throw error;
            this.message = 'Check your email for the login link!';
        } catch (error: any) {
            this.message = error.error_description || error.message;
        } finally {
            this.loading = false;
        }
    }
}

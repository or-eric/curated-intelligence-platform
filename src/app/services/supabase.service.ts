import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;
    private _currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

        // Initialize session
        this.supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                this._currentUser.next(session.user);
            }
        });

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                this._currentUser.next(session.user);
            } else {
                this._currentUser.next(null);
            }
        });
    }

    get currentUser$(): Observable<User | null> {
        return this._currentUser.asObservable();
    }

    get client(): SupabaseClient {
        return this.supabase;
    }

    async signIn(email: string) {
        return this.supabase.auth.signInWithOtp({ email });
    }

    async signOut() {
        return this.supabase.auth.signOut();
    }

    async getSession(): Promise<Session | null> {
        const { data } = await this.supabase.auth.getSession();
        return data.session;
    }
}

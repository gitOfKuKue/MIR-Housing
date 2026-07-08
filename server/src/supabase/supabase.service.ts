import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

@Injectable()
export class SupabaseService {
  private serviceClient: SupabaseClient | null = null;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly configService: ConfigService,
  ) {}

  getClient(accessToken?: string): SupabaseClient {
    if (!accessToken) {
      return this.supabase;
    }

    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const key = this.configService.getOrThrow<string>('SUPABASE_ANON_KEY');

    return createClient(url, key, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  /** Bypasses RLS — use only after the API has authenticated the caller. */
  getServiceClient(): SupabaseClient {
    if (this.serviceClient) {
      return this.serviceClient;
    }

    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!serviceRoleKey) {
      throw new InternalServerErrorException(
        'SUPABASE_SERVICE_ROLE_KEY is required for storage uploads. Add it to server/src/.env.',
      );
    }

    this.serviceClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    return this.serviceClient;
  }
}

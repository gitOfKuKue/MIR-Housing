import { Global, Module } from '@nestjs/common';
import { SUPABASE_CLIENT } from './supabase.constants';
import { supabaseProvider } from './supabase.provider';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  providers: [supabaseProvider, SupabaseService],
  exports: [SUPABASE_CLIENT, SupabaseService],
})
export class SupabaseModule {}

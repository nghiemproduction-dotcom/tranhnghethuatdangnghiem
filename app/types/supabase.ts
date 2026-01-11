// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: any  // Dùng any tạm thời
        Insert: any
        Update: any
      }
    }
    Views: { [key: string]: any }
    Functions: { [key: string]: any }
    Enums: { [key: string]: any }
  }
}
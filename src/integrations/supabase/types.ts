export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content: string | null
          created_at: string
          id: number
          image_url: string | null
          tags: string | null
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          image_url?: string | null
          tags?: string | null
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          image_url?: string | null
          tags?: string | null
          title?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          email: string | null
          id: number
          method: string | null
          name: string | null
          notes: string | null
          preferred_time: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          method?: string | null
          name?: string | null
          notes?: string | null
          preferred_time?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          method?: string | null
          name?: string | null
          notes?: string | null
          preferred_time?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          sender_name: string | null
          sender_type: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          sender_name?: string | null
          sender_type: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          sender_name?: string | null
          sender_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_intake_requests: {
        Row: {
          admin_notes: string | null
          agreement_accepted: boolean
          budget_range: string | null
          company_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          phone: string | null
          project_description: string | null
          project_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          signature_data: string | null
          status: string
          timeline: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          agreement_accepted?: boolean
          budget_range?: string | null
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          phone?: string | null
          project_description?: string | null
          project_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          signature_data?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          agreement_accepted?: boolean
          budget_range?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          project_description?: string | null
          project_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          signature_data?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_notifications: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          project_id: string | null
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          project_id?: string | null
          read_at?: string | null
          title: string
          type?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          project_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      client_projects: {
        Row: {
          budget_total: number | null
          budget_used: number | null
          client_id: string
          created_at: string | null
          current_stage: Database["public"]["Enums"]["project_stage"] | null
          description: string | null
          estimated_completion: string | null
          id: string
          project_name: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          budget_total?: number | null
          budget_used?: number | null
          client_id: string
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["project_stage"] | null
          description?: string | null
          estimated_completion?: string | null
          id?: string
          project_name: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_total?: number | null
          budget_used?: number | null
          client_id?: string
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["project_stage"] | null
          description?: string | null
          estimated_completion?: string | null
          id?: string
          project_name?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          company_name: string | null
          contact_name: string
          created_at: string | null
          email: string
          has_completed_onboarding: boolean | null
          id: string
          is_active: boolean | null
          last_login: string | null
          onboarding_completed_at: string | null
          password_hash: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          contact_name: string
          created_at?: string | null
          email: string
          has_completed_onboarding?: boolean | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          onboarding_completed_at?: string | null
          password_hash: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          contact_name?: string
          created_at?: string | null
          email?: string
          has_completed_onboarding?: boolean | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          onboarding_completed_at?: string | null
          password_hash?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          id: number
          message: string | null
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      project_change_logs: {
        Row: {
          change_type: string
          changed_by: string
          changed_by_type: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          project_id: string | null
          stage_context: Database["public"]["Enums"]["project_stage"] | null
        }
        Insert: {
          change_type: string
          changed_by: string
          changed_by_type: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          stage_context?: Database["public"]["Enums"]["project_stage"] | null
        }
        Update: {
          change_type?: string
          changed_by?: string
          changed_by_type?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          stage_context?: Database["public"]["Enums"]["project_stage"] | null
        }
        Relationships: [
          {
            foreignKeyName: "project_change_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_events: {
        Row: {
          attendees: string[] | null
          created_at: string | null
          created_by: string
          created_by_type: string
          event_date: string
          event_description: string | null
          event_end_date: string | null
          event_location: string | null
          event_title: string
          event_type: string
          id: string
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string | null
          created_by: string
          created_by_type: string
          event_date: string
          event_description?: string | null
          event_end_date?: string | null
          event_location?: string | null
          event_title: string
          event_type: string
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attendees?: string[] | null
          created_at?: string | null
          created_by?: string
          created_by_type?: string
          event_date?: string
          event_description?: string | null
          event_end_date?: string | null
          event_location?: string | null
          event_title?: string
          event_type?: string
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          project_id: string | null
          requires_approval: boolean | null
          stage_name: Database["public"]["Enums"]["project_stage"] | null
          uploaded_by: string
          uploaded_by_type: string
        }
        Insert: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id?: string | null
          requires_approval?: boolean | null
          stage_name?: Database["public"]["Enums"]["project_stage"] | null
          uploaded_by: string
          uploaded_by_type: string
        }
        Update: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id?: string | null
          requires_approval?: boolean | null
          stage_name?: Database["public"]["Enums"]["project_stage"] | null
          uploaded_by?: string
          uploaded_by_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invoices: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          paid_date: string | null
          project_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          paid_date?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          paid_date?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_messages: {
        Row: {
          created_at: string | null
          id: string
          is_important: boolean | null
          message_text: string
          project_id: string | null
          sender_id: string
          sender_name: string
          sender_type: Database["public"]["Enums"]["message_type"]
          stage_context: Database["public"]["Enums"]["project_stage"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          message_text: string
          project_id?: string | null
          sender_id: string
          sender_name: string
          sender_type: Database["public"]["Enums"]["message_type"]
          stage_context?: Database["public"]["Enums"]["project_stage"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          message_text?: string
          project_id?: string | null
          sender_id?: string
          sender_name?: string
          sender_type?: Database["public"]["Enums"]["message_type"]
          stage_context?: Database["public"]["Enums"]["project_stage"] | null
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stages: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          assigned_team_members: string[] | null
          client_approval: Database["public"]["Enums"]["approval_status"] | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          progress_percentage: number | null
          project_id: string | null
          stage_description: string | null
          stage_name: Database["public"]["Enums"]["project_stage"]
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          assigned_team_members?: string[] | null
          client_approval?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          progress_percentage?: number | null
          project_id?: string | null
          stage_description?: string | null
          stage_name: Database["public"]["Enums"]["project_stage"]
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          assigned_team_members?: string[] | null
          client_approval?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          progress_percentage?: number | null
          project_id?: string | null
          stage_description?: string | null
          stage_name?: Database["public"]["Enums"]["project_stage"]
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string | null
          stage_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          stage_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          stage_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_team_members: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_primary_contact: boolean | null
          member_name: string
          phone: string | null
          project_id: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary_contact?: boolean | null
          member_name: string
          phone?: string | null
          project_id?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary_contact?: boolean | null
          member_name?: string
          phone?: string | null
          project_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          budget: string | null
          created_at: string
          email: string | null
          id: number
          message: string | null
          name: string | null
          project_type: string | null
          timeline: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
          project_type?: string | null
          timeline?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
          project_type?: string | null
          timeline?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon_url: string | null
          id: number
          price: string | null
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: number
          price?: string | null
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: number
          price?: string | null
          title?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_project_team_member: {
        Args: {
          p_email?: string
          p_is_primary_contact?: boolean
          p_member_name: string
          p_phone?: string
          p_project_id: string
          p_role: string
        }
        Returns: string
      }
      approve_client_intake: {
        Args: {
          p_admin_email: string
          p_admin_notes?: string
          p_request_id: string
        }
        Returns: string
      }
      assign_admin_role_to_email: {
        Args: { admin_email: string }
        Returns: string
      }
      complete_client_onboarding: {
        Args: {
          p_budget_range?: string
          p_client_id: string
          p_project_description: string
          p_project_type: string
          p_timeline?: string
        }
        Returns: string
      }
      create_admin_blog_post: {
        Args: {
          p_content: string
          p_image_url?: string
          p_tags?: string
          p_title: string
        }
        Returns: number
      }
      create_admin_service: {
        Args: {
          p_category?: string
          p_description: string
          p_icon_url?: string
          p_price?: string
          p_title: string
        }
        Returns: number
      }
      create_client_account: {
        Args: {
          p_company_name: string
          p_contact_name: string
          p_email: string
          p_phone?: string
          p_temporary_password?: string
        }
        Returns: string
      }
      create_default_project_stages: {
        Args: { p_project_id: string }
        Returns: undefined
      }
      create_notification_for_event: {
        Args: {
          p_client_id: string
          p_message: string
          p_project_id: string
          p_title: string
          p_type?: string
        }
        Returns: string
      }
      create_project_event: {
        Args: {
          p_created_by: string
          p_created_by_type: string
          p_event_date: string
          p_event_description: string
          p_event_location: string
          p_event_title: string
          p_event_type: string
          p_project_id: string
          p_status?: string
        }
        Returns: string
      }
      create_project_file_metadata: {
        Args: {
          p_description?: string
          p_file_name: string
          p_file_size: number
          p_file_type: string
          p_project_id: string
          p_stage_name?: Database["public"]["Enums"]["project_stage"]
          p_uploaded_by: string
          p_uploaded_by_type: string
        }
        Returns: string
      }
      create_project_stage: {
        Args: {
          p_due_date?: string
          p_project_id: string
          p_stage_description?: string
          p_stage_name: string
        }
        Returns: string
      }
      delete_admin_blog_post: {
        Args: { p_id: number }
        Returns: boolean
      }
      delete_admin_service: {
        Args: { p_id: number }
        Returns: boolean
      }
      delete_client_account: {
        Args: { p_client_id: string }
        Returns: boolean
      }
      delete_project_file: {
        Args: { p_file_id: string }
        Returns: boolean
      }
      delete_project_stage: {
        Args: { p_stage_id: string }
        Returns: boolean
      }
      delete_project_team_member: {
        Args: { p_member_id: string }
        Returns: boolean
      }
      get_admin_blog_posts: {
        Args: Record<PropertyKey, never>
        Returns: {
          content: string
          created_at: string
          id: number
          image_url: string
          tags: string
          title: string
        }[]
      }
      get_admin_bookings: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          id: number
          method: string
          name: string
          notes: string
          preferred_time: string
        }[]
      }
      get_admin_clients: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_name: string
          contact_name: string
          created_at: string
          email: string
          has_completed_onboarding: boolean
          id: string
          is_active: boolean
          onboarding_completed_at: string
          phone: string
        }[]
      }
      get_admin_contacts: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          phone: string
        }[]
      }
      get_admin_quotes: {
        Args: Record<PropertyKey, never>
        Returns: {
          budget: string
          created_at: string
          email: string
          id: number
          message: string
          name: string
          project_type: string
          timeline: string
        }[]
      }
      get_admin_services: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          created_at: string
          description: string
          icon_url: string
          id: number
          price: string
          title: string
        }[]
      }
      get_client_notifications: {
        Args: { p_client_id: string }
        Returns: {
          client_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          project_id: string | null
          read_at: string | null
          title: string
          type: string
        }[]
      }
      get_client_projects: {
        Args: { p_client_id: string }
        Returns: {
          budget_total: number | null
          budget_used: number | null
          client_id: string
          created_at: string | null
          current_stage: Database["public"]["Enums"]["project_stage"] | null
          description: string | null
          estimated_completion: string | null
          id: string
          project_name: string
          start_date: string | null
          updated_at: string | null
        }[]
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_pending_intake_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          budget_range: string
          company_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          phone: string
          project_description: string
          project_type: string
          timeline: string
        }[]
      }
      get_project_activity_log: {
        Args: { p_project_id: string }
        Returns: {
          activity_type: string
          created_at: string
          created_by_name: string
          description: string
          id: string
          metadata: Json
          title: string
        }[]
      }
      get_project_basic_data: {
        Args: { p_project_id: string }
        Returns: {
          budget_total: number
          budget_used: number
          estimated_completion: string
          start_date: string
        }[]
      }
      get_project_events: {
        Args: { p_project_id: string }
        Returns: {
          attendees: string[] | null
          created_at: string | null
          created_by: string
          created_by_type: string
          event_date: string
          event_description: string | null
          event_end_date: string | null
          event_location: string | null
          event_title: string
          event_type: string
          id: string
          project_id: string | null
          status: string | null
          updated_at: string | null
        }[]
      }
      get_project_files: {
        Args: { p_project_id: string }
        Returns: {
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          project_id: string | null
          requires_approval: boolean | null
          stage_name: Database["public"]["Enums"]["project_stage"] | null
          uploaded_by: string
          uploaded_by_type: string
        }[]
      }
      get_project_messages: {
        Args: { p_project_id: string }
        Returns: {
          created_at: string | null
          id: string
          is_important: boolean | null
          message_text: string
          project_id: string | null
          sender_id: string
          sender_name: string
          sender_type: Database["public"]["Enums"]["message_type"]
          stage_context: Database["public"]["Enums"]["project_stage"] | null
        }[]
      }
      get_project_overview_stats: {
        Args: { p_project_id: string }
        Returns: {
          completed_tasks: number
          current_milestone: string
          estimated_completion: string
          files_shared: number
          next_deadline: string
          overall_progress: number
          team_members: number
          total_tasks: number
          unread_messages: number
          upcoming_deadlines: number
        }[]
      }
      get_project_stages: {
        Args: { p_project_id: string }
        Returns: {
          approval_notes: string | null
          approved_at: string | null
          assigned_team_members: string[] | null
          client_approval: Database["public"]["Enums"]["approval_status"] | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          progress_percentage: number | null
          project_id: string | null
          stage_description: string | null
          stage_name: Database["public"]["Enums"]["project_stage"]
          status: string | null
          updated_at: string | null
        }[]
      }
      get_project_team_members: {
        Args: { p_project_id: string }
        Returns: {
          created_at: string | null
          email: string | null
          id: string
          is_primary_contact: boolean | null
          member_name: string
          phone: string | null
          project_id: string | null
          role: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_project_message: {
        Args: {
          p_message_text: string
          p_project_id: string
          p_sender_id: string
          p_sender_name: string
          p_sender_type?: string
        }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_project_change: {
        Args: {
          p_change_type: string
          p_changed_by: string
          p_changed_by_type: string
          p_description: string
          p_metadata?: Json
          p_project_id: string
          p_stage_context?: Database["public"]["Enums"]["project_stage"]
        }
        Returns: string
      }
      notify_client: {
        Args: {
          p_client_id: string
          p_message: string
          p_project_id: string
          p_title: string
          p_type?: string
        }
        Returns: string
      }
      recalc_project_current_stage: {
        Args: { p_project_id: string }
        Returns: undefined
      }
      recover_ghost_client: {
        Args: {
          p_company_name: string
          p_contact_name: string
          p_email: string
          p_phone?: string
          p_temporary_password?: string
        }
        Returns: string
      }
      reset_client_onboarding: {
        Args: { p_client_id: string }
        Returns: boolean
      }
      reset_client_onboarding_and_data: {
        Args: { p_client_id: string }
        Returns: boolean
      }
      update_admin_blog_post: {
        Args: {
          p_content: string
          p_id: number
          p_image_url?: string
          p_tags?: string
          p_title: string
        }
        Returns: boolean
      }
      update_admin_email: {
        Args: { current_email: string; new_email: string }
        Returns: boolean
      }
      update_admin_password: {
        Args: { admin_email: string; new_password: string }
        Returns: boolean
      }
      update_admin_service: {
        Args: {
          p_category?: string
          p_description: string
          p_icon_url?: string
          p_id: number
          p_price?: string
          p_title: string
        }
        Returns: boolean
      }
      update_project_details: {
        Args: {
          p_current_stage?: string
          p_description?: string
          p_estimated_completion?: string
          p_project_id: string
          p_project_name?: string
          p_start_date?: string
        }
        Returns: boolean
      }
      update_project_event_status: {
        Args: { p_event_id: string; p_status: string }
        Returns: boolean
      }
      update_project_stage_details: {
        Args: {
          p_assigned_team_members?: string[]
          p_due_date?: string
          p_progress_percentage?: number
          p_stage_description?: string
          p_stage_id: string
          p_status?: string
        }
        Returns: boolean
      }
      update_project_team_member: {
        Args: {
          p_email?: string
          p_is_primary_contact?: boolean
          p_member_id: string
          p_member_name?: string
          p_phone?: string
          p_role?: string
        }
        Returns: boolean
      }
      update_stage_approval: {
        Args: {
          p_approval_notes?: string
          p_client_approval: string
          p_stage_id: string
        }
        Returns: boolean
      }
      verify_client_login: {
        Args: { p_email: string; p_password: string }
        Returns: {
          client_id: string
          company_name: string
          contact_name: string
          has_completed_onboarding: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "client"
      approval_status:
        | "pending"
        | "approved"
        | "rejected"
        | "revision_requested"
      message_type: "client" | "team" | "system"
      project_stage:
        | "initial_brief"
        | "scope_agreement"
        | "design_phase"
        | "development"
        | "testing_uat"
        | "go_live"
        | "post_support"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "client"],
      approval_status: [
        "pending",
        "approved",
        "rejected",
        "revision_requested",
      ],
      message_type: ["client", "team", "system"],
      project_stage: [
        "initial_brief",
        "scope_agreement",
        "design_phase",
        "development",
        "testing_uat",
        "go_live",
        "post_support",
      ],
    },
  },
} as const

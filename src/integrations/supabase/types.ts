// Generated from the live database by scripts/gen-types (introspection).
// Do not edit by hand — regenerate after every migration.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      blueprints: {
        Row: {
          id: string;
          project_id: string;
          level_id: string | null;
          name: string;
          code: string;
          revision: string;
          discipline: string;
          status: string;
          approval_status: Database["public"]["Enums"]["approval_status"];
          storage_path: string | null;
          uploaded_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          ai_risk_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          level_id?: string | null;
          name: string;
          code?: string;
          revision?: string;
          discipline?: string;
          status?: string;
          approval_status?: Database["public"]["Enums"]["approval_status"];
          storage_path?: string | null;
          uploaded_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          ai_risk_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          level_id?: string | null;
          name?: string;
          code?: string;
          revision?: string;
          discipline?: string;
          status?: string;
          approval_status?: Database["public"]["Enums"]["approval_status"];
          storage_path?: string | null;
          uploaded_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          ai_risk_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      devices: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          firmware: string | null;
          adapter: string;
          is_simulated: boolean;
          battery_level: number | null;
          charging: boolean | null;
          storage_used_gb: number | null;
          storage_total_gb: number | null;
          connection_state: string;
          media_transport: string;
          project_id: string | null;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name?: string | null;
          firmware?: string | null;
          adapter?: string;
          is_simulated?: boolean;
          battery_level?: number | null;
          charging?: boolean | null;
          storage_used_gb?: number | null;
          storage_total_gb?: number | null;
          connection_state?: string;
          media_transport?: string;
          project_id?: string | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          firmware?: string | null;
          adapter?: string;
          is_simulated?: boolean;
          battery_level?: number | null;
          charging?: boolean | null;
          storage_used_gb?: number | null;
          storage_total_gb?: number | null;
          connection_state?: string;
          media_transport?: string;
          project_id?: string | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      form_submissions: {
        Row: {
          id: string;
          user_id: string;
          site_role: Database["public"]["Enums"]["site_role"] | null;
          project_id: string | null;
          level_id: string | null;
          zone_id: string | null;
          form_id: string;
          form_title: string | null;
          responses: Json;
          submitted_at: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          site_role?: Database["public"]["Enums"]["site_role"] | null;
          project_id?: string | null;
          level_id?: string | null;
          zone_id?: string | null;
          form_id: string;
          form_title?: string | null;
          responses?: Json;
          submitted_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          site_role?: Database["public"]["Enums"]["site_role"] | null;
          project_id?: string | null;
          level_id?: string | null;
          zone_id?: string | null;
          form_id?: string;
          form_title?: string | null;
          responses?: Json;
          submitted_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      glass_sessions: {
        Row: {
          id: string;
          user_id: string;
          device_id: string | null;
          project_id: string | null;
          level_id: string | null;
          zone_id: string | null;
          pairing_code: string;
          media_transport: string;
          started_at: string;
          ended_at: string | null;
          frames_analyzed: number;
          alerts_raised: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          device_id?: string | null;
          project_id?: string | null;
          level_id?: string | null;
          zone_id?: string | null;
          pairing_code: string;
          media_transport?: string;
          started_at?: string;
          ended_at?: string | null;
          frames_analyzed?: number;
          alerts_raised?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_id?: string | null;
          project_id?: string | null;
          level_id?: string | null;
          zone_id?: string | null;
          pairing_code?: string;
          media_transport?: string;
          started_at?: string;
          ended_at?: string | null;
          frames_analyzed?: number;
          alerts_raised?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      levels: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          number: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          name: string;
          number?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          number?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          level_id: string | null;
          zone_id: string | null;
          session_id: string | null;
          type: string;
          source: string;
          title: string | null;
          storage_path: string | null;
          width: number | null;
          height: number | null;
          duration_ms: number | null;
          byte_size: number | null;
          captured_at: string;
          sync_status: string;
          ai_analysis: Json | null;
          ai_status: Database["public"]["Enums"]["ai_status"];
          ai_provider: string | null;
          ai_model: string | null;
          analyzed_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          project_id?: string | null;
          level_id?: string | null;
          zone_id?: string | null;
          session_id?: string | null;
          type?: string;
          source?: string;
          title?: string | null;
          storage_path?: string | null;
          width?: number | null;
          height?: number | null;
          duration_ms?: number | null;
          byte_size?: number | null;
          captured_at?: string;
          sync_status?: string;
          ai_analysis?: Json | null;
          ai_status?: Database["public"]["Enums"]["ai_status"];
          ai_provider?: string | null;
          ai_model?: string | null;
          analyzed_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          level_id?: string | null;
          zone_id?: string | null;
          session_id?: string | null;
          type?: string;
          source?: string;
          title?: string | null;
          storage_path?: string | null;
          width?: number | null;
          height?: number | null;
          duration_ms?: number | null;
          byte_size?: number | null;
          captured_at?: string;
          sync_status?: string;
          ai_analysis?: Json | null;
          ai_status?: Database["public"]["Enums"]["ai_status"];
          ai_provider?: string | null;
          ai_model?: string | null;
          analyzed_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_reads: {
        Row: {
          id: string;
          user_id: string;
          notification_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notification_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          notification_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string | null;
          avatar_url: string | null;
          approval_status: Database["public"]["Enums"]["approval_status"];
          approved_at: string | null;
          approved_by: string | null;
          origin: string;
          site_role: Database["public"]["Enums"]["site_role"] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          approval_status?: Database["public"]["Enums"]["approval_status"];
          approved_at?: string | null;
          approved_by?: string | null;
          origin?: string;
          site_role?: Database["public"]["Enums"]["site_role"] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          approval_status?: Database["public"]["Enums"]["approval_status"];
          approved_at?: string | null;
          approved_by?: string | null;
          origin?: string;
          site_role?: Database["public"]["Enums"]["site_role"] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          site_role: Database["public"]["Enums"]["site_role"];
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          site_role?: Database["public"]["Enums"]["site_role"];
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          site_role?: Database["public"]["Enums"]["site_role"];
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          code: string;
          client: string;
          location: string;
          description: string;
          status: string;
          phase: string;
          progress: number;
          budget: string;
          current_level_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          code?: string;
          client?: string;
          location?: string;
          description?: string;
          status?: string;
          phase?: string;
          progress?: number;
          budget?: string;
          current_level_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          client?: string;
          location?: string;
          description?: string;
          status?: string;
          phase?: string;
          progress?: number;
          budget?: string;
          current_level_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          project_id: string | null;
          title: string;
          summary: string;
          body: string;
          period_start: string | null;
          period_end: string | null;
          generated_by: string | null;
          ai_provider: string | null;
          ai_model: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          project_id?: string | null;
          title: string;
          summary?: string;
          body?: string;
          period_start?: string | null;
          period_end?: string | null;
          generated_by?: string | null;
          ai_provider?: string | null;
          ai_model?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          title?: string;
          summary?: string;
          body?: string;
          period_start?: string | null;
          period_end?: string | null;
          generated_by?: string | null;
          ai_provider?: string | null;
          ai_model?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      site_events: {
        Row: {
          id: string;
          type: string;
          title: string;
          description: string;
          project_id: string | null;
          level_id: string | null;
          zone_id: string | null;
          created_by: string | null;
          created_by_label: string | null;
          created_by_role: string | null;
          assigned_to: string | null;
          severity: Database["public"]["Enums"]["severity"];
          status: Database["public"]["Enums"]["event_status"];
          media_id: string | null;
          blueprint_id: string | null;
          source: string;
          ai_confidence: number | null;
          ai_provider: string | null;
          ai_model: string | null;
          detected_by_session: string | null;
          created_at: string;
          updated_at: string;
          status_changed_at: string | null;
          resolved_at: string | null;
        };
        Insert: {
          id: string;
          type: string;
          title: string;
          description?: string;
          project_id?: string | null;
          level_id?: string | null;
          zone_id?: string | null;
          created_by?: string | null;
          created_by_label?: string | null;
          created_by_role?: string | null;
          assigned_to?: string | null;
          severity?: Database["public"]["Enums"]["severity"];
          status?: Database["public"]["Enums"]["event_status"];
          media_id?: string | null;
          blueprint_id?: string | null;
          source?: string;
          ai_confidence?: number | null;
          ai_provider?: string | null;
          ai_model?: string | null;
          detected_by_session?: string | null;
          created_at?: string;
          updated_at?: string;
          status_changed_at?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          description?: string;
          project_id?: string | null;
          level_id?: string | null;
          zone_id?: string | null;
          created_by?: string | null;
          created_by_label?: string | null;
          created_by_role?: string | null;
          assigned_to?: string | null;
          severity?: Database["public"]["Enums"]["severity"];
          status?: Database["public"]["Enums"]["event_status"];
          media_id?: string | null;
          blueprint_id?: string | null;
          source?: string;
          ai_confidence?: number | null;
          ai_provider?: string | null;
          ai_model?: string | null;
          detected_by_session?: string | null;
          created_at?: string;
          updated_at?: string;
          status_changed_at?: string | null;
          resolved_at?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          level_id: string | null;
          zone_id: string | null;
          title: string;
          description: string;
          status: string;
          priority: string;
          assigned_to: string | null;
          due_date: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          level_id?: string | null;
          zone_id?: string | null;
          title: string;
          description?: string;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          due_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          level_id?: string | null;
          zone_id?: string | null;
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          due_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: Database["public"]["Enums"]["app_role"];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: Database["public"]["Enums"]["app_role"];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
        };
        Relationships: [];
      };
      worker_status: {
        Row: {
          user_id: string;
          device_id: string | null;
          project_id: string | null;
          level_id: string | null;
          zone_id: string | null;
          task: string | null;
          ai_session: Database["public"]["Enums"]["session_state"];
          hazard: string | null;
          hazard_severity: Database["public"]["Enums"]["severity"] | null;
          last_active_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          device_id?: string | null;
          project_id?: string | null;
          level_id?: string | null;
          zone_id?: string | null;
          task?: string | null;
          ai_session?: Database["public"]["Enums"]["session_state"];
          hazard?: string | null;
          hazard_severity?: Database["public"]["Enums"]["severity"] | null;
          last_active_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          device_id?: string | null;
          project_id?: string | null;
          level_id?: string | null;
          zone_id?: string | null;
          task?: string | null;
          ai_session?: Database["public"]["Enums"]["session_state"];
          hazard?: string | null;
          hazard_severity?: Database["public"]["Enums"]["severity"] | null;
          last_active_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      zones: {
        Row: {
          id: string;
          project_id: string;
          level_id: string;
          name: string;
          code: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          level_id: string;
          name: string;
          code?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          level_id?: string;
          name?: string;
          code?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      ai_status: "pending" | "processing" | "complete" | "unavailable";
      app_role: "admin" | "supervisor" | "worker";
      approval_status: "pending" | "approved" | "rejected";
      event_status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";
      session_state: "active" | "idle" | "offline";
      severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      site_role: "worker" | "site_engineer" | "safety_officer";
    };
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];

export const Constants = {
  public: {
    Enums: {
      ai_status: ["pending", "processing", "complete", "unavailable"],
      app_role: ["admin", "supervisor", "worker"],
      approval_status: ["pending", "approved", "rejected"],
      event_status: ["OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED"],
      session_state: ["active", "idle", "offline"],
      severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      site_role: ["worker", "site_engineer", "safety_officer"],
    },
  },
} as const;

export interface MetabaseDatabase {
  id: number;
  name: string;
  description?: string;
  engine: string;
  is_sample: boolean;
  is_full_sync: boolean;
  features?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface MetabaseTable {
  id: number;
  db_id: number;
  name: string;
  display_name: string;
  description?: string;
  entity_type?: string;
  schema?: string;
  active?: boolean;
  visibility_type?: string;
}

export interface MetabaseField {
  id: number;
  table_id: number;
  name: string;
  display_name: string;
  base_type: string;
  semantic_type?: string;
  description?: string;
  visibility_type?: string;
  has_field_values?: string;
  fk_target_field_id?: number;
}

export interface MetabaseCard {
  id: number;
  name: string;
  description?: string;
  display: string;
  dataset_query: DatasetQuery;
  visualization_settings?: Record<string, unknown>;
  collection_id?: number;
  database_id?: number;
  query_type?: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  creator_id?: number;
}

export interface MetabaseCollection {
  id: number;
  name: string;
  description?: string;
  slug: string;
  color?: string;
  archived: boolean;
  location?: string;
  personal_owner_id?: number;
  namespace?: string;
}

export interface DatasetQuery {
  database: number;
  type: "native" | "query";
  native?: {
    query: string;
    "template-tags"?: Record<string, TemplateTag>;
  };
}

export interface TemplateTag {
  type: string;
  name: string;
  "display-name": string;
  id: string;
}

export interface QueryParameter {
  type: string;
  target: unknown[];
  value: unknown;
}

export interface QueryResult {
  data: {
    rows: unknown[][];
    cols: Array<{
      name: string;
      display_name: string;
      base_type: string;
      semantic_type?: string;
    }>;
  };
  row_count: number;
  status: string;
  json_query?: Record<string, unknown>;
}

export interface DatabaseMetadata {
  id: number;
  name: string;
  tables: MetabaseTable[];
}

export interface TableMetadata {
  id: number;
  name: string;
  display_name: string;
  fields: MetabaseField[];
}

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO todos (name) VALUES 
('Install Supabase CLI'),
('Link Supabase Project'),
('Deploy Migrations'),
('Verify Sample Page')
ON CONFLICT DO NOTHING;

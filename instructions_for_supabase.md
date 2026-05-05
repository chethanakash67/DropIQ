Supabase Workflow Guide
This guide covers everything from installation to pushing new database changes.

1. Installation & Setup
Run these once to get the tools ready on your machine.

bash
# Install the Supabase CLI
npm install supabase --save-dev
# Initialize the Supabase folder (if not already done)
npx supabase init
# Log in to your account (opens browser)
npx supabase login
2. Connect to your Project
Link your local code to your remote Supabase project.

bash
# Link to your project (replace with your project ref)
npx supabase link --project-ref owrjohdlyuhjlcyaixew
Note: You will need your Database Password during this step.

3. Fetching the Current Schema (Pulling)
If you or a teammate made changes directly in the Supabase Dashboard UI (like adding a column manually), you need to pull those changes to your local machine so they don't get overwritten.

bash
# This creates a new migration file based on differences in the remote DB
npx supabase db pull
4. Making Changes (Developing)
When you want to add a new table or change a column, follow this professional workflow:

Step A: Create a new migration file

bash
# This creates a blank .sql file in supabase/migrations/
npx supabase migration new your_feature_name
Step B: Edit the file Open the new .sql file in your code editor and write your SQL (e.g., CREATE TABLE... or ALTER TABLE...).

5. Deploying Changes (Pushing)
Once you are happy with your local SQL changes, push them to the live database.

bash
# Push all new migrations to the remote database
npx supabase db push